import { created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { saveUploadedFile, isUploadFolder, UploadError } from '@/lib/upload';

// POST /api/uploads (admin only — image upload to one of the known folders)
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') ?? 'uploads';

    if (!(file instanceof File) || file.size === 0) return badRequest('No file provided');
    if (!isUploadFolder(folder)) return badRequest('Invalid upload folder');

    const url = await saveUploadedFile(file, folder);
    return created({ url });
  } catch (error) {
    if (error instanceof UploadError) return badRequest(error.message);
    return serverError(error);
  }
}
