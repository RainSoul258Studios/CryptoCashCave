import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// ==========================================
// USER & AUTH
// ==========================================
export function useLogin() {
  const { setUser } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { username: string; walletAddress?: string }) => {
      const res = await fetch(api.users.login.path, {
        method: api.users.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to login");
      return api.users.login.responses[200].parse(await res.json());
    },
    onSuccess: (user) => {
      setUser(user);
      toast({ title: "Welcome to the Cave!", description: `Logged in as ${user.username}` });
    },
    onError: (err) => {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useCurrentUser() {
  const { userId, setUser } = useAuthStore();
  
  return useQuery({
    queryKey: [api.users.get.path, userId],
    queryFn: async () => {
      if (!userId) return null;
      const url = buildUrl(api.users.get.path, { id: userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch user");
      const user = api.users.get.responses[200].parse(await res.json());
      setUser(user); // Keep store in sync with fresh data
      return user;
    },
    enabled: !!userId,
  });
}

// ==========================================
// GAMEPLAY (CAVE)
// ==========================================
export function useGameAction() {
  const { userId, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (action: 'attack' | 'heal' | 'next_floor' | 'escape') => {
      if (!userId) throw new Error("Not logged in");
      const url = buildUrl(api.game.action.path, { userId });
      const res = await fetch(url, {
        method: api.game.action.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.game.action.responses[400].parse(data);
          throw new Error(error.message);
        }
        throw new Error("Action failed");
      }
      return api.game.action.responses[200].parse(data);
    },
    onSuccess: (data) => {
      // Update global user state with fresh stats
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData([api.users.get.path, userId], data.user);
      }
      
      // Fun toasts based on events
      if (data.died) {
        toast({ title: "💀 YOU DIED!", description: "Lost progress. Revived at Floor 1.", variant: "destructive" });
      } else if (data.monsterDefeated) {
        toast({ 
          title: "⚔️ Monster Defeated!", 
          description: `You earned $${((data.reward || 0) / 100).toFixed(2)} USDC!`,
          className: "bg-yellow-400 text-black border-4 border-black"
        });
      } else if (!data.success) {
        toast({ title: "Action Failed", description: data.message, variant: "destructive" });
      }
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

// ==========================================
// SHOP
// ==========================================
export function useBuyItem() {
  const { userId, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemName: string) => {
      if (!userId) throw new Error("Not logged in");
      const url = buildUrl(api.game.shop.buy.path, { userId });
      const res = await fetch(url, {
        method: api.game.shop.buy.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to buy item");
      return api.game.shop.buy.responses[200].parse(data);
    },
    onSuccess: (data) => {
      if (data.user) setUser(data.user);
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, userId] });
      queryClient.invalidateQueries({ queryKey: [api.game.inventory.list.path, userId] });
      toast({ title: "Item Purchased! 🛍️", description: data.message, className: "bg-green-400 text-black border-black border-4" });
    },
    onError: (err) => {
      toast({ title: "Cannot Purchase", description: err.message, variant: "destructive" });
    }
  });
}

// ==========================================
// INVENTORY
// ==========================================
export function useInventory() {
  const { userId } = useAuthStore();
  
  return useQuery({
    queryKey: [api.game.inventory.list.path, userId],
    queryFn: async () => {
      if (!userId) return [];
      const url = buildUrl(api.game.inventory.list.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.game.inventory.list.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useEquipItem() {
  const { userId, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: number) => {
      if (!userId) throw new Error("Not logged in");
      const url = buildUrl(api.game.inventory.equip.path, { userId });
      const res = await fetch(url, {
        method: api.game.inventory.equip.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to equip");
      return api.game.inventory.equip.responses[200].parse(data);
    },
    onSuccess: (data) => {
      if (data.user) setUser(data.user);
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, userId] });
      queryClient.invalidateQueries({ queryKey: [api.game.inventory.list.path, userId] });
      toast({ title: "Equipped! 🛡️", description: "Your stats have been updated." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

// ==========================================
// WALLET
// ==========================================
export function useWithdraw() {
  const { userId, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { address: string; amount: number }) => {
      if (!userId) throw new Error("Not logged in");
      const url = buildUrl(api.wallet.withdraw.path, { userId });
      const res = await fetch(url, {
        method: api.wallet.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Withdrawal failed");
      return api.wallet.withdraw.responses[200].parse(resData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, userId] });
      toast({ 
        title: "Withdrawal Successful! 💸", 
        description: `TxHash: ${data.txHash || 'Processing...'}`,
        className: "bg-blue-400 text-white border-black border-4" 
      });
    },
    onError: (err) => {
      toast({ title: "Withdrawal Failed", description: err.message, variant: "destructive" });
    }
  });
}
