"use client";

import { Cloud } from "lucide-react";
import type { ResearchResult } from "@/types/trip";
import { getTripRequest } from "@/lib/trip-context";

interface WeatherCardProps {
  research: ResearchResult;
}

function parseWeatherMetrics(weather: string) {
  const tempMatch = weather.match(/(\d+)\s*°?\s*c/i);
  const humidityMatch = weather.match(/(\d+)\s*%/i);
  const rainfallMatch = weather.match(
    /(low|moderate|high|minimal|heavy)\s*rain/i
  );

  return {
    temp: tempMatch ? `${tempMatch[1]}°C` : "28°C",
    humidity: humidityMatch ? `${humidityMatch[1]}%` : "65%",
    rainfall: rainfallMatch
      ? rainfallMatch[1].charAt(0).toUpperCase() + rainfallMatch[1].slice(1)
      : "Low",
    conditions: weather.trim() || "Sunny / Cloudy",
  };
}

export function WeatherCard({ research }: WeatherCardProps) {
  const request = getTripRequest();
  const monthLabel = request?.destination ? "Destination Weather" : "Weather";
  const metrics = parseWeatherMetrics(research.weather);

  const rows = [
    { label: "Avg Temp", value: metrics.temp },
    { label: "Humidity", value: metrics.humidity },
    { label: "Rainfall", value: metrics.rainfall },
    { label: "Conditions", value: metrics.conditions },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Cloud className="size-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">{monthLabel}</h2>
      </div>

      <dl className="mt-5 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between text-sm"
          >
            <dt className="text-slate-500 pr-4">{row.label}</dt>
            <dd className="font-medium text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
