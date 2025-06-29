import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'product',
      protoPath: '/usr/src/proto/product.proto', 
      url: '0.0.0.0:50052',
    }
  });


  await app.listen();
  console.log('Product service is running on gRPC!');
}
bootstrap();


