import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { BuyNFTDTO, DelistNFTDTO, SellNFTDTO } from "./dto/marketplace.dto";

@Controller("marketplace")
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get("collection")
  async getCollectionData() {
    const data = await this.marketplaceService.getCollectionData();
    return { collection: data };
  }
  @Get("nft-data/:nftAddress")
  async getNFTData(@Param("nftAddress") nftAddress: string) {
    const data = await this.marketplaceService.getNFTData(nftAddress);

    return { nftData: data };
  }
  @Post("sell-nft")
  async sellNFT(@Body() sellNFTDto: SellNFTDTO) {
    const data = await this.marketplaceService.sellNFT(sellNFTDto);
    return { instruction: data };
  }
  @Patch("buy-nft/:mpId")
  async buyNFT(@Param("mpId") mpId: number, @Body() buyNFTDto: BuyNFTDTO) {
    const data = await this.marketplaceService.buyNFT(mpId, buyNFTDto);
    return { instruction: data };
  }
  @Delete("delist-nft/:mpId")
  async delistNFT(
    @Param("mpId") mpId: number,
    @Body() delistNFTDto: DelistNFTDTO,
  ) {
    const data = await this.marketplaceService.delistNFT(mpId, delistNFTDto);
    return { instruction: data };
  }
}
