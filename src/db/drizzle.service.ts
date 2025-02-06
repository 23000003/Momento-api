import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as postgres from "postgres";

@Injectable()
export class DrizzleService {
  constructor(private readonly configService: ConfigService) {}

  getDrizzleDB() {
    const connectionString = this.configService.get("DATABASE_URL") as string;
    const client = postgres(connectionString, { prepare: false });
    return drizzle(client);
  }
}
