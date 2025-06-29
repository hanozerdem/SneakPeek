import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Invoice } from '../../interfaces/invoice.interface';
import { NotificationService } from '../notification.service';
import { UserService } from '../user.service';
import { generateInvoicePdf } from '../../utils/pdf.util';
import { InvoiceDocument } from '../../models/invoice.model';

@Injectable()
export class InvoiceNotificationHandler {
  private readonly logger = new Logger(InvoiceNotificationHandler.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    @InjectModel('Invoice') private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  async handle(payload: Invoice) {
    try {
      const userResponse = await this.userService.getUserById(payload.userId);
      const email = userResponse.email;
      const username = userResponse.username;

      const pdfBase64 = await generateInvoicePdf(payload, username);

      // 1. PDF mail
      await this.notificationService.sendNotification(
        email,
        'Your Invoice from SneakPeek',
        `
Hello!

Thank you for your purchase. Please find your invoice attached as a PDF document.

SneakPeek Team
        `,
        [
          {
            filename: 'invoice.pdf',
            content: pdfBase64,
            encoding: 'base64',
          },
        ],
      );

      // 2. Invoice save in MongoDB
      const invoiceDoc = new this.invoiceModel({
        ...payload,
        userName: username,
        pdfBase64,
      });
      await invoiceDoc.save();

      this.logger.log(`✅ Invoice email sent and saved to DB for ${email}`);
    } catch (err) {
      this.logger.error('❌ Error in InvoiceNotificationHandler:', err?.message || err);
    }
  }
}