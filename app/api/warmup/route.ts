import { NextResponse } from "next/server";
import { COINS } from "../../../lib/coins";
import { fetchHistoricalPrices } from "../../../lib/fetchers";

export async function GET() {
  try {
    await Promise.all(COINS.map((coin) => fetchHistoricalPrices(coin.symbol, "7d")));
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Warmup failed", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
