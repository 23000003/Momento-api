import { ApiProperty } from "@nestjs/swagger";

class NotificationDTO {
  @ApiProperty()
  userId: number;
  @ApiProperty()
  link: string;
  @ApiProperty()
  notifType: number;
}

export class CUDNotificationDTO extends NotificationDTO {}
