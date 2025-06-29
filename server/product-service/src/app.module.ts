import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product } from './entities/product.entity';
import { ProductPricing } from './entities/product-pricing.entity';
import { ProductSize } from './entities/product-size.entity';
import { ProductModule } from './modules/product.module';
import { Review } from './entities/review.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [Product,ProductPricing,ProductSize,Review],
        synchronize: true, 
      }),
    }),

    ClientsModule.register([
      {
        name: 'PRODUCT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          protoPath: '../proto/product.proto',
          url: '0.0.0.0:50052',
        },
      },
    ]),
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
