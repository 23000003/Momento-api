import { Injectable, Logger } from '@nestjs/common';
import { Supabase } from 'src/db/supabase.service';
import { CUDNotificationDTO, GetNotificationDTO } from './dto/notification.dto';

@Injectable()
export class NotificationsService {

    constructor(private readonly supabase: Supabase) {}

    async getNotificationsByUserId (
        user_id: number
    ) : Promise<
        GetNotificationDTO[] | string
    > {
        const { data, error } = await this.supabase
            .getSupabase()
            .from("notifications")
            .select("*")
            .eq("user_id", user_id);

        if (error) {
            Logger.error(error.message);
            return "Error fetching Notifications";
        }

        return data;
    }

    async createNotification    (
        payload: CUDNotificationDTO
    ) : Promise<
        GetNotificationDTO[] | null | string
    > {
        const { error } = await this.supabase
            .getSupabase()
            .from("notifications")
            .insert(payload);

        if (error) {
            Logger.error(error.message);
            return "Error fetching Notifications";
        }

        const { data } = await this.supabase
            .getSupabase()
            .from("notifications")
            .select("*")
            .eq("user_id", payload.user_id);

        return data;
    }

    async deleteNotification(notif_id: number) : Promise<string> {
        const { error } = await this.supabase
            .getSupabase()
            .from("notifications")
            .delete()
            .eq("notif_id", notif_id);

        if (error) {
            Logger.error(error.message);
            return "Error deleting Notification";
        }

        return "Notification deleted successfully";
    }
}
