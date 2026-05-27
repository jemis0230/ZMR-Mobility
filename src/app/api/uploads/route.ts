import { created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { saveUploadedFile } from '@/lib/upload';

// POST /api/uploads (admin only — generic file upload)
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) ?? 'uploads';

    if (!file || file.size === 0) return badRequest('No file provided');

    const url = await saveUploadedFile(file, folder);
    return created({ url });
  } catch (error) {
    return serverError(error);
  }
}
