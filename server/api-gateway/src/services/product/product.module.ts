import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ProductController } from './product.contoller';
import { ProductService } from './product-base.service';
import { ReviewService } from './reviews/product-review.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
          JwtModule.register({
              secret: process.env.JWT_SECRET_KEY,
              signOptions: {expiresIn: '1h'},
            }),
          OrderModule,
  
      ],
  controllers: [ProductController],
  providers: [ProductService,ReviewService],
  exports: [ProductService]
})
export class ProductModule {}
