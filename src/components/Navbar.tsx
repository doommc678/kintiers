import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { useAdmin, logoutAdmin } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ServerStatus } from "@/components/ServerStatus";
import { DiscordButton } from "@/components/DiscordButton";
import { Shield, LogOut, Menu, X, Trophy, ListOrdered, Home, Handshake } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tiers", label: "Tier Lists", icon: ListOrdered },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/partners", label: "Partners", icon: Handshake },
] as const;

export function Navbar() {
  const admin = useAdmin();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass border-b border-primary/20">
      <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 py-3 gap-2">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0" onClick={() => setOpen(false)}>
          <img src={logo} alt="BlockTiers logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover ring-2 ring-primary/40 group-hover:ring-primary transition shrink-0" />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-base sm:text-lg font-bold gradient-text tracking-tight truncate">BlockTiers</span>
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Minecraft PvP Tiers</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <Link key={n.to} to={n.to} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground font-semibold" }}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden xl:block"><ServerStatus compact /></div>
          <div className="hidden sm:block"><DiscordButton compact /></div>
          {admin ? (
            <>
              <Link to="/admin" aria-label="Admin Dashboard" title="Admin Dashboard">
                <Button size="icon" variant="secondary"><Shield className="h-4 w-4" /></Button>
              </Link>
              <Button size="icon" variant="ghost" aria-label="Logout" title="Logout" onClick={() => { logoutAdmin(); router.navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/admin" aria-label="Admin Login" title="Admin">
              <Button size="icon" className="gradient-primary text-primary-foreground border-0 hover:opacity-90">
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button size="icon" variant="ghost" className="md:hidden" aria-label="Menu" onClick={() => setOpen(o => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-primary/15 bg-card/95 backdrop-blur-md animate-slide-up">
          <div className="container mx-auto px-3 py-3 grid gap-1">
            {NAV.map(n => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.to} to={n.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
                  activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
                >
                  <Icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
            <div className="pt-2 sm:hidden"><DiscordButton compact /></div>
          </div>
        </nav>
      )}
    </header>
  );
}
