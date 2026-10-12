import axios from "axios";
import { normalizeTravelPlan } from "@/lib/normalize-trip";
import type { TravelPlanResult, TripRequest } from "@/types/trip";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

export async function generateTrip(
  request: TripRequest
): Promise<TravelPlanResult> {
  const { data } = await api.post("/trip/plan", request);
  return normalizeTravelPlan(data);
}
