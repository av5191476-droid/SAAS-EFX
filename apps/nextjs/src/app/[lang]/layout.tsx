import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { enUS, esES } from "@clerk/localizations";
import { isLocale, locales } from "~/i18n/config";
import { TRPCReactProvider } from "~/trpc/react";
import "~/styles/globals.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });
const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-condensed",
});

export const metadata: Metadata = {
  title: { default: "EFX · Fondo cuantitativo", template: "%s · EFX" },
  description: "Fondo de trading cuantitativo multiestrategia con motor de backtesting abierto a inversores.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: { title: "EFX", description: "Disciplina estadística, no corazonadas.", type: "website" },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <ClerkProvider localization={lang === "es" ? esES : enUS}>
      <html lang={lang} className={`${plex.variable} ${plexCondensed.variable}`}>
        <body className="min-h-screen">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
