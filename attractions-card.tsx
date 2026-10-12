"use client";

import { MapPin } from "lucide-react";
import type { RecommendationResult, ResearchResult } from "@/types/trip";

interface AttractionsCardProps {
  research: ResearchResult;
  recommendations: RecommendationResult;
}

export function AttractionsCard({
  research,
  recommendations,
}: AttractionsCardProps) {
  const attractions = [
    ...research.attractions,
    ...recommendations.attractions,
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  const display = attractions.length > 0 ? attractions.slice(0, 6) : ["—"];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-900">Top Attractions</h2>
      </div>

      <ol className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {display.map((attraction, index) => (
          <li
            key={`${attraction}-${index}`}
            className="flex items-start gap-2.5 text-sm text-slate-700"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {index + 1}
            </span>
            {attraction}
          </li>
        ))}
      </ol>
    </section>
  );
}
