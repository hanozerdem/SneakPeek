export interface Invoice {
  email: string;
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

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
  productName?: string
}
