import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoinDetailClient from "../../../components/CoinDetailClient";
import { getCoinBySymbol, type SupportedSymbol } from "../../../lib/coins";
import { fetchHistoricalPrices, fetchLatestMarket, type TimeRange } from "../../../lib/fetchers";

const DEFAULT_RANGE: TimeRange = "30d";

type PageParams = {
  params: {
    symbol: string;
  };
};

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const coin = getCoinBySymbol(params.symbol);
  if (!coin) {
    return {
      title: "Onbekende coin | Crypto prediction"
    };
  }
  return {
    title: `${coin.displayName} koers & voorspelling | Crypto prediction`,
    description: `Bekijk de actuele ${coin.displayName}-prijs, historische grafieken en experimentele voorspellingen.`
  };
}

export default async function CoinDetailPage({ params }: PageParams) {
  const symbol = params.symbol.toLowerCase() as SupportedSymbol;
  const coin = getCoinBySymbol(symbol);
  if (!coin) {
    notFound();
  }

  const [latest, history] = await Promise.all([
    fetchLatestMarket(symbol),
    fetchHistoricalPrices(symbol, DEFAULT_RANGE)
  ]);

  const series = history.map((point) => ({ t: point.timestamp, p: point.price }));

  return (
    <CoinDetailClient
      symbol={symbol}
      name={coin.displayName}
      initialRange={DEFAULT_RANGE}
      latest={{
        currentPrice: latest.currentPrice,
        priceChange24h: latest.priceChange24h,
        high24h: latest.high24h,
        low24h: latest.low24h,
        totalVolume: latest.totalVolume
      }}
      initialHistory={series}
    />
  );
}
