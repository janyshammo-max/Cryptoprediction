"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { SupportedSymbol } from "../lib/coins";
import type { TimeRange } from "../lib/fetchers";
import type { ForecastPoint, SeriesPoint } from "../lib/predict";
import PredictionChart from "./PredictionChart";
import TimeframeToggle from "./TimeframeToggle";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import Metric from "./Metric";

const currency = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat("nl-NL", {
  notation: "compact",
  maximumFractionDigits: 2
});

interface Props {
  symbol: SupportedSymbol;
  name: string;
  initialRange: TimeRange;
  latest: {
    currentPrice: number | null;
    priceChange24h: number | null;
    high24h: number | null;
    low24h: number | null;
    totalVolume: number | null;
  };
  initialHistory: SeriesPoint[];
}

const MODEL_OPTIONS = [
  { key: "mock", label: "Mock (AR-like)" },
  { key: "linear", label: "Linear Regression (demo)" }
] as const;

type ModelKey = (typeof MODEL_OPTIONS)[number]["key"];

export default function CoinDetailClient({ symbol, name, initialRange, latest, initialHistory }: Props) {
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [history, setHistory] = useState<SeriesPoint[]>(initialHistory);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [model, setModel] = useState<ModelKey>("mock");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const changeRange = useCallback(
    async (nextRange: TimeRange) => {
      if (nextRange === range) return;
      setRange(nextRange);
      setLoadingHistory(true);
      setError(null);
      try {
        const response = await fetch(`/api/price?symbol=${symbol}&range=${nextRange}`);
        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }
        const json = await response.json();
        setHistory((json?.prices ?? []).map((item: { timestamp: number; price: number }) => ({
          t: item.timestamp,
          p: item.price
        })));
        setForecast([]);
      } catch (err) {
        console.error(err);
        setError("Kon de historische data niet laden.");
      } finally {
        setLoadingHistory(false);
      }
    },
    [range, symbol]
  );

  const generateForecast = useCallback(
    async (horizon: number) => {
      setLoadingForecast(true);
      setForecastError(null);
      try {
        const response = await fetch(`/api/predict?symbol=${symbol.toUpperCase()}&horizon=${horizon}&model=${model}`);
        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }
        const json = await response.json();
        const cleaned: ForecastPoint[] = (json?.forecast ?? []).map(
          (entry: { timestamp: number; point: number; lower: number; upper: number }) => ({
            timestamp: entry.timestamp,
            point: entry.point,
            lower: entry.lower,
            upper: entry.upper
          })
        );
        setForecast(cleaned);
      } catch (err) {
        console.error(err);
        setForecastError("Voorspelling genereren mislukte.");
      } finally {
        setLoadingForecast(false);
      }
    },
    [model, symbol]
  );

  const tableRows = useMemo(
    () =>
      history
        .slice()
        .sort((a, b) => b.t - a.t)
        .map((point) => ({
          timestamp: point.t,
          label: format(point.t, "d MMM yyyy HH:mm", { locale: nl }),
          price: currency.format(point.p)
        })),
    [history]
  );

  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{name}</h1>
          <p className="text-sm uppercase text-slate-400">{symbol.toUpperCase()}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Metric label="Huidige prijs" value={latest.currentPrice !== null ? currency.format(latest.currentPrice) : "–"} change={latest.priceChange24h ?? undefined} />
            <Metric label="24h Hoog" value={latest.high24h !== null ? currency.format(latest.high24h) : "–"} />
            <Metric label="24h Laag" value={latest.low24h !== null ? currency.format(latest.low24h) : "–"} />
            <Metric label="24h Volume" value={latest.totalVolume !== null ? `$${numberFormatter.format(latest.totalVolume)}` : "–"} />
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Over deze pagina</h2>
          <p>
            Gebruik de timeframe-selector om historische data te bekijken en genereer vervolgens een mock- of regressievoorspelling. De resultaten zijn illustratief en niet bedoeld als handelsadvies.
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-400">Modelselectie</p>
          <div className="flex gap-2">
            {MODEL_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setModel(option.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  model === option.key
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                aria-pressed={model === option.key}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => generateForecast(7)}
            disabled={loadingForecast}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loadingForecast ? "Voorspelling wordt berekend…" : "Genereer voorspelling"}
          </button>
          {forecastError && <p className="text-xs text-rose-400">{forecastError}</p>}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Historie & voorspelling</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              De grafiek toont historische slotprijzen gecombineerd met een 95% voorspellingsband.
            </p>
          </div>
          <TimeframeToggle value={range} onChange={changeRange} />
        </div>
        {loadingHistory ? (
          <LoadingState label="Historische data laden" />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <PredictionChart historical={history} forecast={forecast} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ruwe datapoints</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tijdstip
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Prijs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
              {tableRows.map((row) => (
                <tr key={row.timestamp}>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{row.label}</td>
                  <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
