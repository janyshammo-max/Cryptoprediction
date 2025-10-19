import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoinBySymbol, type SupportedSymbol } from "../../../lib/coins";
import { fetchHistoricalPrices, type TimeRange } from "../../../lib/fetchers";

const QuerySchema = z.object({
  symbol: z.string(),
  range: z.enum(["24h", "7d", "30d", "90d"]).default("7d")
});

type Query = z.infer<typeof QuerySchema>;

function parseQuery(searchParams: URLSearchParams): Query {
  const result = QuerySchema.safeParse({
    symbol: searchParams.get("symbol") ?? "",
    range: (searchParams.get("range") as TimeRange | null) ?? undefined
  });
  if (!result.success) {
    throw new Error("Invalid query parameters");
  }
  return result.data;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseQuery(searchParams);
    const symbol = query.symbol.toLowerCase() as SupportedSymbol;
    const coin = getCoinBySymbol(symbol);
    if (!coin) {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }
    const prices = await fetchHistoricalPrices(symbol, query.range);
    return NextResponse.json({
      symbol,
      range: query.range,
      prices: prices.map((point) => ({ timestamp: point.timestamp, price: point.price }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
