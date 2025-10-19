import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoinBySymbol, type SupportedSymbol } from "../../../../lib/coins";
import { fetchLatestMarket } from "../../../../lib/fetchers";

const QuerySchema = z.object({
  symbol: z.string()
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = QuerySchema.safeParse({ symbol: searchParams.get("symbol") ?? "" });
    if (!result.success) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }
    const symbol = result.data.symbol.toLowerCase() as SupportedSymbol;
    const coin = getCoinBySymbol(symbol);
    if (!coin) {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }
    const latest = await fetchLatestMarket(symbol);
    return NextResponse.json({
      symbol,
      currentPrice: latest.currentPrice,
      priceChange24h: latest.priceChange24h,
      marketCap: latest.marketCap,
      high24h: latest.high24h,
      low24h: latest.low24h,
      totalVolume: latest.totalVolume
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load latest price" }, { status: 500 });
  }
}
