import { ApiProperty } from "@nestjs/swagger";

class NotificationDTO {
    @ApiProperty()
    user_id: number;

    @ApiProperty()
    notif_type: number;

    @ApiProperty()
    link: string;

}

export class GetNotificationDTO extends NotificationDTO { }

export class CUDNotificationDTO extends NotificationDTO { 
    @ApiProperty()
    notif_id: number;
}
