import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/store/use-auth-store";
import { useCurrentUser } from "@/hooks/use-game-api";
import { Swords, Store, Backpack, Wallet, LogOut } from "lucide-react";
import { FormatUsdc } from "@/components/ui/gamified";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuthStore();
  const { data: user } = useCurrentUser();

  if (!user) return <>{children}</>;

  const navItems = [
    { href: "/", label: "Cave", icon: Swords, color: "text-red-400" },
    { href: "/shop", label: "Shop", icon: Store, color: "text-yellow-400" },
    { href: "/inventory", label: "Bag", icon: Backpack, color: "text-amber-600" },
    { href: "/wallet", label: "Wallet", icon: Wallet, color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto overflow-hidden relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card game-border-b z-20 shadow-lg relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary game-border flex items-center justify-center font-black text-black text-xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm">{user.username}</span>
            <span className="font-black text-lg"><FormatUsdc cents={user.balanceUsdc} /></span>
          </div>
        </div>
        <button onClick={logout} className="p-2 bg-destructive game-border rounded-lg active:translate-y-1">
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-card game-border-r min-h-screen p-6 z-20 relative">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-display text-stroke-primary text-primary mb-6 transform -rotate-2">
            CRYPTO<br/>CASH CAVE
          </h1>
          <div className="bg-background game-border rounded-xl p-4 transform rotate-1 shadow-inner">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary game-border flex items-center justify-center font-black text-black text-3xl mb-2 shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <p className="font-black text-xl mb-1">{user.username}</p>
            <div className="bg-black/50 rounded-lg p-2 game-border border-white/10 mt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase mb-1">Treasury</p>
              <p className="text-2xl font-black"><FormatUsdc cents={user.balanceUsdc} /></p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl game-border transition-all font-bold text-lg",
                  isActive 
                    ? "bg-primary text-black game-shadow translate-x-2" 
                    : "bg-background text-foreground hover:bg-muted hover:-translate-y-1 hover:game-shadow-sm"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive ? "text-black" : item.color)} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center justify-center gap-2 p-4 rounded-xl bg-destructive text-white game-border game-shadow hover:-translate-y-1 active:translate-y-0 active:game-shadow-none transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative z-10">
        {/* Subtle decorative background elements */}
        <div className="fixed top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="fixed bottom-20 left-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="p-4 md:p-8 max-w-4xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card game-border-t z-50 flex justify-around p-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[70px]",
                isActive ? "bg-primary game-border game-shadow-sm -translate-y-2 text-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive ? "text-black" : item.color)} />
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
