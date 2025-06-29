import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('invoices')
  //@Roles('salesmanager')
  //@UseGuards(AuthGuard, RolesGuard)
  async getInvoicesByDate(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.notificationService.getInvoicesByDateRange({ start, end });
  }

  @Get('invoices/pdf')
  //@Roles('salesmanager')
  //@UseGuards(AuthGuard, RolesGuard)
  async getInvoicesPdf(
    @Query('start') start: string,
    @Query('end') end: string,
    @Res() res: Response,
  ) {
    const result = await this.notificationService.getInvoicesPdf({ start, end });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.pdf"');
    res.send(Buffer.from(result.pdfBase64, 'base64'));
  }
}