import { useSyncExternalStore } from "react";
import type { TripRequest } from "@/types/trip";

const TRIP_REQUEST_KEY = "tripRequest";

let cachedRaw: string | null | undefined;
let cachedSnapshot: TripRequest | null = null;

function invalidateTripRequestCache() {
  cachedRaw = undefined;
}

function getTripRequestSnapshot(): TripRequest | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(TRIP_REQUEST_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedSnapshot = null;
    return null;
  }

  try {
    cachedSnapshot = JSON.parse(raw) as TripRequest;
  } catch {
    cachedSnapshot = null;
  }

  return cachedSnapshot;
}

export function readTripRequestFromSession(): TripRequest | null {
  return getTripRequestSnapshot();
}

export function getTripRequest(): TripRequest | null {
  return getTripRequestSnapshot();
}

function subscribeToTripRequest(onStoreChange: () => void) {
  const handler = (event: StorageEvent) => {
    if (event.key === TRIP_REQUEST_KEY || event.key === null) {
      invalidateTripRequestCache();
      onStoreChange();
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function useTripRequest(): TripRequest | null {
  return useSyncExternalStore(
    subscribeToTripRequest,
    getTripRequestSnapshot,
    () => null
  );
}

export function getTripTitle(request: TripRequest | null): string {
  if (!request) return "Your Trip";
  return `${request.destination} ${request.travelStyle} Trip`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
