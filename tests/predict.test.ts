import { describe, expect, it } from "vitest";
import { linearForecast } from "../lib/predict";

function buildSeries(length: number, slope: number, intercept: number) {
  const start = Date.now() - length * 24 * 60 * 60 * 1000;
  return Array.from({ length }, (_, index) => {
    const timestamp = start + index * 24 * 60 * 60 * 1000;
    return { t: timestamp, p: slope * timestamp + intercept };
  });
}

describe("linearForecast", () => {
  it("returns the requested horizon length", () => {
    const series = buildSeries(10, 0.000001, 2000);
    const forecast = linearForecast(series, 5);
    expect(forecast).toHaveLength(5);
  });

  it("extrapolates following the trend", () => {
    const slope = 0.000002;
    const intercept = 1000;
    const series = buildSeries(20, slope, intercept);
    const forecast = linearForecast(series, 3);
    expect(forecast[0].point).toBeGreaterThan(series.at(-1)!.p);
    expect(forecast[forecast.length - 1].point).toBeGreaterThan(forecast[0].point);
  });

  it("handles flat data without NaN", () => {
    const base = Date.now();
    const series = Array.from({ length: 5 }, (_, index) => ({ t: base + index * 1000, p: 100 }));
    const forecast = linearForecast(series, 2);
    forecast.forEach((point) => {
      expect(point.point).toBeTypeOf("number");
      expect(Number.isFinite(point.point)).toBe(true);
    });
  });
});
