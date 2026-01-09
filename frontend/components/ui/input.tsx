import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <input
          ref={ref}
          className={cn(
            "block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 shadow-inner shadow-slate-900/40 outline-none transition focus:border-emerald-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-300/50",
            error ? "border-rose-400/70 focus:ring-rose-400/60" : null,
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-rose-300">{error}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
