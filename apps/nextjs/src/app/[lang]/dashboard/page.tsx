import { getDictionary } from "~/i18n/dictionaries";
import { serverApi } from "~/trpc/server";
import { FundPanel } from "~/components/marketing/fund-section";

export const metadata = { title: "Panel" };

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const api = await serverApi();
  const [overview, nav, current] = await Promise.all([
    api.fund.overview(),
    api.fund.navHistory({ maxPoints: 400 }),
    api.billing.current(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{overview.name}</h1>
          <p className="text-muted-foreground">
            Plan actual: <span className="text-foreground">{current.plan.name}</span>
          </p>
        </div>
      </div>
      {overview.source === "demo" && (
        <p className="rounded-md border border-signal/40 bg-signal/10 px-4 py-3 text-sm">{t.dash.demoNotice}</p>
      )}
      <FundPanel overview={overview} nav={nav} />
    </div>
  );
}
