// Press & Media mentions — validation shared by the admin API and pages.

export interface PressMentionDTO {
  id: string;
  publication: string;
  title: string;
  url: string;
  publishedAt: string | null; // ISO date
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type PressInput = Omit<PressMentionDTO, 'id'>;

const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

/** Validates admin input. Returns parsed data or an error message. */
export function parsePressInput(body: Record<string, unknown>): PressInput | { error: string } {
  const publication = String(body.publication ?? '').trim();
  const title = String(body.title ?? '').trim();
  const url = String(body.url ?? '').trim();
  const imageUrl = String(body.imageUrl ?? '').trim();
  const publishedRaw = String(body.publishedAt ?? '').trim();

  if (!publication) return { error: 'Publication name is required' };
  if (!title) return { error: 'Article title is required' };
  if (!isHttpUrl(url)) return { error: 'Article link must be a full http(s) URL' };
  if (imageUrl && !imageUrl.startsWith('/') && !isHttpUrl(imageUrl)) return { error: 'Image must be an uploaded file or a full http(s) URL' };

  let publishedAt: string | null = null;
  if (publishedRaw) {
    const d = new Date(publishedRaw);
    if (Number.isNaN(d.getTime())) return { error: 'Publication date is not valid' };
    publishedAt = d.toISOString();
  }

  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0;
  const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

  return { publication, title, url, imageUrl: imageUrl || null, publishedAt, sortOrder, isActive };
}

export function toPressDTO(row: {
  id: string; publication: string; title: string; url: string; publishedAt: Date | null;
  imageUrl: string | null; sortOrder: number; isActive: boolean;
}): PressMentionDTO {
  return {
    id: row.id,
    publication: row.publication,
    title: row.title,
    url: row.url,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}
