import { Module } from "@nestjs/common";
import { SolanaConfigService } from "./solana-config.service";
import { SolanaService } from "./solana.service";
import { SolanaController } from "./solana.controller";

@Module({
  controllers: [SolanaController],
  providers: [SolanaConfigService, SolanaService],
})
export class SolanaModule {}
