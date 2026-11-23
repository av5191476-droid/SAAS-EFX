import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getDictionary } from "~/i18n/dictionaries";
import { Logo } from "~/components/marketing/site-header";
import { Sidebar } from "~/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = getDictionary(lang);
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="flex h-14 items-center justify-between px-5">
          <Link href={`/${lang}`}>
            <Logo className="h-5 w-auto" />
          </Link>
          <UserButton />
        </div>
      </header>
      <div className="grid md:grid-cols-[220px_1fr]">
        <aside className="border-b border-border p-3 md:min-h-[calc(100vh-3.5rem)] md:border-b-0 md:border-r">
          <Sidebar lang={lang} labels={t.dash} />
        </aside>
        <main className="min-w-0 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
