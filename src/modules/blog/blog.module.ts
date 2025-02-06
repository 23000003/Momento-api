import { Module } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { BlogController } from "./blog.controller";
import { Supabase } from "src/db/supabase.service";
import { DrizzleService } from "src/db/drizzle.service";

@Module({
  controllers: [BlogController],
  providers: [BlogService, Supabase, DrizzleService],
})
export class BlogModule {}
