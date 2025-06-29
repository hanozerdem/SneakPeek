// Represents an item in the cart.
export interface CartItem {
    productId: number;
    quantity: number;
    price: number;
    productName?: string
  }
  
  // Request interface for processing a payment.
  export interface PaymentRequest {
    userId: string;              // User identifier.
    shippingAddress: string;     // Shipping address for the order.
    items: CartItem[];           // List of cart items.
    paymentMethod: string;       // Payment method (e.g., "Credit Card").
    creditCard: string;          // Credit card number for dummy payment simulation.
  }
  
  // Invoice interface containing all required invoice details.
  export interface Invoice {
    invoiceId: string;           // Unique invoice ID.
    userId: string;              // User identifier.
    items: CartItem[];           // List of purchased items.
    subTotal: number;            // Total price of items.
    shippingFee: number;         // Shipping fee.
    taxRate: number;             // Tax rate (e.g., 0.18 for 18%).
    total: number;               // Total amount (subTotal + shipping fee + tax).
    companyAddress: string;      // Company address.
    paymentMethodEncrypted: string; // Encrypted payment method.
    createdAt: string;           // Invoice creation timestamp.
    pdfBase64: string;           // Base64 encoded PDF invoice.
    // New fields:
    shippingAddress: string;     // User's shipping address.
    creditCardMasked: string;    // Masked credit card number.
    paymentMethod: string;       // Plain payment method (to display on invoice).
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
  
  // Response interface for payment processing.
  export interface PaymentResponse {
    status: boolean;             // True if payment succeeded.
    message: string;             // Details about the payment outcome.
    invoice: Invoice | null;     // Generated invoice or null if payment failed.
  }
  