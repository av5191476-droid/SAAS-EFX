import { BacktestLab } from "~/components/dashboard/backtest-lab";

export const metadata = { title: "Laboratorio" };

export default function BacktestPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Laboratorio de backtesting</h1>
        <p className="text-muted-foreground">
          Las señales se ejecutan en la barra siguiente, con comisión y deslizamiento sobre cada cambio de posición.
        </p>
      </div>
      <BacktestLab />
    </div>
  );
}
