import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './providers/payment.service';


@Module({
  imports: [
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class AppModule {}
