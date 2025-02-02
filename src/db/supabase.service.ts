import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Supabase {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get("SUPA_URL") as string,
      this.configService.get("SUPA_KEY") as string,
    );
  }

  getSupabase(): SupabaseClient {
    return this.supabase;
  }
}
