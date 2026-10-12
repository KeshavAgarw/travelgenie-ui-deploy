import { create } from "zustand";
import { normalizeTravelPlan } from "@/lib/normalize-trip";
import type { TravelPlanResult } from "@/types/trip";

interface TripStore {
  tripData: TravelPlanResult | null;
  loading: boolean;
  hydrated: boolean;
  setTripData: (data: TravelPlanResult | null) => void;
  setLoading: (loading: boolean) => void;
  hydrateFromSession: () => void;
}

function loadTripDataFromSession(): TravelPlanResult | null {
  const raw = sessionStorage.getItem("tripData");
  if (!raw) return null;

  try {
    return normalizeTravelPlan(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveTripDataToSession(tripData: TravelPlanResult | null) {
  if (tripData) {
    sessionStorage.setItem("tripData", JSON.stringify(tripData));
  } else {
    sessionStorage.removeItem("tripData");
  }
}

export const useTripStore = create<TripStore>((set, get) => ({
  tripData: null,
  loading: false,
  hydrated: false,
  setTripData: (tripData) => {
    if (typeof window !== "undefined") {
      saveTripDataToSession(tripData);
    }
    set({ tripData, hydrated: true });
  },
  setLoading: (loading) => set({ loading }),
  hydrateFromSession: () => {
    if (get().hydrated) return;

    const tripData =
      typeof window !== "undefined" ? loadTripDataFromSession() : null;

    set({ tripData, hydrated: true });
  },
}));
