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
var PaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
let PaymentController = PaymentController_1 = class PaymentController {
    paymentService;
    logger = new common_1.Logger(PaymentController_1.name);
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createOrder(data) {
        this.logger.log(`CreateOrder received data: ${JSON.stringify(data)}`);
        try {
            const res = await this.paymentService.createOrder(data);
            return res;
        }
        catch (err) {
            this.logger.error(`CreateOrder failed: ${err.message}`);
            return {
                orderId: '',
                status: false,
                message: 'Failed to create order',
            };
        }
    }
    async updateOrderStatus(data) {
        this.logger.log(`UpdateOrderStatus received data: ${JSON.stringify(data)}`);
        try {
            const response = await this.paymentService.updateOrderStatus(data);
            return response;
        }
        catch (err) {
            this.logger.error(`UpdateOrderStatus failed: ${err.message}`);
            return {
                orderId: '',
                status: false,
                message: 'Failed to update order status',
            };
        }
    }
    async requestRefund(data) {
        this.logger.log(`RequestRefund received data: ${JSON.stringify(data)}`);
        try {
            const res = await this.paymentService.requestRefund(data);
            return res;
        }
        catch (err) {
            this.logger.error(`RequestRefund failed: ${err.message}`);
            return {
                status: false,
                message: 'Failed to process refund request',
                orderId: '',
                refundStatus: '',
            };
        }
    }
    async getOrderHistory(data) {
        this.logger.log(`GetOrderHistory received data: ${JSON.stringify(data)}`);
        try {
            const result = await this.paymentService.getOrderHistory(data);
            return result;
        }
        catch (err) {
            this.logger.error(`GetOrderHistory failed: ${err.message}`);
            return {
                status: false,
                message: 'Failed to fetch order history',
                orders: [],
            };
        }
    }
    async getOrderStatus(data) {
        this.logger.log(`GetOrderStatus received data: ${JSON.stringify(data)}`);
        try {
            const result = await this.paymentService.getOrderStatus(data);
            return result;
        }
        catch (err) {
            this.logger.error(`GetOrderStatus failed: ${err.message}`);
            return {
                orderStatus: '',
                status: false,
                message: 'Failed to fetch order status',
            };
        }
    }
    async getOrderById(data) {
        this.logger.log(`GetOrderById received data: ${JSON.stringify(data)}`);
        try {
            const result = await this.paymentService.getOrderById(data);
            return result;
        }
        catch (err) {
            this.logger.error(`GetOrderById failed: ${err.message}`);
            return {
                orderId: '',
                userId: '',
                address: '',
                items: [],
                total: 0,
                orderStatus: '',
                createdAt: '',
                status: false,
                message: 'Failed to get order details',
            };
        }
    }
    async getAllRefunds() {
        this.logger.log(`GetAllRefunds called`);
        try {
            return await this.paymentService.getAllRefunds();
        }
        catch (err) {
            this.logger.error(`GetAllRefunds failed: ${err.message}`);
            return {
                refunds: [],
                status: false,
                message: 'Failed to fetch refunds',
            };
        }
    }
    async changeRefundStatus(data) {
        this.logger.log(`ChangeRefundStatus called with: ${JSON.stringify(data)}`);
        try {
            return await this.paymentService.changeRefundStatus(data);
        }
        catch (err) {
            this.logger.error(`ChangeRefundStatus failed: ${err.message}`);
            return {
                status: false,
                message: 'Failed to change refund status',
            };
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'CreateOrder'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createOrder", null);
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'UpdateOrderStatus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updateOrderStatus", null);
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'RequestRefund'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "requestRefund", null);
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'GetOrderHistory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getOrderHistory", null);
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'GetOrderStatus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getOrderStatus", null);
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'GetOrderById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getOrderById", null);
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'GetAllRefunds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAllRefunds", null);
__decorate([
    (0, microservices_1.GrpcMethod)('OrderService', 'ChangeRefundStatus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "changeRefundStatus", null);
exports.PaymentController = PaymentController = PaymentController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map