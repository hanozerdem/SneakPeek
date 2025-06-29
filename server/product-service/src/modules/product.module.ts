import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductController } from 'src/controllers/product.controller';
import { ProductService } from 'src/providers/product.service';
import { ReviewService } from 'src/providers/review.service';
import { Review } from 'src/entities/review.entity';
import { ProductSize } from 'src/entities/product-size.entity';
import { ProductPricing } from 'src/entities/product-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product,Review, ProductSize,ProductPricing])],
  controllers: [ProductController],
  providers: [ProductService,ReviewService],
  exports: [ProductService,ReviewService], 
})
export class ProductModule {}
