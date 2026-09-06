"use client";

import React, { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

// ── Brand Logo ───────────────────────────────────────────────────────────────
export function Logo({ size = 32, white = false }: { size?: number; white?: boolean }) {
  const green = white ? "#ffffff" : "#1d6b3a";
  const field = white ? "#a0cfb0" : "#4caf7d";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="KisanSetu Admin logo">
      <rect x="4" y="28" width="40" height="3" rx="1.5" fill={field} opacity="0.4" />
      <rect x="4" y="34" width="40" height="3" rx="1.5" fill={field} opacity="0.6" />
      <rect x="4" y="40" width="40" height="3" rx="1.5" fill={field} opacity="0.8" />
      <path d="M8 28 Q24 10 40 28" stroke={green} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="13" y="22" width="3" height="6" rx="1" fill={green} />
      <rect x="32" y="22" width="3" height="6" rx="1" fill={green} />
      <circle cx="24" cy="17" r="3.5" fill={green} />
    </svg>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "accent";
type BtnSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer select-none";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-[#1d6b3a] text-white hover:bg-[#155c30] shadow-sm",
  secondary: "bg-[#e8f0e9] text-[#1d6b3a] hover:bg-[#d4e8d6] border border-[#ddd9d2]",
  ghost: "bg-transparent text-[#1a2319] hover:bg-[#eeeae4]",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  outline: "bg-white text-[#1a2319] border border-[#ddd9d2] hover:bg-[#f7f4ef] shadow-sm",
  accent: "bg-[#b87333] text-white hover:bg-[#9d6028] shadow-sm",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "px-3 py-1.5 text-xs min-h-[32px]",
  md: "px-4 py-2 text-sm min-h-[40px]",
  lg: "px-6 py-2.5 text-base min-h-[48px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
  highlight = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border ${
        highlight ? "border-[#1d6b3a] ring-2 ring-[#1d6b3a]/20 shadow-md" : "border-[#ddd9d2] shadow-xs"
      } p-5 ${onClick ? "cursor-pointer hover:border-[#1d6b3a]/60 transition-all" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
export type BadgeStatus =
  | "available"
  | "waiting"
  | "arrived"
  | "processing"
  | "delayed"
  | "completed"
  | "cancelled"
  | "open"
  | "limited"
  | "full"
  | "closed"
  | "info"
  | "warning"
  | "critical";

const badgeStyles: Record<BadgeStatus, { bg: string; text: string; dot: string; label: string }> = {
  available: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-600", label: "Available" },
  waiting: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500", label: "Waiting" },
  arrived: { bg: "bg-blue-50 border-blue-200", text: "text-blue-800", dot: "bg-blue-500", label: "Arrived at Gate" },
  processing: { bg: "bg-emerald-50 border-emerald-300", text: "text-emerald-800", dot: "bg-emerald-500 animate-pulse", label: "Weighing In-Process" },
  delayed: { bg: "bg-orange-50 border-orange-200", text: "text-orange-800", dot: "bg-orange-500", label: "Delayed" },
  completed: { bg: "bg-green-50 border-green-200", text: "text-green-800", dot: "bg-green-600", label: "Completed" },
  cancelled: { bg: "bg-red-50 border-red-200", text: "text-red-700", dot: "bg-red-500", label: "Cancelled" },
  open: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-600", label: "Open" },
  limited: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500", label: "Limited Space" },
  full: { bg: "bg-red-50 border-red-200", text: "text-red-800", dot: "bg-red-500", label: "At Capacity" },
  closed: { bg: "bg-gray-100 border-gray-300", text: "text-gray-700", dot: "bg-gray-400", label: "Closed" },
  info: { bg: "bg-blue-50 border-blue-200", text: "text-blue-800", dot: "bg-blue-500", label: "Notice" },
  warning: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500", label: "Warning" },
  critical: { bg: "bg-red-50 border-red-200", text: "text-red-800", dot: "bg-red-600", label: "Urgent" },
};

export function StatusBadge({ status, label, size = "md" }: { status: BadgeStatus; label?: string; size?: "sm" | "md" }) {
  const config = badgeStyles[status] || badgeStyles.info;
  const displayLabel = label || config.label;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────────
export function MetricCard({
  title,
  value,
  subtext,
  icon,
  trend,
  color = "green",
}: {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  trend?: string;
  color?: "green" | "copper" | "blue" | "neutral";
}) {
  const colorMap = {
    green: "bg-emerald-50 text-[#1d6b3a] border-emerald-100",
    copper: "bg-amber-50 text-[#b87333] border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    neutral: "bg-[#eeeae4] text-[#1a2319] border-[#ddd9d2]",
  };

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#697067]">{title}</span>
        {icon && <div className={`p-2 rounded-xl border ${colorMap[color]}`}>{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">{value}</div>
        {(subtext || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-[#697067]">
            {trend && <span className="font-semibold text-[#1d6b3a]">{trend}</span>}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Form Input ───────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

export function Input({ label, error, help, className = "", id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#1a2319] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
          error ? "border-red-500 focus:ring-red-400" : "border-[#ddd9d2] focus:border-[#1d6b3a] focus:ring-[#1d6b3a]/20"
        } rounded-xl shadow-2xs focus:outline-none focus:ring-3 transition-colors ${className}`}
        {...props}
      />
      {help && !error && <p className="mt-1 text-xs text-[#697067]">{help}</p>}
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className = "", id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#1a2319] mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
          error ? "border-red-500 focus:ring-red-400" : "border-[#ddd9d2] focus:border-[#1d6b3a] focus:ring-[#1d6b3a]/20"
        } rounded-xl shadow-2xs focus:outline-none focus:ring-3 transition-colors ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-xl border border-[#ddd9d2] w-full ${maxWidth} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ddd9d2] bg-[#f7f4ef]">
          <h3 className="font-display font-semibold text-lg text-[#1a2319]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#697067] hover:text-[#1a2319] p-1 rounded-lg hover:bg-[#eeeae4] transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#eeeae4] rounded-xl border border-[#ddd9d2] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isActive
                ? "bg-white text-[#1d6b3a] shadow-xs"
                : "text-[#697067] hover:text-[#1a2319] hover:bg-white/50"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-[#e8f0e9] text-[#1d6b3a]" : "bg-[#ddd9d2] text-[#697067]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
