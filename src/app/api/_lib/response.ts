type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: string; details?: Record<string, unknown> };

function json<T>(body: ApiSuccess<T> | ApiError, status: number): Response {
  return Response.json(body, { status });
}

export function ok<T>(data: T): Response {
  return json({ success: true, data }, 200);
}

export function created<T>(data: T): Response {
  return json({ success: true, data }, 201);
}

export function badRequest(error: string, details?: Record<string, unknown>): Response {
  return json({ success: false, error, details }, 400);
}

export function unauthorized(): Response {
  return json({ success: false, error: 'Authentication required' }, 401);
}

export function forbidden(): Response {
  return json({ success: false, error: 'Insufficient permissions' }, 403);
}

export function notFound(resource = 'Resource'): Response {
  return json({ success: false, error: `${resource} not found` }, 404);
}

export function serverError(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Internal server error';
  console.error('[API Error]', error);
  return json({ success: false, error: message }, 500);
}
