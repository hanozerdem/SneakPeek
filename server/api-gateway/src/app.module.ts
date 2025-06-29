import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './controllers/gateway.controller';
import { AuthModule } from './services/auth/auth.module';
import { HealthModule } from './health/health.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ProductModule } from './services/product/product.module';
import { WishlistModule } from './services/wishlist/wishlist.module';
import { OrderModule } from './services/order/order.module';
import { CartModule } from './services/cart/cart.module';
import { NotificationModule } from './services/notification/notification.module'; 
import { ChatbotProxyController } from './controllers/chatbot.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // that make .env file available for our service
    ConfigModule.forRoot(),

    // For rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),

    // JWT module for authentication
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {expiresIn: '1h'},
    }),

    // other modules from our service
    AuthModule,
    HealthModule,
    ProductModule,
    WishlistModule,
    OrderModule,
    NotificationModule,
    CartModule,
    HttpModule
  ],
  controllers: [GatewayController,
    ChatbotProxyController
  ],
  // our providers
  providers: [
    {
    // this is also for rate limitng in our entire app
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },],
})
export class AppModule {}
