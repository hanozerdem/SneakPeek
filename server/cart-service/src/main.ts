//Grpc Microservice
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'cart',
      protoPath: '../proto/cart.proto',
      url: '0.0.0.0:50054',
    },
  });

  await app.listen();
  console.log('Cart gRPC Service running on port 50054');
}

bootstrap();
