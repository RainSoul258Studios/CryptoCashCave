import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/hooks/use-game-api";
import { useAuthStore } from "@/store/use-auth-store";
import { GameButton, GameCard } from "@/components/ui/gamified";
import { motion } from "framer-motion";
import { Swords, Coins } from "lucide-react";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [wallet, setWallet] = useState("");
  const login = useLogin();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    login.mutate(
      { username, walletAddress: wallet || undefined },
      { onSuccess: () => setLocation("/") }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8 relative">
          <motion.div 
            animate={{ rotate: [-2, 2, -2] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-block"
          >
            <h1 className="text-5xl md:text-6xl font-display text-stroke text-primary drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              CRYPTO
              <br/>
              <span className="text-white text-stroke-primary">CASH CAVE</span>
            </h1>
          </motion.div>
          <p className="mt-4 text-xl font-bold text-gray-300">Play. Battle. Earn USDC.</p>
        </div>

        <GameCard padding="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-primary">Player Name</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your hero's name"
                className="w-full bg-input game-border rounded-xl px-4 py-4 text-lg font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-green-400">Wallet Address (Optional)</label>
              <input 
                type="text" 
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x... for withdrawals"
                className="w-full bg-input game-border rounded-xl px-4 py-4 text-lg font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all"
              />
            </div>

            <GameButton 
              type="submit" 
              size="xl" 
              className="w-full flex items-center justify-center gap-3 mt-4 group"
              disabled={login.isPending || !username}
            >
              {login.isPending ? "Entering Cave..." : (
                <>
                  <Swords className="w-6 h-6 group-hover:animate-shake" />
                  ENTER GAME
                  <Coins className="w-6 h-6 text-yellow-200" />
                </>
              )}
            </GameButton>
          </form>
        </GameCard>
      </motion.div>
    </div>
  );
}
