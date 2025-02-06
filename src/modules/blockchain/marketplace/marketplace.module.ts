import { Module } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceController } from "./marketplace.controller";
import { BlockchainConfigService } from "../blockchain-config.service";

@Module({
  providers: [MarketplaceService],
  controllers: [MarketplaceController, BlockchainConfigService],
})
export class MarketplaceModule {}
