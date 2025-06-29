import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserController } from './controllers/user.controller';
import { UserService } from './providers/user.service';
import { JwtModule } from '@nestjs/jwt';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistService } from './providers/wishlist.service';

@Module({
  imports: [
    // Enable .env files
    ConfigModule.forRoot(),

    // transportation module for open user-service
    ClientsModule.register([
      {
        name: 'USER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: '/usr/src/proto/user.proto',
          url: '0.0.0.0:50051',
        },
      },
    ]),

    // Mongodb conneciton
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {expiresIn: '1h'},
    }),
  ],
  controllers: [UserController,WishlistController],
  providers: [UserService,WishlistService],
})
export class AppModule {}

