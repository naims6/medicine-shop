import { api } from "@/lib/apiClient";
import type { DashboardSummary, SalesTrend, SalesTrendQuery } from "@/types";

export const dashboardService = {
  /** GET /dashboard/summary */
  getSummary(): Promise<DashboardSummary> {
    return api.get<DashboardSummary>("/dashboard/summary");
  },

  /** GET /dashboard/sales-trend */
  getSalesTrend(query: SalesTrendQuery = {}): Promise<SalesTrend> {
    const params = new URLSearchParams();
    if (query.interval) params.set("interval", query.interval);
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.year !== undefined) params.set("year", String(query.year));
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);

    const qs = params.toString();
    return api.get<SalesTrend>(`/dashboard/sales-trend${qs ? `?${qs}` : ""}`);
  },
};
