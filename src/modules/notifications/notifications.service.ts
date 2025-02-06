import { Injectable } from "@nestjs/common";
import { CUDNotificationDTO } from "./dto/notification.dto";
import { Drizzle } from "src/db/drizzle.service";
import { GetNotificationSchema, notificationsTable } from "src/db/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class NotificationsService {
  constructor(private readonly db: Drizzle) {}

  async getNotificationsByUserId(
    user_id: number,
  ): Promise<GetNotificationSchema[]> {
    const data = await this.db
      .getDrizzleDB()
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user_id));
    // .leftJoin(usersTable, eq(notificationsTable.userId, usersTable.userId));

    return data;
  }

  async createNotification(
    payload: CUDNotificationDTO,
  ): Promise<GetNotificationSchema[] | null | string> {
    const data = await this.db
      .getDrizzleDB()
      .insert(notificationsTable)
      .values(payload)
      .returning();

    return data;
  }

  async deleteNotification(notif_id: number): Promise<string> {
    await this.db
      .getDrizzleDB()
      .delete(notificationsTable)
      .where(eq(notificationsTable.notifId, notif_id));

    return "Notification deleted successfully";
  }
}
