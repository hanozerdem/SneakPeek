import { PaymentService } from './payment.service';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateOrderRequest,
  OrderResponse,
  UpdateOrderStatusRequest,
  RequestRefundRequest,
  RefundResponse,
  GetOrderHistoryRequest,
  OrderHistoryResponse,
  GetOrderStatusRequest,
  GetOrderStatusResponse,
  GetOrderByIdRequest,
  GetOrderByIdResponse,
  ChangeRefundStatusRequest,
  ChangeRefundStatusResponse,
  getAllRefundsResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  ChangeRefundRequest,
  SingleRefundResponse,
} from './interfaces/order.interface';

@Controller()
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  
  @GrpcMethod('OrderService', 'GetAllRefunds')
  async getAllRefunds(): Promise<getAllRefundsResponse> {
    this.logger.log(`GetAllRefunds called`);
    try {
      return await this.paymentService.getAllRefunds();
    } catch (err) {
      this.logger.error(`GetAllRefunds failed: ${err.message}`);
      return { refunds: [], status: false, message: 'Failed to fetch refunds' };
    }
  }

  
  @GrpcMethod('OrderService', 'CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    console.log("Order Service: ",data);
    this.logger.log(`CreateOrder received data: ${JSON.stringify(data)}`);
    try {
      const res: OrderResponse = await this.paymentService.createOrder(data);
      return res;
    } catch (err) {
      this.logger.error(`CreateOrder failed: ${err.message}`);
      return {
        orderId: '',
        status: false,
        message: 'Failed to create order',
      };
    }
  }

  @GrpcMethod('OrderService', 'UpdateOrderStatus')
  async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<OrderResponse> {
    this.logger.log(`UpdateOrderStatus received data: ${JSON.stringify(data)}`);
    try {
      const response = await this.paymentService.updateOrderStatus(data);
      return response;
    } catch (err) {
      this.logger.error(`UpdateOrderStatus failed: ${err.message}`);
      return {
        orderId: '',
        status: false,
        message: 'Failed to update order status',
      };
    }
  }

  @GrpcMethod('OrderService', 'RequestRefund')
  async requestRefund(data: RequestRefundRequest): Promise<RefundResponse> {
    this.logger.log(`RequestRefund received data: ${JSON.stringify(data)}`);
    try {
      const res = await this.paymentService.requestRefund(data);
      return res;
    } catch (err) {
      this.logger.error(`RequestRefund failed: ${err.message}`);
      return {
        status: false,
        message: 'Failed to process refund request',
        orderId: '',
        
        refundStatus: '',
      };
    }
  }

  @GrpcMethod('OrderService', 'GetOrderHistory')
  async getOrderHistory(data: GetOrderHistoryRequest): Promise<OrderHistoryResponse> {
    this.logger.log(`GetOrderHistory received data: ${JSON.stringify(data)}`);
    try {
      const result = await this.paymentService.getOrderHistory(data);
      return result;
    } catch (err) {
      this.logger.error(`GetOrderHistory failed: ${err.message}`);
      return {
        status: false,
        message: 'Failed to fetch order history',
        orders: [],
      };
    }
  }

  @GrpcMethod('OrderService', 'GetOrderStatus')
  async getOrderStatus(data: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    this.logger.log(`GetOrderStatus received data: ${JSON.stringify(data)}`);
    try {
      const result = await this.paymentService.getOrderStatus(data);
      return result;
    } catch (err) {
      this.logger.error(`GetOrderStatus failed: ${err.message}`);
      return {
        orderStatus: '',
        status: false,
        message: 'Failed to fetch order status',
      };
    }
  }

  @GrpcMethod('OrderService', 'GetOrderById')
  async getOrderById(data: GetOrderByIdRequest): Promise<GetOrderByIdResponse> {
    this.logger.log(`GetOrderById received data: ${JSON.stringify(data)}`);
    try {
      const result = await this.paymentService.getOrderById(data);
      return result;
    } catch (err) {
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
  
  @GrpcMethod('OrderService', 'GetAllOrderHistories')
async getAllOrderHistories(): Promise<OrderHistoryResponse> {
  this.logger.log(`GetAllOrderHistories called`);
  try {
    const result = await this.paymentService.getAllOrderHistories();
    return result;
  } catch (err) {
    this.logger.error(`GetAllOrderHistories failed: ${err.message}`);
    return {
      status: false,
      message: 'Failed to fetch all order histories',
      orders: [],
    };
  }
}

  
  @GrpcMethod('OrderService', 'CancelOrder')
async cancelOrder(data: CancelOrderRequest): Promise<CancelOrderResponse> {
  this.logger.log(`CancelOrder called with: ${JSON.stringify(data)}`);
  try {
    return await this.paymentService.cancelOrder(data);
  } catch (err) {
    this.logger.error(`CancelOrder failed: ${err.message}`);
    return { status: false, message: 'Failed to cancel order' };
  }
}


  @GrpcMethod('OrderService', 'ChangeRefundStatus')
  async changeRefundStatus(data: ChangeRefundStatusRequest): Promise<ChangeRefundStatusResponse> {
    this.logger.log(`ChangeRefundStatus received: ${JSON.stringify(data)}`);
    try {
      return await this.paymentService.changeRefundStatus(data);
    } catch (err) {
      this.logger.error(`ChangeRefundStatus failed: ${err.message}`);
      return { status: false, message: 'Failed to change refund status' };
    }
  }


  @GrpcMethod('OrderService', 'ApproveRefund')
  async approveRefund(data: ChangeRefundRequest): Promise<SingleRefundResponse> {
    this.logger.log(`ApproveRefund received: ${JSON.stringify(data)}`);
    try {
      return await this.paymentService.approveRefund(data);
    } catch (err) {
      this.logger.error(`ApproveRefund failed: ${err.message}`);
      return { refund: {
        refundId: '',
        orderId: '',
        userId: '',
        reason: '',
        status: '',    
        reviewedBy: undefined,
        reviewedAt: undefined,
        createdAt: undefined,
      }, };
    }
  }

  @GrpcMethod('OrderService', 'RejectRefund')
  async rejectRefund(data: ChangeRefundRequest): Promise<SingleRefundResponse> {
    this.logger.log(`RejectRefund received: ${JSON.stringify(data)}`);
    try {
      return await this.paymentService.rejectRefund(data);
    } catch (err) {
      this.logger.error(`RejectRefund failed: ${err.message}`);
      return { refund: {
        refundId: '',
        orderId: '',
        userId: '',
        reason: '',
        status: '',    
        reviewedBy: undefined,
        reviewedAt: undefined,
        createdAt: undefined,
      }, };
    }
  }
}

