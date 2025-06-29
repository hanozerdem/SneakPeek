import { PaymentService } from './payment.service';
import { CreateOrderRequest, OrderResponse, UpdateOrderStatusRequest, RequestRefundRequest, RefundResponse, GetOrderHistoryRequest, OrderHistoryResponse, GetOrderStatusRequest, GetOrderStatusResponse, GetOrderByIdRequest, GetOrderByIdResponse, ChangeRefundStatusRequest, ChangeRefundStatusResponse, getAllRefundsResponse } from './interfaces/order.interface';
export declare class PaymentController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    createOrder(data: CreateOrderRequest): Promise<OrderResponse>;
    updateOrderStatus(data: UpdateOrderStatusRequest): Promise<OrderResponse>;
    requestRefund(data: RequestRefundRequest): Promise<RefundResponse>;
    getOrderHistory(data: GetOrderHistoryRequest): Promise<OrderHistoryResponse>;
    getOrderStatus(data: GetOrderStatusRequest): Promise<GetOrderStatusResponse>;
    getOrderById(data: GetOrderByIdRequest): Promise<GetOrderByIdResponse>;
    getAllRefunds(): Promise<getAllRefundsResponse>;
    changeRefundStatus(data: ChangeRefundStatusRequest): Promise<ChangeRefundStatusResponse>;
}
