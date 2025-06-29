// src/controllers/grpc.controller.ts

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from '../providers/notification.service';

@Controller()
export class GrpcController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod('NotificationService', 'GetInvoicesBetweenDates')
  async getInvoicesBetweenDates(data: { startDate: string; endDate: string }) {
    return this.notificationService.getInvoicesByDateRange(data);
  }

  @GrpcMethod('NotificationService', 'GetInvoicesPdf')
  async getInvoicesPdf(data: { startDate: string; endDate: string }) {
    return this.notificationService.getInvoicesPdf(data);
  }
}