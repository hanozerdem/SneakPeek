import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @MessagePattern('order-created')
  async handleMessage(@Payload() order: any) {
    this.logger.log(`Received event: ${order.orderId}`);

    this.logger.log(`Payment status for order ${order.orderId}`);
  }
}


