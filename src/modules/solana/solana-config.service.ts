import { Injectable } from "@nestjs/common";
import { Account } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";
import { ConfigService } from "@nestjs/config";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";

@Injectable()
export class SolanaConfigService {
  public readonly dappKeyPair: Keypair;
  public readonly connection: Connection;
  public readonly mintToken: PublicKey;
  public readonly dappATA: Promise<Account>;
  public readonly umi = createUmi(clusterApiUrl("devnet"));

  constructor(private readonly configService: ConfigService) {
    this.dappKeyPair = Keypair.fromSecretKey(
      bs58.decode(this.configService.get("DAPP") as string),
    );
    this.connection = new Connection(clusterApiUrl("devnet"), "finalized");
    this.mintToken = new PublicKey(
      this.configService.get("MINT_TOKEN") as string,
    );
    this.dappATA = this.getATA();
    this.initializeUMI(this.dappKeyPair);
  }

  private async getATA(): Promise<Account> {
    return getOrCreateAssociatedTokenAccount(
      this.connection,
      this.dappKeyPair,
      this.mintToken,
      this.dappKeyPair.publicKey,
      false,
      "finalized",
      {
        skipPreflight: true,
      },
      TOKEN_2022_PROGRAM_ID,
    );
  }

  private initializeUMI(dappKeyPair: Keypair): void {
    const umiKeypair = this.umi.eddsa.createKeypairFromSecretKey(
      dappKeyPair.secretKey,
    );

    this.umi
      .use(keypairIdentity(umiKeypair))
      .use(mplTokenMetadata())
      .use(irysUploader())
      .use(dasApi());
  }
}
