import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdminPassword, getAdminPassword, setAdminPassword } from "./admin.server";

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input)
  )
  .handler(async ({ data }) => {
    const stored = await getAdminPassword();
    return { ok: data.password === stored };
  });

export const changeAdminPassword = createServerFn({ method: "POST" })
  .inputValidator((input: { oldPassword: string; newPassword: string }) =>
    z.object({
      oldPassword: z.string().min(1),
      newPassword: z.string().min(6).max(200),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    await assertAdminPassword(data.oldPassword);
    await setAdminPassword(data.newPassword);
    return { ok: true };
  });
