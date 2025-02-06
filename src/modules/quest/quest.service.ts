import { Injectable } from "@nestjs/common";
import { Supabase } from "src/db/supabase.service";
import { QUEST } from "./data/quest";
import { shuffleQuests } from "src/utils/shuffle.util";

@Injectable()
export class QuestService {
  private readonly quests = QUEST;

  constructor(private readonly supabase: Supabase) {}

  getTodaysQuests(questDone: typeof QUEST | undefined): typeof QUEST {
    return shuffleQuests(this.quests, questDone);
  }

  async getQuestsByUserId() {}

  async getQuestById() {}

  async createQuest() {}
}
