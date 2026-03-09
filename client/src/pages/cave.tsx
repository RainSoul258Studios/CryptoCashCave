import { useState } from "react";
import { useCurrentUser, useGameAction } from "@/hooks/use-game-api";
import { GameButton, GameCard, StatBar, GameBadge } from "@/components/ui/gamified";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sword, Heart, Skull, DoorOpen, PlaySquare } from "lucide-react";

export default function CavePage() {
  const { data: user, isLoading } = useCurrentUser();
  const gameAction = useGameAction();
  const [shake, setShake] = useState(false);
  const [monsterHit, setMonsterHit] = useState(false);

  if (isLoading || !user) return <div className="p-8 text-center text-2xl font-bold animate-pulse">Loading Cave...</div>;

  const handleAction = (action: 'attack' | 'heal' | 'next_floor' | 'escape') => {
    if (gameAction.isPending) return;
    
    // Trigger visual feedback immediately
    if (action === 'attack') {
      setMonsterHit(true);
      setTimeout(() => setMonsterHit(false), 400);
    } else if (action === 'heal') {
      // maybe add a heal glow effect later
    }

    gameAction.mutate(action, {
      onError: () => setShake(true),
    });
  };

  const isDead = user.health <= 0;

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      {/* Header Stats Area */}
      <GameCard className="flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-card to-background">
        <div className="flex flex-col">
          <span className="text-muted-foreground font-bold uppercase text-sm">Location</span>
          <h2 className="text-3xl font-display text-stroke-sm text-primary flex items-center gap-2">
            Floor {user.currentFloor} <Skull className="w-6 h-6" />
          </h2>
        </div>
        
        <div className="flex gap-4">
          <GameBadge color="bg-red-500 text-white flex items-center gap-1 text-sm px-4 py-2">
            <Sword className="w-4 h-4" /> {user.attack} ATK
          </GameBadge>
          <GameBadge color="bg-blue-500 text-white flex items-center gap-1 text-sm px-4 py-2">
            <Shield className="w-4 h-4" /> {user.defense} DEF
          </GameBadge>
        </div>
      </GameCard>

      {/* Main Battle Stage */}
      <div className="flex-1 min-h-[300px] relative flex flex-col items-center justify-center game-border game-shadow-lg rounded-3xl bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] overflow-hidden">
        
        {/* Cave background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
        </div>

        <AnimatePresence mode="wait">
          {isDead ? (
            <motion.div 
              key="dead"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center z-10"
            >
              <Skull className="w-32 h-32 text-destructive mx-auto mb-4 animate-pulse" />
              <h2 className="text-5xl font-display text-destructive text-stroke mb-6 transform -rotate-3">YOU DIED</h2>
              <GameButton size="lg" variant="primary" onClick={() => handleAction('next_floor')}>
                Revive at Floor 1
              </GameButton>
            </motion.div>
          ) : (
            <motion.div 
              key="alive"
              className="flex flex-col items-center w-full max-w-md px-6 z-10"
            >
              {/* The Monster (Simulated) */}
              <motion.div 
                className={`w-40 h-40 md:w-56 md:h-56 mb-8 relative ${monsterHit ? 'animate-shake' : 'animate-float'}`}
              >
                {/* A generic gamified monster representation using CSS shapes and emoji for MVP */}
                <div className="absolute inset-0 bg-purple-600 rounded-3xl transform rotate-45 game-border shadow-[0_0_30px_rgba(147,51,234,0.5)]"></div>
                <div className="absolute inset-0 bg-purple-500 rounded-3xl transform rotate-[25deg] game-border"></div>
                <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-8xl drop-shadow-xl z-10">
                  {monsterHit ? '😵' : '😈'}
                </div>
                
                {/* Hit effect flash */}
                <AnimatePresence>
                  {monsterHit && (
                    <motion.div 
                      initial={{ opacity: 0.8, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-red-500 rounded-full blur-xl z-0"
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Player Stats underneath monster */}
              <div className="w-full bg-black/50 p-4 rounded-2xl game-border border-white/10 backdrop-blur-sm">
                <StatBar 
                  label="Health" 
                  current={user.health} 
                  max={user.maxHealth} 
                  colorClass="bg-red-500" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <GameButton 
          variant="danger" 
          size="lg" 
          onClick={() => handleAction('attack')}
          disabled={gameAction.isPending || isDead}
          className="flex flex-col items-center justify-center gap-1 py-4 md:py-6"
        >
          <Sword className="w-8 h-8 md:w-10 md:h-10 mb-1" />
          <span>Attack</span>
        </GameButton>

        <GameButton 
          variant="success" 
          size="lg" 
          onClick={() => handleAction('heal')}
          disabled={gameAction.isPending || isDead || user.health >= user.maxHealth}
          className="flex flex-col items-center justify-center gap-1 py-4 md:py-6"
        >
          <Heart className="w-8 h-8 md:w-10 md:h-10 mb-1" />
          <span>Heal (-$0.50)</span>
        </GameButton>

        <GameButton 
          variant="primary" 
          size="lg" 
          onClick={() => handleAction('next_floor')}
          disabled={gameAction.isPending || isDead}
          className="flex flex-col items-center justify-center gap-1 py-4 md:py-6 text-black"
        >
          <DoorOpen className="w-8 h-8 md:w-10 md:h-10 mb-1" />
          <span>Next Floor</span>
        </GameButton>

        <GameButton 
          variant="neutral" 
          size="lg" 
          onClick={() => handleAction('escape')}
          disabled={gameAction.isPending || isDead || user.currentFloor === 1}
          className="flex flex-col items-center justify-center gap-1 py-4 md:py-6 bg-slate-600"
        >
          <PlaySquare className="w-8 h-8 md:w-10 md:h-10 mb-1" />
          <span>Escape</span>
        </GameButton>
      </div>
    </div>
  );
}
