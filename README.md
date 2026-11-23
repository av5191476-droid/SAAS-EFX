# SAAS-EFX
Sistema SAAS para clientes, monorepo completo, organizado igual que Saasfly.


# EFX — Fondo de trading cuantitativo

SaaS para un fondo cuantitativo multiestrategia, construido sobre la arquitectura de
[Saasfly](https://github.com/nextify-limited/saasfly): monorepo Bun + Turborepo, Next.js 15 (App Router),
tRPC, Prisma/PostgreSQL, Clerk, Stripe, Tailwind y componentes estilo shadcn/ui, con i18n (es/en).

A lo que Saasfly ya ofrece, EFX añade un **motor cuantitativo propio** (`@efx/quant`) que se ejecuta igual en
el servidor (API, semilla de la base de datos) y en el navegador (demo en vivo de la landing).

## Estructura

```
efx/
├── apps/
│   └── nextjs/                 App web (landing, panel, auth, API)
│       └── src/
│           ├── app/[lang]/(marketing)/   Landing con el motor en vivo
│           ├── app/[lang]/dashboard/     Resumen, laboratorio, estrategias, facturación
│           ├── app/[lang]/sign-in|up/    Clerk
│           ├── app/api/trpc/             Endpoint tRPC
│           ├── app/api/webhooks/stripe/  Webhook de suscripciones
│           ├── components/               Gráficos, marketing, panel
│           ├── i18n/                     Diccionarios es/en
│           ├── trpc/                     Cliente React y caller de servidor
│           └── middleware.ts             Idioma + protección de rutas
├── packages/
│   ├── quant/    Motor: datos sintéticos, indicadores, estrategias, backtest, métricas, riesgo (+ tests)
│   ├── api/      Routers tRPC: fund, strategy, backtest, billing
│   ├── db/       Esquema Prisma + semilla del fondo
│   ├── stripe/   Planes, checkout y sincronización por webhook
│   ├── email/    Informe mensual vía Resend
│   └── ui/       Button, Card, Badge, utilidades de formato
├── tooling/typescript/   tsconfig compartidos
├── docker-compose.yml    PostgreSQL local
└── .github/workflows/ci.yml
```

## Puesta en marcha

Requisitos: Bun ≥ 1.1, Node ≥ 20, Docker (o cualquier PostgreSQL).

```bash
bun install
cp .env.example apps/nextjs/.env.local     # rellena Clerk (obligatorio) y Stripe (opcional)
cp .env.example packages/db/.env           # Prisma lee POSTGRES_URL de aquí
docker compose up -d                       # PostgreSQL en localhost:5432
bun db:generate && bun db:push && bun db:seed
bun dev:web                                # http://localhost:3000
```

Sin base de datos sembrada, el panel muestra datos de demostración generados por el motor, así que la app
funciona desde el primer arranque.

## Motor cuantitativo (`@efx/quant`)

| Módulo | Contenido |
| --- | --- |
| `data.ts` | PRNG determinista, GBM con regímenes de volatilidad |
| `indicators.ts` | SMA, EMA, RSI (Wilder), Bollinger, z-score, desviación móvil |
| `strategies/` | Cruce de medias, reversión por z-score, momentum RSI, tendencia con objetivo de volatilidad |
| `backtest.ts` | Ejecución en la barra siguiente (sin anticipación), comisión + deslizamiento por cambio de posición |
| `metrics.ts` | CAGR, volatilidad, Sharpe, Sortino, Calmar, drawdown, acierto, profit factor, exposición |
| `risk.ts` | VaR y CVaR históricos, Kelly, peso por volatilidad objetivo |

```bash
cd packages/quant && bun test
```

Añadir una estrategia: crea un `StrategyDefinition` en `packages/quant/src/strategies/` y regístralo en
`STRATEGIES`. Aparece automáticamente en la landing, el laboratorio y el catálogo.

## Planes y límites

Los planes viven en `packages/stripe/src/plans.ts`. El router `backtest.run` aplica el límite diario de cada
plan. Para Stripe: crea los productos, copia los `price_…` en el `.env` y apunta el webhook a
`/api/webhooks/stripe` (eventos `checkout.session.completed` y `customer.subscription.*`).

## Roles

Los correos de `ADMIN_EMAIL` reciben rol `ADMIN` al primer acceso. Analistas y administradores pueden crear
estrategias y cambiar su estado (investigación → papel → vivo → retirada).

## Despliegue

Vercel con raíz `apps/nextjs` (ver `vercel.json`) y una base PostgreSQL gestionada (Neon, Vercel Postgres,
Supabase).

## Aviso

Proyecto de demostración. Las rentabilidades mostradas proceden de datos sintéticos y no constituyen
asesoramiento financiero. Operar un fondo real exige licencias y cumplimiento normativo en tu jurisdicción.

Licencia MIT. Arquitectura inspirada en Saasfly (MIT) de Nextify Limited.

