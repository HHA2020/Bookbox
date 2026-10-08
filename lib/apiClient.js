// Browser-side fetch wrapper for our /api routes. Throws an Error whose
// message comes from the API's { error: { message, details } } payload.
export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "content-type": "application/json", ...options.headers },
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = data?.error;
    const details = error?.details ? Object.values(error.details).join(" ") : "";
    const message = error?.message ?? `Request failed (${res.status})`;
    throw new Error(details ? `${message}: ${details}` : message);
  }
  return data;
}
