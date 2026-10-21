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

export const CUSTOMER_PHOTOS: CustomerPhoto[] = [
  { src: "/customers/zmr-customer-01.jpeg", alt: "A customer standing beside a red and black BGauss electric scooter", location: null },
  { src: "/customers/zmr-customer-02.jpeg", alt: "A customer standing with a dark blue BGauss electric scooter", location: null },
  { src: "/customers/zmr-customer-03.jpeg", alt: "A customer standing with a matte green BGauss electric scooter", location: null },
  { src: "/customers/zmr-customer-04.jpeg", alt: "A customer standing behind a silver BGauss electric scooter", location: null },
];

export const anyPhotoHasLocation = (photos: CustomerPhoto[]) => photos.some((p) => !!p.location?.label);
