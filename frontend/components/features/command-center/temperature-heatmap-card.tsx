"use client";

interface TemperatureHeatmapCardProps {
  temperature: number | null;
}

function getTemperatureTone(value: number | null) {
  if (value === null) return "bg-slate-500/30";
  if (value < 30) return "bg-sky-500/60";
  if (value < 50) return "bg-amber-400/70";
  return "bg-rose-500/70";
}

export function TemperatureHeatmapCard({
  temperature,
}: TemperatureHeatmapCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Temperature
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className={`h-12 w-12 rounded-xl ${getTemperatureTone(temperature)}`} />
        <p className="text-2xl font-semibold text-slate-50">
          {temperature !== null ? `${temperature.toFixed(1)} C` : "N/A"}
        </p>
      </div>
    </div>
  );
}
