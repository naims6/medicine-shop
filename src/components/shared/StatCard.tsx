import React from "react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

export function StatCard({ label, value, color = "text-slate-900" }: StatCardProps) {
  return (
    <Card className="p-3">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <div className={`text-lg font-bold mt-0.5 ${color}`}>{value}</div>
    </Card>
  );
}
