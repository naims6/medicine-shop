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
  console.warn("[apiClient] NEXT_PUBLIC_API_URL is not set; API calls will fail.");
}

// ---- Session-expired signaling --------------------------------------------
type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function onSessionExpired(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}

// ---- Single-flight refresh ------------------------------------------------
let refreshInFlight: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }
}

function refreshOnce(): Promise<void> {
  if (refreshInFlight) return refreshInFlight;
  const attempt = doRefresh();
  refreshInFlight = attempt;
  attempt.catch(() => {}).finally(() => { refreshInFlight = null; });
  return attempt;
}

// ---- Core ----------------------------------------------------------------

/** Extra fetch options passed to apiRequest. */
export interface ApiOptions extends Omit<RequestInit, "body" | "method"> {
  /** Set true for paginated endpoints to receive { data, meta } instead of just data. */
  isPaginated?: boolean;
}

function shouldAutoRefresh(path: string, isRetry: boolean): boolean {
  if (isRetry) return false;
  return path !== "/auth/refresh" && path !== "/auth/login";
}

export async function apiRequest<T>(
  path: string,
  method: string,
  body?: unknown,
  options: ApiOptions = {},
  isRetry = false,
): Promise<T> {
  const { isPaginated = false, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && shouldAutoRefresh(path, isRetry)) {
    try {
      await refreshOnce();
    } catch {
      notifySessionExpired();
      throw new ApiError("Your session has expired. Please log in again.", 401);
    }
    return apiRequest<T>(path, method, body, options, true);
  }

  const payload = await safeParseJson(res);

  if (!res.ok) {
    throw toApiError(payload, res.status);
  }

  return isPaginated ? (payload as T) : (payload as ApiEnvelope<T>).data;
}

async function safeParseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
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

// ---- HTTP verbs -----------------------------------------------------------

export const api = {
  get: <T>(path: string, options?: ApiOptions) =>
    apiRequest<T>(path, "GET", undefined, options),
  getPaginated: <T>(path: string, options?: ApiOptions) =>
    apiRequest<T>(path, "GET", undefined, { ...options, isPaginated: true }),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(path, "POST", body, options),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(path, "PATCH", body, options),
  put: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiRequest<T>(path, "PUT", body, options),
  delete: <T>(path: string, options?: ApiOptions) =>
    apiRequest<T>(path, "DELETE", undefined, options),
};
