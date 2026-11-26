import { api } from "@/lib/apiClient";
import type { Sale } from "@/types";
import type { PaginatedApiEnvelope, PaginationMeta } from "@/types";

export interface SalesQuery {
  page?: number;
  limit?: number;
  query?: string;
  paymentMethod?: "Cash" | "Owing" | "All";
  dueStatus?: "cleared" | "partially_paid" | "unpaid" | "All";
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface PaginatedSales {
  data: Sale[];
  meta: PaginationMeta;
}

export const salesService = {
  /** GET /sales — paginated, filtered */
  async getAll(query: SalesQuery = {}): Promise<PaginatedSales> {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.query?.trim()) params.set("query", query.query.trim());
    if (query.paymentMethod && query.paymentMethod !== "All")
      params.set("paymentMethod", query.paymentMethod);
    if (query.dueStatus && query.dueStatus !== "All")
      params.set("dueStatus", query.dueStatus);
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);

    const qs = params.toString();
    const result = await api.getPaginated<Sale>(
      `/sales${qs ? `?${qs}` : ""}`,
    );
    // getPaginated returns the full PaginatedApiEnvelope
    return result as unknown as PaginatedSales;
  },

  /** GET /sales/:id */
  getById(id: string): Promise<Sale> {
    return api.get<Sale>(`/sales/${id}`);
  },

  /** POST /sales/:id/collect-due */
  collectDue(
    saleId: string,
    paymentAmount: number,
    notes?: string,
  ): Promise<Sale> {
    return api.post<Sale>(`/sales/${saleId}/collect-due`, {
      paymentAmount,
      ...(notes ? { notes } : {}),
    });
  },
};
