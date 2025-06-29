import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: '/usr/src/proto/user.proto', 
      url: '0.0.0.0:50051',
    }
  });

  await app.listen();
  console.log('User service is running on gRPC!');
}
bootstrap();

