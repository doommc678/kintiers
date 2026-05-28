import { Link, useRouter } from "@tanstack/react-router";
import logo from "@/assets/logo.jpg";
import { useAdmin, logoutAdmin } from "@/lib/store";
import { Button } from "@/components/ui/button";

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
          {admin ? (
            <>
              <Link to="/admin">
                <Button size="sm" variant="secondary">Admin</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => { logoutAdmin(); router.navigate({ to: "/" }); }}>Logout</Button>
            </>
          ) : (
            <Link to="/admin">
              <Button size="sm" className="gradient-primary text-primary-foreground border-0 hover:opacity-90">Admin</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
