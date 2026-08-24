import { API } from "@/lib/api";

/**
 * Session handling.
 *
 * The access token is kept in memory ONLY. The refresh token lives in an httpOnly
 * cookie the browser sends automatically, so a page reload can recover the session
 * without ever storing a long-lived credential where JavaScript (or an XSS payload)
 * can read it.
 */
let accessToken: string | null = null;

const DOOR_KEY = "atlas_token";

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** The shared app-password token. Unlocks Google sign-in, nothing else. */
export function getDoorToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DOOR_KEY);
}

export function setDoorToken(token: string): void {
  window.localStorage.setItem(DOOR_KEY, token);
}

export function clearDoorToken(): void {
  window.localStorage.removeItem(DOOR_KEY);
}

/** Exchange the refresh cookie for a new access token. Returns null when signed out. */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      credentials: "include", // the refresh token is a cross-site cookie
    });
    if (!res.ok) {
      accessToken = null;
      return null;
    }
    const data = await res.json();
    accessToken = data.access_token;
    return accessToken;
  } catch {
    accessToken = null;
    return null;
  }
}

export async function fetchMe() {
  try {
    const res = await fetch(`${API}/auth/me`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    // Revokes the session server-side, so the token is dead everywhere, not just here.
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // Even if the call fails, clear locally so the user is not stuck signed in.
  } finally {
    accessToken = null;
    clearDoorToken();
    window.location.href = "/login";
  }
}
