import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { Drizzle } from "src/db/drizzle.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, Drizzle],
})
export class NotificationsModule {}
