"use client";

import { useCallback, useMemo, useState } from "react";
import type { SupportedSymbol } from "../lib/coins";
import type { TimeRange } from "../lib/fetchers";
import CoinCard from "./CoinCard";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import TimeframeToggle from "./TimeframeToggle";

interface CoinOverview {
  symbol: SupportedSymbol;
  name: string;
  currentPrice: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  sparkline: number[];
}

interface Props {
  initialRange: TimeRange;
  coins: CoinOverview[];
}

export default function HomeDashboard({ initialRange, coins }: Props) {
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [data, setData] = useState<CoinOverview[]>(coins);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRangeChange = useCallback(
    async (nextRange: TimeRange) => {
      if (nextRange === range) return;
      setRange(nextRange);
      setLoading(true);
      setError(null);
      try {
        const updated = await Promise.all(
          data.map(async (coin) => {
            const response = await fetch(`/api/price?symbol=${coin.symbol}&range=${nextRange}`, {
              method: "GET"
            });
            if (!response.ok) {
              throw new Error(`Failed to fetch sparkline for ${coin.symbol}`);
            }
            const json = await response.json();
            return {
              ...coin,
              sparkline: (json?.prices ?? []).map((item: { price: number }) => Number(item.price?.toFixed?.(2) ?? item.price)),
            };
          })
        );
        setData(updated);
      } catch (err) {
        console.error(err);
        setError("Kon de sparklines niet verversen.");
      } finally {
        setLoading(false);
      }
    },
    [data, range]
  );

  const content = useMemo(() => {
    if (error) {
      return <ErrorState message={error} />;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.map((coin) => (
          <CoinCard
            key={coin.symbol}
            symbol={coin.symbol}
            name={coin.name}
            currentPrice={coin.currentPrice}
            priceChange24h={coin.priceChange24h}
            marketCap={coin.marketCap}
            sparkline={coin.sparkline}
            range={range}
          />
        ))}
      </div>
    );
  }, [data, error, range]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Marktoverzicht</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Combineer actuele prijzen met historische sparklines en wissel de periode zonder de pagina te herladen.
          </p>
        </div>
        <TimeframeToggle value={range} onChange={handleRangeChange} />
      </div>
      {loading ? <LoadingState label="Sparklines verversen" /> : content}
    </section>
  );
}
