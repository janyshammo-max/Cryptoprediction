"use client";

import Link from "next/link";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import type { TimeRange } from "../lib/fetchers";
import type { SupportedSymbol } from "../lib/coins";
import Metric from "./Metric";

interface CoinCardProps {
  symbol: SupportedSymbol;
  name: string;
  currentPrice: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  sparkline: number[];
  range: TimeRange;
}

const formatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const marketCapFormatter = new Intl.NumberFormat("nl-NL", {
  notation: "compact",
  maximumFractionDigits: 1
});

export default function CoinCard({
  symbol,
  name,
  currentPrice,
  priceChange24h,
  marketCap,
  sparkline,
  range
}: CoinCardProps) {
  const priceLabel = currentPrice !== null ? formatter.format(currentPrice) : "–";
  const marketCapLabel = marketCap ? `$${marketCapFormatter.format(marketCap)}` : "n.v.t.";
  const chartData = sparkline.map((price, index) => ({ index, price }));

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{name}</h3>
          <p className="text-xs uppercase text-slate-400">{symbol.toUpperCase()}</p>
        </div>
        <span className="text-xs text-slate-400">{range}</span>
      </div>
      <div className="mt-4 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Tooltip
              cursor={{ stroke: "#cbd5f5" }}
              contentStyle={{ backgroundColor: "#0f172a", color: "#e2e8f0", borderRadius: 12, border: "none" }}
              formatter={(value: number) => formatter.format(value)}
              labelFormatter={(index: number) => `#${index + 1}`}
            />
            <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <Metric label="Huidige prijs" value={priceLabel} change={priceChange24h ?? undefined} />
        <Metric label="Market cap" value={marketCapLabel} />
      </div>
      <div className="mt-6">
        <Link
          href={`/coin/${symbol}`}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Bekijk details
        </Link>
      </div>
    </article>
  );
}
