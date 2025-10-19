import { NextResponse } from "next/server";
import { z } from "zod";
import { getCoinBySymbol, type SupportedSymbol } from "../../../lib/coins";
import { fetchHistoricalPrices } from "../../../lib/fetchers";
import { linearForecast, mockForecast, type SeriesPoint } from "../../../lib/predict";

const QuerySchema = z.object({
  symbol: z.string(),
  horizon: z.coerce.number().min(1).max(30).default(7),
  model: z.enum(["mock", "linear"]).default("mock")
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = QuerySchema.safeParse({
      symbol: searchParams.get("symbol") ?? "",
      horizon: searchParams.get("horizon") ?? undefined,
      model: (searchParams.get("model") as "mock" | "linear" | null) ?? undefined
    });
    if (!result.success) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }
    const { symbol: rawSymbol, horizon, model } = result.data;
    const symbol = rawSymbol.toLowerCase() as SupportedSymbol;
    const coin = getCoinBySymbol(symbol);
    if (!coin) {
      return NextResponse.json({ error: "Unsupported symbol" }, { status: 400 });
    }

    const history = await fetchHistoricalPrices(symbol, "90d");
    const series: SeriesPoint[] = history.map((point) => ({ t: point.timestamp, p: point.price }));
    if (series.length === 0) {
      return NextResponse.json({ error: "Insufficient historical data" }, { status: 422 });
    }

    const seed = process.env.PREDICTION_SEED ?? `${symbol}-${horizon}`;
    const forecast = model === "mock" ? mockForecast(series, horizon, seed) : linearForecast(series, horizon);

    return NextResponse.json({ symbol, model, forecast });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 });
  }
}
