export interface TripRequest {
  source: string;
  destination: string;
  days: number;
  travelers: number;
  budget: number;
  travelStyle: string;
}

export interface ResearchResult {
  weather: string;
  bestTime: string;
  attractions: string[];
}

export interface AccommodationDetails {
  hotelName: string;
  roomType?: string;
  roomDetails?: string;
  nights?: number;
  rooms?: number;
  pricePerNight?: number;
  totalCost?: number;
  address?: string;
  checkIn?: string;
  checkOut?: string;
  amenities?: string[];
}

export interface BudgetResult {
  transport: number;
  hotel: number;
  food: number;
  activities: number;
  total: number;
  accommodation?: AccommodationDetails;
}

export interface NamedRecommendation {
  name: string;
  description?: string;
  cuisine?: string;
}

export interface RecommendationResult {
  attractions: string[];
  restaurants: string[];
  hiddenGems: string[];
  familyActivities?: string[];
  attractionItems?: NamedRecommendation[];
  restaurantItems?: NamedRecommendation[];
  hiddenGemItems?: NamedRecommendation[];
  familyActivityItems?: NamedRecommendation[];
}

export interface ItineraryDay {
  day: number;
  activities: string[];
  destination?: string;
  accommodation?: AccommodationDetails | string;
  origin?: string;
}

export interface ItineraryResult {
  itinerary: ItineraryDay[];
}

export interface TravelPlanResult {
  research: ResearchResult;
  budget: BudgetResult;
  recommendations: RecommendationResult;
  itinerary: ItineraryResult;
}
