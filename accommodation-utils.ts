import type { AccommodationDetails } from "@/types/trip";
import { formatCurrency } from "@/lib/trip-context";

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

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.map((item) => String(item).trim()).filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function asNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function normalizeAccommodation(
  value: unknown
): AccommodationDetails | string | undefined {
  if (!value) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value !== "object") return undefined;

  const obj = value as Record<string, unknown>;
  const hotelName = String(
    getField(obj, "hotelName", "HotelName", "name", "Name", "hotel", "Hotel") ??
      ""
  ).trim();

  if (!hotelName) return undefined;

  return {
    hotelName,
    roomType: getField(obj, "roomType", "RoomType")
      ? String(getField(obj, "roomType", "RoomType"))
      : undefined,
    roomDetails: getField(obj, "roomDetails", "RoomDetails", "details", "Details")
      ? String(getField(obj, "roomDetails", "RoomDetails", "details", "Details"))
      : undefined,
    nights: asNumber(getField(obj, "nights", "Nights")),
    rooms: asNumber(getField(obj, "rooms", "Rooms")),
    pricePerNight: asNumber(
      getField(obj, "pricePerNight", "PricePerNight", "nightlyRate", "NightlyRate")
    ),
    totalCost: asNumber(getField(obj, "totalCost", "TotalCost", "total", "Total")),
    address: getField(obj, "address", "Address", "location", "Location")
      ? String(getField(obj, "address", "Address", "location", "Location"))
      : undefined,
    checkIn: getField(obj, "checkIn", "CheckIn")
      ? String(getField(obj, "checkIn", "CheckIn"))
      : undefined,
    checkOut: getField(obj, "checkOut", "CheckOut")
      ? String(getField(obj, "checkOut", "CheckOut"))
      : undefined,
    amenities: asStringArray(getField(obj, "amenities", "Amenities")),
  };
}

export function isAccommodationDetails(
  value: AccommodationDetails | string | undefined
): value is AccommodationDetails {
  return typeof value === "object" && value !== null && "hotelName" in value;
}

export function formatAccommodationSummary(
  value: AccommodationDetails | string | undefined
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;

  const parts = [value.hotelName];
  if (value.roomType) parts.push(value.roomType);
  return parts.join(" · ");
}

export function formatAccommodationStay(
  value: AccommodationDetails | string | undefined
): string | undefined {
  if (!isAccommodationDetails(value)) return undefined;

  const parts: string[] = [];
  if (value.nights) {
    parts.push(`${value.nights} night${value.nights > 1 ? "s" : ""}`);
  }
  if (value.rooms) {
    parts.push(`${value.rooms} room${value.rooms > 1 ? "s" : ""}`);
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function formatAccommodationCost(
  value: AccommodationDetails | string | undefined
): string | undefined {
  if (!isAccommodationDetails(value)) return undefined;

  if (value.pricePerNight) {
    const nightly = `${formatCurrency(value.pricePerNight)}/night`;
    if (value.totalCost) {
      return `${nightly} · ${formatCurrency(value.totalCost)} total`;
    }
    return nightly;
  }

  if (value.totalCost) {
    return formatCurrency(value.totalCost);
  }

  return undefined;
}
