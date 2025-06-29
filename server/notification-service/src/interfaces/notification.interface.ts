/**
 * Interface representing the manual notification sending request.
 */
export interface SendNotificationRequest {
  to: string;          // Recipient email address.
  subject: string;     // Notification subject line.
  text: string;        // Plain text body of the notification.
}

/**
 * Interface representing the payload from Kafka to send an invoice notification.
 */
export interface InvoiceNotificationPayload {
  invoiceId: string;
  userId: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
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