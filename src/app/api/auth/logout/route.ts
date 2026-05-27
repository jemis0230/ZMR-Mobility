import { ok, serverError } from '@/app/api/_lib/response';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    await destroySession();
    return ok({ message: 'Logged out' });
  } catch (error) {
    return serverError(error);
  }
}
