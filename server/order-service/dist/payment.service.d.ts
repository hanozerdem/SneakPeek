import { OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { CreateOrderRequest, GetOrderByIdRequest, GetOrderByIdResponse, GetOrderHistoryRequest, GetOrderStatusRequest, GetOrderStatusResponse, OrderHistoryResponse, OrderResponse, RefundResponse, RequestRefundRequest, UpdateOrderStatusRequest, getAllRefundsResponse, ChangeRefundStatusRequest, ChangeRefundStatusResponse } from './interfaces/order.interface';
import { OrderDocument } from './models/order.model';
import { RefundDocument } from './models/refund.model';
export declare class PaymentService implements OnModuleInit {
    private readonly kafkaClient;
    private readonly orderModel;
    private readonly refundModel;
    private readonly logger;
    constructor(kafkaClient: ClientKafka, orderModel: Model<OrderDocument>, refundModel: Model<RefundDocument>);
    onModuleInit(): Promise<void>;
    private isValidCard;
    private computeTotal;
    createOrder(order: CreateOrderRequest): Promise<OrderResponse>;
    updateOrderStatus(data: UpdateOrderStatusRequest): Promise<OrderResponse>;
    requestRefund(data: RequestRefundRequest): Promise<RefundResponse>;
    getOrderHistory(data: GetOrderHistoryRequest): Promise<OrderHistoryResponse>;
    getOrderStatus(data: GetOrderStatusRequest): Promise<GetOrderStatusResponse>;
    getOrderById(data: GetOrderByIdRequest): Promise<GetOrderByIdResponse>;
    getAllRefunds(): Promise<getAllRefundsResponse>;
    changeRefundStatus(data: ChangeRefundStatusRequest): Promise<ChangeRefundStatusResponse>;
}
