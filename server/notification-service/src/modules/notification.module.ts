import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose'; 

import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../providers/notification.service';
import { UserService } from '../providers/user.service';

import { KafkaConsumerService } from '../kafka/kafka-consumer.service';

import { InvoiceNotificationHandler } from '../providers/handlers/invoice-notification.handler';
import { WishlistDropHandler } from '../providers/handlers/wishlist-drop.handler';
import { RefundApprovalHandler } from '../providers/handlers/refund-approval.handler';

import { Invoice, InvoiceSchema } from '../models/invoice.model'; // <-- model import

import { GrpcController } from '../controllers/grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''), // <-- MongoDB 
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]) 
  ],
  controllers: [NotificationController, GrpcController],
  providers: [
    NotificationService,
    UserService,
    KafkaConsumerService,
    InvoiceNotificationHandler,
    WishlistDropHandler,
    RefundApprovalHandler,
  ],
})
export class NotificationModule {}