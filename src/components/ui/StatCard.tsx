interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

export function StatCard({ label, value, color = "text-slate-900" }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <div className={`text-lg font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}
