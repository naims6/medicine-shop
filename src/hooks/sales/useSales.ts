"use client";

import { useQuery } from "@tanstack/react-query";
import { salesService, type SalesQuery } from "@/services/sales.service";

export function useSales(query: SalesQuery = {}) {
  return useQuery({
    queryKey: ["sales", query],
    queryFn: () => salesService.getAll(query),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
