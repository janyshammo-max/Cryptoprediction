"use client";

import clsx from "clsx";
import type { TimeRange } from "../lib/fetchers";

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24u" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" }
];

interface Props {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export default function TimeframeToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 text-sm dark:border-slate-700 dark:bg-slate-900">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "rounded-full px-3 py-1 font-medium transition",
            option.value === value
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
          )}
          aria-pressed={option.value === value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
