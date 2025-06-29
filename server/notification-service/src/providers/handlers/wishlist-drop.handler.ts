import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service';
import { UserService } from '../user.service';

@Injectable()
export class WishlistDropHandler {
  private readonly logger = new Logger(WishlistDropHandler.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async handle(message: string): Promise<void> {
    try {
      
      const data = JSON.parse(message); // contains userId, productName, newPrice
      const email = await this.userService.getUserEmail(data.userId);

      const subject = `Price Drop Alert: ${data.productName}`;
      const text = `
        Great news!

        An item in your wishlist has dropped in price:

        - Product: ${data.productName}
        - New Price: ${data.newPrice} TL

        Hurry up before it's gone!

        SneakPeek Team
      `;

      await this.notificationService.sendNotification(email, subject, text);
      this.logger.log(`✅ Wishlist price drop email sent to ${email}`);
    } catch (error: any) {
      this.logger.error('❌ Error in WishlistDropNotificationHandler:', error.message);
    }
  }
}