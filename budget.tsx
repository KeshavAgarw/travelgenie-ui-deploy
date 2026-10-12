"use client";

import { Info } from "lucide-react";
import { AccommodationDetailsView } from "@/components/accommodation-details";
import type { BudgetResult } from "@/types/trip";
import {
  computeBudgetMetrics,
  formatCompact,
} from "@/lib/budget-utils";
import { formatCurrency, getTripRequest } from "@/lib/trip-context";
import { cn } from "@/lib/utils";

function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-white/20",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-white transition-all duration-500",
          barClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function CategoryProgressBar({
  value,
  barColor,
}: {
  value: number;
  barColor: string;
}) {
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full transition-all duration-500", barColor)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

interface BudgetViewProps {
  budget: BudgetResult;
}

export function BudgetView({ budget }: BudgetViewProps) {
  const request = getTripRequest();
  const metrics = computeBudgetMetrics(budget, request);

  const detailCards = metrics.categories.filter((cat) => cat.id !== "misc");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-slate-900 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-300">Total Budget</p>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(metrics.totalBudget)}
          </p>
          <ProgressBar
            value={metrics.allocatedPercent}
            className="mt-4 bg-white/10"
          />
          <p className="mt-2 text-xs text-slate-400">
            {formatCurrency(metrics.allocated)} allocated
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Per Person Budget</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(metrics.perPerson)}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Across all {request?.travelers ?? "—"} travelers
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Budget Remaining</p>
            <Info className="size-4 text-slate-300" />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {formatCurrency(metrics.remaining)}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            {metrics.remainingPercent}% unallocated buffer
          </p>
        </div>
      </div>

      {budget.accommodation && (
        <AccommodationDetailsView accommodation={budget.accommodation} />
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Cost Categories</h2>
        <div className="mt-6 space-y-5">
          {metrics.categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="flex items-center gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {category.label}
                    </p>
                    <div className="flex shrink-0 items-center gap-3 text-sm">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(category.amount)}
                      </span>
                      <span className="w-8 text-right text-slate-400">
                        {category.percent}%
                      </span>
                    </div>
                  </div>
                  <CategoryProgressBar
                    value={category.percent}
                    barColor={category.barColor}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {detailCards.map((category) => (
          <div
            key={category.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-slate-400">
              {category.label.split(" &")[0].split(" ")[0]}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(category.amount)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{category.detail}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Expense Distribution
        </h2>

        <div className="mt-6 flex h-14 overflow-hidden rounded-xl">
          {metrics.categories.map((category) =>
            category.percent > 0 ? (
              <div
                key={category.id}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-white transition-all",
                  category.segmentColor
                )}
                style={{ width: `${category.percent}%` }}
              >
                <category.icon className="size-4" />
                <span className="text-[10px] font-medium">
                  {category.percent}%
                </span>
              </div>
            ) : null
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {metrics.categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span
                className={cn("size-2.5 rounded-full", category.segmentColor)}
              />
              {category.label.split(" &")[0]}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { formatCompact };
