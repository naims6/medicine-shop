"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type { SalesTrendQuery } from "@/types";

export function useSalesTrend(query: SalesTrendQuery = {}) {
  return useQuery({
    queryKey: ["dashboard", "sales-trend", query],
    queryFn: () => dashboardService.getSalesTrend(query),
    staleTime: 60 * 1000, // 1 minute
  });
}
