import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SolanaService } from "./solana.service";
import { ClaimTokenDTO } from "./dto/claim-token.dto";
import { MintNFTDTO } from "./dto/mint-nft.dto";

@Controller("solana")
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @Get("nft-collection")
  async getNFTCollection() {
    const x = await this.solanaService.getNFTCollection();
    return { collection: x };
  }

  @Get("wallet-token-balance/:userAddress")
  async getWalletTokenBalance(@Param("userAddress") userAddress: string) {
    const x = await this.solanaService.getWalletTokenBalance(userAddress);
    return { balance: x };
  }

  @Post("claim-token")
  async claimMomentoToken(@Body() claimTokenDto: ClaimTokenDTO) {
    const x = await this.solanaService.claimMomentoToken(claimTokenDto);
    return { instruction: x };
  }

  @Post("mint-nft")
  async mintNFT(@Body() mintNFT: MintNFTDTO) {
    const x = await this.solanaService.mintNFT(mintNFT);
    return { message: x };
  }
}
