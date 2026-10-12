"use client";

import { RecommendationsView } from "@/components/recommendations";
import { TripHeader } from "@/components/trip/trip-header";
import { getRecommendationsSubtitle } from "@/lib/recommendations-utils";
import { getTripRequest } from "@/lib/trip-context";
import { useTripStore } from "@/store/trip-store";

export default function RecommendationsPage() {
  const tripData = useTripStore((s) => s.tripData);
  const request = getTripRequest();

  if (!tripData) {
    return null;
  }

  const subtitle = request
    ? getRecommendationsSubtitle(request.travelStyle)
    : "Curated by AI Recommendation Agent";

  return (
    <>
      <TripHeader title="Personalized Recommendations" subtitle={subtitle} />
      <main className="flex-1 p-8">
        <RecommendationsView
          tripData={tripData}
          destination={request?.destination}
        />
      </main>
    </>
  );
}
