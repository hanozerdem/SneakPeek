import { Injectable, OnModuleInit } from "@nestjs/common";
import { Client, ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { handleMappedError } from 'src/exceptions/error-handler';
import { OrderClientOptions } from './order-svc.options';

import {
  OrderService as OrderServiceGrpc,
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
  getAllRefundsResponse,
  ChangeRefundStatusRequest,
  ChangeRefundStatusResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  ChangeRefundRequest,
  SingleRefundResponse,
} from '../../interfaces/order.interface';

@Injectable()
export class OrderService implements OnModuleInit {
  private grpc: OrderServiceGrpc;

  @Client(OrderClientOptions)
  private readonly client: ClientGrpc;

  onModuleInit() {
    this.grpc = this.client.getService<OrderServiceGrpc>('OrderService');
  }

  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    try {
      return await lastValueFrom(this.grpc.CreateOrder(data));
    } catch (err) {
      handleMappedError("ORDER_CREATION_FAILED");
    }
  }

  async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<OrderResponse> {
    try {
      return await lastValueFrom(this.grpc.UpdateOrderStatus(data));
    } catch (err) {
      handleMappedError("ORDER_UPDATE_FAILED");
    }
  }

  async requestRefund(data: RequestRefundRequest): Promise<RefundResponse> {
    try {
      return await lastValueFrom(this.grpc.RequestRefund(data));
    } catch (err) {
      handleMappedError("ORDER_REFUND_FAILED");
    }
  }

  async getOrderHistory(data: GetOrderHistoryRequest): Promise<OrderHistoryResponse> {
    try {
      return await lastValueFrom(this.grpc.GetOrderHistory(data));
    } catch (err) {
      handleMappedError("ORDER_HISTORY_FAILED");
    }
  }

  async getOrderStatus(data: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    try {
      return await lastValueFrom(this.grpc.GetOrderStatus(data));
    } catch (err) {
      handleMappedError("ORDER_STATUS_FAILED");
    }
  }

  async getOrderById(data: GetOrderByIdRequest): Promise<GetOrderByIdResponse> {
    try {
      return await lastValueFrom(this.grpc.GetOrderById(data));
    } catch (err) {
      handleMappedError("ORDER_FIND_FAILED");
    }
  }

  async getAllRefundRequests(): Promise<getAllRefundsResponse> {
    try {
      return await lastValueFrom(this.grpc.GetAllRefunds({}));
    } catch (err) {
      handleMappedError("REFUND_LIST_FAILED");
    }
  }

  async changeRefundStatus(data: ChangeRefundStatusRequest): Promise<ChangeRefundStatusResponse> {
    try {
      return await lastValueFrom(this.grpc.ChangeRefundStatus(data));
    } catch (err) {
      handleMappedError("REFUND_UPDATE_FAILED");
    }
  }

  async cancelOrder(data: CancelOrderRequest): Promise<CancelOrderResponse> {
    try {
      return await lastValueFrom(this.grpc.CancelOrder(data));
    } catch (err) {
      handleMappedError("ORDER_CANCEL_FAILED");
    }
  }


  async approveRefund(data: ChangeRefundRequest): Promise<SingleRefundResponse> {
    try {
      return await lastValueFrom(this.grpc.ApproveRefund(data));
    } catch (err) {
      handleMappedError("REFUND_APPROVE_FAILED");
    }
  }
  async getAllOrderHistories(): Promise<OrderHistoryResponse> {
    try {
      return await lastValueFrom(this.grpc.GetAllOrderHistories({}));
    } catch (err) {
      handleMappedError("ORDER_ALL_HISTORY_FAILED");
    }
  }

  async rejectRefund(data: ChangeRefundRequest): Promise<SingleRefundResponse> {
    try {
      return await lastValueFrom(this.grpc.RejectRefund(data));
    } catch (err) {
      handleMappedError("REFUND_REJECT_FAILED");
    }
  }
}
