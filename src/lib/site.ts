// Canonical site details — used for metadata, sitemap, robots and structured data.
export const SITE_URL = 'https://zmrmobility.in';
export const SITE_NAME = 'ZMR Mobility';
export const SITE_DESCRIPTION =
  "ZMR Mobility is India's technology-first EV asset management company. Buy, lease or rent certified pre-owned electric 2-wheelers, 3-wheelers and 4-wheelers with IoT tracking, warranty and easy EMI.";
/**
 * Public business phone and WhatsApp (confirmed by ZMR: +91 92114 21514). Header,
 * footer, contact pages, metadata and the floating WhatsApp button all read these.
 * This is the public click-to-chat destination only; staff lead-notification
 * recipients are configured separately on the server (WHATSAPP_LEAD_RECIPIENTS,
 * docs/LEAD_NOTIFICATIONS.md).
 */
export const SITE_PHONE = '+91-9211421514';
export const SITE_PHONE_DISPLAY = '+91 92114 21514';
export const SITE_PHONE_HREF = 'tel:+919211421514';
/** WhatsApp click-to-chat (opens the visitor's own WhatsApp; not an automatic notification). */
export const SITE_WHATSAPP_URL = 'https://wa.me/919211421514';
export const SITE_EMAIL = 'info@zmrmobility.in';
export const SITE_INSTAGRAM_URL = 'https://www.instagram.com/zmr_mobility?vrfl=MWlhbzBqNjhsNXY3dQ==';
export const SITE_SOCIALS = [
  'https://www.linkedin.com/company/zmr-mobility',
  SITE_INSTAGRAM_URL,
];

/**
 * Cities ZMR Mobility operates in today (city names only), as confirmed by the team
 * and matching the header city selector and the test-drive form. Planned cities are
 * not listed here. NOTE: the About page / presence map also show "NCR"/"Delhi NCR" as
 * completed; it stays out of this list until ZMR confirms it is operational.
 */
export const OPERATIONAL_CITIES = ['Lucknow', 'Dehradun', 'Chennai', 'Bangalore'] as const;
