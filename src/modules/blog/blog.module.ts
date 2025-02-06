import { Module } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { BlogController } from "./blog.controller";
import { Drizzle } from "src/db/drizzle.service";

@Module({
  controllers: [BlogController],
  providers: [BlogService, Drizzle],
})
export class BlogModule {}
