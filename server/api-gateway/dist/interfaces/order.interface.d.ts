import { Observable } from "rxjs";
export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}
export interface CreateOrderRequest {
    userId: string;
    address: string;
    cardInformation: string;
    items: OrderItem[];
}
export interface UpdateOrderStatusRequest {
    orderId: string;
    newStatus: string;
}
export interface RequestRefundRequest {
    orderId: string;
    userId: string;
    reason: string;
}
export interface GetOrderStatusRequest {
    orderId: string;
}
export interface GetOrderHistoryRequest {
    userId: string;
}
export interface GetOrderByIdRequest {
    orderId: string;
}
export interface getAllRefundsRequest {
}
export interface ChangeRefundStatusRequest {
    refundId: string;
    refundStatus: string;
}
export declare enum OrderStatus {
    PROCESSING = "PROCESSING",
    ONWAY = "ONWAY",
    DELIVERED = "DELIVERED",
    REJECTED = "REJECTED"
}
export declare enum RefundStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface OrderResponse {
    orderId: string;
    status: boolean;
    message: string;
}
export interface RefundResponse {
    status: boolean;
    message: string;
    orderId: string;
    refundStatus: string;
    
}
export interface GetOrderStatusResponse {
    orderStatus: string;
    status: boolean;
    message: string;
}
export interface OrderItemSummary {
    productId: string;
    quantity: number;
}
export interface OrderSummary {
    orderId: string;
    orderStatus: string;
    createdAt: string;
    deliveredAt: string;
    items: OrderItemSummary[];
    totalQuantity: number;
    totalPrice: number;
}
export interface OrderHistoryResponse {
    orders: OrderSummary[];
    status: boolean;
    message: string;
}
export interface GetOrderByIdResponse {
    orderId: string;
    userId: string;
    address: string;
    items: OrderItemSummary[];
    total: number;
    orderStatus: string;
    createdAt: string;
    status: boolean;
    message: string;
}
export interface RefundSummary {
    refundId: string;
    refundReason: string;
    userId: string;
    productIds: number[];
    orderDate: string;
    refundDate: string;
}
export interface getAllRefundsResponse {
    refunds: RefundSummary[];
    status: boolean;
    message: string;
}
export interface ChangeRefundStatusResponse {
    status: boolean;
    message: string;
}
export interface OrderService {
    CreateOrder(data: CreateOrderRequest): Observable<OrderResponse>;
    UpdateOrderStatus(data: UpdateOrderStatusRequest): Observable<OrderResponse>;
    RequestRefund(data: RequestRefundRequest): Observable<RefundResponse>;
    GetOrderHistory(data: GetOrderHistoryRequest): Observable<OrderHistoryResponse>;
    GetOrderStatus(data: GetOrderStatusRequest): Observable<GetOrderStatusResponse>;
    GetOrderById(data: GetOrderByIdRequest): Observable<GetOrderByIdResponse>;
    GetAllRefunds(data: getAllRefundsRequest): Observable<getAllRefundsResponse>;
    ChangeRefundStatus(data: ChangeRefundStatusRequest): Observable<ChangeRefundStatusResponse>;
}
