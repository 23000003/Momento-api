import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
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
  // sol,
  transactionBuilder,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { getExplorerLink } from "@solana-developers/helpers";
// import { promises as fs } from "fs";
// import { console } from 'inspector';
import { Logger } from "@nestjs/common";
// import { das } from "@metaplex-foundation/mpl-core-das";
import {
  createNft,
  // createV1,
  findMetadataPda,
  // mintV1,
  // TokenStandard,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
// import { addMemo, createMintWithAssociatedToken, transferSol } from "@metaplex-foundation/mpl-toolbox";
// import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
// import { mintFromCandyMachineV2 } from "@metaplex-foundation/mpl-candy-machine";
// import { create } from "@metaplex-foundation/mpl-core";
import { DasApiAssetList } from "@metaplex-foundation/digital-asset-standard-api";

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
    } catch (e: unknown) {
      Logger.error(e);
      throw new BadRequestException({
        error: e instanceof Error ? e.message : e,
        message: "Error Getting Token Balance.",
      });
    }
  }

  async getWalletNFTHoldings(userAddress: string) {
    const owner = UMIPublicKey(userAddress);
    const assets = await this.sol.umi.rpc.getAssetsByOwner({
      owner,
    });

    return assets;
  }

  async getNFTCollection(): Promise<{
    collection: DasApiAssetList;
    totalNFTs: number;
  }> {
    const assets = await this.sol.umi.rpc.getAssetsByGroup({
      groupKey: "collection",
      groupValue: this.sol.collectionAddress.toString(),
    });

    return {
      collection: assets,
      totalNFTs: assets.total,
    };
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
      return base64;
    } catch (error: unknown) {
      Logger.error(error);
      if (error instanceof TokenAccountNotFoundError) {
        throw new BadRequestException(error);
      } else {
        throw new BadRequestException({
          error: error instanceof Error ? error.message : error,
          message: "Error Claiming Token.",
        });
      }
    }
  }

  async mintNFT(payload: MintNFTDTO): Promise<{
    message: string;
    explorerLink: string;
  }> {
    const { publicKey, image } = payload;

    console.log(publicKey, image); // eslint

    // Test nft image url
    const img =
      "https://wfiljmekszmbpzaqaxys.supabase.co/storage/v1/object/public/images//e43b427f-70ab-48cb-8770-923563ebc74a";

    try {
      const { totalNFTs } = await this.getNFTCollection();
      Logger.log(totalNFTs, "TOTAL NFTS");
      Logger.log(publicKey, "USER PUBLIC KEY");

      const nftMetadata = {
        name: `Test NFT #${totalNFTs + 1}`,
        description: "WASSUP MY FRIEND",
        image: img,
        attributes: [
          {
            trait_type: "trait1",
            value: "value1",
          },
          {
            trait_type: "trait2",
            value: "value2",
          },
        ],
      };

      Logger.log("Metadata JSON uploading");
      const uri = await this.sol.umi.uploader.uploadJson(nftMetadata);

      // Unique mintAddress for the nft
      const nftMintAddress = generateSigner(this.sol.umi);

      // Nft Address
      const nftAddress = UMIPublicKey(nftMintAddress.publicKey.toString());
      Logger.log(nftAddress, "NFT ADDRESS");

      // collection PDA
      const collectionPDA = findMetadataPda(this.sol.umi, { mint: nftAddress });

      Logger.log("Build Transaction");
      const builder = transactionBuilder()
        .add(setComputeUnitLimit(this.sol.umi, { units: 800_000 }))
        .add(
          createNft(this.sol.umi, {
            // mint nft
            mint: nftMintAddress,
            name: "Test Part 2 Collection #5",
            symbol: "TPC",
            uri,
            updateAuthority: this.sol.umi.identity.publicKey,
            sellerFeeBasisPoints: percentAmount(0),
            tokenOwner: UMIPublicKey(publicKey),
            collection: {
              key: this.sol.collectionAddress,
              verified: false,
            },
          }),
        )
        .add(
          verifyCollectionV1(this.sol.umi, {
            // verify nft to nft collection
            metadata: collectionPDA,
            collectionMint: this.sol.collectionAddress,
            authority: this.sol.umi.identity,
          }),
        );

      Logger.log("Send Transaction");
      const { signature, result } = await builder.sendAndConfirm(this.sol.umi, {
        send: {
          skipPreflight: true,
          commitment: "finalized",
        },
      });

      Logger.log("NFT MINTED");
      Logger.log(signature, "SIGNATURE");
      Logger.log(result, "RESULT");
      Logger.log(nftMintAddress, "nftMintAddress");
      Logger.log("NFT created and confirmed");

      // //metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s

      const explorerLink = getExplorerLink(
        "address",
        nftMintAddress.publicKey,
        "devnet",
      );
      Logger.log(`Collection NFT: ${explorerLink}`);
      Logger.log(`Collection NFT address:`, nftMintAddress.publicKey);

      return {
        message: "NFT minted successfully!",
        explorerLink: explorerLink,
      };
    } catch (error: unknown) {
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(this.sol.connection);
        Logger.error(logs);
        throw new BadRequestException(error);
      } else {
        throw new BadRequestException({
          error: error instanceof Error ? error.message : error,
          message: "Error Minting NFT.",
        });
      }
    }
  }
}
