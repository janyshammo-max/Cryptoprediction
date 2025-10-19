import { z } from "zod";
import { COINS, type CoinMetadata, type SupportedSymbol } from "./coins";

const BASE_URL = process.env.COIN_API_URL ?? "https://api.coingecko.com/api/v3";

export type TimeRange = "24h" | "7d" | "30d" | "90d";

const MarketChartSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  total_volumes: z.array(z.tuple([z.number(), z.number()])).optional()
});

const MarketSchema = z.array(
  z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    current_price: z.number().nullable().catch(null),
    price_change_percentage_24h: z.number().nullable().catch(null),
    market_cap: z.number().nullable().catch(null),
    high_24h: z.number().nullable().catch(null),
    low_24h: z.number().nullable().catch(null),
    total_volume: z.number().nullable().catch(null)
  })
);

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface LatestMarketData {
  coin: CoinMetadata;
  currentPrice: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  high24h: number | null;
  low24h: number | null;
  totalVolume: number | null;
}

function getDays(range: TimeRange): string {
  switch (range) {
    case "24h":
      return "1";
    case "7d":
      return "7";
    case "30d":
      return "30";
    case "90d":
      return "90";
    default:
      return "7";
  }
}

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function safeFetch<T>(url: string, schema: z.ZodSchema<T>, cacheSeconds = 300): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: cacheSeconds }
    });
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    const data = await res.json();
    return schema.parse(data);
  } catch (error) {
    console.error("Fetch error", error);
    throw error;
  }
}

function buildFallbackSeries(range: TimeRange): PricePoint[] {
  const length = range === "24h" ? 24 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const now = Date.now();
  const step = range === "24h" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return Array.from({ length }, (_, index) => {
    const timestamp = now - (length - index) * step;
    const base = 100 + Math.sin(index / 3) * 5;
    return { timestamp, price: Number(base.toFixed(2)) };
  });
}

export async function fetchHistoricalPrices(symbol: SupportedSymbol, range: TimeRange): Promise<PricePoint[]> {
  const coin = COINS.find((item) => item.symbol === symbol);
  if (!coin) {
    throw new Error(`Unsupported symbol: ${symbol}`);
  }
  const url = buildUrl(`/coins/${coin.coingeckoId}/market_chart`, {
    vs_currency: "usd",
    days: getDays(range),
    interval: range === "24h" ? "hourly" : "daily"
  });
  try {
    const data = await safeFetch(url, MarketChartSchema);
    return data.prices.map(([timestamp, price]) => ({ timestamp, price }));
  } catch (error) {
    console.warn("Falling back to dummy historical data", error);
    return buildFallbackSeries(range);
  }
}

export async function fetchLatestMarket(symbol: SupportedSymbol): Promise<LatestMarketData> {
  const coin = COINS.find((item) => item.symbol === symbol);
  if (!coin) {
    throw new Error(`Unsupported symbol: ${symbol}`);
  }
  const url = buildUrl(`/coins/markets`, {
    vs_currency: "usd",
    ids: coin.coingeckoId,
    price_change_percentage: "24h"
  });
  try {
    const result = await safeFetch(url, MarketSchema, 120);
    const entry = result[0];
    if (!entry) {
      throw new Error("No market data returned");
    }
    return {
      coin,
      currentPrice: entry.current_price,
      priceChange24h: entry.price_change_percentage_24h,
      marketCap: entry.market_cap,
      high24h: entry.high_24h,
      low24h: entry.low_24h,
      totalVolume: entry.total_volume
    };
  } catch (error) {
    console.warn("Falling back to dummy latest data", error);
    const fallback = buildFallbackSeries("7d");
    return {
      coin,
      currentPrice: fallback.at(-1)?.price ?? null,
      priceChange24h: 0,
      marketCap: null,
      high24h: null,
      low24h: null,
      totalVolume: null
    };
  }
}

export async function fetchSparkline(symbol: SupportedSymbol, range: TimeRange): Promise<number[]> {
  const series = await fetchHistoricalPrices(symbol, range);
  return series.map((item) => Number(item.price.toFixed(2)));
}
