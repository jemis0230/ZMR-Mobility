// Canonical site details — used for metadata, sitemap, robots and structured data.
export const SITE_URL = 'https://zmrmobility.in';
export const SITE_NAME = 'ZMR Mobility';
export const SITE_DESCRIPTION =
  "ZMR Mobility is India's technology-first EV asset management company. Buy, lease or rent certified pre-owned electric 2-wheelers, 3-wheelers and 4-wheelers with IoT tracking, warranty and easy EMI.";
/**
 * Public business phone for calls (header/footer/contact/metadata all read these).
 * The floating WhatsApp button keeps its own number until ZMR confirms which WhatsApp
 * account it should open (see WhatsAppButton). Staff notification recipients are
 * configured separately (docs/LEAD_NOTIFICATIONS.md) and are not affected.
 */
export const SITE_PHONE = '+91-9211421514';
export const SITE_PHONE_DISPLAY = '+91 92114 21514';
export const SITE_PHONE_HREF = 'tel:+919211421514';
/**
 * WhatsApp chat destination (floating button). It used the same number as the old
 * call number; switch it to 'https://wa.me/919211421514' once ZMR confirms that the
 * new business number has WhatsApp on the intended account.
 */
export const SITE_WHATSAPP_URL = 'https://wa.me/919045222999';
export const SITE_EMAIL = 'info@zmrmobility.in';
export const SITE_SOCIALS = [
  'https://www.linkedin.com/company/zmr-mobility',
  'https://www.instagram.com/p/DIijiOgtuAv/',
];

/**
 * Cities ZMR Mobility operates in today (city names only), as confirmed by the team
 * and matching the header city selector and the test-drive form. Planned cities are
 * not listed here. NOTE: the About page / presence map also show "NCR"/"Delhi NCR" as
 * completed; it stays out of this list until ZMR confirms it is operational.
 */
export const OPERATIONAL_CITIES = ['Lucknow', 'Dehradun', 'Chennai', 'Bangalore'] as const;
