"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type { SalesTrendQuery } from "@/types";

interface UseSalesTrendOptions extends SalesTrendQuery {
  enabled?: boolean;
}

export function useSalesTrend({ enabled = true, ...query }: UseSalesTrendOptions = {}) {
  return useQuery({
    queryKey: ["dashboard", "sales-trend", query],
    queryFn: () => dashboardService.getSalesTrend(query),
    staleTime: 60 * 1000,
    enabled,
  });
}
