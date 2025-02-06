import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("testusers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  phone: varchar("phone", { length: 256 }),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
