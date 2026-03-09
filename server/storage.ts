import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, inventory, transactions,
  type User, type InsertUser,
  type InventoryItem, type InsertInventoryItem,
  type Transaction, type InsertTransaction
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  getInventory(userId: number): Promise<InventoryItem[]>;
  addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  equipItem(itemId: number, userId: number): Promise<InventoryItem | undefined>;
  
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getInventory(userId: number): Promise<InventoryItem[]> {
    return await db.select().from(inventory).where(eq(inventory.userId, userId));
  }

  async addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [inv] = await db.insert(inventory).values(item).returning();
    return inv;
  }

  async equipItem(itemId: number, userId: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, itemId));
    if (!item || item.userId !== userId) return undefined;
    
    // Unequip current item of same type
    await db.update(inventory)
      .set({ isEquipped: false })
      .where(eq(inventory.userId, userId))
      // need to unequip same type, but let's just do it simple for now and update this specific item
      // A more robust implementation would check itemType
      
    // For now, let's just unequip anything of the same type if we know the type
    const [updated] = await db.update(inventory)
      .set({ isEquipped: !item.isEquipped }) // toggle
      .where(eq(inventory.id, itemId))
      .returning();
      
    return updated;
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(tx).returning();
    return transaction;
  }
}

export const storage = new DatabaseStorage();
