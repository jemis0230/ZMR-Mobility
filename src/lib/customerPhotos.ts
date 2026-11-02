// ZMR customers' own photographs (public/customers), served unchanged.
//
// `location` is an approved public city/state label for where the photo was taken.
// Add it only when ZMR has an explicit record for that photo — never infer it from
// number plates, backgrounds, file names, the visitor's selected city or service
// locations. No street addresses, GPS or customer home locations. `mapUrl` is optional
// and only for an approved public place (for example a city), never a private address.
// Photos without an approved location are shown without a location label.

export type CustomerPhoto = {
  src: string;
  alt: string;
  location?: { label: string; mapUrl?: string } | null;
};

// These photos carry their approved location label inside the image (bottom-left), as
// supplied by ZMR, so `location` stays null to avoid a duplicate badge. Files are the
// supplied originals, byte for byte (no conversion or compression); they must be shown
// whole (object-contain) so the label is never cropped.
export const CUSTOMER_PHOTOS: CustomerPhoto[] = [
  { src: "/customers/zmr-customer-bangalore-red-scooter.webp", alt: "ZMR customer standing beside a red and black BGauss electric scooter in Bangalore, Karnataka", location: null },
  { src: "/customers/zmr-customer-bangalore-purple-scooter.jpg", alt: "ZMR customer with a purple BGauss electric scooter in Bangalore, Karnataka", location: null },
  { src: "/customers/zmr-customer-bangalore-green-scooter.jpg", alt: "ZMR customer with a matte green BGauss electric scooter in Bangalore, Karnataka", location: null },
  { src: "/customers/zmr-customer-chennai-white-scooter.webp", alt: "ZMR customer standing behind a white BGauss electric scooter in Chennai, Tamil Nadu", location: null },
  { src: "/customers/zmr-customer-new-delhi.webp", alt: "Smiling ZMR customer in a black shirt holding papers beside an electric scooter in New Delhi", location: null },
];

export const anyPhotoHasLocation = (photos: CustomerPhoto[]) => photos.some((p) => !!p.location?.label);
