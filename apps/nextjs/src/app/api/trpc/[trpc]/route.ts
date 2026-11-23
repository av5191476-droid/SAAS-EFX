import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTRPCContext } from "@efx/api";
import { getAuthInfo } from "~/trpc/server";

export const dynamic = "force-dynamic";

const handler = async (req: Request) => {
  const authInfo = await getAuthInfo();
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers, auth: authInfo }),
    onError({ path, error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") console.error(`[trpc] ${path ?? "?"}:`, error);
    },
  });
};

export { handler as GET, handler as POST };
