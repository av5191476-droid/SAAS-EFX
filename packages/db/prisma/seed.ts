import { PrismaClient } from "@prisma/client";
import { STRATEGIES, generateBars, resolveParams, runBacktest } from "@efx/quant";

const db = new PrismaClient();

async function main() {
  const fund = await db.fund.upsert({
    where: { slug: "efx-multi-strategy" },
    update: {},
    create: {
      name: "EFX Multi-Strategy",
      slug: "efx-multi-strategy",
      aum: 48_250_000,
      inception: new Date(Date.UTC(2023, 0, 2)),
    },
  });

  const weights = [0.35, 0.15, 0.25, 0.25];
  const symbols = ["ES", "EURUSD", "NQ", "GC"];
  for (const [i, def] of STRATEGIES.entries()) {
    await db.strategy.upsert({
      where: { id: `seed-${def.id}` },
      update: {},
      create: {
        id: `seed-${def.id}`,
        fundId: fund.id,
        engineId: def.id,
        name: def.name,
        symbol: symbols[i] ?? "ES",
        status: i === 1 ? "PAPER" : "LIVE",
        weight: weights[i] ?? 0,
        params: resolveParams(def),
      },
    });
  }

  // NAV histórico: combinación ponderada de las estrategias sobre datos sintéticos.
  const bars = generateBars({ seed: 2312, bars: 756 });
  const curves = STRATEGIES.map((s) => runBacktest(bars, s.signal(bars, resolveParams(s)), { initialCapital: 100 }));
  const rows = bars.map((b, idx) => {
    const nav = curves.reduce((acc, c, k) => acc + (weights[k] ?? 0) * c.equity[idx]!.value, 0);
    return { fundId: fund.id, date: new Date(b.t), nav, aum: (48_250_000 * nav) / 100 };
  });
  await db.navSnapshot.deleteMany({ where: { fundId: fund.id } });
  await db.navSnapshot.createMany({ data: rows });

  console.log(`Semilla completada: ${STRATEGIES.length} estrategias, ${rows.length} puntos de NAV.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
