"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { AccommodationDetailsView } from "@/components/accommodation-details";
import type { DayPlan } from "@/lib/itinerary-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function TimelineBlock({
  block,
}: {
  block: DayPlan["blocks"][number];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-sm font-semibold text-slate-900">
        {block.emoji} {block.label}
      </h3>

      {block.items.length === 0 ? (
        <p className="text-sm text-slate-400">No activities scheduled.</p>
      ) : (
        <div className="space-y-0">
          {block.items.map((item, index) => (
            <div key={`${item.time}-${item.title}`} className="flex gap-4">
              <div className="w-12 shrink-0 pt-0.5 text-right text-xs font-medium text-slate-400">
                {item.time}
              </div>
              <div className="relative flex flex-1 gap-3 pb-6">
                <div className="relative flex flex-col items-center">
                  <span className="z-10 size-2.5 rounded-full bg-slate-300" />
                  {index < block.items.length - 1 && (
                    <span className="absolute top-2 h-full w-px bg-slate-200" />
                  )}
                </div>
                <div className="-mt-0.5 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface ItineraryViewProps {
  days: DayPlan[];
  currentDay: number;
}

export function ItineraryView({ days, currentDay }: ItineraryViewProps) {
  const router = useRouter();
  const dayPlan = days.find((day) => day.day === currentDay) ?? days[0];
  const totalDays = days.length;
  const hasPrev = currentDay > 1;
  const hasNext = currentDay < totalDays;

  if (!dayPlan) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-900">No itinerary available</p>
        <p className="mt-2 text-sm text-slate-500">
          Plan a new trip to generate your day-by-day schedule.
        </p>
      </div>
    );
  }

  const hasActivities = dayPlan.blocks.some((block) => block.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {days.map((day) => (
          <Link
            key={day.day}
            href={`/trip/itinerary/${day.day}`}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              day.day === currentDay
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            )}
          >
            Day {day.day}
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{dayPlan.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Location: {dayPlan.location}
            </p>
          </div>
          {dayPlan.transport && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {dayPlan.transport.includes("Flight") ? (
                <Plane className="size-4 shrink-0 text-slate-400" />
              ) : (
                <Car className="size-4 shrink-0 text-slate-400" />
              )}
              <span>{dayPlan.transport}</span>
            </div>
          )}
        </div>
      </section>

      {dayPlan.accommodation && (
        <AccommodationDetailsView accommodation={dayPlan.accommodation} />
      )}

      <div className="space-y-4">
        {!hasActivities ? (
          <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              No activities were returned for this day. Try planning a new trip.
            </p>
          </section>
        ) : (
          dayPlan.blocks.map((block) => (
            <TimelineBlock key={block.label} block={block} />
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => router.push(`/trip/itinerary/${currentDay - 1}`)}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          Previous Day
        </Button>
        <span className="text-sm text-slate-500">
          Day {currentDay} of {totalDays}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => router.push(`/trip/itinerary/${currentDay + 1}`)}
          className="gap-1"
        >
          Next Day
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
