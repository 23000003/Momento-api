import { Module } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceController } from "./marketplace.controller";
import { BlockchainConfigService } from "../blockchain-config.service";
import { SolanaService } from "../solana/solana.service";
import { Drizzle } from "src/db/drizzle.service";

@Module({
  providers: [
    MarketplaceService,
    BlockchainConfigService,
    SolanaService,
    Drizzle,
  ],
  controllers: [MarketplaceController],
})
export class MarketplaceModule {}
