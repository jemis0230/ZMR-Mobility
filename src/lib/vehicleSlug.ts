/**
 * Generates a SEO-friendly URL slug for a vehicle detail page.
 * Format: `{make}-{model}-{id}` — keywords first, CUID at the end.
 *
 * The ID is always recoverable by taking the last hyphen-separated segment
 * because Prisma CUIDs are 25-char lowercase alphanumeric with no hyphens.
 */
export function slugifyVehicle(make: string, model: string, id: string): string {
  const base = `${make} ${model}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // strip special chars (brackets, dots, etc.)
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse consecutive hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
  return `${base}-${id}`;
}

/**
 * Extracts the database ID from a vehicle URL slug.
 * Works for both:
 *   - New format: "ather-450x-gen-3-cmpfl1l53000110xz7cmhqldc" → "cmpfl1l53000110xz7cmhqldc"
 *   - Old format: "cmpfl1l53000110xz7cmhqldc" → "cmpfl1l53000110xz7cmhqldc"
 */
export function extractIdFromSlug(slug: string): string {
  return slug.split('-').pop() ?? slug;
}
