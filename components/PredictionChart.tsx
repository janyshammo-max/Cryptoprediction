"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import type { ForecastPoint, SeriesPoint } from "../lib/predict";

interface PredictionChartProps {
  historical: SeriesPoint[];
  forecast: ForecastPoint[];
}

const priceFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

export default function PredictionChart({ historical, forecast }: PredictionChartProps) {
  const sortedHistorical = [...historical].sort((a, b) => a.t - b.t);
  const lastHistorical = sortedHistorical.at(-1);
  const windowSize = (lastHistorical?.t ?? 0) - (sortedHistorical[0]?.t ?? 0);
  const forecastData = forecast.map((point) => ({
    timestamp: point.timestamp,
    point: point.point,
    lower: point.lower,
    band: Math.max(point.upper - point.lower, 0)
  }));
  const historicalData = sortedHistorical.map((point) => ({ timestamp: point.t, price: point.p }));
  const axisData = [...historicalData, ...forecastData];

  return (
    <ResponsiveContainer width="100%" height={380}>
      <AreaChart data={axisData} margin={{ left: 16, right: 24, top: 20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorHistoric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5f5" opacity={0.2} />
        <XAxis
          type="number"
          dataKey="timestamp"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(value: number) =>
            format(value, windowSize > 48 * 60 * 60 * 1000 ? "d MMM" : "HH:mm", { locale: nl })
          }
          stroke="#94a3b8"
        />
        <YAxis tickFormatter={(value: number) => priceFormatter.format(value)} stroke="#94a3b8" width={120} />
        <Tooltip
          contentStyle={{ background: "#0f172a", color: "#f8fafc", borderRadius: 12, border: "none" }}
          labelFormatter={(value) => format(value as number, "d MMM HH:mm", { locale: nl })}
          formatter={(value: number) => priceFormatter.format(value)}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="price"
          data={historicalData}
          stroke="#4f46e5"
          strokeWidth={2}
          fill="url(#colorHistoric)"
          name="Historisch"
          dot={false}
          isAnimationActive={false}
          activeDot={{ r: 4 }}
        />
        {forecast.length > 0 && (
          <Area
            type="monotone"
            dataKey="lower"
            data={forecastData}
            stackId="forecast"
            stroke="none"
            fillOpacity={0}
            activeDot={false}
            isAnimationActive={false}
          />
        )}
        {forecast.length > 0 && (
          <Area
            type="monotone"
            dataKey="band"
            data={forecastData}
            stackId="forecast"
            stroke="none"
            fill="url(#colorForecast)"
            name="95% band"
            activeDot={false}
            isAnimationActive={false}
          />
        )}
        {forecast.length > 0 && (
          <Line
            type="monotone"
            dataKey="point"
            data={forecastData}
            stroke="#38bdf8"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Voorspelling"
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
