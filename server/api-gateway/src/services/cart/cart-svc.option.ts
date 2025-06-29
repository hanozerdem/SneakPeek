import { Transport, ClientOptions } from '@nestjs/microservices';

// For communication between cart-service and API Gateway
export const CartClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'cart-service:50054',
    package: 'cart',
    protoPath: '/usr/src/proto/cart.proto',
  },
};
