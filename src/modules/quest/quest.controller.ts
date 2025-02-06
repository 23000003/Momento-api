import { Controller, Get, UseGuards } from "@nestjs/common";
import { Supabase } from "src/db/supabase.service";
import { AuthGuard } from "src/guards/auth.guard";

@Controller("quest")
@UseGuards(AuthGuard)
export class QuestController {

    constructor(private readonly supabase: Supabase){}

    @Get()
    getQuests() {
        return {message: "Test"};
    }

}
