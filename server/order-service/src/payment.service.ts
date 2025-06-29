import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import axios from 'axios';
import {
  CreateOrderRequest,
  GetOrderByIdRequest,
  GetOrderByIdResponse,
  GetOrderHistoryRequest,
  GetOrderStatusRequest,
  GetOrderStatusResponse,
  OrderHistoryResponse,
  OrderItemSummary,
  OrderResponse,
  OrderStatus,
  RefundResponse,
  RefundStatus,
  RequestRefundRequest,
  UpdateOrderStatusRequest,
  OrderSummary,
  getAllRefundsResponse,
  ChangeRefundStatusRequest,
  ChangeRefundStatusResponse,
  RefundSummary,
  CancelOrderRequest,
  CancelOrderResponse,
  ChangeRefundRequest,
  SingleRefundResponse,
  RefundListResponse,
  GetRefundsByUserRequest,
} from './interfaces/order.interface';
import { Order, OrderDocument } from './models/order.model';
import { Refund, RefundDocument } from './models/refund.model';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Refund.name) private readonly refundModel: Model<RefundDocument>
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  private isValidCard(cardInfo: string): boolean {
    const parts = cardInfo.trim().split(' ');
    if (parts.length !== 3) return false;
    const [cardNumber, securityCode, expiryDate] = parts;
    const cleanedCardNumber = cardNumber.replace(/\s+/g, '');
    const cardNumberValid = /^\d{16}$/.test(cleanedCardNumber);
    const securityCodeValid = /^\d{3,4}$/.test(securityCode);
    const expiryValid = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiryDate);
    return cardNumberValid && securityCodeValid && expiryValid;
  }

  private computeTotal(items: { price: number; quantity: number }[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async createOrder(order: CreateOrderRequest): Promise<OrderResponse> {
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
        size: item.size, 
      })),
      total,
      status: OrderStatus.PROCESSING,
      createdAt: new Date(),
    });

    console.log(newOrder);
    const savedOrder = await newOrder.save();

    if (!savedOrder || !savedOrder._id) {
      return {
        orderId: '',
        status: false,
        message: 'There is an error occurred during create an order',
      };
    }

    
    
    const taxRate = 0.18; // %18
    const subTotal = total;
    const shippingFee = subTotal > 10000 ? 0 : 150;
    const taxAmount = subTotal * taxRate;
    const finalTotal = subTotal + taxAmount + shippingFee;

    const itemsWithNames = await Promise.all(order.items.map(async (item) => {
          try {
            const response = await axios.get(`http://api-gateway:9000/api/products/${item.productId}`);
            const product = response.data as { productName?: string; imageUrl?: string };
        
            return {
              ...item,
              productName: product.productName || `Product ID: ${item.productId}`,
              imageUrl: product.imageUrl || '',
            };
          } catch (error) {
            console.error(`❌ Failed to fetch product name for productId=${item.productId}:`, error.message);
            return {
              ...item,
              productName: `Product ID: ${item.productId}`,
              imageUrl: '',
            };
          }
        }));
  
  this.kafkaClient.emit('invoice-created', {
    email: order.email,
    userName: order.userName,
    invoiceId: savedOrder._id.toString(),
    userId: order.userId,
    total: finalTotal,
    createdAt: new Date().toISOString(),
    paymentMethod: 'CREDIT_CARD',
    items: itemsWithNames,
    subTotal: subTotal,
    shippingFee: shippingFee,
    taxRate: taxRate,
    companyAddress: "company",
    paymentMethodEncrypted: "CARD",
    pdfBase64: "base64",
    shippingAddress: order.address,
    creditCardMasked: "mask",
});

const [rawNumber, securityCode, expiryDate] = order.cardInformation.split(' ');
const cleanedNum = rawNumber.replace(/\s+/g, '');
const last4 = cleanedNum.slice(-4);
const masked = `**** **** **** ${last4}`;

const isVisa = Math.random() < 0.5;
const cardType: 'VISA' | 'MASTERCARD' = isVisa ? 'VISA' : 'MASTERCARD';
const cardLogoUrl = isVisa
  ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Visa_2021.svg/1280px-Visa_2021.svg.png'
  : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png';


const invoicePayload = {
  invoiceId: savedOrder._id.toString(),
  userId: order.userId,
  email: order.email,
  userName: order.userName,
  total: finalTotal,
  createdAt: new Date().toISOString(),
  paymentMethod: 'CREDIT_CARD',
    expiryDate,                    
    cardType,                      
    cardLogoUrl,   
  items: itemsWithNames.map(i => ({
    productId: Number(i.productId),
    quantity: i.quantity,
    price: i.price,
    total: i.price * i.quantity,
    productName: i.productName,
    imageUrl: i.imageUrl,        
  })),
  subTotal,
  shippingFee,
  taxRate,
  companyAddress: 'SneakPeek Inc.',
  paymentMethodEncrypted: masked ,
  shippingAddress: order.address,
  creditCardMasked: masked,
};

this.kafkaClient.emit('invoice-created', invoicePayload);


    return {
      orderId: savedOrder._id.toString(),
      status: true,
      message: 'Order created and payment approved successfully',
      invoice: invoicePayload,
    };
  }

  async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<OrderResponse> {
    try {
      const updatedOrder = await this.orderModel.findByIdAndUpdate(
        data.orderId,
        { status: data.newStatus },
        { new: true },
      );

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
    } catch (err) {
      console.error('Error updating order status:', err);
      return {
        orderId: '',
        status: false,
        message: 'Failed to update order status',
      };
    }
  }
  async getAllOrderHistories(): Promise<OrderHistoryResponse> {
    try {
      const orders = await this.orderModel.find(); // userId filtresi yok, tüm siparişler gelir!
  
      if (!orders) {
        return {
          status: false,
          message: 'Failed to fetch orders database!',
          orders: [],
        };
      }
  
      const orderSummaries: OrderSummary[] = orders.map(order => {
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  
        const items: OrderItemSummary[] = order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size
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
        message: 'All orders retrieved successfully.',
        orders: orderSummaries,
      };
    } catch (err) {
      this.logger.error('Error fetching all order histories:', err);
      return {
        status: false,
        message: 'Failed to retrieve all orders.',
        orders: [],
      };
    }
  }
  
  

  async getOrderHistory(data: GetOrderHistoryRequest): Promise<OrderHistoryResponse> {
    try {
      const orders = await this.orderModel.find({ userId: data.userId });

      if (!orders) {
        return {
          status: false,
          message: 'Failed to fetch orders database!',
          orders: [],
        };
      }

      // Ürünleri eşleştirirken "size" bilgisini de ekliyoruz.
      const orderSummaries: OrderSummary[] = orders.map(order => {
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

        const items: OrderItemSummary[] = order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size// Eklenen alan
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
    } catch (err) {
      this.logger.error('Error fetching order history:', err);
      return {
        status: false,
        message: 'Failed to retrieve order history.',
        orders: [],
      };
    }
  }

  async getOrderStatus(data: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
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
    } catch (err) {
      this.logger.error('Error fetching order status:', err);
      return {
        orderStatus: '',
        status: false,
        message: 'Failed to retrieve order status',
      };
    }
  }

  async getOrderById(data: GetOrderByIdRequest): Promise<GetOrderByIdResponse> {
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

      // "size" alanı eklenerek mapping yapılıyor.
      const items: OrderItemSummary[] = order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size, 
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
    } catch (err) {
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

  async cancelOrder(data: CancelOrderRequest): Promise<CancelOrderResponse> {
    try {
      const order = await this.orderModel.findById(data.orderId);
  
      if (!order) {
        return { status: false, message: 'Order not found' };
      }
  
      if (order.userId !== data.userId) {
        return { status: false, message: 'Order does not belong to this user' };
      }
  
      // Cancel only if still early in the pipeline
      if (![OrderStatus.PROCESSING, OrderStatus.APPROVED].includes(order.status)) {
        return {
          status: false,
          message: `Order cannot be cancelled in status ${order.status}`,
        };
      }
  
      order.status = OrderStatus.REJECTED;
      await order.save();
  
  
      // Notify other services
      this.kafkaClient.emit('order-cancelled', {
        orderId: order._id.toString(),
        userId: data.userId,
        reason: data.reason || 'No reason provided',
      });
  
      return { status: true, message: 'Order successfully cancelled' };
    } catch (err) {
      this.logger.error('Cancel order failed:', err);
      return { status: false, message: 'Error occurred while cancelling order' };
    }
  
}
async requestRefund(data: RequestRefundRequest): Promise<RefundResponse> {
  try {
    const order = await this.orderModel.findById(data.orderId);
    if (!order) {
      return {
        status: false,
        message: 'Order not found',
        orderId: '',
        refundStatus: '',
      };
    }

    if (order.userId !== data.userId) {
      return {
        status: false,
        message: 'You cannot refund someone else’s order',
        orderId: data.orderId,
        refundStatus: '',
      };
    }

    const existing = await this.refundModel.findOne({ orderId: data.orderId });
    if (existing) {
      return {
        status: false,
        message: 'Refund already requested for this order',
        orderId: data.orderId,
        refundStatus: existing.status,
      };
    }

    const refundDoc = await this.refundModel.create({
      orderId: data.orderId,
      userId: data.userId,
      reason: data.reason,
      status: RefundStatus.PENDING,
    });
    

    return {
      status: true,
      message: 'Refund request submitted successfully',
      orderId: refundDoc.orderId,
      refundStatus: refundDoc.status,
    };
  } catch (err) {
    this.logger.error('requestRefund failed:', err);
    return {
      status: false,
      message: 'Error occurred while requesting refund',
      orderId: '',
      refundStatus: '',
    };
  }
}

async getAllRefunds(): Promise<getAllRefundsResponse> {
  try {
    // Get all refunds
    const docs = await this.refundModel.find().sort({ createdAt: -1 });

    // Get order IDs from refunds
    const orderIds = docs.map(r => r.orderId).filter(Boolean);

    // Get orders in a single query
    const orders = await this.orderModel.find({ _id: { $in: orderIds } });
    const orderMap = orders.reduce<Record<string, OrderDocument>>(
      (acc, o) => ({ ...acc, [o._id.toString()]: o }),
      {},
    );

    //Refund summary
    const refunds: RefundSummary[] = docs.map(r => {
      const order = orderMap[r.orderId?.toString() ?? ''];
      const productIds =
        order?.items?.map(i => Number(i.productId)) ?? [];

      return {
        refundId:    r.id.toString(),
        refundReason: r.reason,
        userId:       r.userId,
        productIds,                
        orderDate:    order?.createdAt?.toISOString() ?? '',
        refundDate:   r.reviewedAt?.toISOString()     ?? '',
      };
    });

    return { refunds, status: true, message: '' };

  } catch (err) {
    this.logger.error('getAllRefunds failed:', err);
    return {
      refunds: [],
      status: false,
      message: 'Error fetching all refunds',
    };
  }
}


async changeRefundStatus(
  data: ChangeRefundStatusRequest,
): Promise<ChangeRefundStatusResponse> {
  try {
    const refund = await this.refundModel.findById(data.refundId);
    if (!refund) {
      return { status: false, message: 'Refund not found' };
    }

    refund.status = data.refundStatus as RefundStatus;
    refund.reviewedAt = new Date();
    await refund.save();

    // ✅ Kafka 
    if (data.refundStatus === RefundStatus.APPROVED) {
      this.kafkaClient.emit('refund-approved', {
        userId: refund.userId,
        orderId: refund.orderId ?? refund._id, // fallback to refundId if orderId not available
      });
    }

    return {
      status: true,
      message: `Refund status updated to ${refund.status}`,
    };
  } catch (err) {
    this.logger.error('changeRefundStatus failed:', err);
    return { status: false, message: 'Error updating refund status' };
  }
}



async approveRefund(data: ChangeRefundRequest): Promise<SingleRefundResponse> {
  try {
    let refund = await this.refundModel.findById(data.refundId);
    if (!refund) {
      refund = await this.refundModel.findOne({ orderId: data.refundId });
      this.logger.warn(`approveRefund: used fallback lookup by orderId=${data.refundId}`);
    }
    if (!refund) {
      this.logger.warn(`approveRefund: refund ${data.refundId} not found`);
      return {
        refund: {
          refundId: '',
          orderId: '',
          userId: '',
          reason: '',
          status: RefundStatus.PENDING,
        },
      };
    }

    refund.status     = RefundStatus.APPROVED;
    refund.reviewedBy = data.reviewerId;
    refund.reviewedAt = new Date();
    await refund.save();

    this.logger.log(`Refund ${refund.id} marked APPROVED by ${data.reviewerId}`);

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      refund.orderId,
      { status: OrderStatus.REJECTED },
      { new: true },
    );

    if (updatedOrder) {
      this.logger.log(`Order ${updatedOrder._id} auto‐rejected after refund approval.`);
    } else {
      this.logger.warn(`approveRefund: order ${refund.orderId} not found for auto‐reject`);
    }

    // Kafka emit with additional order info
    const order = await this.orderModel.findById(refund.orderId);

    this.kafkaClient.emit('refund-approved', {
      userId: refund.userId,
      orderId: refund.orderId,
      items: order?.items ?? [],
      total: order?.total ?? 0,
    });

    return {
      refund: {
        refundId:   refund.id,
        orderId:    refund.orderId,
        userId:     refund.userId,
        reason:     refund.reason,
        status:     refund.status,
        reviewedBy: refund.reviewedBy,
        reviewedAt: refund.reviewedAt!.toISOString(),
        createdAt:  refund.createdAt?.toISOString(),
      },
    };
  } catch (err) {
    this.logger.error('approveRefund failed:', err);
    return {
      refund: {
        refundId: '',
        orderId: '',
        userId: '',
        reason: '',
        status: RefundStatus.PENDING,
      },
    };
  }
}

async rejectRefund(data: ChangeRefundRequest): Promise<SingleRefundResponse> {
  try {
    // 1) load the refund
    const refund = await this.refundModel.findById(data.refundId);
    if (!refund) {
      return { refund: { refundId: '', orderId: '', userId: '', reason: '', status: RefundStatus.PENDING } };
    }

    // 2) mark refund as rejected
    refund.status = RefundStatus.REJECTED;
    refund.reviewedBy = data.reviewerId;
    refund.reviewedAt = new Date();
    await refund.save();

    // 3) also update the underlying order (optional)
    const order = await this.orderModel.findById(refund.orderId);
    if (order) {
      order.status = OrderStatus.REJECTED;
      await order.save();
      this.kafkaClient.emit('order-refund-rejected', { orderId: order._id.toString() });
    }

    // 4) return it
    return {
      refund: {
        refundId: refund.id.toString(),
        orderId: refund.orderId,
        userId: refund.userId,
        reason: refund.reason,
        status: refund.status,
        reviewedBy: refund.reviewedBy,
        reviewedAt: refund.reviewedAt.toISOString(),
        createdAt: refund.createdAt?.toISOString(),
      },
    };
  } catch (err) {
    this.logger.error('rejectRefund failed:', err);
    return {
      refund: { refundId: '', orderId: '', userId: '', reason: '', status: RefundStatus.PENDING },
    };
  }
}
}