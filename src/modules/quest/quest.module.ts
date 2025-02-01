import { Module } from '@nestjs/common';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { Supabase } from 'src/db/supabase.service';

@Module({
  controllers: [QuestController],
  providers: [QuestService, Supabase]
})
export class QuestModule {}
