import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { BlockchainConfigService } from "../blockchain-config.service";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { SolanaService } from "../solana/solana.service";
import { Drizzle } from "src/db/drizzle.service";
import { marketplaceTable } from "src/db/schema";
import { eq, min } from "drizzle-orm";
import {
  generateSigner,
  publicKey,
  sol,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import {
  BuyNFTDTO,
  DelistNFTDTO,
  GetMarketplaceCollectionDTO,
  SellNFTDTO,
} from "./dto/marketplace.dto";
// import { createTransferInstruction, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import {
  TokenStandard,
  transferV1,
} from "@metaplex-foundation/mpl-token-metadata";
// import {
//   fetchAsset,
//   fetchCollection,
//   transfer,
// } from '@metaplex-foundation/mpl-core'
// import { getExplorerLink } from "@solana-developers/helpers";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly web3: BlockchainConfigService,
    private readonly sol: SolanaService,
    private readonly db: Drizzle,
  ) {}

  async getCollectionData(): Promise<GetMarketplaceCollectionDTO | string> {
    const { collection, totalNFTs } = await this.sol.getNFTCollection();

    try {
      // Fetches unique holders
      const uniqueHolders = new Set(
        collection.items.map((item) => item.ownership.owner.toString()),
      ).size;

      // Fetches on sale nfts
      const mpWallet = await this.sol.getWalletNFTHoldings(
        this.web3.marketplaceKeyPair.publicKey.toString(),
      );

      const listedNFTs = await this.db
        .getDrizzleDB()
        .select({
          nftAddress: marketplaceTable.nftAddress,
          price: marketplaceTable.price,
        })
        .from(marketplaceTable)
        .where(eq(marketplaceTable.isSold, false));

      const onSaleMetadata = mpWallet.items.map((nft) => ({
        // Combine metadata with prices
        ...nft,
        price:
          listedNFTs.find((listed) => listed.nftAddress === nft.id.toString())
            ?.price ?? 0,
      }));

      // Fetches floor price
      const floorPrice = await this.db
        .getDrizzleDB()
        .select({ price: min(marketplaceTable.price) })
        .from(marketplaceTable)
        .where(eq(marketplaceTable.isSold, false))
        .then((result) => result[0]?.price ?? 0);

      // Calculate total volume
      const totalVolume = await this.db
        .getDrizzleDB()
        .select({ price: marketplaceTable.price })
        .from(marketplaceTable)
        .where(eq(marketplaceTable.isSold, true))
        .then((results) =>
          results.reduce((sum, record) => sum + (record.price ?? 0), 0),
        );

      return {
        uniqueHolders: uniqueHolders,
        totalSupply: totalNFTs,
        floorPrice: floorPrice,
        totalVolume: totalVolume,
        onSaleMetadata: onSaleMetadata,
      };
    } catch (e: unknown) {
      Logger.error(e);
      throw new BadRequestException({
        error: e instanceof Error ? e.message : e,
        message: "Error Fetching Collection.",
      });
    }
  }

  async getNFTData(nftAddress: string): Promise<DasApiAsset> {
    const nftPub = publicKey(nftAddress);
    const nftData = await this.web3.umi.rpc.getAsset(nftPub);

    return nftData;
  }

  async sellNFT(payload: SellNFTDTO): Promise<string> {
    const { nftAddress, price, listedByAddress } = payload;

    // const nftAddress = publicKey("FcVQhQ8NqRQvs2HR3JCXc6jauTJA2M9RidJnbhQVemwa");
    // const listedByAddress = publicKey("EBmwY3ecpy1oD8ohqAk6xJCwEbi344XxVvyxoEq5cAyY");
    Logger.log(payload);
    try {
      Logger.log(price);
      Logger.log(nftAddress);
      Logger.log(listedByAddress);

      await this.db.getDrizzleDB().insert(marketplaceTable).values(payload);

      const owner = generateSigner(this.web3.umi);
      owner.publicKey = publicKey(listedByAddress);

      Logger.log(owner.publicKey.toString());

      const builder = transactionBuilder()
        .add(
          transferV1(this.web3.umi, {
            mint: publicKey(nftAddress),
            authority: owner,
            tokenOwner: publicKey(listedByAddress),
            destinationOwner: this.web3.umi.identity.publicKey,
            tokenStandard: TokenStandard.NonFungible,
          }),
        )
        .add(
          transferSol(this.web3.umi, {
            source: owner,
            destination: this.web3.umi.identity.publicKey,
            amount: sol(0.008),
          }),
        );

      const toWeb3JS = builder.getInstructions().map(toWeb3JsInstruction);

      const transaction = new Transaction().add(...toWeb3JS);

      const { blockhash } =
        await this.web3.connection.getLatestBlockhash("finalized");

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.web3.dappKeyPair.publicKey;

      transaction.partialSign(this.web3.dappKeyPair);

      const serailizeTransac = transaction.serialize({
        requireAllSignatures: false,
      });

      const base64 = serailizeTransac.toString("base64");

      return base64;
    } catch (e: unknown) {
      Logger.error(e);
      throw new BadRequestException({
        error: e instanceof Error ? e.message : e,
        message: "Error Listing NFT.",
      });
    }
  }

  async buyNFT(mpId: number, payload: BuyNFTDTO): Promise<string> {
    const { price, nftAddress, listedByAddress, buyerAddress } = payload;

    // const nftAddress = "4HRrEmFDrDeSCLtvAaRAzGAqLr1vbUfh4AXgqzUcaw1D";
    // const listedByAddress = "EBmwY3ecpy1oD8ohqAk6xJCwEbi344XxVvyxoEq5cAyY";
    // const buyerAddress = "EBmwY3ecpy1oD8ohqAk6xJCwEbi344XxVvyxoEq5cAyY";

    try {
      await this.db
        .getDrizzleDB()
        .update(marketplaceTable)
        .set({ isSold: true })
        .where(eq(marketplaceTable.marketId, mpId));

      const owner = generateSigner(this.web3.umi);
      owner.publicKey = publicKey(buyerAddress);

      const builder = transactionBuilder()
        .add(
          transferV1(this.web3.umi, {
            mint: publicKey(nftAddress),
            tokenOwner: this.web3.umi.identity.publicKey,
            destinationOwner: publicKey(buyerAddress),
            tokenStandard: TokenStandard.NonFungible,
          }),
        )
        .add(
          transferSol(this.web3.umi, {
            source: owner,
            destination: publicKey(listedByAddress),
            amount: sol(price),
          }),
        );

      const toWeb3JS = builder.getInstructions().map(toWeb3JsInstruction);

      const transaction = new Transaction().add(...toWeb3JS);

      const { blockhash } =
        await this.web3.connection.getLatestBlockhash("finalized");

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.web3.dappKeyPair.publicKey;

      transaction.partialSign(this.web3.dappKeyPair);

      const serailizeTransac = transaction.serialize({
        requireAllSignatures: false,
      });

      const base64 = serailizeTransac.toString("base64");

      return base64;
    } catch (e: unknown) {
      Logger.error(e);
      throw new BadRequestException({
        error: e instanceof Error ? e.message : e,
        message: "Error Buying NFT.",
      });
    }
  }

  async delistNFT(
    mpId: number,
    payload: DelistNFTDTO,
  ): Promise<{ message: string } | string> {
    const { nftAddress, listedByAddress } = payload;
    // const nftAddress = "4HRrEmFDrDeSCLtvAaRAzGAqLr1vbUfh4AXgqzUcaw1D";
    // const listedByAddress = "EBmwY3ecpy1oD8ohqAk6xJCwEbi344XxVvyxoEq5cAyY";

    try {
      await transferV1(this.web3.umi, {
        mint: publicKey(nftAddress),
        tokenOwner: this.web3.umi.identity.publicKey,
        destinationOwner: publicKey(listedByAddress),
        tokenStandard: TokenStandard.NonFungible,
      }).sendAndConfirm(this.web3.umi, {
        send: { skipPreflight: true, commitment: "finalized" },
      });

      await this.db
        .getDrizzleDB()
        .delete(marketplaceTable)
        .where(eq(marketplaceTable.marketId, mpId));

      return {
        message: "NFT delisted successfully",
      };
    } catch (e: unknown) {
      Logger.error(e);
      throw new BadRequestException({
        error: e instanceof Error ? e.message : e,
        message: "Error Delisting NFT.",
      });
    }
  }
}
