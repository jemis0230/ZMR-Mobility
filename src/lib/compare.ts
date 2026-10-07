// Shared (server + client) comparison settings.
export const COMPARE_MAX = 3;
export const COMPARE_MIN = 2;

export function compareHref(ids: string[]): string {
  return ids.length ? `/compare?ids=${ids.map(encodeURIComponent).join(",")}` : "/compare";
}
