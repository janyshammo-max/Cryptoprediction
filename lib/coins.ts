export type SupportedSymbol = "btc" | "eth" | "bnb" | "xrp" | "sol";

export interface CoinMetadata {
  symbol: SupportedSymbol;
  coingeckoId: string;
  displayName: string;
}

export const COINS: CoinMetadata[] = [
  { symbol: "btc", coingeckoId: "bitcoin", displayName: "Bitcoin" },
  { symbol: "eth", coingeckoId: "ethereum", displayName: "Ethereum" },
  { symbol: "bnb", coingeckoId: "binancecoin", displayName: "BNB" },
  { symbol: "xrp", coingeckoId: "ripple", displayName: "XRP" },
  { symbol: "sol", coingeckoId: "solana", displayName: "Solana" }
];

export const SYMBOL_MAP: Record<SupportedSymbol, CoinMetadata> = COINS.reduce(
  (acc, coin) => {
    acc[coin.symbol] = coin;
    return acc;
  },
  {} as Record<SupportedSymbol, CoinMetadata>,
);

export const COIN_SYMBOLS = COINS.map((coin) => coin.symbol);

export function getCoinBySymbol(symbol: string): CoinMetadata | undefined {
  return COINS.find((coin) => coin.symbol === symbol.toLowerCase());
}
