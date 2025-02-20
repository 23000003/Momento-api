import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

// Timestamp has function trigger to auto default to current timestamp

export const usersTable = pgTable("testusers", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(), // has function trigger referenced to auths
  displayName: text("display_name"),
  otp: text("otp").notNull(),
  total_popularity: integer("total_popularity").default(0),
  tokens: integer("tokens").default(0),
  canClaimTokens: boolean("can_claim_tokens").default(false),
  canMintNFT: boolean("can_mint_nft").default(false),
  createdAt: timestamp("created_at"),
});

export const blogsTable = pgTable("blogs", {
  blogId: serial("blog_id").primaryKey(),
  title: varchar("title", { length: 50 }).notNull(),
  content: text("content").notNull(),
  capturedMoment: text("captured_moment").notNull(),
  semiCapturedMoment: text("semi_captured_moment").notNull(),
  popularity: integer("popularity").default(0),
  postedbyId: integer("postedby_id")
    .notNull()
    .references(() => usersTable.id),
  postedAt: timestamp("posted_at"),
});

export const notificationsTable = pgTable("notifications", {
  notifId: serial("notif_id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  notifType: integer("notif_type").notNull(),
  link: text("link").notNull(),
  notifAt: timestamp("posted_at"),
});

export const escrowTable = pgTable("escrow", {
  escrowId: serial("escrow_id").primaryKey(),
  escrowFrom: integer("escrow_from")
    .notNull()
    .references(() => usersTable.id),
  escrowTo: integer("escrow_to")
    .notNull()
    .references(() => usersTable.id),
  serializeTxhash: text("serialize_txhash").notNull(),
  escrowAt: timestamp("escrow_at"),
});

// Track marketplace data since theres no marketplace api for devnet
export const marketplaceTable = pgTable("marketplace", {
  marketId: serial("market_id").primaryKey(),
  nftAddress: text("nft_id").notNull(),
  listedByAddress: text("listed_by").notNull(),
  price: integer("price").notNull(),
  isSold: boolean("is_sold").default(false),
  listedAt: timestamp("listed_at"),
  soldAt: timestamp("sold_at"),
  soldToAddress: text("sold_to"),
});

export type GetBlogSchema = typeof blogsTable.$inferSelect;
export type InsertBlogSchema = typeof blogsTable.$inferInsert;
// ====================
export type GetNotificationSchema = typeof notificationsTable.$inferSelect;
export type InsertNotificationSchema = typeof notificationsTable.$inferInsert;
// ====================
export type GetEscrowSchema = typeof escrowTable.$inferSelect;
export type InsertEscrowSchema = typeof escrowTable.$inferInsert;
// ====================
export type InsertUserSchema = typeof usersTable.$inferInsert;
export type GetUserSchema = typeof usersTable.$inferSelect;
// ====================
export type GetMarketplaceSchema = typeof marketplaceTable.$inferSelect;
export type InsertMarketplaceSchema = typeof marketplaceTable.$inferInsert;
