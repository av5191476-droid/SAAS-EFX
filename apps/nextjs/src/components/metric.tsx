import { cn } from "@efx/ui";

export function Metric({
  label,
  value,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-display text-2xl font-semibold",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function toneOf(v: number): "positive" | "negative" | "neutral" {
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
}
