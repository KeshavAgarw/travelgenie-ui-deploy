"use client";

import type { BudgetResult } from "@/types/trip";
import { formatCurrency, getTripRequest } from "@/lib/trip-context";

interface BudgetSummaryProps {
  budget: BudgetResult;
}

export function BudgetSummary({ budget }: BudgetSummaryProps) {
  const request = getTripRequest();
  const totalBudget = request?.budget ?? budget.total;
  const allocated =
    budget.transport + budget.hotel + budget.food + budget.activities;
  const unallocated = Math.max(0, totalBudget - allocated);
  const allocatedPercent =
    totalBudget > 0 ? Math.round((allocated / totalBudget) * 100) : 0;

  const categories = [
    { label: "Transport", amount: budget.transport },
    { label: "Hotel", amount: budget.hotel },
    { label: "Food", amount: budget.food },
    { label: "Activities", amount: budget.activities },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Budget Summary</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-400">Total Budget</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(totalBudget)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Allocated</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(allocated)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Unallocated</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {formatCurrency(unallocated)}
          </p>
        </div>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500"
          style={{ width: `${allocatedPercent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {allocatedPercent}% of budget allocated across categories
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
        {categories.map((cat) => (
          <div key={cat.label}>
            <p className="text-xs text-slate-400">{cat.label}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-900">
              {formatCurrency(cat.amount)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
