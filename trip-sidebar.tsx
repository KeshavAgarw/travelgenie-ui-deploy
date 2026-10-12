"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  Plane,
  Star,
  Wallet,
} from "lucide-react";
import { computeBudgetMetrics, formatCompact } from "@/lib/budget-utils";
import { getConfidenceScore } from "@/components/recommendations";
import {
  buildItineraryDays,
  getItineraryStats,
} from "@/lib/itinerary-utils";
import { cn } from "@/lib/utils";
import { getTripRequest, getTripTitle } from "@/lib/trip-context";
import { useTripStore } from "@/store/trip-store";

const NAV_ITEMS = [
  {
    href: "/trip",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/trip/budget",
    label: "Budget Planner",
    icon: Wallet,
    exact: false,
  },
  {
    href: "/trip/recommendations",
    label: "Recommendations",
    icon: Star,
    exact: false,
  },
  {
    href: "/trip/itinerary/1",
    label: "Itinerary",
    icon: CalendarDays,
    exact: false,
  },
] as const;

export function TripSidebar() {
  const pathname = usePathname();
  const tripRequest = getTripRequest();
  const tripTitle = getTripTitle(tripRequest);
  const tripData = useTripStore((s) => s.tripData);
  const isBudgetPage = pathname.startsWith("/trip/budget");
  const isRecommendationsPage = pathname.startsWith("/trip/recommendations");
  const isItineraryPage = pathname.startsWith("/trip/itinerary");

  const budgetMetrics =
    tripData && isBudgetPage
      ? computeBudgetMetrics(tripData.budget, tripRequest)
      : null;

  const confidenceScore =
    tripData && isRecommendationsPage
      ? getConfidenceScore(tripData, tripRequest?.destination)
      : null;

  const itineraryDays =
    tripData && isItineraryPage
      ? buildItineraryDays(tripData, tripRequest)
      : [];

  const itineraryStats =
    itineraryDays.length > 0 ? getItineraryStats(itineraryDays) : null;

  const activeDayMatch = pathname.match(/\/trip\/itinerary\/(\d+)/);
  const activeDay = activeDayMatch ? Number(activeDayMatch[1]) : 1;

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <Link
        href="/"
        className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 transition-colors hover:bg-slate-50"
      >
        <Plane className="size-5 text-slate-900" />
        <span className="text-base font-bold text-slate-900">TravelGenie AI</span>
      </Link>

      <nav className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Navigation
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {isActive && (
                    <span className="absolute top-1/2 left-0 h-6 w-0.5 -translate-y-1/2 rounded-full bg-blue-600" />
                  )}
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {isItineraryPage && itineraryDays.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Days
            </p>
            <ul className="space-y-1">
              {itineraryDays.map((day) => (
                <li key={day.day}>
                  <Link
                    href={`/trip/itinerary/${day.day}`}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      activeDay === day.day
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    Day {day.day} — {day.locationShort}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          {budgetMetrics ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">Budget Used</p>
                <ChevronRight className="size-3.5 text-slate-400" />
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${budgetMetrics.allocatedPercent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                {formatCompact(budgetMetrics.allocated)} of{" "}
                {formatCompact(budgetMetrics.totalBudget)}
              </p>
            </>
          ) : confidenceScore !== null ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">AI Confidence</p>
                <ChevronRight className="size-3.5 text-slate-400" />
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                {confidenceScore}% match score
              </p>
            </>
          ) : itineraryStats ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">
                  Total Activities
                </p>
                <ChevronRight className="size-3.5 text-slate-400" />
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {itineraryStats.totalActivities} planned
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {itineraryStats.averagePerDay} per day avg
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-700">Trip Progress</p>
                <ChevronRight className="size-3.5 text-slate-400" />
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">{tripTitle}</p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-3/4 rounded-full bg-slate-900" />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">Planning phase</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
