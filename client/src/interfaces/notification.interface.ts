import { Observable } from 'rxjs';

export interface GetInvoicesBetweenDatesRequest {
  startDate: string; // ISO 8601 tarih stringi (örnek: "2025-05-01T00:00:00.000Z")
  endDate: string;
}

export interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface InvoiceSummary {
  invoiceId: string;
  userName: string;
  createdAt: string;
  total: number;
  items: InvoiceItem[];
}

export interface GetInvoicesBetweenDatesResponse {
  invoices: InvoiceSummary[];
}

export interface NotificationServiceGrpc {
  GetInvoicesBetweenDates(data: GetInvoicesBetweenDatesRequest): Observable<GetInvoicesBetweenDatesResponse>;
}