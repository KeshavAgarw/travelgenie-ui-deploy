"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ItineraryView } from "@/components/itinerary";
import { TripHeader } from "@/components/trip/trip-header";
import {
  buildItineraryDays,
  getItinerarySubtitle,
} from "@/lib/itinerary-utils";
import { getTripRequest } from "@/lib/trip-context";
import { useTripStore } from "@/store/trip-store";

export default function ItineraryDayPage() {
  const router = useRouter();
  const params = useParams();
  const tripData = useTripStore((s) => s.tripData);
  const request = getTripRequest();

  const dayParam = Number(params.day);
  const days = tripData ? buildItineraryDays(tripData, request) : [];
  const totalDays = days.length;
  const currentDay =
    Number.isFinite(dayParam) && dayParam >= 1 && dayParam <= totalDays
      ? dayParam
      : 1;

  useEffect(() => {
    if (!tripData) return;
    if (!Number.isFinite(dayParam) || dayParam < 1 || dayParam > totalDays) {
      router.replace("/trip/itinerary/1");
    }
  }, [tripData, dayParam, totalDays, router]);

  if (!tripData) {
    return null;
  }

  const title = `${totalDays}-Day Trip Itinerary`;

  return (
    <>
      <TripHeader
        title={title}
        subtitle={getItinerarySubtitle(request, totalDays)}
      />
      <main className="flex-1 p-8">
        <ItineraryView days={days} currentDay={currentDay} />
      </main>
    </>
  );
}
