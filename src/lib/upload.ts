import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export async function saveUploadedFile(
  file: File,
  subfolder: string, // e.g. 'uploads/blogs' or 'uploads/ev-models'
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadError(`Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF, and SVG are allowed.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`);
  }

  const ext = path.extname(file.name).toLowerCase() || '.jpg';
  const fileName = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), 'public', subfolder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));

  return `/${subfolder}/${fileName}`;
}
