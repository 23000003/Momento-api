import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { ApiProperty } from "@nestjs/swagger";

export class GetMarketplaceCollectionDTO {
  uniqueHolders: number;
  totalSupply: number;
  floorPrice: number;
  totalVolume: number;
  onSaleMetadata: Array<{ price: number } & DasApiAsset>;
}

export class DelistNFTDTO {
  @ApiProperty()
  nftAddress: string;
  @ApiProperty()
  listedByAddress: string;
}
export class SellNFTDTO extends DelistNFTDTO {
  @ApiProperty()
  price: number;
}

export class BuyNFTDTO extends DelistNFTDTO {
  @ApiProperty()
  buyerAddress: string;
  @ApiProperty()
  mpId: number;
  @ApiProperty()
  price: number;
}
