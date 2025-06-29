import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cartItem.entity';
import { CartController } from './controllers/cart.controller';
import { CartService } from './providers/cart.service';

@Module({
  imports: [
    // Global .env configuration
    ConfigModule.forRoot({ isGlobal: true }),
    
    // TypeORM connection: directly using process.env values without fallback
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = process.env.DB_HOST;
        const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
        const username = process.env.DB_USER;
        const password = process.env.DB_PASS;
        const database = process.env.DB_NAME;

        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          entities: [CartEntity, CartItemEntity],
          synchronize: true, 
        };
      },
    }),
    
    // Register entities for dependency injection (DI)
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class AppModule {}
