import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  Account,
  createTransferCheckedInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SolanaConfigService } from "./solana-config.service";
import { ClaimTokenDTO } from "./dto/claim-token.dto";
import { MintNFTDTO } from "./dto/mint-nft.dto";
import {
  // createGenericFile,
  generateSigner,
  percentAmount,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { getExplorerLink } from "@solana-developers/helpers";
// import { promises as fs } from "fs";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
// import { console } from 'inspector';
import { Logger } from "@nestjs/common";

@Injectable()
export class SolanaService implements OnModuleInit {
  private dappATA: Account;

  constructor(private readonly solanaConfig: SolanaConfigService) {}

  async onModuleInit() {
    this.dappATA = await this.solanaConfig.dappATA;
  }

  async getWalletTokenBalance(
    userAddress: string,
  ): Promise<{ SOL: number; MMT: number } | string> {
    try {
      const getUserATA = await getOrCreateAssociatedTokenAccount(
        this.solanaConfig.connection,
        this.solanaConfig.dappKeyPair,
        this.solanaConfig.mintToken,
        new PublicKey(userAddress),
        false,
        "finalized",
        {
          skipPreflight: true,
        },
        TOKEN_2022_PROGRAM_ID,
      );

      const solBalance = await this.solanaConfig.connection.getBalance(
        new PublicKey(userAddress),
      );

      return {
        SOL: solBalance / LAMPORTS_PER_SOL,
        MMT: Number(getUserATA.amount) / LAMPORTS_PER_SOL,
      };
    } catch (err) {
      Logger.error(err);
      return `${err} Error getting token balance`;
    }
  }

  getWalletNFTHoldings(): string {
    return "TWA";
  }

  getNFTCollection(): string {
    return "NTAT";
  }

  async claimMomentoToken(payload: ClaimTokenDTO): Promise<string> {
    const { publicKey, amount } = payload;

    const sendToAddress = new PublicKey(publicKey);

    try {
      const sendToATA = await getOrCreateAssociatedTokenAccount(
        this.solanaConfig.connection,
        this.solanaConfig.dappKeyPair,
        this.solanaConfig.mintToken,
        sendToAddress,
        false,
        "finalized",
        {
          skipPreflight: true,
        },
        TOKEN_2022_PROGRAM_ID,
      );

      Logger.log(sendToATA);

      const { blockhash } =
        await this.solanaConfig.connection.getLatestBlockhash("finalized");

      const transaction = new Transaction();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.solanaConfig.dappKeyPair.publicKey;

      const lamports =
        await this.solanaConfig.connection.getMinimumBalanceForRentExemption(5);

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: sendToAddress,
          toPubkey: this.solanaConfig.dappKeyPair.publicKey,
          lamports,
        }),
      );

      transaction.add(
        createTransferCheckedInstruction(
          this.dappATA.address,
          this.solanaConfig.mintToken, // mint
          sendToATA.address, // destination
          this.solanaConfig.dappKeyPair.publicKey, // owner of source account
          amount * LAMPORTS_PER_SOL, // amount to transfer
          9, // decimals of my created token
          [this.solanaConfig.dappKeyPair, sendToAddress], // signers
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      transaction.partialSign(this.solanaConfig.dappKeyPair);

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
      });

      const base64 = serializedTransaction.toString("base64");

      // console.log("-------------------\n")
      // console.log(base64)
      // console.log("\n-------------------")

      return base64;
    } catch (error) {
      Logger.error(error);
      if (error instanceof TokenAccountNotFoundError) {
        Logger.error(error.message, "HERE");
      }
      return "Transaction Error";
    }
  }

  async mintNFT(payload: MintNFTDTO): Promise<string> {
    const { publicKey, image } = payload;

    console.log(publicKey, image); // eslint

    // Test nft image url
    const img =
      "https://wfiljmekszmbpzaqaxys.supabase.co/storage/v1/object/public/images//pfp.jpg";

    try {
      // Fetch the image from the URL
      // const res = await fetch(img);

      // const arrayBuffer = await res.arrayBuffer();
      // const buffer = Buffer.from(arrayBuffer);

      Logger.log("Convert image");
      // Logger.log(buffer, "BUFFER");
      Logger.log(this.solanaConfig.umi.identity.publicKey, "PUBLIC KEY");
      // Create a generic file for upload
      // const file = createGenericFile(buffer, "test-image.jpg", {
      //     contentType: "image/jpeg",
      // });

      Logger.log("Generic file created");

      // const [imageUMI] = await this.solanaConfig.umi.uploader.upload([file]);

      Logger.log("Image uploaded to UMI");

      // const uri = await this.solanaConfig.umi.uploader.uploadJson({
      //     name: "My Collection",
      //     description: "My Collection description",
      //     image: imageUMI, // Use the uploaded image URI
      // });

      /**
       * Create a
       */
      const collectionMint = generateSigner(this.solanaConfig.umi);

      Logger.log(this.solanaConfig.umi.identity.publicKey, "PUBLIC KEY");

      const nftMetadata = {
        name: "Test Part 2 Collection 2232",
        description: "dohod description",
        image: img,
      };

      Logger.log("Metadata JSON uploading");

      const uri = await this.solanaConfig.umi.uploader.uploadJson(nftMetadata);

      Logger.log(uri, "MINT");

      // Dummy NFT collection
      const collectionNftAddress = UMIPublicKey(
        "BQsupfq2mB8WYgmQczCKLbMT1tz3JDBbTsFEENdy4uT8",
      );

      // Mint the NFT
      const { signature, result } = await createNft(this.solanaConfig.umi, {
        mint: collectionMint,
        name: "Test Part 2 Collection #5",
        symbol: "TPC",
        uri,
        updateAuthority: this.solanaConfig.umi.identity.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
        collection: {
          key: collectionNftAddress,
          verified: false,
        },
      }).sendAndConfirm(this.solanaConfig.umi, {
        send: { commitment: "finalized" },
      });

      Logger.log(signature, "SIGNATURE");
      Logger.log(result, "RESULT");
      Logger.log(collectionMint, "CollectioNMint");
      Logger.log("NFT created and confirmed");

      const explorerLink = getExplorerLink(
        "address",
        collectionMint.publicKey,
        "devnet",
      );
      Logger.log(`Collection NFT: ${explorerLink}`);
      Logger.log(`Collection NFT address:`, collectionMint.publicKey);

      /**
       * will create a transfer instruction for user to receive the nft
       */

      return `NFT minted successfully! Mint address: ${collectionMint.publicKey.toString()}`;
    } catch (error) {
      Logger.error("Error minting NFT:", error);
      return "Failed to mint NFT.";
    }
  }

  sellNFT(): string {
    return "NFT";
  }
}
