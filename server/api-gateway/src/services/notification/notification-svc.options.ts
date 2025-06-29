import { Transport, ClientOptions } from '@nestjs/microservices';

export const NotificationClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'notification-service:6000',
    package: 'notification',
    protoPath: '/usr/src/proto/notification.proto', // docker path
  },
};