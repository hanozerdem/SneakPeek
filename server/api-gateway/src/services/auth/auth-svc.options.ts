import { Transport, ClientOptions} from '@nestjs/microservices';

// For communication between user-service and api-gateway
export const UserServiceClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'user-service:50051',
        package: 'user',
        // /usr is the path of the main path and rest is comes from docker file
        // In docker file we export /proto folder to api-gateway container
        protoPath: '/usr/src/proto/user.proto' // This comes from docker
      },
}