import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Page title — rendered as an h2 */
  title: React.ReactNode;
  /** Short description shown below the title */
  description?: string;
  /** Optional element (e.g. a Button) placed at the trailing edge */
  action?: React.ReactNode;
  /** Optional icon placed before the title */
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Reusable page-level header with an optional action slot.
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="User Management"
 *   description="Manage pharmacy salesmen and admin accounts."
 *   icon={<Users className="w-5 h-5 text-emerald-600" />}
 *   action={<Button onClick={openCreate}><UserPlus />Add User</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  action,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        className,
      )}
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {action && (
        <div className="self-start sm:self-auto shrink-0">{action}</div>
      )}
    </div>
  );
}
