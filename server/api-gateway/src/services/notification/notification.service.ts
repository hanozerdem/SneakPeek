import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { NotificationClientOptions } from './notification-svc.options';
import { lastValueFrom } from 'rxjs';

interface NotificationGrpcService {
  GetInvoicesBetweenDates(data: { startDate: string; endDate: string }): any;
  GetInvoicesPdf(data: { startDate: string; endDate: string }): any;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private grpc: NotificationGrpcService;

  @Client(NotificationClientOptions)
  private readonly client: ClientGrpc;

  onModuleInit() {
    this.grpc = this.client.getService<NotificationGrpcService>('NotificationService');
  }

  async getInvoicesByDateRange(data: { start: string; end: string }) {
    return await lastValueFrom(
      this.grpc.GetInvoicesBetweenDates({ startDate: data.start, endDate: data.end }),
    );
  }

  async getInvoicesPdf(data: { start: string; end: string }): Promise<{ pdfBase64: string }> {
    return await lastValueFrom(
      this.grpc.GetInvoicesPdf({ startDate: data.start, endDate: data.end }),
    );
  }
}