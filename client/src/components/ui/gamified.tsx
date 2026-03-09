import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Reusable Gamified Components to maintain aesthetic consistency

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary text-black hover:brightness-110",
      secondary: "bg-secondary text-white hover:brightness-110",
      danger: "bg-destructive text-white hover:brightness-110",
      success: "bg-success text-white hover:brightness-110",
      neutral: "bg-muted text-white hover:brightness-110",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm font-bold",
      md: "px-5 py-2.5 text-lg font-bold",
      lg: "px-8 py-4 text-xl font-bold",
      xl: "px-10 py-6 text-2xl font-black uppercase tracking-widest",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "btn-arcade game-border game-shadow rounded-xl active:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GameButton.displayName = "GameButton";

export const GameCard = ({ children, className, padding = "p-6" }: { children: React.ReactNode, className?: string, padding?: string }) => (
  <div className={cn("bg-card game-border game-shadow-lg rounded-2xl", padding, className)}>
    {children}
  </div>
);

export const GameBadge = ({ children, className, color = "bg-primary text-black" }: { children: React.ReactNode, className?: string, color?: string }) => (
  <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider game-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", color, className)}>
    {children}
  </span>
);

export const StatBar = ({ 
  label, 
  current, 
  max, 
  colorClass 
}: { 
  label: string; 
  current: number; 
  max: number; 
  colorClass: string;
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className="w-full mb-3">
      <div className="flex justify-between items-end mb-1 px-1">
        <span className="font-bold text-sm text-foreground/90 uppercase tracking-wider font-display">{label}</span>
        <span className="font-black text-sm">{current}/{max}</span>
      </div>
      <div className="h-6 w-full bg-black rounded-full p-1 game-border overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          className={cn("h-full rounded-full", colorClass)}
        />
        {/* Shine effect */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 rounded-full mx-2 mt-0.5"></div>
      </div>
    </div>
  );
};

export const FormatUsdc = ({ cents }: { cents: number }) => {
  return <span className="font-display tracking-widest text-green-400 drop-shadow-md text-stroke-sm">${(cents / 100).toFixed(2)}</span>;
};
