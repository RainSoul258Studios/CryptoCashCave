import { useBuyItem, useCurrentUser } from "@/hooks/use-game-api";
import { GameButton, GameCard, FormatUsdc, GameBadge } from "@/components/ui/gamified";
import { Store, Sword, Shield, FlaskConical } from "lucide-react";

// Mock store items since we don't have a GET /shop endpoint defined in schema
// We pass itemName to the buy mutation
const SHOP_ITEMS = [
  { name: "Iron Sword", type: "weapon", boost: "+5 ATK", price: 200, icon: Sword, color: "text-red-400" },
  { name: "Steel Broadsword", type: "weapon", boost: "+15 ATK", price: 800, icon: Sword, color: "text-red-500" },
  { name: "Leather Armor", type: "armor", boost: "+5 DEF", price: 250, icon: Shield, color: "text-blue-400" },
  { name: "Mithril Plate", type: "armor", boost: "+15 DEF", price: 1000, icon: Shield, color: "text-blue-500" },
  { name: "Health Potion", type: "potion", boost: "Full Heal", price: 150, icon: FlaskConical, color: "text-green-400" },
];

export default function ShopPage() {
  const { data: user } = useCurrentUser();
  const buyItem = useBuyItem();

  const handleBuy = (itemName: string, price: number) => {
    if (!user) return;
    if (user.balanceUsdc < price) return; // Prevent clicking if too poor
    buyItem.mutate(itemName);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-yellow-500 rounded-2xl game-border game-shadow text-black">
          <Store className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-display text-stroke-sm text-yellow-400">CAVE MERCHANT</h1>
          <p className="text-lg font-bold text-muted-foreground">Spend your hard-earned USDC here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_ITEMS.map((item, idx) => {
          const canAfford = user ? user.balanceUsdc >= item.price : false;
          
          return (
            <GameCard key={idx} className="flex flex-col relative group overflow-hidden transition-transform hover:-translate-y-2">
              {/* Type Badge */}
              <div className="absolute top-4 right-4 z-10">
                <GameBadge color="bg-background text-white/70 border-white/20">
                  {item.type}
                </GameBadge>
              </div>

              <div className="flex-1 flex flex-col items-center text-center pt-8 pb-4">
                <item.icon className={`w-16 h-16 mb-4 ${item.color} drop-shadow-lg group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-black mb-1">{item.name}</h3>
                <p className="text-lg font-bold text-green-400 mb-6 bg-green-400/10 px-3 py-1 rounded-lg">
                  {item.boost}
                </p>
              </div>

              <div className="mt-auto border-t-2 border-white/10 pt-4">
                <GameButton 
                  variant={canAfford ? "primary" : "neutral"}
                  className="w-full"
                  disabled={!canAfford || buyItem.isPending}
                  onClick={() => handleBuy(item.name, item.price)}
                >
                  {buyItem.isPending && buyItem.variables === item.name ? "Buying..." : (
                    <span className="flex items-center justify-center gap-2">
                      Buy for <FormatUsdc cents={item.price} />
                    </span>
                  )}
                </GameButton>
              </div>
            </GameCard>
          );
        })}
      </div>
    </div>
  );
}
