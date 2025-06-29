import { Transport, ClientOptions} from '@nestjs/microservices';

// For communication between user-service and api-gateway
export const ProductBaseClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'product-service:50052',
        package: 'product',
        // /usr is the path of the main path and rest is comes from docker file
        // In docker file we export /proto folder to api-gateway container
        protoPath: '/usr/src/proto/product.proto' // This comes from docker
      },
}