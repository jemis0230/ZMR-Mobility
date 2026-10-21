import { MapPin } from "lucide-react";
import type { CustomerPhoto } from "@/lib/customerPhotos";

/**
 * City/state caption for a customer photo, rendered as HTML below the image (never baked
 * into the photo). Renders nothing when the photo has no approved location.
 */
export default function PhotoLocation({ location, className = "" }: { location: CustomerPhoto["location"]; className?: string }) {
  if (!location?.label) return null;
  const content = (
    <>
      <MapPin className="w-3.5 h-3.5 shrink-0 text-leaf" aria-hidden />
      <span className="sr-only">Photo location: </span>
      {location.label}
    </>
  );
  const cls = `inline-flex items-center gap-1 text-xs font-semibold text-forest ${className}`;
  return location.mapUrl ? (
    <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className={`${cls} hover:underline`}>{content}</a>
  ) : (
    <span className={cls}>{content}</span>
  );
}
