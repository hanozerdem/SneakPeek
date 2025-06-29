import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './models/order.model';
import { Refund, RefundSchema } from './models/refund.model';

@Module({
  imports: [

    ConfigModule.forRoot(),

    ClientsModule.register([
      {
        name: 'ORDER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'order',
          protoPath: '/usr/src/proto/order.proto',
          url: '0.0.0.0:50053',
        },
      },
    ]),


    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-service',
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'orders',
          },
        },
      },
    ]),

    // Mongodb conneciton
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Refund.name, schema: RefundSchema },
    ]),  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class AppModule {}
