"use client";

import { getTripRequest } from "@/lib/trip-context";

export function TripSummary() {
  const request = getTripRequest();

  const items = [
    {
      label: "Destination",
      value: request ? `${request.destination}, India` : "—",
    },
    {
      label: "Travel Dates",
      value: request ? `${request.days}-day trip` : "—",
    },
    {
      label: "Travelers",
      value: request
        ? `${request.travelers} (${request.travelStyle})`
        : "—",
    },
    {
      label: "Duration",
      value: request ? `${request.days} Days` : "—",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Trip Summary</h2>
      <dl className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs font-medium text-slate-400">{item.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
