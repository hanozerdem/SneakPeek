/*import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { NotificationService } from '../providers/notification.service';
import { Invoice } from '../interfaces/invoice.interface';
import { UserService } from '../providers/user.service';
import { generateInvoicePdf } from '../utils/pdf.util';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    const kafka = new Kafka({
      clientId: 'notification-service',
      brokers: ['kafka:9092'], // production'da ENV'den alınmalı
    });

    const consumer = kafka.consumer({ groupId: 'notification-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'invoice-created', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        try {
          // Check if message has a value
          if (!message.value) {
            this.logger.warn('Received message with null value');
            return;
          }

          const data: Invoice = JSON.parse(message.value.toString());
          this.logger.log(`Received invoice message for userId: ${data.userId}`);

          // Get email address from user-service
          const email = await this.userService.getUserEmail(data.userId);

          // Generate PDF attachment from invoice
          const pdfBase64 = await generateInvoicePdf(data);

          // Send email with PDF attached
          await this.notificationService.sendNotification(
            email,
            'Your Invoice',
            `
              Hello!

              Your payment was successful. Here are your invoice details:

              - Invoice ID: ${data.invoiceId}
              - Total: ${data.total} TL
              - Created At: ${data.createdAt}
              - Payment Method: ${data.paymentMethod}

              Thank you for shopping with us!
            `,
            [
              {
                filename: 'invoice.pdf',
                content: pdfBase64,
                encoding: 'base64',
              },
            ],
          );

          this.logger.log(`Invoice email sent to ${email}`);
        } catch (err) {
          this.logger.error(`KafkaConsumer error: ${err.message}`, err.stack);
        }
      },
    });
  }
}*/