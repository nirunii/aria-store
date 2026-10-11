// Address of the backend. Empty while developing on your computer (Vite forwards /api to port 5000).
// When published, it is set to your hosted backend, e.g. https://aria-api.onrender.com
export const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Uploaded photos are saved by the backend, so they need the backend address in front.
export const imgUrl = (u) => (u && u.startsWith('/uploads') ? API + u : u);

// One helper for talking to the backend. It adds the login token automatically.
export async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = 'Bearer ' + token;
  let payload;
  if (formData) payload = formData; // used for picture uploads
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(API + '/api' + path, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// Change the currency symbol here (for example 'Rs ' or '£').
export const money = (n) => '$' + Number(n).toFixed(2);
