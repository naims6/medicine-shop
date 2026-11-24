/** Success envelope returned by every backend endpoint (TransformInterceptor). */
export interface ApiEnvelope<T> {
  success: true;
  statusCode: number;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Success envelope for paginated endpoints. */
export interface PaginatedApiEnvelope<T> {
  success: true;
  statusCode: number;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

/** Error envelope returned on failure (HttpExceptionFilter). */
export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  message: string;
  errors?: unknown;
  timestamp: string;
  path: string;
}
