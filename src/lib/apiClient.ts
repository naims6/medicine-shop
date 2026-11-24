import type { ApiEnvelope, ApiErrorEnvelope } from "@/types";
import { ApiError } from "@/lib/apiErrors";

/**
 * Base URL for backend API calls. Kept same-origin ("/api/v1") via a rewrite in
 * next.config.ts so that httpOnly auth cookies set by the backend are stored for
 * the frontend origin — the browser then sends them automatically and the proxy
 * (src/proxy.ts) can read them for route guarding.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

if (process.env.NODE_ENV !== "production" && !BASE_URL) {
  // Surface a clear misconfiguration during development.
  console.warn(
    "[apiClient] NEXT_PUBLIC_API_URL is not set; API calls will fail.",
  );
}

// ---- Session-expired signaling --------------------------------------------
// The AuthProvider registers a handler that clears the query cache and lets the
// AppLayout guard redirect to /login. This decouples apiClient from the router.
type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function onSessionExpired(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}

// ---- Single-flight refresh -------------------------------------------------
// When several requests 401 at once, only one /auth/refresh fires; every
// concurrent 401 awaits that same promise and retries afterwards — so the
// refresh endpoint is never called more than once concurrently.
let refreshInFlight: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    // Refresh token missing/invalid/expired → the session is dead.
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }
  // The backend rotates both httpOnly cookies via Set-Cookie; nothing to store.
}

function refreshOnce(): Promise<void> {
  if (refreshInFlight) return refreshInFlight; // reuse the in-flight refresh
  const attempt = doRefresh();
  refreshInFlight = attempt;
  // Clear the handle once settled. Swallow the rejection here so it does not
  // become an unhandled promise rejection (callers await `attempt` directly).
  attempt
    .catch(() => {})
    .finally(() => {
      refreshInFlight = null;
    });
  return attempt;
}

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/** Endpoints that must never trigger an automatic refresh. */
function shouldAutoRefresh(path: string, isRetry: boolean): boolean {
  if (isRetry) return false; // only one retry per request
  return path !== "/auth/refresh" && path !== "/auth/login";
}

/**
 * Core fetch wrapper. Always sends httpOnly auth cookies (`credentials:
 * 'include'`), unwraps the backend success envelope, normalises failures into
 * `ApiError`, and transparently refreshes once on 401 (single-flight).
 *
 * `path` is relative to BASE_URL, e.g. "/auth/login".
 */
export async function apiRequest<T>(
  path: string,
  init: ApiRequestInit = {},
): Promise<T> {
  return doRequest<T>(path, init, false);
}

async function doRequest<T>(
  path: string,
  init: ApiRequestInit,
  isRetry: boolean,
): Promise<T> {
  const { body, headers, ...rest } = init;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Transparent refresh: only for protected endpoints, once per request.
  if (res.status === 401 && shouldAutoRefresh(path, isRetry)) {
    try {
      await refreshOnce();
    } catch {
      // Refresh failed → session dead. Notify and surface the 401.
      notifySessionExpired();
      throw new ApiError(
        "Your session has expired. Please log in again.",
        401,
      );
    }
    // Refresh succeeded (cookies rotated). Retry the original request once.
    return doRequest<T>(path, init, true);
  }

  const payload = await safeParseJson(res);

  if (!res.ok) {
    throw toApiError(payload, res.status);
  }

  return (payload as ApiEnvelope<T>).data;
}

async function safeParseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toApiError(payload: unknown, status: number): ApiError {
  if (payload && typeof payload === "object" && "message" in payload) {
    const err = payload as Partial<ApiErrorEnvelope>;
    return new ApiError(
      typeof err.message === "string" ? err.message : "Request failed",
      status,
      err.errors,
    );
  }
  return new ApiError("Request failed", status);
}

// Convenience HTTP verbs — one function per method; services compose these.
export const api = {
  get: <T>(path: string, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "PUT", body }),
  delete: <T>(path: string, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "DELETE" }),
};
