import { Link, useRouter } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { useAdmin, logoutAdmin } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ServerStatus } from "@/components/ServerStatus";
import { DiscordButton } from "@/components/DiscordButton";
import { Shield, LogOut } from "lucide-react";

export function Navbar() {
  const admin = useAdmin();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 glass border-b border-primary/20">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="KinTiers logo"
            className="h-10 w-10 rounded-lg object-cover ring-2 ring-primary/40 group-hover:ring-primary transition"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold gradient-text tracking-tight">KinTiers</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Minecraft PvP Tiers</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Home</Link>
          <Link to="/tiers" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Tier Lists</Link>
          <Link to="/leaderboard" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition" activeProps={{ className: "text-foreground" }}>Leaderboard</Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block"><ServerStatus compact /></div>
          <DiscordButton compact />
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
        </div>
      </div>
    </header>
  );
}
