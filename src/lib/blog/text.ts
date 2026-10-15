// Shared (client + server) helpers for blog names and slugs.

/** Trim and collapse internal whitespace. */
export const cleanName = (s: string) => s.trim().replace(/\s+/g, " ");

/** Case-insensitive identity used for duplicate checks ("EV" and " ev " are the same tag). */
export const nameKey = (s: string) => cleanName(s).toLowerCase();

/** URL-safe slug; mirrors the SQL used by the tag migration. */
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Article slugs that would collide with static routes under /blogs. */
export const RESERVED_ARTICLE_SLUGS = new Set(["tags"]);

export const TAG_NAME_MAX = 40;
export const AUTHOR_NAME_MAX = 80;
export const DESIGNATION_MAX = 80;
export const TYPE_NAME_MAX = 40;
export const MAX_TAGS_PER_POST = 10;

/** Reading time in minutes at ~200 words per minute. */
export const readMinutes = (html: string) =>
  Math.max(1, Math.ceil(html.replace(/<[^>]+>/g, " ").split(/\s+/g).filter(Boolean).length / 200));
