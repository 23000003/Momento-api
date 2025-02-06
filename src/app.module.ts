import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SolanaModule } from "./modules/solana/solana.module";
import { QuestModule } from "./modules/quest/quest.module";
import { BlogModule } from "./modules/blog/blog.module";
import { UserModule } from "./modules/user/user.module";
import { MarketplaceModule } from "./modules/marketplace/marketplace.module";
import { ConfigModule } from "@nestjs/config";
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SolanaModule,
    QuestModule,
    BlogModule,
    UserModule,
    MarketplaceModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
