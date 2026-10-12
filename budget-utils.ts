import {
  formatAccommodationStay,
  formatAccommodationSummary,
} from "@/lib/accommodation-utils";
import type { BudgetResult, TripRequest } from "@/types/trip";
import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Gift,
  Plane,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";

export interface BudgetCategory {
  id: string;
  label: string;
  amount: number;
  percent: number;
  barColor: string;
  segmentColor: string;
  icon: LucideIcon;
  detail: string;
}

export interface BudgetMetrics {
  totalBudget: number;
  allocated: number;
  remaining: number;
  perPerson: number;
  allocatedPercent: number;
  remainingPercent: number;
  categories: BudgetCategory[];
}

function formatCompact(amount: number): string {
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function computeBudgetMetrics(
  budget: BudgetResult,
  request: TripRequest | null
): BudgetMetrics {
  const totalBudget = request?.budget ?? budget.total;
  const hotel = budget.hotel;
  const transport = budget.transport;
  const food = budget.food;
  const activities = budget.activities;
  const allocated = hotel + transport + food + activities;
  const remaining = Math.max(0, totalBudget - allocated);
  const travelers = request?.travelers ?? 1;
  const days = request?.days ?? 1;
  const nights = Math.max(1, days - 1);
  const rooms = Math.max(1, Math.ceil(travelers / 2));

  const accommodationSummary = formatAccommodationSummary(budget.accommodation);
  const accommodationStay = formatAccommodationStay(budget.accommodation);
  const hotelDetail =
    accommodationSummary && accommodationStay
      ? `${accommodationSummary} · ${accommodationStay}`
      : accommodationSummary ??
        `${nights} nights · ${rooms} room${rooms > 1 ? "s" : ""}`;

  const rawCategories = [
    {
      id: "hotel",
      label: "Hotels & Accommodation",
      amount: hotel,
      barColor: "bg-orange-500",
      segmentColor: "bg-orange-400",
      icon: BedDouble,
      detail: hotelDetail,
    },
    {
      id: "transport",
      label: "Transport & Flights",
      amount: transport,
      barColor: "bg-sky-500",
      segmentColor: "bg-sky-400",
      icon: Plane,
      detail: "Flights + local",
    },
    {
      id: "food",
      label: "Food & Dining",
      amount: food,
      barColor: "bg-slate-400",
      segmentColor: "bg-slate-300",
      icon: UtensilsCrossed,
      detail: `₹${Math.round(food / (travelers * days)).toLocaleString("en-IN")}/person/day`,
    },
    {
      id: "activities",
      label: "Activities & Entry Fees",
      amount: activities,
      barColor: "bg-indigo-600",
      segmentColor: "bg-indigo-500",
      icon: Ticket,
      detail: `${Math.max(1, Math.round(activities / 1500))} attractions`,
    },
    {
      id: "misc",
      label: "Miscellaneous",
      amount: remaining,
      barColor: "bg-pink-400",
      segmentColor: "bg-pink-300",
      icon: Gift,
      detail: "Buffer & extras",
    },
  ];

  const categories: BudgetCategory[] = rawCategories.map((cat) => ({
    ...cat,
    percent:
      totalBudget > 0 ? Math.round((cat.amount / totalBudget) * 100) : 0,
  }));

  return {
    totalBudget,
    allocated,
    remaining,
    perPerson: travelers > 0 ? Math.round(totalBudget / travelers) : totalBudget,
    allocatedPercent:
      totalBudget > 0 ? Math.round((allocated / totalBudget) * 100) : 0,
    remainingPercent:
      totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0,
    categories,
  };
}

export { formatCompact };
