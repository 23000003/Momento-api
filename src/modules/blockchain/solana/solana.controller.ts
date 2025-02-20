import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SolanaService } from "./solana.service";
import { ClaimTokenDTO } from "./dto/claim-token.dto";
import { MintNFTDTO } from "./dto/mint-nft.dto";

@Controller("solana")
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @Get("nft-collection")
  async getNFTCollection() {
    const data = await this.solanaService.getNFTCollection();
    return { collection: data };
  }

  @Get("wallet-token-balance/:userAddress")
  async getWalletTokenBalance(@Param("userAddress") userAddress: string) {
    const data = await this.solanaService.getWalletTokenBalance(userAddress);
    return { holdings: data };
  }

  @Get("wallet-holdings/:userAddress")
  async getWalletHoldings(@Param("userAddress") userAddress: string) {
    const data = await this.solanaService.getWalletNFTHoldings(userAddress);
    return { holdings: data };
  }

  @Post("claim-token")
  async claimMomentoToken(@Body() claimTokenDto: ClaimTokenDTO) {
    const data = await this.solanaService.claimMomentoToken(claimTokenDto);
    return { instruction: data };
  }

  @Post("mint-nft")
  async mintNFT(@Body() mintNFT: MintNFTDTO) {
    const data = await this.solanaService.mintNFT(mintNFT);
    return data;
  }
}
