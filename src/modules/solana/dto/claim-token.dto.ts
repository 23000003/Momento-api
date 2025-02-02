import { ApiProperty } from "@nestjs/swagger";

export class ClaimTokenDTO {
  @ApiProperty()
  publicKey: string;
  @ApiProperty()
  amount: number;
}
