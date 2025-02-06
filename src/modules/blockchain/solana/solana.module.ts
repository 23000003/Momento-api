import { Module } from "@nestjs/common";
import { BlockchainConfigService } from "../blockchain-config.service";
import { SolanaService } from "./solana.service";
import { SolanaController } from "./solana.controller";

@Module({
  controllers: [SolanaController],
  providers: [BlockchainConfigService, SolanaService],
})
export class SolanaModule {}
