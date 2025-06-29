import { Transport, ClientOptions} from '@nestjs/microservices';

// For communication between order-service and api-gateway
export const OrderClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'order-service:50053',
        package: 'order',
        // /usr is the path of the main path and rest is comes from docker file
        // In docker file we export /proto folder to api-gateway container
        protoPath: '/usr/src/proto/order.proto' // This comes from docker
      },
}