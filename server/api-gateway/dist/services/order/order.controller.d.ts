import { OrderService } from './order.service';
import { getAllRefundsResponse } from '../../interfaces/order.interface';
import { ChangeRefundStatusDto, CreateOrderDto, RequestRefundDto, UpdateOrderStatusDto } from 'src/dtos/order.dto';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(body: CreateOrderDto): Promise<import("../../interfaces/order.interface").OrderResponse>;
    updateOrderStatus(body: UpdateOrderStatusDto): Promise<import("../../interfaces/order.interface").OrderResponse>;
    requestRefund(body: RequestRefundDto): Promise<import("../../interfaces/order.interface").RefundResponse>;
    getOrderHistory(userId: string): Promise<import("../../interfaces/order.interface").OrderHistoryResponse>;
    getOrderStatus(orderId: string): Promise<import("../../interfaces/order.interface").GetOrderStatusResponse>;
    getAllRefundRequests(): Promise<getAllRefundsResponse>;
    getOrderById(orderId: string): Promise<import("../../interfaces/order.interface").GetOrderByIdResponse>;
    changeRefundStatus(body: ChangeRefundStatusDto): Promise<import("../../interfaces/order.interface").ChangeRefundStatusResponse>;
}
