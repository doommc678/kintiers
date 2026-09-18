import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Measures real network latency to a Minecraft server by timing a TCP
 * handshake to its port (default 25565). Returns null when unreachable.
 */
export const pingServer = createServerFn({ method: "POST" })
  .inputValidator((input: { host: string; port?: number }) =>
    z.object({ host: z.string().min(1).max(200), port: z.number().int().positive().max(65535).optional() }).parse(input)
  )
  .handler(async ({ data }) => {
    const [rawHost, rawPort] = data.host.split(":");
    const host = rawHost.trim();
    const port = data.port ?? Number(rawPort) ?? 25565;

    const net = await import("node:net");

    const attempt = () =>
      new Promise<number | null>((resolve) => {
        const start = Date.now();
        let done = false;
        const finish = (v: number | null) => {
          if (done) return;
          done = true;
          try { socket.destroy(); } catch { /* noop */ }
          resolve(v);
        };
        const socket = net.connect({ host, port: port || 25565 });
        socket.setTimeout(3000);
        socket.once("connect", () => finish(Date.now() - start));
        socket.once("timeout", () => finish(null));
        socket.once("error", () => finish(null));
      });

    const samples: number[] = [];
    for (let i = 0; i < 3; i++) {
      const ms = await attempt();
      if (ms != null) samples.push(ms);
    }
    if (!samples.length) return { ping: null as number | null };
    return { ping: Math.max(1, Math.min(...samples)) };
  });
