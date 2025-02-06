import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CUDNotificationDTO } from "./dto/notification.dto";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(":userId")
  async getNotificationsByUserId(@Param("userId") userId: string) {
    const data = await this.notificationsService.getNotificationsByUserId(
      parseInt(userId),
    );
    return data;
  }

  @Post("notify-user")
  async createNotification(@Body() payload: CUDNotificationDTO) {
    const data = await this.notificationsService.createNotification(payload);
    return data;
  }

  @Delete("delete-notification/:notifId")
  async deleteNotification(@Param("notifId") notifId: string) {
    const data = await this.notificationsService.deleteNotification(
      parseInt(notifId),
    );
    return data;
  }
}
