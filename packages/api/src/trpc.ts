import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@efx/db";

export interface AuthInfo {
  clerkId: string;
  email: string;
  name: string | null;
}

export function createTRPCContext(opts: { headers: Headers; auth: AuthInfo | null }) {
  return { db, headers: opts.headers, auth: opts.auth };
}
export type Context = ReturnType<typeof createTRPCContext>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: { ...shape.data, zodError: error.cause instanceof ZodError ? error.cause.flatten() : null },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/** Requiere sesión de Clerk y garantiza que exista el usuario en la base de datos. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.auth) throw new TRPCError({ code: "UNAUTHORIZED", message: "Inicia sesión para continuar." });
  const admins = (process.env.ADMIN_EMAIL ?? "").split(",").map((s) => s.trim().toLowerCase());
  const user = await ctx.db.user.upsert({
    where: { clerkId: ctx.auth.clerkId },
    update: {},
    create: {
      clerkId: ctx.auth.clerkId,
      email: ctx.auth.email,
      name: ctx.auth.name,
      role: admins.includes(ctx.auth.email.toLowerCase()) ? "ADMIN" : "INVESTOR",
    },
  });
  return next({ ctx: { ...ctx, user } });
});

export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role === "INVESTOR") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo analistas y administradores." });
  }
  return next();
});
