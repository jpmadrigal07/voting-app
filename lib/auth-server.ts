import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

/** One session read per RSC tree per request (React cache). */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
