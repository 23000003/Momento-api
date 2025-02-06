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
  SendTransactionError,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { BlockchainConfigService } from "../blockchain-config.service";
import { ClaimTokenDTO } from "./dto/claim-token.dto";
import { MintNFTDTO } from "./dto/mint-nft.dto";
import {
  // createGenericFile,
  generateSigner,
  percentAmount,
  publicKey,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { getExplorerLink } from "@solana-developers/helpers";
// import { promises as fs } from "fs";
// import { console } from 'inspector';
import { Logger } from "@nestjs/common";
// import { das } from "@metaplex-foundation/mpl-core-das";
import {
  createNft,
  findMetadataPda,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";

@Injectable()
export class SolanaService implements OnModuleInit {
  private dappATA: Account;

  constructor(private readonly sol: BlockchainConfigService) {}

  async onModuleInit() {
    this.dappATA = await this.sol.dappATA;
  }

  async getWalletTokenBalance(
    userAddress: string,
  ): Promise<{ SOL: number; MMT: number } | string> {
    try {
      const getUserATA = await getOrCreateAssociatedTokenAccount(
        this.sol.connection,
        this.sol.dappKeyPair,
        this.sol.mintToken,
        new PublicKey(userAddress),
        false,
        "finalized",
        {
          skipPreflight: true,
        },
        TOKEN_2022_PROGRAM_ID,
      );

      const solBalance = await this.sol.connection.getBalance(
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

  async getNFTCollection(): Promise<string> {
    const collection = publicKey(
      "BQsupfq2mB8WYgmQczCKLbMT1tz3JDBbTsFEENdy4uT8",
    );

    Logger.log(collection, "COLLECTION");
    const assets = await this.sol.umi.rpc.getAssetsByGroup({
      groupKey: "collection",
      groupValue: "BQsupfq2mB8WYgmQczCKLbMT1tz3JDBbTsFEENdy4uT8",
    });

    Logger.log(assets, "ASSETS");

    return "NTAT";
  }

  async claimMomentoToken(payload: ClaimTokenDTO): Promise<string> {
    const { publicKey, amount } = payload;

    const sendToAddress = new PublicKey(publicKey);

    try {
      const sendToATA = await getOrCreateAssociatedTokenAccount(
        this.sol.connection,
        this.sol.dappKeyPair,
        this.sol.mintToken,
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
        await this.sol.connection.getLatestBlockhash("finalized");

      const transaction = new Transaction();

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.sol.dappKeyPair.publicKey;

      const lamports =
        await this.sol.connection.getMinimumBalanceForRentExemption(5);

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: sendToAddress,
          toPubkey: this.sol.dappKeyPair.publicKey,
          lamports,
        }),
      );

      transaction.add(
        createTransferCheckedInstruction(
          this.dappATA.address,
          this.sol.mintToken, // mint
          sendToATA.address, // destination
          this.sol.dappKeyPair.publicKey, // owner of source account
          amount * LAMPORTS_PER_SOL, // amount to transfer
          9, // decimals of my created token
          [this.sol.dappKeyPair, sendToAddress], // signers
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      transaction.partialSign(this.sol.dappKeyPair);

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
      Logger.log(this.sol.umi.identity.publicKey, "PUBLIC KEY");
      // Fetch the image from the URL
      // const res = await fetch(img);

      // const arrayBuffer = await res.arrayBuffer();
      // const buffer = Buffer.from(arrayBuffer);

      Logger.log("Convert image");
      // Logger.log(buffer, "BUFFER");
      // Create a generic file for upload
      // const file = createGenericFile(buffer, "test-image.jpg", {
      //     contentType: "image/jpeg",
      // });

      Logger.log("Generic file created");

      // const [imageUMI] = await this.sol.umi.uploader.upload([file]);

      Logger.log("Image uploaded to UMI");

      // const uri = await this.sol.umi.uploader.uploadJson({
      //     name: "My Collection",
      //     description: "My Collection description",
      //     image: imageUMI, // Use the uploaded image URI
      // });

      // Unique mintAddress for the nft
      const nftMintAddress = generateSigner(this.sol.umi);

      const nftMetadata = {
        name: "VERIFY IT #@#",
        description: "WASSUPP",
        image: img,
      };

      Logger.log("Metadata JSON uploading");

      const uri = await this.sol.umi.uploader.uploadJson(nftMetadata);

      Logger.log(uri, "MINT");

      // Dummy NFT collection
      const collectionNftAddress = UMIPublicKey(
        "BQsupfq2mB8WYgmQczCKLbMT1tz3JDBbTsFEENdy4uT8",
      );

      // Mint the NFT
      const { signature, result } = await createNft(this.sol.umi, {
        mint: nftMintAddress,
        name: "Test Part 2 Collection #5",
        symbol: "TPC",
        uri,
        updateAuthority: this.sol.umi.identity.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
        collection: {
          key: collectionNftAddress,
          verified: false,
        },
      }).sendAndConfirm(this.sol.umi, {
        send: { commitment: "finalized" },
      });

      Logger.log("NFT MINTED");

      // Nft Mint Address
      const nftAddress = UMIPublicKey(nftMintAddress.publicKey.toString());
      Logger.log(nftAddress, "NFT ADDRESS");

      // Verify the collection
      const metadata = findMetadataPda(this.sol.umi, { mint: nftAddress });

      Logger.log("Verify Collection");
      await verifyCollectionV1(this.sol.umi, {
        metadata,
        collectionMint: collectionNftAddress,
        authority: this.sol.umi.identity,
      }).sendAndConfirm(this.sol.umi);

      Logger.log("Collection Verified");
      const explorerVerifyLink = getExplorerLink(
        "address",
        nftAddress,
        "devnet",
      );
      Logger.log(`verified collection:  ${explorerVerifyLink}`);

      Logger.log(signature, "SIGNATURE");
      Logger.log(result, "RESULT");
      Logger.log(nftMintAddress, "nftMintAddress");
      Logger.log("NFT created and confirmed");

      //metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s

      const explorerLink = getExplorerLink(
        "address",
        nftMintAddress.publicKey,
        "devnet",
      );
      Logger.log(`Collection NFT: ${explorerLink}`);
      Logger.log(`Collection NFT address:`, nftMintAddress.publicKey);

      /**
       * will create a transfer instruction for user to receive the nft
       */

      return `NFT minted successfully! Mint address: ${nftMintAddress.publicKey.toString()}`;
    } catch (error) {
      Logger.error("Error minting NFT:", error);
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(this.sol.connection);
        Logger.error(logs);
      }
      return "Failed to mint NFT.";
    }
  }

  sellNFT(): string {
    return "NFT";
  }
}
