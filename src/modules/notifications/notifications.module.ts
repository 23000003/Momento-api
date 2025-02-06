import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Supabase } from 'src/db/supabase.service';

@Module({
  providers: [NotificationsService, Supabase],
  controllers: [NotificationsController]
})
export class NotificationsModule {}
