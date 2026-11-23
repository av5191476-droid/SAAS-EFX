import { defaultLocale, isLocale } from "./config";

const es = {
  nav: { fund: "El fondo", engine: "Motor", process: "Proceso", pricing: "Planes", signIn: "Acceder", dashboard: "Panel" },
  hero: {
    title: "Disciplina estadística, no corazonadas.",
    subtitle:
      "EFX es un fondo cuantitativo multiestrategia. Cada posición nace de un modelo probado, con costes y riesgo medidos antes de arriesgar un dólar.",
    primary: "Abrir cuenta de inversor",
    secondary: "Probar el motor",
    engineHint: "Elige una estrategia: el backtest se calcula en tu navegador con el mismo motor que usa el fondo.",
  },
  fund: { title: "El fondo en cifras", subtitle: "NAV por participación desde el lanzamiento, neto de comisiones de gestión." },
  process: {
    title: "De la hipótesis al capital real",
    steps: [
      { name: "Investigación", text: "Hipótesis, datos limpios y backtest con costes y deslizamiento realistas." },
      { name: "Papel", text: "Mínimo 60 sesiones operando sin capital para validar la ejecución." },
      { name: "En vivo", text: "Asignación inicial pequeña que crece si el Sharpe realizado se sostiene." },
      { name: "Retiro", text: "Se desactiva cuando su drawdown supera 1,5 veces el histórico." },
    ],
  },
  pricing: { title: "Planes", subtitle: "Investiga con el motor de EFX o accede a las señales del fondo.", cta: "Elegir plan", perMonth: "/mes" },
  dash: {
    overview: "Resumen",
    backtest: "Laboratorio",
    strategies: "Estrategias",
    billing: "Plan y facturación",
    demoNotice: "Mostrando datos de demostración. Ejecuta `bun db:seed` para cargar el fondo en tu base de datos.",
  },
  footer:
    "EFX es un proyecto de demostración. Rentabilidades pasadas o simuladas no garantizan resultados futuros. Nada de lo aquí mostrado constituye asesoramiento financiero.",
};

export type Dictionary = typeof es;

const en: Dictionary = {
  nav: { fund: "The fund", engine: "Engine", process: "Process", pricing: "Plans", signIn: "Sign in", dashboard: "Dashboard" },
  hero: {
    title: "Statistical discipline, not hunches.",
    subtitle:
      "EFX is a multi-strategy quantitative fund. Every position comes from a tested model, with costs and risk measured before a single dollar is at stake.",
    primary: "Open an investor account",
    secondary: "Try the engine",
    engineHint: "Pick a strategy: the backtest runs in your browser on the same engine the fund uses.",
  },
  fund: { title: "The fund in numbers", subtitle: "NAV per unit since inception, net of management fees." },
  process: {
    title: "From hypothesis to real capital",
    steps: [
      { name: "Research", text: "Hypothesis, clean data and a backtest with realistic costs and slippage." },
      { name: "Paper", text: "At least 60 sessions trading without capital to validate execution." },
      { name: "Live", text: "A small initial allocation that grows if realized Sharpe holds." },
      { name: "Retirement", text: "Switched off when drawdown exceeds 1.5× its historical maximum." },
    ],
  },
  pricing: { title: "Plans", subtitle: "Research with the EFX engine or access the fund's signals.", cta: "Choose plan", perMonth: "/mo" },
  dash: {
    overview: "Overview",
    backtest: "Lab",
    strategies: "Strategies",
    billing: "Plan & billing",
    demoNotice: "Showing demo data. Run `bun db:seed` to load the fund into your database.",
  },
  footer:
    "EFX is a demo project. Past or simulated performance does not guarantee future results. Nothing shown here is financial advice.",
};

const dictionaries = { es, en } as const;

export function getDictionary(lang: string): Dictionary {
  return dictionaries[isLocale(lang) ? lang : defaultLocale];
}
