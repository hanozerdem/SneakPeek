import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'payment-service',
          brokers: ['kafka:9092'],
        },
        consumer: {
          groupId: 'orders',
        }
      }, 
    },
  );

  console.log('Payment running on TCP localhost:6000');
  await app.listen();
}

bootstrap();
