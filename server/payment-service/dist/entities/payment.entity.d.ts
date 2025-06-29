export interface CartItem {
    productId: number;
    quantity: number;
    price: number;
    productName?: string
}
export declare class Payment {
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
    constructor(init?: Partial<Payment>);
}
