import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.users.login.path, async (req, res) => {
    try {
      const input = api.users.login.input.parse(req.body);
      let user = await storage.getUserByUsername(input.username);
      
      if (!user) {
        // Create user if they don't exist
        user = await storage.createUser({
          username: input.username,
          walletAddress: input.walletAddress || null,
        });
        
        // Give them a starting weapon
        await storage.addInventoryItem({
          userId: user.id,
          itemName: "Rusty Sword",
          itemType: "weapon",
          statBoost: 5,
          isEquipped: true
        });
      }
      
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });

  app.post(api.game.action.path, async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const input = api.game.action.input.parse(req.body);
      
      let message = "";
      let reward = 0;
      let monsterDefeated = false;
      let died = false;
      let updates: Partial<typeof user> = {};

      if (input.action === 'attack') {
        // Simplified combat math
        const damageTaken = Math.max(0, 15 - user.defense);
        updates.health = Math.max(0, user.health - damageTaken);
        
        if (updates.health === 0) {
          died = true;
          message = "You died in the cave! Starting over.";
          updates.health = user.maxHealth;
          updates.currentFloor = 1;
        } else {
          // 50% chance to defeat monster on attack
          monsterDefeated = Math.random() > 0.5;
          if (monsterDefeated) {
            reward = 10 + (user.currentFloor * 5); // Base 10 cents + 5 per floor
            updates.balanceUsdc = user.balanceUsdc + reward;
            message = `You defeated a monster and found $${(reward / 100).toFixed(2)} USDC!`;
            
            // Record reward
            await storage.createTransaction({
              userId,
              type: 'reward',
              amount: reward,
              status: 'completed'
            });
          } else {
            message = `You attacked! The monster hit back for ${damageTaken} damage.`;
          }
        }
      } else if (input.action === 'heal') {
        const healCost = 20; // 20 cents
        if (user.balanceUsdc >= healCost) {
          updates.balanceUsdc = user.balanceUsdc - healCost;
          updates.health = user.maxHealth;
          message = "You healed back to full health for $0.20 USDC.";
        } else {
          message = "Not enough USDC to heal!";
        }
      } else if (input.action === 'next_floor') {
        updates.currentFloor = user.currentFloor + 1;
        message = `You advanced to floor ${updates.currentFloor}! Monsters are stronger here.`;
      } else if (input.action === 'escape') {
        updates.currentFloor = 1;
        updates.health = user.maxHealth;
        message = "You escaped the cave safely with your loot.";
      }

      const updatedUser = await storage.updateUser(userId, updates);
      res.json({
        success: true,
        message,
        user: updatedUser,
        reward,
        monsterDefeated,
        died
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.post(api.game.shop.buy.path, async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const input = api.game.shop.buy.input.parse(req.body);
      
      const shopItems: Record<string, { price: number, type: string, boost: number }> = {
        "Iron Sword": { price: 100, type: "weapon", boost: 10 },
        "Steel Shield": { price: 150, type: "armor", boost: 10 },
        "Health Potion": { price: 50, type: "potion", boost: 50 },
      };

      const item = shopItems[input.itemName];
      if (!item) return res.status(400).json({ message: "Item not found in shop" });

      if (user.balanceUsdc < item.price) {
        return res.status(400).json({ message: "Not enough USDC" });
      }

      const updatedUser = await storage.updateUser(userId, {
        balanceUsdc: user.balanceUsdc - item.price
      });

      await storage.addInventoryItem({
        userId,
        itemName: input.itemName,
        itemType: item.type,
        statBoost: item.boost,
        isEquipped: false
      });

      await storage.createTransaction({
        userId,
        type: 'purchase',
        amount: item.price,
        status: 'completed'
      });

      res.json({ success: true, message: `Bought ${input.itemName}!`, user: updatedUser });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.get(api.game.inventory.list.path, async (req, res) => {
    const items = await storage.getInventory(Number(req.params.userId));
    res.json(items);
  });

  app.post(api.game.inventory.equip.path, async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const input = api.game.inventory.equip.input.parse(req.body);
      
      await storage.equipItem(input.itemId, userId);
      
      // Recalculate stats
      const items = await storage.getInventory(userId);
      const equippedWeapons = items.filter(i => i.isEquipped && i.itemType === 'weapon');
      const equippedArmor = items.filter(i => i.isEquipped && i.itemType === 'armor');
      
      let attack = 10 + equippedWeapons.reduce((sum, item) => sum + item.statBoost, 0);
      let defense = 5 + equippedArmor.reduce((sum, item) => sum + item.statBoost, 0);
      
      const user = await storage.updateUser(userId, { attack, defense });
      
      res.json({ success: true, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.post(api.wallet.withdraw.path, async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const input = api.wallet.withdraw.input.parse(req.body);
      
      if (input.amount <= 0 || input.amount > user.balanceUsdc) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }

      // Simulate withdrawal tx hash
      const txHash = "0x" + crypto.randomBytes(32).toString('hex');
      
      const updatedUser = await storage.updateUser(userId, {
        balanceUsdc: user.balanceUsdc - input.amount
      });

      await storage.createTransaction({
        userId,
        type: 'withdrawal',
        amount: input.amount,
        status: 'completed',
        txHash
      });

      res.json({ 
        success: true, 
        message: `Successfully withdrawn $${(input.amount/100).toFixed(2)} to ${input.address}`,
        txHash,
        balance: updatedUser.balanceUsdc
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  return httpServer;
}
