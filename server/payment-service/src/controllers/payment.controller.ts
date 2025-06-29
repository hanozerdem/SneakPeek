import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../providers/payment.service';

@Controller()
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern('payment-approved')
  async handlePaymentApproved(@Payload() paymentData: any){
    console.log(paymentData)
    this.logger.log(`Received 'payment-approved' message for user: ${paymentData.order.userId}`);
    try {
      // Process payment using the same logic defined in PaymentService.
      const response = await firstValueFrom(this.paymentService.processPayment(paymentData.order));
      this.logger.log(`Payment processed successfully: ${response.message}`);
    } catch (err) {
      this.logger.error(`Error processing payment for user ${paymentData.userId}: ${err.message}`);      
    }
  }
}
