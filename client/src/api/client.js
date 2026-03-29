const BASE = '/api';

/** Core fetch wrapper — attaches auth header, handles 401 redirect */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('ss_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data;
}

export async function apiGet(path)         { return apiFetch(path); }
export async function apiPost(path, body)  { return apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }); }
export async function apiPut(path, body)   { return apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }); }
export async function apiDelete(path)      { return apiFetch(path, { method: 'DELETE' }); }

/** Download a blob (CSV / PDF) */
export async function apiDownload(path, filename) {
  const token = localStorage.getItem('ss_token');
  const res   = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
