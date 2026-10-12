"use client";

import { type ReactNode } from "react";
import {
  Diamond,
  MapPin,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import type { TravelPlanResult } from "@/types/trip";
import {
  buildRecommendationsData,
  type AttractionCard,
  type FamilyActivityCard,
  type HiddenGemItem,
  type RestaurantCard,
} from "@/lib/recommendations-utils";
import { AttractionImage } from "@/components/attraction-image";
import { cn } from "@/lib/utils";

function DotRating({
  rating,
  max = 5,
  showScore,
}: {
  rating: number;
  max?: number;
  showScore?: boolean;
}) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-2 rounded-full",
              i < filled ? "bg-slate-700" : "bg-slate-200"
            )}
          />
        ))}
      </div>
      {showScore && (
        <span className="text-xs font-medium text-slate-500">{rating}</span>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: ReactNode;
  title: string;
  count?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-slate-500">{icon}</span>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {count && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {count}
        </span>
      )}
    </div>
  );
}

function AttractionCardView({ item }: { item: AttractionCard }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <AttractionImage
        key={`${item.name}-${item.destination ?? ""}`}
        name={item.name}
        destination={item.destination}
      />
      <div className="space-y-2 p-4">
        <h3 className="font-semibold text-slate-900">{item.name}</h3>
        <DotRating rating={item.rating} />
        <p className="text-xs text-slate-400">
          {item.category} · {item.duration}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
          {item.description}
        </p>
      </div>
    </article>
  );
}

function RestaurantCardView({ item }: { item: RestaurantCard }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{item.name}</h3>
        <span className="text-xs font-medium text-slate-400">
          {item.priceLevel}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{item.cuisine}</p>
      <div className="mt-3">
        <DotRating rating={item.rating} showScore />
      </div>
    </article>
  );
}

function HiddenGemRow({ item }: { item: HiddenGemItem }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
      </div>
      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
        Off-beat
      </span>
    </div>
  );
}

function FamilyActivityCardView({ item }: { item: FamilyActivityCard }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
        {item.tag}
      </span>
      <h3 className="mt-2 font-semibold text-slate-900">{item.name}</h3>
      <p className="mt-1 text-xs text-slate-400">{item.duration}</p>
      <div className="mt-3">
        <DotRating rating={item.rating} />
      </div>
    </article>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

interface RecommendationsViewProps {
  tripData: TravelPlanResult;
  destination?: string;
}

export function RecommendationsView({
  tripData,
  destination,
}: RecommendationsViewProps) {
  const data = buildRecommendationsData(tripData, destination);

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader
          icon={<MapPin className="size-4" />}
          title="Top Attractions"
          count={
            data.attractions.length > 0
              ? `${data.attractions.length} places`
              : undefined
          }
        />
        {data.attractions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.attractions.map((item) => (
              <AttractionCardView key={item.name} item={item} />
            ))}
          </div>
        ) : (
          <EmptySection message="No attractions recommended yet." />
        )}
      </section>

      <section>
        <SectionHeader
          icon={<UtensilsCrossed className="size-4" />}
          title="Restaurants"
          count={
            data.restaurants.length > 0
              ? `${data.restaurants.length} picks`
              : undefined
          }
        />
        {data.restaurants.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.restaurants.map((item) => (
              <RestaurantCardView key={item.name} item={item} />
            ))}
          </div>
        ) : (
          <EmptySection message="No restaurants recommended yet." />
        )}
      </section>

      <section>
        <SectionHeader
          icon={<Diamond className="size-4 text-blue-500" />}
          title="Hidden Gems"
        />
        {data.hiddenGems.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {data.hiddenGems.map((item) => (
              <HiddenGemRow key={item.name} item={item} />
            ))}
          </div>
        ) : (
          <EmptySection message="No hidden gems recommended yet." />
        )}
      </section>

      {data.familyActivities.length > 0 && (
        <section>
          <SectionHeader
            icon={<Users className="size-4" />}
            title="Family Activities"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.familyActivities.map((item) => (
              <FamilyActivityCardView key={item.name} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function getConfidenceScore(
  tripData: TravelPlanResult,
  destination?: string
): number {
  return buildRecommendationsData(tripData, destination).confidenceScore;
}
