"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { useLanguage } from "../lib/languageContext";

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ size = 32, white = false }: { size?: number; white?: boolean }) {
  const green = white ? "#ffffff" : "#1d6b3a";
  const field = white ? "#a0cfb0" : "#4caf7d";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="KisanSetu logo">
      {/* Field rows */}
      <rect x="4" y="28" width="40" height="3" rx="1.5" fill={field} opacity="0.4" />
      <rect x="4" y="34" width="40" height="3" rx="1.5" fill={field} opacity="0.6" />
      <rect x="4" y="40" width="40" height="3" rx="1.5" fill={field} opacity="0.8" />
      {/* Bridge arch */}
      <path d="M8 28 Q24 10 40 28" stroke={green} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Bridge pillars */}
      <rect x="13" y="22" width="3" height="6" rx="1" fill={green} />
      <rect x="32" y="22" width="3" height="6" rx="1" fill={green} />
      {/* Center dot */}
      <circle cx="24" cy="17" r="3.5" fill={green} />
    </svg>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type BtnSize = "sm" | "md" | "lg" | "xl";

const btnBase =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-[#155c30] shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-[#d4e8d6] border border-border",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  outline: "bg-white text-foreground border border-border hover:bg-muted shadow-sm",
};

const btnSizes: Record<BtnSize, string> = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[52px]",
  xl: "px-8 py-4 text-lg min-h-[60px]",
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
  fullWidth,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const { t } = useLanguage();
  const renderedChildren = typeof children === "string" ? t(children, children) : children;
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {renderedChildren}
    </button>
  );
}

// ── Badge / Status chip ───────────────────────────────────────────────────────
type StatusType = "confirmed" | "available" | "limited" | "full" | "waiting" | "processing" | "completed" | "delayed" | "cancelled" | "open" | "closed" | "info";

const statusStyles: Record<StatusType, string> = {
  confirmed:  "bg-green-100 text-green-800 border-green-200",
  available:  "bg-green-50 text-green-700 border-green-100",
  limited:    "bg-amber-50 text-amber-700 border-amber-100",
  full:       "bg-red-50 text-red-700 border-red-100",
  waiting:    "bg-blue-50 text-blue-700 border-blue-100",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  completed:  "bg-gray-100 text-gray-700 border-gray-200",
  delayed:    "bg-amber-100 text-amber-800 border-amber-200",
  cancelled:  "bg-red-100 text-red-700 border-red-200",
  open:       "bg-green-100 text-green-800 border-green-200",
  closed:     "bg-gray-100 text-gray-600 border-gray-200",
  info:       "bg-blue-50 text-blue-700 border-blue-100",
};

const statusDots: Record<StatusType, string> = {
  confirmed:  "bg-green-500",
  available:  "bg-green-400",
  limited:    "bg-amber-400",
  full:       "bg-red-400",
  waiting:    "bg-blue-400",
  processing: "bg-blue-500",
  completed:  "bg-gray-400",
  delayed:    "bg-amber-500",
  cancelled:  "bg-red-400",
  open:       "bg-green-500",
  closed:     "bg-gray-400",
  info:       "bg-blue-400",
};

export function StatusBadge({ status, label }: { status: StatusType; label?: string }) {
  const { t } = useLanguage();
  const rawText = label ?? (status.charAt(0).toUpperCase() + status.slice(1));
  const displayText = t(rawText, rawText);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
      {displayText}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border shadow-sm ${onClick ? "cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  hint?: string;
}

export function Input({ label, icon, hint, placeholder, className = "", ...props }: InputProps) {
  const { t } = useLanguage();
  const localizedLabel = label ? t(label, label) : undefined;
  const localizedHint = hint ? t(hint, hint) : undefined;
  const localizedPlaceholder = placeholder ? t(placeholder, placeholder) : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {localizedLabel && <label className="text-sm font-semibold text-foreground">{localizedLabel}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          placeholder={localizedPlaceholder}
          className={`w-full bg-white border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all min-h-[52px] ${icon ? "pl-10" : ""} ${className}`}
          {...props}
        />
      </div>
      {localizedHint && <p className="text-xs text-muted-foreground">{localizedHint}</p>}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  const { t } = useLanguage();
  const localizedChildren = typeof children === "string" ? t(children, children) : children;
  const localizedSub = sub ? t(sub, sub) : undefined;
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-foreground leading-tight">{localizedChildren}</h2>
      {localizedSub && <p className="text-sm text-muted-foreground mt-0.5">{localizedSub}</p>}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-border ${className}`} />;
}

// ── Icons (inline SVG, no external dep) ──────────────────────────────────────
const iconPaths: Record<string, string> = {
  clock:      "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v5l4 2-1 1.7L11 13V7h1z",
  calendar:   "M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM5 20V9h14v11H5z",
  pin:        "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z",
  route:      "M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z",
  check:      "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
  users:      "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  bell:       "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  phone:      "M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  shield:     "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.61-2.44 6.98-5 7.93V5z",
  language:   "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
  search:     "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  refresh:    "M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  arrow_right:"M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z",
  home:       "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  booking:    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z",
  queue:      "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z",
  procurement:"M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
  profile:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z",
  warehouse:  "M22 9V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2zm-4 10H4V5h14v14z",
  warning:    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  info_icon:  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  check_circle:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  close:      "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  menu:       "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  arrow_left: "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z",
  reports:    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
  settings:   "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  chart:      "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
  cross:      "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.48 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z",
  star:       "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  lightning:  "M7 2v11h3v9l7-12h-4l4-8z",
  bookmark:   "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z",
  eye:        "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  file_text:  "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  chevron_down: "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
  mail:       "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  help_circle:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z",
};

export function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const d = iconPaths[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

// ── Progress timeline ─────────────────────────────────────────────────────────
export type TimelineStep = { label: string; time?: string; status: "done" | "active" | "pending" };

export function Timeline({ steps, compact = false }: { steps: TimelineStep[]; compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                step.status === "done"
                  ? "bg-primary border-primary text-white"
                  : step.status === "active"
                  ? "bg-white border-primary text-primary"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {step.status === "done" ? (
                <Icon name="check" size={13} />
              ) : step.status === "active" ? (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-40" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-0.5 flex-1 my-0.5 ${step.status === "done" ? "bg-primary" : "bg-border"}`}
                style={{ minHeight: compact ? 12 : 18 }}
              />
            )}
          </div>
          <div className={`${i === steps.length - 1 ? "pb-1" : compact ? "pb-2.5" : "pb-3.5"} pt-0.5 flex-1`}>
            <p className={`text-sm font-semibold leading-snug ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
              {t(step.label, step.label)}
            </p>
            {step.time && <p className="text-xs text-muted-foreground mt-0.5 leading-none">{t(step.time, step.time)}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Toast/Alert ───────────────────────────────────────────────────────────────
type AlertType = "success" | "warning" | "error" | "info";
const alertStyles: Record<AlertType, { bg: string; border: string; icon: string; iconColor: string }> = {
  success: { bg: "bg-green-50", border: "border-green-200", icon: "check_circle", iconColor: "text-green-600" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "warning", iconColor: "text-amber-600" },
  error:   { bg: "bg-red-50",   border: "border-red-200",   icon: "cross",    iconColor: "text-red-600"   },
  info:    { bg: "bg-blue-50",  border: "border-blue-200",  icon: "info_icon", iconColor: "text-blue-600" },
};

export function Alert({ type, title, message }: { type: AlertType; title: string; message?: string }) {
  const { t } = useLanguage();
  const s = alertStyles[type];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${s.bg} ${s.border}`}>
      <Icon name={s.icon} size={20} className={`shrink-0 mt-0.5 ${s.iconColor}`} />
      <div>
        <p className="text-sm font-semibold text-foreground">{t(title, title)}</p>
        {message && <p className="text-sm text-muted-foreground mt-0.5">{t(message, message)}</p>}
      </div>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, icon, color = "green" }: { label: string; value: string | number; sub?: string; icon?: string; color?: "green" | "blue" | "amber" | "red" | "gray" }) {
  const { t } = useLanguage();
  const colors = {
    green: "text-green-700 bg-green-50",
    blue:  "text-blue-700 bg-blue-50",
    amber: "text-amber-700 bg-amber-50",
    red:   "text-red-700 bg-red-50",
    gray:  "text-gray-600 bg-gray-50",
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t(label, label)}</p>
          <p className="text-3xl font-bold text-foreground mt-1 font-display">{typeof value === "string" ? t(value, value) : value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{t(sub, sub)}</p>}
        </div>
        {icon && (
          <span className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon name={icon} size={20} />
          </span>
        )}
      </div>
    </Card>
  );
}

// ── Skeleton Loader ──────────────────────────────────────────────────────────
export function SkeletonCard({ className = "", rows = 3 }: { className?: string; rows?: number }) {
  return (
    <Card className={`p-4 animate-pulse space-y-3 bg-white ${className}`}>
      <div className="h-4 bg-muted rounded w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-muted/70 rounded"
          style={{ width: `${Math.max(45, 90 - i * 15)}%` }}
        />
      ))}
    </Card>
  );
}

export function SkeletonText({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded ${className}`} />;
}

// ── Offline & Network State Banner ───────────────────────────────────────────
export function OfflineBanner({
  lastUpdated = "10:49 AM",
  onRetry,
}: {
  lastUpdated?: string;
  onRetry?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2">
        <Icon name="warning" size={16} className="text-amber-600 shrink-0" />
        <span>
          <strong>{t("offline_title", "Connection unavailable")}</strong> ·{" "}
          {t("offline_desc", "Showing the most recent information available.")}{" "}
          {t("last_updated_label", "Last updated:")} <strong>{lastUpdated}</strong>
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-2.5 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition-colors cursor-pointer shrink-0"
        >
          {t("btn_retry", "Retry")}
        </button>
      )}
    </div>
  );
}

