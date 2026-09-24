import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const DISCORD_URL = "https://discord.gg/rpvsQyvt7";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.07.07 0 0 0-.073.035c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.51 12.51 0 0 0-.617-1.25.07.07 0 0 0-.073-.034A19.74 19.74 0 0 0 5.94 4.369a.06.06 0 0 0-.03.025C2.43 9.56 1.46 14.6 1.94 19.58a.08.08 0 0 0 .03.054 19.9 19.9 0 0 0 5.993 3.03.07.07 0 0 0 .078-.026c.46-.63.873-1.295 1.226-1.994a.07.07 0 0 0-.038-.098 13.1 13.1 0 0 1-1.872-.892.07.07 0 0 1-.007-.118c.126-.094.252-.192.371-.291a.07.07 0 0 1 .074-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .074.009c.12.099.246.198.372.292a.07.07 0 0 1-.006.118 12.3 12.3 0 0 1-1.873.891.07.07 0 0 0-.037.099c.36.698.772 1.362 1.225 1.993a.07.07 0 0 0 .078.027 19.84 19.84 0 0 0 6.002-3.03.08.08 0 0 0 .03-.053c.5-5.76-.838-10.76-3.548-15.187a.06.06 0 0 0-.03-.025zM8.02 16.566c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.955 2.42-2.157 2.42zm7.974 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.946 2.42-2.157 2.42z"/>
    </svg>
  );
}

export function DiscordButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size={compact ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        aria-label="Join Discord"
        title="Join our Discord"
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
      >
        <DiscordIcon className="h-4 w-4" />
        {!compact && <span className="ml-2">Discord</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-primary/30 sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5865F2]/15 ring-1 ring-[#5865F2]/40 animate-float-y">
              <DiscordIcon className="h-9 w-9 text-[#5865F2]" />
            </div>
            <DialogTitle className="text-center text-2xl gradient-text">Join the BlockTiers Community</DialogTitle>
            <DialogDescription className="text-center">
              Hang out with other PvPers, request tier trials, get match-ups, and stay updated on rankings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 shadow-lg shadow-indigo-500/40">
                <DiscordIcon className="h-4 w-4" />
                <span className="ml-2">Join Community</span>
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
