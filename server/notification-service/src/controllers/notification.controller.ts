import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from '../providers/notification.service';
import { SendNotificationRequest } from '../interfaces/notification.interface';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Endpoint for sending a plain-text notification manually.
   * Example payload: { to: "user@example.com", subject: "Hello", text: "Message here" }
   */
  @Post('send')
  async sendNotification(@Body() body: SendNotificationRequest) {
    const result = await this.notificationService.sendNotification(
      body.to,
      body.subject,
      body.text
    );
    return {
      message: 'Notification sent successfully',
      info: result,
    };
  }
}