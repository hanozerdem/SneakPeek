import { OnModuleInit } from "@nestjs/common";
import { CreateOrderRequest, OrderResponse, UpdateOrderStatusRequest, RequestRefundRequest, RefundResponse, GetOrderHistoryRequest, OrderHistoryResponse, GetOrderStatusRequest, GetOrderStatusResponse, GetOrderByIdRequest, GetOrderByIdResponse, getAllRefundsResponse, ChangeRefundStatusRequest, ChangeRefundStatusResponse } from '../../interfaces/order.interface';
export declare class OrderService implements OnModuleInit {
    private orderService;
    private readonly orderServiceClient;
    onModuleInit(): void;
    createOrder(data: CreateOrderRequest): Promise<OrderResponse>;
    updateOrderStatus(data: UpdateOrderStatusRequest): Promise<OrderResponse>;
    requestRefund(data: RequestRefundRequest): Promise<RefundResponse>;
    getOrderHistory(data: GetOrderHistoryRequest): Promise<OrderHistoryResponse>;
    getOrderStatus(data: GetOrderStatusRequest): Promise<GetOrderStatusResponse>;
    getOrderById(data: GetOrderByIdRequest): Promise<GetOrderByIdResponse>;
    getAllRefundRequests(): Promise<getAllRefundsResponse>;
    changeRefundStatus(data: ChangeRefundStatusRequest): Promise<ChangeRefundStatusResponse>;
}
