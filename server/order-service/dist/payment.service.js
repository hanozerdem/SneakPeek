"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_interface_1 = require("./interfaces/order.interface");
const order_model_1 = require("./models/order.model");
const refund_model_1 = require("./models/refund.model");
let PaymentService = PaymentService_1 = class PaymentService {
    kafkaClient;
    orderModel;
    refundModel;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(kafkaClient, orderModel, refundModel) {
        this.kafkaClient = kafkaClient;
        this.orderModel = orderModel;
        this.refundModel = refundModel;
    }
    async onModuleInit() {
        await this.kafkaClient.connect();
    }
    isValidCard(cardInfo) {
        const parts = cardInfo.trim().split(' ');
        if (parts.length !== 3)
            return false;
        const [cardNumber, securityCode, expiryDate] = parts;
        const cleanedCardNumber = cardNumber.replace(/\s+/g, '');
        const cardNumberValid = /^\d{16}$/.test(cleanedCardNumber);
        const securityCodeValid = /^\d{3,4}$/.test(securityCode);
        const expiryValid = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiryDate);
        return cardNumberValid && securityCodeValid && expiryValid;
    }
    computeTotal(items) {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    async createOrder(order) {
        if (!this.isValidCard(order.cardInformation)) {
            return {
                orderId: '',
                status: false,
                message: 'Invalid card information',
            };
        }
        const total = this.computeTotal(order.items);
        const newOrder = new this.orderModel({
            userId: order.userId,
            address: order.address,
            items: order.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
            total,
            status: order_interface_1.OrderStatus.PROCESSING,
            createdAt: new Date(),
        });
        const savedOrder = await newOrder.save();
        if (!savedOrder || !savedOrder._id) {
            return {
                orderId: '',
                status: false,
                message: 'There is an error occured during create an order',
            };
        }
        this.kafkaClient.emit('payment-approved', {
            order: order,
        });
        return {
            orderId: savedOrder._id.toString(),
            status: true,
            message: 'Order created and payment approved successfully',
        };
    }
    async updateOrderStatus(data) {
        try {
            const updatedOrder = await this.orderModel.findByIdAndUpdate(data.orderId, { status: data.newStatus }, { new: true });
            if (!updatedOrder || !updatedOrder._id) {
                return {
                    orderId: '',
                    status: false,
                    message: 'order not found',
                };
            }
            return {
                orderId: updatedOrder._id.toString(),
                status: true,
                message: `Order status updated to ${updatedOrder.status}`,
            };
        }
        catch (err) {
            console.error('Error updating order status:', err);
            return {
                orderId: '',
                status: false,
                message: 'Failed to update order status',
            };
        }
    }
    async requestRefund(data) {
        try {
            if (!data) {
                return {
                    status: false,
                    message: 'Invalid refund request payload!',
                    orderId: '',
                    refundStatus: '',
                };
            }
            const order = await this.orderModel.findById(data.orderId);
            if (!order) {
                return {
                    status: false,
                    message: 'No order found with the given ID.',
                    orderId: '',
                    refundStatus: '',
                };
            }
            const existingRefund = await this.refundModel.findOne({ orderId: data.orderId });
            if (existingRefund) {
                return {
                    status: false,
                    message: 'Refund request already exists for this order.',
                    orderId: data.orderId,
                    refundStatus: existingRefund.status,
                };
            }
            const refund = await this.refundModel.create({
                orderId: data.orderId,
                userId: data.userId,
                reason: data.reason,
                status: order_interface_1.RefundStatus.PENDING,
                createdAt: new Date(),
            });
            return {
                status: true,
                message: 'Refund request submitted successfully.',
                orderId: refund.orderId,
                refundStatus: refund.status,
            };
        }
        catch (err) {
            this.logger.error('Refund creation error', err);
            return {
                status: false,
                message: 'An unknown error occurred during refund request.',
                orderId: '',
                refundStatus: '',
            };
        }
    }
    async getOrderHistory(data) {
        try {
            const orders = await this.orderModel.find({ userId: data.userId });
            if (!orders) {
                return {
                    status: false,
                    message: 'Failed to fetch orders database!',
                    orders: [],
                };
            }
            const orderSummaries = orders.map(order => {
                const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const items = order.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                }));
                return {
                    orderId: order._id.toString(),
                    orderStatus: order.status,
                    createdAt: order.createdAt.toISOString(),
                    deliveredAt: order.deliveredAt ? order.deliveredAt.toISOString() : '',
                    items,
                    totalQuantity,
                    totalPrice: order.total,
                };
            });
            return {
                status: true,
                message: 'Order history retrieved successfully.',
                orders: orderSummaries,
            };
        }
        catch (err) {
            this.logger.error('Error fetching order history:', err);
            return {
                status: false,
                message: 'Failed to retrieve order history.',
                orders: [],
            };
        }
    }
    async getOrderStatus(data) {
        try {
            const order = await this.orderModel.findById(data.orderId);
            if (!order) {
                return {
                    orderStatus: '',
                    status: false,
                    message: 'Order not found',
                };
            }
            return {
                orderStatus: order.status,
                status: true,
                message: 'Order status retrieved successfully',
            };
        }
        catch (err) {
            this.logger.error('Error fetching order status:', err);
            return {
                orderStatus: '',
                status: false,
                message: 'Failed to retrieve order status',
            };
        }
    }
    async getOrderById(data) {
        try {
            const order = await this.orderModel.findById(data.orderId);
            if (!order) {
                return {
                    orderId: '',
                    userId: '',
                    address: '',
                    items: [],
                    total: 0,
                    orderStatus: '',
                    createdAt: '',
                    status: false,
                    message: 'Order not found',
                };
            }
            const items = order.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            }));
            return {
                orderId: order._id.toString(),
                userId: order.userId,
                address: order.address,
                items,
                total: order.total,
                orderStatus: order.status,
                createdAt: order.createdAt.toISOString(),
                status: true,
                message: 'Order retrieved successfully',
            };
        }
        catch (err) {
            this.logger.error('Error fetching order by ID:', err);
            return {
                orderId: '',
                userId: '',
                address: '',
                items: [],
                total: 0,
                orderStatus: '',
                createdAt: '',
                status: false,
                message: 'Failed to retrieve order by ID',
            };
        }
    }
    async getAllRefunds() {
        const refunds = await this.refundModel.find();
        if (!refunds) {
            return {
                refunds: [],
                status: false,
                message: 'there is an error occured during fetch the refunds',
            };
        }
        const refundSummaries = await Promise.all(refunds.map(async (refund) => {
            const order = await this.orderModel.findById(refund.orderId);
            const productIds = order?.items.map(i => Number(i.productId)) ?? [];
            return {
                refundId: refund._id?.toString() ?? '',
                refundReason: refund.reason,
                userId: refund.userId,
                productIds,
                orderDate: order?.createdAt?.toISOString() ?? '',
                refundDate: refund.reviewedAt?.toISOString() ?? '',
            };
        }));
        return {
            refunds: refundSummaries,
            status: true,
            message: 'All refunds listed',
        };
    }
    async changeRefundStatus(data) {
        try {
            const updated = await this.refundModel.findByIdAndUpdate(data.refundId, { status: data.refundStatus }, { new: true });
            if (!updated) {
                return {
                    status: false,
                    message: 'Refund not found',
                };
            }
            return {
                status: true,
                message: `Refund status updated to ${updated.status}`,
            };
        }
        catch (err) {
            this.logger.error('changeRefundStatus error:', err);
            return {
                status: false,
                message: 'Failed to update refund status',
            };
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KAFKA_SERVICE')),
    __param(1, (0, mongoose_1.InjectModel)(order_model_1.Order.name)),
    __param(2, (0, mongoose_1.InjectModel)(refund_model_1.Refund.name)),
    __metadata("design:paramtypes", [microservices_1.ClientKafka,
        mongoose_2.Model,
        mongoose_2.Model])
], PaymentService);
//# sourceMappingURL=payment.service.js.map