import { Injectable } from "@nestjs/common";
import { BlockchainConfigService } from "../blockchain-config.service";

@Injectable()
export class MarketplaceService {
  constructor(private readonly web3: BlockchainConfigService) {}
}
