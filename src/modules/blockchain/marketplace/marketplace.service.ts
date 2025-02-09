import { Injectable } from "@nestjs/common";
import { BlockchainConfigService } from "../blockchain-config.service";

@Injectable()
export class MarketplaceService {
  constructor(private readonly web3: BlockchainConfigService) {}

  getCollectionData() {
    return {
      uniqueHolders: 0,
      totalSupply: 0,
      floorPrice: 0,
      totalVolume: 0,
      onSale: {
        metadata: [],
        price: 0,
      },
    };
  }

  getNFTData() {
    return {
      metadata: [],
      price: 0,
    };
  }

  sellNFT() {
    return {
      status: "success",
      message: "NFT listed successfully",
    };
  }

  buyNFT() {
    return {
      status: "success",
      message: "NFT bought successfully",
    };
  }

  delistNFT() {
    return {
      status: "success",
      message: "NFT delisted successfully",
    };
  }
}
