import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (Players)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // e.g. wallet address or nickname
  walletAddress: text("wallet_address"),
  balanceUsdc: integer("balance_usdc").notNull().default(0), // stored in cents (100 = $1.00 USDC)
  currentFloor: integer("current_floor").notNull().default(1),
  health: integer("health").notNull().default(100),
  maxHealth: integer("max_health").notNull().default(100),
  attack: integer("attack").notNull().default(10),
  defense: integer("defense").notNull().default(5),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull(), // 'weapon', 'armor', 'potion'
  statBoost: integer("stat_boost").notNull(),
  isEquipped: boolean("is_equipped").notNull().default(false),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'reward', 'purchase'
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
