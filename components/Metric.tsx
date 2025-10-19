import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

interface MetricProps {
  label: string;
  value: string;
  change?: number | null;
  prefix?: string;
  suffix?: string;
}

export default function Metric({ label, value, change, prefix, suffix }: MetricProps) {
  const changeNumber = typeof change === "number" ? change : null;
  const isPositive = (changeNumber ?? 0) >= 0;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        {prefix}
        {value}
        {suffix}
        {changeNumber !== null && (
          <span
            className={clsx(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
            )}
          >
            {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
            {changeNumber.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
