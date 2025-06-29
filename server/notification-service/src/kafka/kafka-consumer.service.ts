import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { InvoiceNotificationHandler } from '../providers/handlers/invoice-notification.handler';
import { WishlistDropHandler } from '../providers/handlers/wishlist-drop.handler';
import { RefundApprovalHandler } from '../providers/handlers/refund-approval.handler';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly invoiceHandler: InvoiceNotificationHandler,
    private readonly wishlistHandler: WishlistDropHandler,
    private readonly refundHandler: RefundApprovalHandler,
  ) {}

  async onModuleInit() {
    const kafka = new Kafka({
      clientId: 'notification-service',
      brokers: ['kafka:9092'],
    });

    const consumer = kafka.consumer({ groupId: 'notification-group' });
    await consumer.connect();

    await consumer.subscribe({ topic: 'invoice-created', fromBeginning: false });
    await consumer.subscribe({ topic: 'wishlist-price-drop', fromBeginning: false });
    await consumer.subscribe({ topic: 'refund-approved', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        try {
          this.logger.log(`📩 Received message on topic: ${topic}`);
          if (!message.value) {
            this.logger.warn('❌ Message with null value received');
            return;
          }

          const payload = JSON.parse(message.value.toString());

          switch (topic) {
            case 'invoice-created':
              await this.invoiceHandler.handle(payload);
              break;
            case 'wishlist-price-drop':
              await this.wishlistHandler.handle(payload);
              break;
            case 'refund-approved':
              await this.refundHandler.handle(payload);
              break;
            default:
              this.logger.warn(`No handler for topic: ${topic}`);
          }
        } catch (err) {
          this.logger.error('❌ Error in KafkaConsumerService:', err?.message || err);
        }
      },
    });
  }
}
