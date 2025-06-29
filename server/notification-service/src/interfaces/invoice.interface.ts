/**
 * Represents an item in the invoice.
 */
export interface CartItem {
    productId: number;
    quantity: number;
    price: number;
    productName?: string
  }
  
  /**
   * Invoice structure received from Kafka.
   */
  export interface Invoice {
    email: string
    invoiceId: string;
    userId: string;
    items: CartItem[];
    subTotal: number;
    userName?: string;
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