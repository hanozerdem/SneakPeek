import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as nodemailer from 'nodemailer';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../models/invoice.model';
import { generateInvoiceReport } from '../utils/pastPdfs.util';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendNotification(
    to: string,
    subject: string,
    text: string,
    attachments?: { filename: string; content: string; encoding: string }[],
  ) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"SneakPeek" <${this.configService.get<string>('SMTP_USER')}>`,
      to,
      subject,
      text,
      attachments: attachments || [],
    };

    return this.transporter.sendMail(mailOptions);
  }

  async saveInvoice(invoiceData: Partial<Invoice>) {
    try {
      console.log('🔍 Trying to save invoice with ID:', invoiceData.invoiceId);

      if (!invoiceData.invoiceId) {
        console.error('❌ invoiceId is missing. Cannot save to MongoDB.');
        return;
      }

      const exists = await this.invoiceModel.findOne({ invoiceId: invoiceData.invoiceId });
      if (exists) {
        console.warn('⚠️ Invoice already exists, skipping save.');
        return;
      }

      const invoiceWithTimestamp = {
        ...invoiceData,
        createdAt: new Date(new Date().getTime() + 3 * 60 * 60 * 1000),
      };

      await this.invoiceModel.create(invoiceWithTimestamp);
      console.log('✅ Invoice saved to MongoDB');
    } catch (err) {
      console.error('❌ Failed to save invoice to MongoDB:', err);
    }
  }

  async getInvoicesByDateRange(data: { startDate: string; endDate: string }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    const invoices = await this.invoiceModel.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    return {
      status: true,
      message: 'Fetched invoices',
      invoices,
    };
  }

  async getInvoicesPdf(data: { startDate: string; endDate: string }): Promise<{ pdfBase64: string }> {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    const invoices = await this.invoiceModel.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    console.log('Found invoices:', invoices.length);

    const buffer = await generateInvoiceReport(invoices, data.startDate, data.endDate);
    return { pdfBase64: buffer.toString('base64') };
  }
}
