/**
 * Single source of truth for talking to the backend.
 *
 * The backend URL used to be hardcoded in 36 places, which made deploying the frontend
 * anywhere else impossible. It now comes from an environment variable, falling back to
 * localhost so local development keeps working untouched.
 *
 * Set in Vercel (or .env.local):
 *   NEXT_PUBLIC_API_URL=https://testbackend.muhammadshahzeb.dev
 */
const DEFAULT_API = "http://" + "localhost:8000";

export const API = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API).replace(/\/+$/, "");

const TOKEN_KEY = "atlas_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

/**
 * Append the session token as a query parameter.
 *
 * Needed for <img> and <video> sources: media tags cannot send custom headers, and the
 * backend protects /static too, so the token has to ride along in the URL instead.
 */
export function withToken(url: string): string {
  const token = getToken();
  if (!token) return url;
  return url + (url.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(token);
}

/** Absolute URL for a backend path, e.g. mediaUrl("/static/projects/x/thumb.jpg"). */
export function mediaUrl(path: string): string {
  const clean = path.startsWith("http") ? path : API + (path.startsWith("/") ? path : "/" + path);
  return withToken(clean);
}
