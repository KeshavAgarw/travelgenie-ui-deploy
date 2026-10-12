import { normalizeAccommodation } from "@/lib/accommodation-utils";
import type {
  ItineraryDay,
  NamedRecommendation,
  TravelPlanResult,
} from "@/types/trip";

function getField(
  record: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
    const match = Object.keys(record).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    if (match && record[match] !== undefined) return record[match];
  }
  return undefined;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          return String(
            obj.name ?? obj.title ?? obj.activity ?? obj.text ?? ""
          ).trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function asActivityStrings(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  if (!Array.isArray(value)) return [];

  const results: string[] = [];

  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      results.push(item.trim());
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const obj = item as Record<string, unknown>;
    const nested = getField(obj, "items", "Items", "activities", "Activities");

    if (Array.isArray(nested)) {
      results.push(...asActivityStrings(nested));
      continue;
    }

    const title = String(
      obj.activity ?? obj.name ?? obj.title ?? obj.text ?? ""
    ).trim();
    const subtitle = String(
      obj.description ?? obj.details ?? obj.note ?? ""
    ).trim();
    const time = String(obj.time ?? obj.Time ?? "").trim();

    if (!title) continue;

    if (time && subtitle) {
      results.push(`${time} · ${title} - ${subtitle}`);
    } else if (subtitle && title !== subtitle) {
      results.push(`${title}: ${subtitle}`);
    } else if (time) {
      results.push(`${time} · ${title}`);
    } else {
      results.push(title);
    }
  }

  return results.filter(Boolean);
}

function isDayLike(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const day = value as Record<string, unknown>;
  return (
    getField(day, "day", "Day") !== undefined ||
    getField(day, "activities", "Activities") !== undefined ||
    getField(day, "location", "Location", "destination", "Destination") !==
      undefined
  );
}

function findItineraryDayArray(value: unknown, depth = 0): unknown[] {
  if (depth > 6) return [];

  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (value.some(isDayLike)) return value;
    return [];
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = [
      "itinerary",
      "Itinerary",
      "days",
      "Days",
      "schedule",
      "Schedule",
      "plan",
      "Plan",
      "dailyPlan",
      "daily_plan",
      "tripPlan",
      "trip_plan",
    ];

    for (const key of keys) {
      const candidate = getField(record, key);
      const found = findItineraryDayArray(candidate, depth + 1);
      if (found.length > 0) return found;
    }

    for (const nested of Object.values(record)) {
      if (nested && typeof nested === "object") {
        const found = findItineraryDayArray(nested, depth + 1);
        if (found.length > 0) return found;
      }
    }
  }

  return [];
}

function asRecommendationItems(value: unknown): NamedRecommendation[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string" && item.trim()) {
        return { name: item.trim() };
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const name = String(obj.name ?? obj.title ?? "").trim();
        if (!name) return null;
        return {
          name,
          description: obj.description
            ? String(obj.description)
            : undefined,
          cuisine: obj.cuisine ? String(obj.cuisine) : undefined,
        };
      }
      return null;
    })
    .filter((item): item is NamedRecommendation => item !== null);
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDay(day: unknown, index: number): ItineraryDay {
  const d = (day ?? {}) as Record<string, unknown>;
  const location = getField(
    d,
    "location",
    "Location",
    "destination",
    "Destination"
  );
  const accommodation = getField(d, "accommodation", "Accommodation");
  const origin = getField(d, "origin", "Origin");

  const activities = asActivityStrings(getField(d, "activities", "Activities"));
  const noteLines = asStringArray(getField(d, "notes", "Notes"));

  return {
    day: asNumber(getField(d, "day", "Day")) || index + 1,
    activities: [...activities, ...noteLines],
    destination: location ? String(location) : undefined,
    accommodation: normalizeAccommodation(accommodation),
    origin: origin ? String(origin) : undefined,
  };
}

function normalizeItineraryDays(value: unknown): ItineraryDay[] {
  const days = findItineraryDayArray(value);
  return days.map(normalizeDay);
}

function normalizeBudget(
  budget: Record<string, unknown>,
  itinerary: Record<string, unknown> | undefined
): TravelPlanResult["budget"] {
  const summary =
    itinerary && typeof itinerary === "object"
      ? (getField(
          itinerary as Record<string, unknown>,
          "budgetSummary",
          "BudgetSummary",
          "totalBudgetEstimate",
          "TotalBudgetEstimate"
        ) as Record<string, unknown> | undefined)
      : undefined;

  const source = summary ?? budget;

  const accommodation = normalizeAccommodation(
    getField(source, "accommodation", "Accommodation") ??
      getField(budget, "accommodation", "Accommodation")
  );

  return {
    transport: asNumber(getField(source, "transport", "Transport")),
    hotel: asNumber(getField(source, "hotel", "Hotel")),
    food: asNumber(getField(source, "food", "Food")),
    activities: asNumber(getField(source, "activities", "Activities")),
    total: asNumber(getField(source, "total", "Total")),
    accommodation:
      accommodation && typeof accommodation !== "string"
        ? accommodation
        : undefined,
  };
}

export function normalizeTravelPlan(data: unknown): TravelPlanResult {
  const raw = (data ?? {}) as Record<string, unknown>;
  const research = (raw.research ?? {}) as Record<string, unknown>;
  const budget = (raw.budget ?? {}) as Record<string, unknown>;
  const recommendations = (raw.recommendations ?? {}) as Record<string, unknown>;
  const itineraryRaw = raw.itinerary;

  const attractionSource = getField(
    recommendations,
    "attractions",
    "Attractions"
  );
  const restaurantSource = getField(
    recommendations,
    "restaurants",
    "Restaurants"
  );
  const hiddenGemSource = getField(
    recommendations,
    "hiddenGems",
    "hidden_gems",
    "HiddenGems"
  );
  const familyActivitySource = getField(
    recommendations,
    "familyActivities",
    "FamilyActivities",
    "family_activities"
  );

  const attractionItems = asRecommendationItems(attractionSource);
  const restaurantItems = asRecommendationItems(restaurantSource);
  const hiddenGemItems = asRecommendationItems(hiddenGemSource);
  const familyActivityItems = asRecommendationItems(familyActivitySource);

  return {
    research: {
      weather: String(research.weather ?? "—"),
      bestTime: String(research.bestTime ?? research.best_time ?? "—"),
      attractions: asStringArray(research.attractions),
    },
    budget: normalizeBudget(budget, itineraryRaw as Record<string, unknown>),
    recommendations: {
      attractions:
        attractionItems.length > 0
          ? attractionItems.map((item) => item.name)
          : asStringArray(attractionSource),
      restaurants:
        restaurantItems.length > 0
          ? restaurantItems.map((item) => item.name)
          : asStringArray(restaurantSource),
      hiddenGems:
        hiddenGemItems.length > 0
          ? hiddenGemItems.map((item) => item.name)
          : asStringArray(hiddenGemSource),
      familyActivities:
        familyActivityItems.length > 0
          ? familyActivityItems.map((item) => item.name)
          : asStringArray(familyActivitySource),
      attractionItems,
      restaurantItems,
      hiddenGemItems,
      familyActivityItems,
    },
    itinerary: {
      itinerary: normalizeItineraryDays(itineraryRaw),
    },
  };
}

export function formatList(items: string[] | undefined, fallback = "—"): string {
  return items?.length ? items.join(", ") : fallback;
}
