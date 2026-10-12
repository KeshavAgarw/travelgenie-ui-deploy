"use client";

import { Clock } from "lucide-react";
import type { ResearchResult } from "@/types/trip";

interface BestTimeCardProps {
  research: ResearchResult;
}

export function BestTimeCard({ research }: BestTimeCardProps) {
  const seasons = [
    {
      label: "Peak Season",
      period: "Oct – Feb",
      note: "Ideal · Your trip",
      highlight: true,
    },
    {
      label: "Shoulder",
      period: "Mar – May",
      note: "Hot, less crowd",
      highlight: false,
    },
    {
      label: "Monsoon",
      period: "Jun – Sep",
      note: "Heavy rains",
      highlight: false,
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">
          Best Time to Visit
        </h2>
      </div>

      {research.bestTime && research.bestTime !== "—" && (
        <p className="mt-3 text-sm text-slate-600">{research.bestTime}</p>
      )}

      <div className="mt-4 space-y-2">
        {seasons.map((season) => (
          <div
            key={season.label}
            className={
              season.highlight
                ? "rounded-lg border border-blue-100 bg-blue-50 px-4 py-3"
                : "rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">
                {season.label}{" "}
                <span className="font-normal text-slate-500">
                  ({season.period})
                </span>
              </p>
              {season.highlight && (
                <span className="text-xs font-medium text-blue-600">
                  {season.note}
                </span>
              )}
            </div>
            {!season.highlight && (
              <p className="mt-0.5 text-xs text-slate-500">{season.note}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
