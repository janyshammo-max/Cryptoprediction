export interface SeriesPoint {
  t: number;
  p: number;
}

export interface ForecastPoint {
  timestamp: number;
  point: number;
  lower: number;
  upper: number;
}

function createSeededRng(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeStep(prices: SeriesPoint[]): number {
  if (prices.length < 2) {
    return 24 * 60 * 60 * 1000;
  }
  const last = prices.at(-1)!;
  const prev = prices.at(-2)!;
  return Math.max(last.t - prev.t, 60 * 60 * 1000);
}

export function mockForecast(prices: SeriesPoint[], horizon: number, seed = "demo"): ForecastPoint[] {
  if (!prices.length || horizon <= 0) return [];
  const rng = createSeededRng(seed);
  const sorted = [...prices].sort((a, b) => a.t - b.t);
  const step = computeStep(sorted);
  const last = sorted.at(-1)!;
  const driftBase = (sorted.at(-1)!.p - sorted[0]!.p) / Math.max(sorted.length - 1, 1);
  const bandRatio = 0.06;
  const points: ForecastPoint[] = [];
  let current = last.p;
  for (let i = 1; i <= horizon; i += 1) {
    const noise = (rng() - 0.5) * current * 0.02;
    const trend = driftBase * 0.5;
    current = Math.max(0, current + trend + noise);
    const timestamp = last.t + step * i;
    const margin = Math.max(current * bandRatio, 0.5);
    points.push({
      timestamp,
      point: Number(current.toFixed(2)),
      lower: Number(Math.max(current - margin, 0).toFixed(2)),
      upper: Number((current + margin).toFixed(2))
    });
  }
  return points;
}

type RegressionResult = {
  slope: number;
  intercept: number;
  residualStd: number;
};

function linearRegression(points: SeriesPoint[]): RegressionResult {
  const n = points.length;
  if (n < 2) {
    return { slope: 0, intercept: points[0]?.p ?? 0, residualStd: 0 };
  }
  const meanX = points.reduce((acc, pt) => acc + pt.t, 0) / n;
  const meanY = points.reduce((acc, pt) => acc + pt.p, 0) / n;
  let numerator = 0;
  let denominator = 0;
  for (const pt of points) {
    const dx = pt.t - meanX;
    numerator += dx * (pt.p - meanY);
    denominator += dx * dx;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  const residuals = points.map((pt) => pt.p - (slope * pt.t + intercept));
  const residualStd = Math.sqrt(
    residuals.reduce((acc, value) => acc + value * value, 0) / Math.max(residuals.length - 1, 1),
  );
  return { slope, intercept, residualStd };
}

export function linearForecast(prices: SeriesPoint[], horizon: number): ForecastPoint[] {
  if (!prices.length || horizon <= 0) return [];
  const sorted = [...prices].sort((a, b) => a.t - b.t);
  const step = computeStep(sorted);
  const regression = linearRegression(sorted);
  const last = sorted.at(-1)!;
  const forecasts: ForecastPoint[] = [];
  const sigma = regression.residualStd || (last.p * 0.05);
  for (let i = 1; i <= horizon; i += 1) {
    const timestamp = last.t + step * i;
    const prediction = regression.slope * timestamp + regression.intercept;
    const margin = sigma * 1.96;
    forecasts.push({
      timestamp,
      point: Number(prediction.toFixed(2)),
      lower: Number(Math.max(prediction - margin, 0).toFixed(2)),
      upper: Number(Math.max(prediction + margin, 0).toFixed(2))
    });
  }
  return forecasts;
}
