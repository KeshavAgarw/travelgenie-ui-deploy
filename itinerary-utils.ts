import type {
  AccommodationDetails,
  ItineraryDay,
  TravelPlanResult,
  TripRequest,
} from "@/types/trip";

export interface TimelineItem {
  time: string;
  title: string;
  subtitle?: string;
}

export interface TimeBlock {
  label: "Morning" | "Afternoon" | "Evening";
  emoji: string;
  items: TimelineItem[];
}

export interface DayPlan {
  day: number;
  title: string;
  location: string;
  locationShort: string;
  transport?: string;
  accommodation?: AccommodationDetails | string;
  blocks: TimeBlock[];
}

export interface ItineraryStats {
  totalActivities: number;
  averagePerDay: number;
}

const MORNING_TIMES = ["07:00", "08:00", "09:00", "10:30", "11:30"];
const AFTERNOON_TIMES = ["13:00", "14:30", "16:00", "15:00", "17:00"];
const EVENING_TIMES = ["18:00", "18:30", "19:30", "20:00", "21:00", "21:30"];

function shortLocationName(location: string): string {
  const primary = location.split(/[&,]/)[0]?.trim() ?? location;
  if (primary.length <= 20) return primary;
  return primary.split(" ")[0] ?? primary;
}

function splitActivity(activity: string): { title: string; subtitle?: string } {
  const colonMatch = activity.match(/^([^:]+):\s*(.+)$/);
  if (colonMatch) {
    return { title: colonMatch[1].trim(), subtitle: colonMatch[2].trim() };
  }

  const parenMatch = activity.match(/^(.+?)\s*(\([^)]+\))\s*\.?$/);
  if (parenMatch && /travel|drive|hours|hrs|arrive|depart/i.test(activity)) {
    return { title: parenMatch[1].trim(), subtitle: parenMatch[2].trim() };
  }

  const separators = [" - ", " · ", " | "];
  for (const sep of separators) {
    if (activity.includes(sep)) {
      const [title, ...rest] = activity.split(sep);
      return { title: title.trim(), subtitle: rest.join(sep).trim() };
    }
  }

  return { title: activity.trim().replace(/\.$/, "") };
}

function extractTransport(activities: string[]): string | undefined {
  const travel = activities.find((activity) =>
    /travel|arrive|departure|drive from|board a|disembark|flight/i.test(activity)
  );
  if (!travel) return undefined;
  return splitActivity(travel).title;
}

function distributeActivities(activities: string[]): TimeBlock[] {
  if (activities.length === 0) {
    return [
      { label: "Morning", emoji: "🌅", items: [] },
      { label: "Afternoon", emoji: "☀️", items: [] },
      { label: "Evening", emoji: "🌙", items: [] },
    ];
  }

  const count = activities.length;
  const morningCount = Math.max(1, Math.ceil(count * 0.35));
  const afternoonCount = Math.max(1, Math.ceil(count * 0.35));

  const morningActs = activities.slice(0, morningCount);
  const afternoonActs = activities.slice(
    morningCount,
    morningCount + afternoonCount
  );
  const eveningActs = activities.slice(morningCount + afternoonCount);

  const toItems = (acts: string[], times: string[]): TimelineItem[] =>
    acts.map((activity, index) => {
      const parsed = splitActivity(activity);
      return {
        time: times[index] ?? times[times.length - 1] ?? "--",
        title: parsed.title,
        subtitle: parsed.subtitle,
      };
    });

  return [
    {
      label: "Morning" as const,
      emoji: "🌅",
      items: toItems(morningActs, MORNING_TIMES),
    },
    {
      label: "Afternoon" as const,
      emoji: "☀️",
      items: toItems(afternoonActs, AFTERNOON_TIMES),
    },
    {
      label: "Evening" as const,
      emoji: "🌙",
      items: toItems(eveningActs, EVENING_TIMES),
    },
  ];
}

function ensureDayCount(itinerary: ItineraryDay[] | undefined | null): ItineraryDay[] {
  return itinerary && itinerary.length > 0 ? itinerary : [];
}

export function buildItineraryDays(
  tripData: TravelPlanResult,
  request: TripRequest | null
): DayPlan[] {
  const fallbackDestination = request?.destination ?? "Destination";
  const fallbackAccommodation = tripData.budget.accommodation;
  const rawDays = ensureDayCount(tripData.itinerary?.itinerary);

  return rawDays.map((day) => {
    const location = day.destination ?? fallbackDestination;
    const locationShort = shortLocationName(location);
    const activities = day.activities;

    return {
      day: day.day,
      title: `Day ${day.day} — ${location}`,
      location,
      locationShort,
      transport: extractTransport(activities),
      accommodation: day.accommodation ?? fallbackAccommodation,
      blocks: distributeActivities(activities),
    };
  });
}

export function getItineraryStats(days: DayPlan[]): ItineraryStats {
  const totalActivities = days.reduce(
    (sum, day) =>
      sum + day.blocks.reduce((blockSum, block) => blockSum + block.items.length, 0),
    0
  );

  return {
    totalActivities,
    averagePerDay:
      days.length > 0 ? Math.round(totalActivities / days.length) : 0,
  };
}

export function getItinerarySubtitle(
  request: TripRequest | null,
  dayCount?: number
): string {
  if (!request) return "AI-composed day-by-day schedule";
  const days = dayCount ?? request.days;
  return `${request.destination} ${request.travelStyle} Trip · ${days} days · ${request.travelers} travelers`;
}
