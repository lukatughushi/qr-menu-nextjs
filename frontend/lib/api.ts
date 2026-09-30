import type { Permissions } from './permissions';

// Base URL of the backend (Express on Render). Empty in dev falls back to localhost.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, init);
}

// The backend lives on another domain, so it can't set cookies for this site.
// proxy.ts reads this cookie to gate /admin routes in the UI; real authorization
// is still enforced by the backend and Supabase RLS.
export function setPermsCookie(permissions: Permissions) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `admin-perms=${encodeURIComponent(JSON.stringify(permissions))}; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Strict${secure}`;
}

export function clearPermsCookie() {
  document.cookie = 'admin-perms=; Path=/; Max-Age=0; SameSite=Strict';
}
