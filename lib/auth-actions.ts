"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function appOrigin(): Promise<string> {
  const env = process.env.BETTER_AUTH_URL;
  if (env) {
    return env.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) {
    return "http://localhost:3000";
  }
  return `${proto}://${host}`;
}

export async function signInWithGoogle() {
  const origin = await appOrigin();
  const hdrs = await headers();
  const res = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: `${origin}/`,
      disableRedirect: true,
    },
    headers: hdrs,
  });

  if ("url" in res && res.url) {
    redirect(res.url);
  }
  throw new Error("Could not start Google sign-in");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
