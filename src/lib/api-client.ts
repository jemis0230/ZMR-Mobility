// Typed API client for use in client components.
// Server components should continue to use repositories directly.

export type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

const BASE = '/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, init);
    const json = await res.json();
    return json as ApiResult<T>;
  } catch {
    return { success: false, error: 'Network error — please try again' };
  }
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) => {
    const url = params ? `${path}?${new URLSearchParams(params)}` : path;
    return apiFetch<T>(url);
  },

  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, jsonInit('POST', body)),

  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, jsonInit('PUT', body)),

  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, jsonInit('PATCH', body)),

  del: <T = void>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),

  // For multipart/form-data (file uploads) — do NOT set Content-Type, browser adds boundary
  upload: <T>(path: string, formData: FormData, method: 'POST' | 'PUT' = 'POST') =>
    apiFetch<T>(path, { method, body: formData }),
};
