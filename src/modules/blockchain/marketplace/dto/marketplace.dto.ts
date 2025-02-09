import { ApiProperty } from "@nestjs/swagger";

export class MarketplaceDTO {
  @ApiProperty()
  uniqueHolders: number;
}
