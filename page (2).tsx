"use client";

import { BudgetView } from "@/components/budget";
import { TripHeader } from "@/components/trip/trip-header";
import { getTripRequest } from "@/lib/trip-context";
import { useTripStore } from "@/store/trip-store";

export default function BudgetPlannerPage() {
  const tripData = useTripStore((s) => s.tripData);
  const request = getTripRequest();

  if (!tripData) {
    return null;
  }

  const subtitle = request
    ? `AI-optimized allocation for ${request.travelers} travelers · ${request.days} days`
    : "AI-optimized allocation for your trip";

  return (
    <>
      <TripHeader title="Budget Breakdown" subtitle={subtitle} />
      <main className="flex-1 p-8">
        <BudgetView budget={tripData.budget} />
      </main>
    </>
  );
}
