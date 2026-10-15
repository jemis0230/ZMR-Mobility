import 'server-only';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

// Image uploads for the admin area (blog, press, vehicles, EV catalogue).
//
// Storage:
// - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production on Vercel). Files are
//   durable and served from *.public.blob.vercel-storage.com.
// - On Vercel without that token, uploads are refused: the deployment's disk is
//   read-only and temporary, so a "successful" local write would be lost.
// - Elsewhere (local development, self-hosted Docker with a volume) files go to public/.
//
// The uploaded bytes are stored exactly as received: no resizing or re-encoding.

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Folders callers may write to. Anything else is rejected (no path traversal). */
export const UPLOAD_FOLDERS = ['uploads', 'uploads/blogs', 'uploads/press', 'uploads/ev-models'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

type Detected = { ext: string; mime: string };

/** Identify the image format from its first bytes; the browser-supplied type is not trusted. */
export function detectImageType(bytes: Uint8Array): Detected | null {
  const b = bytes;
  const at = (i: number, ...v: number[]) => v.every((x, k) => b[i + k] === x);
  if (b.length >= 3 && at(0, 0xff, 0xd8, 0xff)) return { ext: 'jpg', mime: 'image/jpeg' };
  if (b.length >= 8 && at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { ext: 'png', mime: 'image/png' };
  if (b.length >= 12 && at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return { ext: 'webp', mime: 'image/webp' };
  if (b.length >= 6 && (at(0, 0x47, 0x49, 0x46, 0x38, 0x37, 0x61) || at(0, 0x47, 0x49, 0x46, 0x38, 0x39, 0x61))) return { ext: 'gif', mime: 'image/gif' };
  return null;
}

export function isUploadFolder(v: unknown): v is UploadFolder {
  return typeof v === 'string' && (UPLOAD_FOLDERS as readonly string[]).includes(v);
}

/** Which backend this deployment uses. */
export function storageMode(): 'blob' | 'local' | 'unconfigured' {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (process.env.VERCEL) return 'unconfigured';
  return 'local';
}

/** Validate and store an uploaded image; returns its public URL. */
export async function saveUploadedFile(file: File, folder: UploadFolder): Promise<string> {
  if (!isUploadFolder(folder)) throw new UploadError('Invalid upload folder.');
  if (!(file instanceof File) || file.size === 0) throw new UploadError('No file uploaded.');
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) throw new UploadError('Unsupported image. Upload a JPEG, PNG, WebP or GIF file.');

  // Unique, URL-safe name; the original file name is not used.
  const now = new Date();
  const objectName = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${type.ext}`;

  const mode = storageMode();
  if (mode === 'unconfigured') {
    throw new UploadError('Image storage is not configured for this website yet. Ask the site administrator to connect a Vercel Blob store.');
  }

  if (mode === 'blob') {
    const blob = await put(objectName, Buffer.from(bytes), {
      access: 'public',
      contentType: type.mime,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365, // names are unique, so files never change
    });
    return blob.url;
  }

  const target = path.join(process.cwd(), 'public', objectName);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  return `/${objectName}`;
}
