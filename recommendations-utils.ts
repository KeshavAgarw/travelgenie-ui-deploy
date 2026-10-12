import type { NamedRecommendation, TravelPlanResult } from "@/types/trip";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: string): T {
  return items[hashString(seed) % items.length];
}

const ATTRACTION_CATEGORIES = [
  "Nature",
  "Waterways",
  "Wildlife",
  "Heritage",
  "Beach",
  "Adventure",
];

const ATTRACTION_DURATIONS = ["3hrs", "Full day", "Half day", "4hrs", "5hrs"];

const ATTRACTION_DESCRIPTIONS = [
  "Scenic viewpoints and unforgettable landscapes",
  "Perfect for photos, walks, and local culture",
  "A must-visit highlight for your itinerary",
  "Family-friendly experience with great views",
];

const CUISINES = [
  "Kerala Cuisine",
  "North Indian",
  "Seafood",
  "South Indian",
  "Multi-cuisine",
];

const FAMILY_TAGS = ["Top Pick", "Kids Love", "Cultural", "Educational"];

const FAMILY_DURATIONS = ["Full Day", "4 Hours", "2 Hours", "Half Day"];

const HIDDEN_GEM_SUBTITLES = [
  "Less crowded · local favorite",
  "Off the beaten path · worth the detour",
  "Hidden spot recommended by locals",
  "Quiet escape away from tourist crowds",
];

export interface AttractionCard {
  name: string;
  category: string;
  duration: string;
  description: string;
  rating: number;
  destination?: string;
}

export interface RestaurantCard {
  name: string;
  cuisine: string;
  priceLevel: string;
  rating: number;
}

export interface HiddenGemItem {
  name: string;
  subtitle: string;
}

export interface FamilyActivityCard {
  name: string;
  tag: string;
  duration: string;
  rating: number;
}

export interface RecommendationsViewData {
  attractions: AttractionCard[];
  restaurants: RestaurantCard[];
  hiddenGems: HiddenGemItem[];
  familyActivities: FamilyActivityCard[];
  confidenceScore: number;
}

function uniqueStrings(items: string[]): string[] {
  return items.filter((item, index, arr) => item && arr.indexOf(item) === index);
}

function buildHiddenGem(name: string, destination: string): HiddenGemItem {
  const templates = [
    `Scenic spot near ${destination}`,
    ...HIDDEN_GEM_SUBTITLES,
  ];
  return {
    name,
    subtitle: pick(templates, name),
  };
}

function buildFamilyActivity(name: string, index: number): FamilyActivityCard {
  return {
    name,
    tag: FAMILY_TAGS[index % FAMILY_TAGS.length],
    duration: pick(FAMILY_DURATIONS, name),
    rating: 4 + (hashString(name) % 2),
  };
}

export function buildRecommendationsData(
  tripData: TravelPlanResult,
  destination = "your destination"
): RecommendationsViewData {
  const { recommendations, research } = tripData;

  const attractionItems: NamedRecommendation[] =
    recommendations.attractionItems && recommendations.attractionItems.length > 0
      ? recommendations.attractionItems.slice(0, 4)
      : uniqueStrings([
          ...recommendations.attractions,
          ...research.attractions,
        ])
          .slice(0, 4)
          .map((name) => ({ name }));

  const restaurantItems: NamedRecommendation[] =
    recommendations.restaurantItems && recommendations.restaurantItems.length > 0
      ? recommendations.restaurantItems.slice(0, 4)
      : uniqueStrings(recommendations.restaurants)
          .slice(0, 4)
          .map((name) => ({ name }));

  const hiddenGemItems: NamedRecommendation[] =
    recommendations.hiddenGemItems && recommendations.hiddenGemItems.length > 0
      ? recommendations.hiddenGemItems.slice(0, 6)
      : uniqueStrings(recommendations.hiddenGems)
          .slice(0, 6)
          .map((name) => ({ name }));

  const familyActivityItems: NamedRecommendation[] =
    recommendations.familyActivityItems &&
    recommendations.familyActivityItems.length > 0
      ? recommendations.familyActivityItems.slice(0, 4)
      : uniqueStrings(recommendations.familyActivities ?? [])
          .slice(0, 4)
          .map((name) => ({ name }));

  const totalItems =
    attractionItems.length +
    restaurantItems.length +
    hiddenGemItems.length +
    familyActivityItems.length;

  return {
    attractions: attractionItems.map((item) => ({
      name: item.name,
      category: pick(ATTRACTION_CATEGORIES, item.name),
      duration: pick(ATTRACTION_DURATIONS, item.name),
      description: item.description ?? pick(ATTRACTION_DESCRIPTIONS, item.name),
      rating: 4 + (hashString(item.name) % 2),
      destination,
    })),
    restaurants: restaurantItems.map((item) => ({
      name: item.name,
      cuisine: item.cuisine ?? pick(CUISINES, item.name),
      priceLevel: "₹".repeat(2 + (hashString(item.name) % 2)),
      rating: Number((4 + (hashString(item.name) % 10) / 10).toFixed(1)),
    })),
    hiddenGems: hiddenGemItems.map((item) => ({
      name: item.name,
      subtitle: item.description ?? buildHiddenGem(item.name, destination).subtitle,
    })),
    familyActivities: familyActivityItems.map((item, index) =>
      buildFamilyActivity(item.name, index)
    ),
    confidenceScore:
      totalItems === 0 ? 75 : Math.min(98, 82 + Math.min(16, totalItems * 2)),
  };
}

export function getRecommendationsSubtitle(travelStyle: string): string {
  return `Curated by AI Recommendation Agent · optimized for ${travelStyle.toLowerCase()} travel`;
}
