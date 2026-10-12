"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AttractionsCard } from "@/components/trip/attractions-card";
import { BestTimeCard } from "@/components/trip/best-time-card";
import { BudgetSummary } from "@/components/trip/budget-summary";
import { TripHeader } from "@/components/trip/trip-header";
import { TripSummary } from "@/components/trip/trip-summary";
import { WeatherCard } from "@/components/trip/weather-card";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/store/trip-store";

export default function TripDashboardPage() {
  const tripData = useTripStore((s) => s.tripData);

  if (!tripData) {
    return null;
  }

  return (
    <>
      <TripHeader />
      <main className="flex-1 space-y-6 p-8">
        <TripSummary />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BudgetSummary budget={tripData.budget} />
          </div>
          <WeatherCard research={tripData.research} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BestTimeCard research={tripData.research} />
          <AttractionsCard
            research={tripData.research}
            recommendations={tripData.recommendations}
          />
        </div>

        <Button
          asChild
          className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
        >
          <Link href="/trip/itinerary/1">
            View Full Itinerary
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </main>
    </>
  );
}
