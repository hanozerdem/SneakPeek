import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'order',
      protoPath: '/usr/src/proto/order.proto', 
      url: '0.0.0.0:50053',
    }
  });

  await app.listen();
  console.log('Order service is running on gRPC!');
}
bootstrap();