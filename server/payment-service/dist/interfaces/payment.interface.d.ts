export interface CartItem {
    productId: number;
    quantity: number;
    price: number;
    productName?: string
}
export interface PaymentRequest {
    userId: string;
    shippingAddress: string;
    items: CartItem[];
    paymentMethod: string;
    creditCard: string;
}
export interface Invoice {
    invoiceId: string;
    userId: string;
    items: CartItem[];
    subTotal: number;
    shippingFee: number;
    taxRate: number;
    total: number;
    companyAddress: string;
    paymentMethodEncrypted: string;
    createdAt: string;
    pdfBase64: string;
    shippingAddress: string;
    creditCardMasked: string;
    paymentMethod: string;
}
export interface OrderItem {
    price: number;
    productId: string;
    quantity: number;
}
export interface CreateOrderRequest {
    userId: string;
    address: string;
    cardInformation: string;
    items: OrderItem[];
}
export interface PaymentResponse {
    status: boolean;
    message: string;
    invoice: Invoice | null;
}
