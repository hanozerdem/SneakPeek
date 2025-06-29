



import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // gRPC 
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:6000',
      package: 'notification',
      protoPath: '/usr/src/proto/notification.proto',
    },
  });

  await app.startAllMicroservices(); // <== GRPC sunucusu
  await app.listen(process.env.PORT ?? 6100); // HTTP sunucusu

  console.log('✅ gRPC Notification service is running on port 6000');
  //Logger.log(`Notification service is running on http://localhost:${process.env.PORT ?? 6100}`);
}
bootstrap();