"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TripSidebar } from "@/components/trip/trip-sidebar";
import { useTripStore } from "@/store/trip-store";

export default function TripLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const tripData = useTripStore((s) => s.tripData);
  const hydrated = useTripStore((s) => s.hydrated);
  const hydrateFromSession = useTripStore((s) => s.hydrateFromSession);

  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  useEffect(() => {
    if (!hydrated) return;
    if (!tripData) {
      router.replace("/");
    }
  }, [hydrated, tripData, router]);

  if (!hydrated) {
    return null;
  }

  if (!tripData) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TripSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
