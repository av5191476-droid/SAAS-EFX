import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@efx/ui";
import type { Dictionary } from "~/i18n/dictionaries";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" className={className} aria-label="EFX" role="img">
      <path d="M2 4h14v3.2H5.8v3.2h9v3.2h-9v3.2H16V20H2z" fill="currentColor" />
      <path d="M20 4h13v3.2h-9.2v3.4h8.2v3.2h-8.2V20H20z" fill="currentColor" />
      <path d="M37 4h4.4l4.1 5.6L49.6 4H54l-6.3 8 6.3 8h-4.4l-4.1-5.6-4.1 5.6H37l6.3-8z" fill="rgb(var(--signal))" />
    </svg>
  );
}

export function SiteHeader({ lang, t }: { lang: string; t: Dictionary }) {
  const other = lang === "es" ? "en" : "es";
  return (
    <header className="border-b border-border">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href={`/${lang}`} className="text-foreground">
          <Logo className="h-6 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#motor" className="hover:text-foreground">{t.nav.engine}</a>
          <a href="#fondo" className="hover:text-foreground">{t.nav.fund}</a>
          <a href="#proceso" className="hover:text-foreground">{t.nav.process}</a>
          <a href="#planes" className="hover:text-foreground">{t.nav.pricing}</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href={`/${other}`} className="px-2 text-sm text-muted-foreground hover:text-foreground">
            {other.toUpperCase()}
          </Link>
          <SignedOut>
            <Button asChild size="sm">
              <Link href={`/${lang}/sign-in`}>{t.nav.signIn}</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="sm">
              <Link href={`/${lang}/dashboard`}>{t.nav.dashboard}</Link>
            </Button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
