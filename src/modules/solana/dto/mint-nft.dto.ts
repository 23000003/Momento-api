import { ApiProperty } from '@nestjs/swagger';

export class MintNFTDTO {
    @ApiProperty()
    publicKey: string;
    @ApiProperty()
    image: string;
}