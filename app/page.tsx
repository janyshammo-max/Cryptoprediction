import HomeDashboard from "../components/HomeDashboard";
import { COINS } from "../lib/coins";
import { fetchLatestMarket, fetchSparkline, type TimeRange } from "../lib/fetchers";

const DEFAULT_RANGE: TimeRange = "7d";

export default async function Page() {
  const overview = await Promise.all(
    COINS.map(async (coin) => {
      const [latest, sparkline] = await Promise.all([
        fetchLatestMarket(coin.symbol),
        fetchSparkline(coin.symbol, DEFAULT_RANGE)
      ]);
      return {
        symbol: coin.symbol,
        name: coin.displayName,
        currentPrice: latest.currentPrice,
        priceChange24h: latest.priceChange24h,
        marketCap: latest.marketCap,
        sparkline
      };
    })
  );

  return (
    <div className="space-y-12">
      <section className="space-y-4 text-center">
        <p className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-900/40 dark:text-indigo-200">
          Educatief & experimenteel
        </p>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Crypto prediction</h1>
        <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Prijsdata, trends en voorspellende inzichten — educatief en experimenteel. Ontdek hoe eenvoudige modellen kunnen helpen bij het visualiseren van mogelijke scenario&apos;s voor Bitcoin, Ethereum, BNB, XRP en Solana.
        </p>
      </section>
      <HomeDashboard initialRange={DEFAULT_RANGE} coins={overview} />
    </div>
  );
}
