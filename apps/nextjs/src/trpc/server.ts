import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCaller, createTRPCContext, type AuthInfo } from "@efx/api";

export async function getAuthInfo(): Promise<AuthInfo | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return {
    clerkId: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? `${userId}@users.efx.local`,
    name: user?.fullName ?? null,
  };
}

/** Caller de tRPC para Server Components (memoizado por petición). */
export const serverApi = cache(async () => {
  const h = new Headers(await headers());
  h.set("x-trpc-source", "rsc");
  return createCaller(createTRPCContext({ headers: h, auth: await getAuthInfo() }));
});
