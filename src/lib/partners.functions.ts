import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { assertAdminPassword } from "./admin.server";

export type Partner = {
  id: string;
  name: string;
  ip: string;
  createdAt: string;
};

function rowToPartner(r: any): Partner {
  return { id: r.id, name: r.name, ip: r.ip, createdAt: r.created_at };
}

export const listPartners = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToPartner);
});

export const addPartner = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string; name: string; ip: string }) =>
    z.object({
      password: z.string().min(1),
      name: z.string().trim().min(1).max(60),
      ip: z.string().trim().min(3).max(120).regex(/^[a-zA-Z0-9.\-:_]+$/, "Invalid IP/host"),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    await assertAdminPassword(data.password);
    const { error } = await supabaseAdmin.from("partners").insert({
      name: data.name, ip: data.ip,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removePartner = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string; id: string }) =>
    z.object({ password: z.string(), id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }) => {
    await assertAdminPassword(data.password);
    const { error } = await supabaseAdmin.from("partners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
