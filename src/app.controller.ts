import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Drizzle } from "./db/drizzle.service";
import { usersTable } from "./db/schema";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly db: Drizzle,
  ) {}

  //Test
  @Get()
  async getHello() {
    const db = this.db.getDrizzleDB();

    try {
      const res = await db.select().from(usersTable);

      return res;
    } catch (err) {
      console.log(err);
    }
  }
}
