import Link from "next/link";
import { Button } from "@efx/ui";
import { getDictionary } from "~/i18n/dictionaries";
import { serverApi } from "~/trpc/server";
import { EngineDemo } from "~/components/marketing/engine-demo";
import { FundPanel } from "~/components/marketing/fund-section";
import { Pricing } from "~/components/marketing/pricing";
import { SiteHeader } from "~/components/marketing/site-header";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const api = await serverApi();
  const [overview, nav] = await Promise.all([api.fund.overview(), api.fund.navHistory({ maxPoints: 260 })]);

  return (
    <>
      <SiteHeader lang={lang} t={t} />
      <main>
        <section className="container pb-16 pt-16 md:pt-24">
          <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/${lang}/sign-up`}>{t.hero.primary}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#motor">{t.hero.secondary}</a>
            </Button>
          </div>
          <div id="motor" className="mt-14 scroll-mt-20">
            <EngineDemo hint={t.hero.engineHint} />
          </div>
        </section>

        <section id="fondo" className="scroll-mt-20 border-t border-border py-16">
          <div className="container">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{t.fund.title}</h2>
            <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">{t.fund.subtitle}</p>
            <FundPanel overview={overview} nav={nav} />
          </div>
        </section>

        <section id="proceso" className="scroll-mt-20 border-t border-border py-16">
          <div className="container">
            <h2 className="mb-10 font-display text-3xl font-semibold md:text-4xl">{t.process.title}</h2>
            <ol className="grid gap-8 md:grid-cols-4">
              {t.process.steps.map((step, i) => (
                <li key={step.name} className="border-t-2 border-foreground pt-4">
                  <span className="font-display text-sm font-semibold text-signal">Fase {i + 1}</span>
                  <h3 className="mt-1 font-display text-xl font-semibold">{step.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="planes" className="scroll-mt-20 border-t border-border py-16">
          <div className="container">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{t.pricing.title}</h2>
            <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">{t.pricing.subtitle}</p>
            <Pricing lang={lang} cta={t.pricing.cta} perMonth={t.pricing.perMonth} />
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-10">
        <p className="container max-w-3xl text-sm text-muted-foreground">{t.footer}</p>
      </footer>
    </>
  );
}
