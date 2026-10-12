import { BedDouble, Clock, MapPin } from "lucide-react";
import type { AccommodationDetails } from "@/types/trip";
import {
  formatAccommodationCost,
  formatAccommodationStay,
  isAccommodationDetails,
} from "@/lib/accommodation-utils";
import { cn } from "@/lib/utils";

interface AccommodationDetailsViewProps {
  accommodation: AccommodationDetails | string;
  className?: string;
  compact?: boolean;
}

export function AccommodationDetailsView({
  accommodation,
  className,
  compact = false,
}: AccommodationDetailsViewProps) {
  if (!isAccommodationDetails(accommodation)) {
    return <p className={cn("text-sm text-slate-600", className)}>{accommodation}</p>;
  }

  const stay = formatAccommodationStay(accommodation);
  const cost = formatAccommodationCost(accommodation);

  if (compact) {
    return (
      <div className={cn("space-y-1 text-sm text-slate-600", className)}>
        <p className="font-medium text-slate-900">{accommodation.hotelName}</p>
        {accommodation.roomType && <p>{accommodation.roomType}</p>}
        {accommodation.roomDetails && (
          <p className="text-xs text-slate-500">{accommodation.roomDetails}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          <BedDouble className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            Recommended Stay
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {accommodation.hotelName}
          </h3>
          {accommodation.roomType && (
            <p className="mt-1 text-sm font-medium text-slate-700">
              {accommodation.roomType}
            </p>
          )}
          {accommodation.roomDetails && (
            <p className="mt-1 text-sm text-slate-500">
              {accommodation.roomDetails}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        {accommodation.address && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <span>{accommodation.address}</span>
          </div>
        )}
        {(accommodation.checkIn || accommodation.checkOut) && (
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <span>
              {accommodation.checkIn && `Check-in ${accommodation.checkIn}`}
              {accommodation.checkIn && accommodation.checkOut && " · "}
              {accommodation.checkOut && `Check-out ${accommodation.checkOut}`}
            </span>
          </div>
        )}
        {stay && <p>{stay}</p>}
        {cost && <p className="font-medium text-slate-900">{cost}</p>}
      </div>

      {accommodation.amenities && accommodation.amenities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {accommodation.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
            >
              {amenity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
