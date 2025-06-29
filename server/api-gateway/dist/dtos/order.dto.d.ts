export declare class OrderItemDto {
    productId: string;
    quantity: number;
    price: number;
}
export declare class CreateOrderDto {
    userId: string;
    address: string;
    cardInformation: string;
    items: OrderItemDto[];
}
export declare class UpdateOrderStatusDto {
    orderId: string;
    newStatus: string;
}
export declare class RequestRefundDto {
    orderId: string;
    userId: string;
    reason: string;
}
export declare class ChangeRefundStatusDto {
    refundId: string;
    refundStatus: string;
}
