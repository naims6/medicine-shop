"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── helpers ───────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

function today(): string {
  return toISO(new Date());
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

function startOfMonth(): string {
  const d = new Date();
  return toISO(new Date(d.getFullYear(), d.getMonth(), 1));
}

function endOfMonth(): string {
  const d = new Date();
  return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

function yesterday(): string {
  return daysAgo(1);
}

function formatDisplay(start: string, end: string): string {
  if (!start && !end) return "All time";
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  if (start === end) return fmt(start);
  if (!end) return `From ${fmt(start)}`;
  if (!start) return `Until ${fmt(end)}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Preset type ────────────────────────────────────────────────────────────

interface Preset {
  id: string;
  label: string;
  getRange: () => { start: string; end: string };
}

const PRESETS: Preset[] = [
  {
    id: "today",
    label: "Today",
    getRange: () => ({ start: today(), end: today() }),
  },
  {
    id: "yesterday",
    label: "Yesterday",
    getRange: () => ({ start: yesterday(), end: yesterday() }),
  },
  {
    id: "last7",
    label: "Last 7 days",
    getRange: () => ({ start: daysAgo(6), end: today() }),
  },
  {
    id: "last30",
    label: "Last 30 days",
    getRange: () => ({ start: daysAgo(29), end: today() }),
  },
  {
    id: "thisMonth",
    label: "This month",
    getRange: () => ({ start: startOfMonth(), end: endOfMonth() }),
  },
  {
    id: "allTime",
    label: "All time",
    getRange: () => ({ start: "", end: "" }),
  },
];

// ─── Props ──────────────────────────────────────────────────────────────────

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** Extra class applied to the trigger button */
  className?: string;
  placeholder?: string;
  /** Compact mode — shows only an icon button, not the full label */
  compact?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Date range",
  compact = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [localStart, setLocalStart] = useState(value.startDate);
  const [localEnd, setLocalEnd] = useState(value.endDate);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // keep local inputs in sync when parent resets
  useEffect(() => {
    setLocalStart(value.startDate);
    setLocalEnd(value.endDate);
  }, [value.startDate, value.endDate]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const applyPreset = (preset: Preset) => {
    const { start, end } = preset.getRange();
    setLocalStart(start);
    setLocalEnd(end);
    setActivePreset(preset.id);
    onChange({ startDate: start, endDate: end });
    setOpen(false);
  };

  const applyCustom = () => {
    setActivePreset(null);
    onChange({ startDate: localStart, endDate: localEnd });
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalStart("");
    setLocalEnd("");
    setActivePreset("allTime");
    onChange({ startDate: "", endDate: "" });
  };

  const hasRange = value.startDate || value.endDate;
  const displayLabel = hasRange
    ? formatDisplay(value.startDate, value.endDate)
    : placeholder;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* ── Trigger — split into a flex wrapper so the clear × is never nested inside a <button> ── */}
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border transition-all text-xs font-medium select-none",
          "bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-white",
          open && "border-emerald-400 bg-white shadow-sm",
          compact ? "p-0" : "",
        )}
      >
        {/* Clickable label area */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg",
            compact ? "p-2" : "pl-3 py-2",
            !compact && hasRange ? "pr-1" : "pr-3",
          )}
        >
          <Calendar
            className={cn(
              "shrink-0",
              hasRange ? "text-emerald-600" : "text-slate-400",
              compact ? "w-4 h-4" : "w-3.5 h-3.5",
            )}
          />
          {!compact && (
            <>
              <span className={cn(hasRange ? "text-slate-900" : "text-slate-400")}>
                {displayLabel}
              </span>
              {!hasRange && (
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform",
                    open && "rotate-180",
                  )}
                />
              )}
            </>
          )}
        </button>

        {/* Clear button — separate element, never nested inside the label button */}
        {!compact && hasRange && (
          <button
            type="button"
            onClick={clear}
            className="pr-2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
            aria-label="Clear date range"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg",
            "w-72 p-3",
            // position: prefer right-align if space is tight
            "right-0 sm:right-auto sm:left-0",
          )}
        >
          {/* Preset buttons */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quick select
          </p>
          <div className="grid grid-cols-3 gap-1 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={cn(
                  "px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                  activePreset === p.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 my-2.5">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] text-slate-400 font-medium">
              or custom range
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Custom date inputs */}
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-0.5 block">
                From
              </label>
              <input
                type="date"
                value={localStart}
                max={localEnd || undefined}
                onChange={(e) => {
                  setLocalStart(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-0.5 block">
                To
              </label>
              <input
                type="date"
                value={localEnd}
                min={localStart || undefined}
                onChange={(e) => {
                  setLocalEnd(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Apply / Cancel */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCustom}
              disabled={!localStart && !localEnd}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                localStart || localEnd
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed",
              )}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
