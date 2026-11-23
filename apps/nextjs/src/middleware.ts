import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "~/i18n/config";

const isProtected = createRouteMatcher(["/:lang/dashboard(.*)"]);

function preferredLocale(req: NextRequest): string {
  const header = req.headers.get("accept-language") ?? "";
  const first = header.split(",")[0]?.slice(0, 2).toLowerCase() ?? "";
  return (locales as readonly string[]).includes(first) ? first : defaultLocale;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api") || pathname.startsWith("/trpc");
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (!isApi && !hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (isProtected(req)) await auth.protect();
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
