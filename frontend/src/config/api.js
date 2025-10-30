export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const resp = await fetch(url, {
    headers: { ...(options.headers || {}) },
    method: options.method || 'GET',
    body: options.body || undefined,
    credentials: options.credentials || 'same-origin'
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API ${resp.status}: ${text}`);
  }
  return resp.json();
}