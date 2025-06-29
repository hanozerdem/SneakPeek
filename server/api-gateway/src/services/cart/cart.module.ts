import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/guards/auth.guard';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
          JwtModule.register({
              secret: process.env.JWT_SECRET_KEY,
              signOptions: {expiresIn: '1h'},
            }),
            ProductModule
      ],
  controllers: [CartController],
  providers: [CartService,AuthGuard],
  exports: [CartService],
})
export class CartModule {}
