import { z } from 'zod';
import { users, inventory, transactions } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  users: {
    login: {
      method: 'POST' as const,
      path: '/api/users/login' as const,
      input: z.object({ username: z.string(), walletAddress: z.string().optional() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
  },
  game: {
    action: {
      method: 'POST' as const,
      path: '/api/game/:userId/action' as const,
      input: z.object({ action: z.enum(['attack', 'heal', 'next_floor', 'escape']) }),
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          user: z.custom<typeof users.$inferSelect>(),
          reward: z.number().optional(),
          monsterDefeated: z.boolean().optional(),
          died: z.boolean().optional(),
        }),
        400: errorSchemas.validation,
      }
    },
    shop: {
      buy: {
        method: 'POST' as const,
        path: '/api/game/:userId/shop/buy' as const,
        input: z.object({ itemName: z.string() }),
        responses: {
          200: z.object({ success: z.boolean(), message: z.string(), user: z.custom<typeof users.$inferSelect>() }),
          400: errorSchemas.validation,
        }
      }
    },
    inventory: {
      equip: {
        method: 'POST' as const,
        path: '/api/game/:userId/inventory/equip' as const,
        input: z.object({ itemId: z.number() }),
        responses: {
          200: z.object({ success: z.boolean(), user: z.custom<typeof users.$inferSelect>() })
        }
      },
      list: {
        method: 'GET' as const,
        path: '/api/game/:userId/inventory' as const,
        responses: {
          200: z.array(z.custom<typeof inventory.$inferSelect>())
        }
      }
    }
  },
  wallet: {
    withdraw: {
      method: 'POST' as const,
      path: '/api/wallet/:userId/withdraw' as const,
      input: z.object({ address: z.string(), amount: z.number() }),
      responses: {
        200: z.object({ success: z.boolean(), message: z.string(), txHash: z.string().optional(), balance: z.number() }),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
