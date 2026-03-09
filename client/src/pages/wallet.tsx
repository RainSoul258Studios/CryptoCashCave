import { useState } from "react";
import { useCurrentUser, useWithdraw } from "@/hooks/use-game-api";
import { GameButton, GameCard, FormatUsdc } from "@/components/ui/gamified";
import { Wallet, ArrowRight, Activity } from "lucide-react";

export default function WalletPage() {
  const { data: user } = useCurrentUser();
  const withdraw = useWithdraw();
  const [address, setAddress] = useState(user?.walletAddress || "");
  const [amountStr, setAmountStr] = useState("");

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amountStr) return;
    
    // Convert float dollar amount to cents for API
    const amountCents = Math.floor(parseFloat(amountStr) * 100);
    if (isNaN(amountCents) || amountCents <= 0) return;

    withdraw.mutate({ address, amount: amountCents });
  };

  const setMax = () => {
    if (user) {
      setAmountStr((user.balanceUsdc / 100).toString());
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-green-500 rounded-2xl game-border game-shadow text-black">
          <Wallet className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-display text-stroke-sm text-green-400">WEB3 WALLET</h1>
          <p className="text-lg font-bold text-muted-foreground">Withdraw your spoils to Base Mainnet.</p>
        </div>
      </div>

      <GameCard className="bg-gradient-to-br from-card to-card/50">
        <div className="text-center mb-8 p-6 bg-black/30 rounded-xl game-border border-white/10">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Available Balance</p>
          <div className="text-5xl">
            {user ? <FormatUsdc cents={user.balanceUsdc} /> : "$0.00"}
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-green-400">Destination Address</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-input game-border rounded-xl px-4 py-4 font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold uppercase tracking-wider text-primary">Amount (USDC)</label>
              <button 
                type="button" 
                onClick={setMax}
                className="text-xs font-bold text-primary hover:underline px-2 py-1 rounded bg-primary/10"
              >
                MAX
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">$</span>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                max={user ? user.balanceUsdc / 100 : 0}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full bg-input game-border rounded-xl pl-8 pr-4 py-4 text-xl font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          </div>

          <GameButton 
            type="submit" 
            size="xl" 
            variant="success"
            className="w-full flex items-center justify-center gap-3 mt-8"
            disabled={withdraw.isPending || !address || !amountStr || parseFloat(amountStr) <= 0 || (user && parseFloat(amountStr) * 100 > user.balanceUsdc)}
          >
            {withdraw.isPending ? (
              <span className="flex items-center gap-2"><Activity className="animate-spin" /> Processing Tx...</span>
            ) : (
              <>WITHDRAW TO BASE <ArrowRight className="w-6 h-6" /></>
            )}
          </GameButton>
        </form>
      </GameCard>
      
      <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mt-8">
        Powered by simulated on-chain transfers
      </p>
    </div>
  );
}
