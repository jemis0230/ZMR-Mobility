// Canonical site details — used for metadata, sitemap, robots and structured data.
export const SITE_URL = 'https://zmrmobility.in';
export const SITE_NAME = 'ZMR Mobility';
export const SITE_DESCRIPTION =
  "ZMR Mobility is India's technology-first EV asset management company. Buy, lease or rent certified pre-owned electric 2-wheelers, 3-wheelers and 4-wheelers with IoT tracking, warranty and easy EMI.";
/** Business phone (calls). WhatsApp keeps its own number (WhatsAppButton). */
export const SITE_PHONE = '+91-9212421514';
export const SITE_PHONE_DISPLAY = '+91 92124 21514';
export const SITE_PHONE_HREF = 'tel:+919212421514';
export const SITE_EMAIL = 'info@zmrmobility.in';
export const SITE_SOCIALS = [
  'https://www.linkedin.com/company/zmr-mobility',
  'https://www.instagram.com/p/DIijiOgtuAv/',
];

/**
 * Cities ZMR Mobility operates in today (city names only), as listed by the header
 * city selector and the test-drive form. Planned cities are not listed here.
 * NOTE: the About page / presence map also show "NCR"/"Delhi NCR" as completed; it is
 * left out until ZMR confirms whether it is operational.
 */
export const OPERATIONAL_CITIES = ['Lucknow', 'Dehradun', 'Chennai', 'Bangalore'] as const;
