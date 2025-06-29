// ----------------------
// ORDER TYPES (REQUEST)
// ----------------------

import { Observable } from "rxjs";

export interface OrderItem {
  productId: number; 
  quantity: number;
  price: number;
  size: string;
}

export interface CreateOrderRequest {
  userId: string;
  email: string
  userName: string;
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

export interface getAllRefundsRequest {}

export interface ChangeRefundStatusRequest {
  refundId: string;
  refundStatus: string;
}
export interface Refund {
  refundId: string;
  orderId: string;
  userId: string;
  reason: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}


export interface ChangeRefundRequest {
  refundId: string;
  reviewerId: string;
}

export interface CancelOrderRequest {
  orderId: string;
  userId: string;          
  reason?: string;         // optional explanatory text
}


// ----------------------
// ENUM
// ----------------------

export enum OrderStatus {
  PROCESSING = 'PROCESSING',
  ONWAY = 'ONWAY',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// ----------------------
// RESPONSE TYPES
// ----------------------

export interface OrderResponse {
  orderId: string;
  status: boolean;
  message: string;

  invoice?: {
    invoiceId: string;
    userId: string;
    email: string;
    userName: string;
    total: number;
    createdAt: string;
    paymentMethod: string;
    items: {
      productId: number;
      quantity: number;
      price: number;
      total: number;
      productName?: string;
      imageUrl?: string;
    }[];
    subTotal: number;
    shippingFee: number;
    taxRate: number;
    companyAddress: string;
    paymentMethodEncrypted: string;
    shippingAddress: string;
    creditCardMasked: string;
    expiryDate: string;             
    cardType: 'VISA' | 'MASTERCARD';
    cardLogoUrl: string;  
  };
}

export interface RefundResponse {
  status: boolean;
  message: string;
  orderId: string;
  refundStatus: string;
  
}

export interface SingleRefundResponse {
  refund: Refund;
}

export interface GetOrderStatusResponse {
  orderStatus: string;
  status: boolean;
  message: string;
}

// Güncellenmiş: OrderItemSummary artık size bilgisini de içeriyor.
export interface OrderItemSummary {
  productId: string;
  quantity: number;
  size: string; 
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
  items: OrderItemSummary[]; // Bu dizide artık her öğe productId ve size içeriyor.
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

interface RefundViewModelResponse {
  refundId: string;
  reason: string;
  refundDate: string;
  orderDate: string;
  user: {
    userId: string;
    fullName: string;
    email: string;
  };
  products: {
    productId: string;
    name: string;
    price: number;
  }[];
}
export interface CancelOrderResponse {
  status: boolean;
  message: string;
}

// ----------------------
// ORDER SERVICE INTERFACE
// ----------------------

export interface OrderService {
  CreateOrder(data: CreateOrderRequest): Observable<OrderResponse>;
  UpdateOrderStatus(data: UpdateOrderStatusRequest): Observable<OrderResponse>;
  RequestRefund(data: RequestRefundRequest): Observable<RefundResponse>;
  GetOrderHistory(data: GetOrderHistoryRequest): Observable<OrderHistoryResponse>;
  GetOrderStatus(data: GetOrderStatusRequest): Observable<GetOrderStatusResponse>;
  GetOrderById(data: GetOrderByIdRequest): Observable<GetOrderByIdResponse>;
  GetAllRefunds(data: getAllRefundsRequest): Observable<getAllRefundsResponse>;
  ChangeRefundStatus(data: ChangeRefundStatusRequest): Observable<ChangeRefundStatusResponse>;
  CancelOrder(data: CancelOrderRequest): Observable<CancelOrderResponse>;
  ApproveRefund(data: ChangeRefundRequest): Observable<SingleRefundResponse>;
  RejectRefund(data: ChangeRefundRequest): Observable<SingleRefundResponse>;
  GetAllOrderHistories(data: getAllRefundsRequest): Observable<OrderHistoryResponse>;

}
