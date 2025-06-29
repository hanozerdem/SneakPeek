import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service';
import { UserService } from '../user.service';

@Injectable()
export class RefundApprovalHandler {
  private readonly logger = new Logger(RefundApprovalHandler.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService
  ) {}

  async handle(payload: any) {
    try {
      const { userId, orderId, items, total } = payload;

      const user = await this.userService.getUserById(userId);
      if (!user?.email || !user?.username) {
        this.logger.warn(`User not found for refund notification: ${userId}`);
        return;
      }

      const subject = `Your Refund for Order #${orderId} Has Been Approved`;

      const itemsText = items
        .map((item: any) => `• ${item.quantity}x ${item.productName} (Size ${item.size})`)
        .join('\n\t');

      const text = `Hello ${user.username},\n\n` +
        `We’ve approved your refund request for the following order:\n\n` +


        `Order #${orderId}`;

      await this.notificationService.sendNotification(user.email, subject, text);

      this.logger.log(`✅ Refund approval email sent to ${user.email}`);
    } catch (err) {
      this.logger.error('❌ Failed to send refund approval notification', err);
    }
  }
}

/* */