import { forwardRef, Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
            JwtModule.register({
                secret: process.env.JWT_SECRET_KEY,
                signOptions: {expiresIn: '1h'},
              }),
              AuthModule,
              forwardRef(() => ProductModule),
        ],
  controllers: [OrderController],
  providers: [OrderService,AuthGuard],
  exports: [OrderService]
})
export class OrderModule {}
