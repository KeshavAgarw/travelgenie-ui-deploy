"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateTrip } from "@/lib/api";
import { useTripStore } from "@/store/trip-store";

const AGENT_BADGES = [
  { icon: "🔍", label: "Research Agent" },
  { icon: "💰", label: "Budget Agent" },
  { icon: "⭐", label: "Recommendation Agent" },
  { icon: "🗓️", label: "Itinerary Agent" },
] as const;

const TRAVEL_STYLES = [
  "Family",
  "Solo",
  "Adventure",
  "Luxury",
  "Spiritual",
] as const;

type TravelStyle = (typeof TRAVEL_STYLES)[number];

function parseNumber(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function Landing() {
  const router = useRouter();
  const { loading, setTripData, setLoading } = useTripStore();

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [travelers, setTravelers] = useState("");
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("Family");
  const [formError, setFormError] = useState<string | null>(null);

  async function handlePlanTrip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const tripRequest = {
      source: source.trim(),
      destination: destination.trim(),
      days: parseNumber(days),
      travelers: parseNumber(travelers),
      budget: parseNumber(budget),
      travelStyle,
    };

    if (
      !tripRequest.source ||
      !tripRequest.destination ||
      tripRequest.days < 1 ||
      tripRequest.travelers < 1 ||
      tripRequest.budget < 1
    ) {
      setFormError(
        "Please fill in all fields with valid values (days, travelers, and budget must be at least 1)."
      );
      return;
    }

    setLoading(true);
    setTripData(null);
    sessionStorage.setItem("tripRequest", JSON.stringify(tripRequest));
    router.push("/processing");

    try {
      const plan = await generateTrip(tripRequest);
      setTripData(plan);
      router.replace("/trip");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate trip plan.";
      router.replace("/");
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Plane className="size-5 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">
              TravelGenie AI
            </span>
          </div>
          <Button variant="outline" size="sm" className="rounded-md px-4">
            Sign In
          </Button>
        </div>
      </header>

      <header className="w-full text-center py-6 border bg-white">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Plan Your Perfect Trip with AI
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-slate-500">
          Powered by intelligent multi-agent technology — Research, Budget,
          Recommendations &amp; Itinerary
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-6 ">
        <section className="mb-10 text-center">
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {AGENT_BADGES.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm text-slate-700"
              >
                <span aria-hidden="true">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Trip Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Fill in your preferences and our AI agents will build your perfect
              itinerary
            </p>
          </div>

          <form onSubmit={handlePlanTrip} className="space-y-6">
            {formError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="source-city"
                  className="text-sm font-medium text-slate-700"
                >
                  Source City
                </label>
                <input
                  id="source-city"
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="📍 e.g. Mumbai"
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="destination"
                  className="text-sm font-medium text-slate-700"
                >
                  Destination
                </label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="📍 e.g. Kerala"
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="trip-days"
                  className="text-sm font-medium text-slate-700"
                >
                  Trip Duration (days)
                </label>
                <input
                  id="trip-days"
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="5"
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="travelers"
                  className="text-sm font-medium text-slate-700"
                >
                  Number of Travelers
                </label>
                <input
                  id="travelers"
                  type="number"
                  min={1}
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  placeholder="4"
                  required
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="budget"
                className="text-sm font-medium text-slate-700"
              >
                Budget (Total)
              </label>
              <input
                id="budget"
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="₹ 85,000"
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-3">
              <span className="text-sm font-medium text-slate-700">
                Travel Style
              </span>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTravelStyle(style)}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      travelStyle === style
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-md bg-slate-900 text-base font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Planning your trip…" : "🚀 Plan My Trip"}
              </Button>
              <p className="text-center text-xs text-slate-400">
                4 specialized AI agents will collaborate to build your itinerary
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
