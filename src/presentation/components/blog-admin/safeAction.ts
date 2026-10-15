// Server actions throw in the browser when the request is redirected (for example, the
// /admin middleware sends an expired session to the login page) or the network fails.
// Turn that into a normal failed result so forms show a message and keep their content.
export const SESSION_OR_NETWORK_ERROR =
  "Couldn’t save — your session may have expired or the connection dropped. Sign in again in a new tab, then retry here; your changes are kept.";

export async function safeAction<T>(call: Promise<T>): Promise<T | { success: false; error: string; field?: undefined }> {
  try {
    return await call;
  } catch (e) {
    console.warn("[blog admin] action failed", e);
    return { success: false, error: SESSION_OR_NETWORK_ERROR };
  }
}
