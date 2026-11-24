/**
 * Normalised error thrown by `apiClient` for any non-success backend response.
 *
 * The backend wraps failures as:
 *   { success: false, statusCode, message, errors?, timestamp, path }
 * `ApiError` exposes the useful parts so UI code and TanStack Query can branch on
 * HTTP status without re-parsing JSON.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function isUnauthorizedError(value: unknown): boolean {
  return isApiError(value) && value.statusCode === 401;
}
