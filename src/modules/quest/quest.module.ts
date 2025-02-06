import { Module } from "@nestjs/common";
import { QuestController } from "./quest.controller";
import { QuestService } from "./quest.service";
import { Supabase } from "src/db/supabase.service";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [CacheModule.register()],
  controllers: [QuestController],
  providers: [QuestService, Supabase],
})
export class QuestModule {}
