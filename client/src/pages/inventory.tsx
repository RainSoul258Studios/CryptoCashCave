import { useInventory, useEquipItem } from "@/hooks/use-game-api";
import { GameButton, GameCard, GameBadge } from "@/components/ui/gamified";
import { Backpack, Sword, Shield, PackageOpen } from "lucide-react";

export default function InventoryPage() {
  const { data: items, isLoading } = useInventory();
  const equipItem = useEquipItem();

  if (isLoading) return <div className="p-8 text-center text-2xl font-bold animate-pulse">Opening Bag...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-amber-600 rounded-2xl game-border game-shadow text-white">
          <Backpack className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-display text-stroke-sm text-amber-500">INVENTORY</h1>
          <p className="text-lg font-bold text-muted-foreground">Manage your gear and power up.</p>
        </div>
      </div>

      {!items || items.length === 0 ? (
        <GameCard className="flex flex-col items-center justify-center py-20 text-center border-dashed border-4 border-muted">
          <PackageOpen className="w-20 h-20 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-muted-foreground">Your bag is empty!</h3>
          <p className="text-muted-foreground mt-2">Visit the Shop or defeat monsters to get items.</p>
        </GameCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <GameCard key={item.id} padding="p-4" className={`flex items-center gap-4 ${item.isEquipped ? 'ring-4 ring-primary bg-primary/5' : ''}`}>
              <div className="w-16 h-16 rounded-xl bg-background game-border flex items-center justify-center shrink-0">
                {item.itemType === 'weapon' ? <Sword className="w-8 h-8 text-red-400" /> : 
                 item.itemType === 'armor' ? <Shield className="w-8 h-8 text-blue-400" /> : 
                 <PackageOpen className="w-8 h-8 text-purple-400" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-lg font-black truncate">{item.itemName}</h3>
                  {item.isEquipped && (
                    <GameBadge color="bg-primary text-black shrink-0">Equipped</GameBadge>
                  )}
                </div>
                <p className="text-sm font-bold text-green-400">
                  +{item.statBoost} {item.itemType === 'weapon' ? 'ATK' : 'DEF'}
                </p>
              </div>

              {item.itemType !== 'potion' && (
                <GameButton 
                  size="sm"
                  variant={item.isEquipped ? "neutral" : "secondary"}
                  onClick={() => equipItem.mutate(item.id)}
                  disabled={equipItem.isPending || item.isEquipped}
                  className="shrink-0"
                >
                  {item.isEquipped ? "Equipped" : "Equip"}
                </GameButton>
              )}
            </GameCard>
          ))}
        </div>
      )}
    </div>
  );
}
