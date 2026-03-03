"use client";

interface BudgetProgressBarProps {
  projectedBill: number;
  currentUsage: number;
  goal: number;
  currency?: string;
}

export function BudgetProgressBar({
  projectedBill,
  currentUsage,
  goal,
  currency = "NGN",
}: BudgetProgressBarProps) {
  const progress = goal > 0 ? Math.min((currentUsage / goal) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Projected Monthly Bill
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {currency} {projectedBill.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Usage vs Goal
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-50">
            {currentUsage.toFixed(1)} / {goal.toFixed(1)} kWh
          </p>
        </div>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
