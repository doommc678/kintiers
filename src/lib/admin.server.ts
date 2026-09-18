import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DEFAULT_PASSWORD = "blockmc826481037#@_";
const KEY = "admin_password";

export async function getAdminPassword(): Promise<string> {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();
  return (data?.value as string | undefined) ?? DEFAULT_PASSWORD;
}

export async function assertAdminPassword(pw: unknown): Promise<void> {
  const stored = await getAdminPassword();
  if (pw !== stored) throw new Error("Unauthorized");
}

export async function setAdminPassword(newPw: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: KEY, value: newPw, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
