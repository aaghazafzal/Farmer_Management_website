"use client";

import { ReactNode, useState } from "react";
import { Logo, Icon } from "../components/ui";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
  current: string;
  children: ReactNode;
}

export default function StaffShell({ navigate, current, children }: Props) {
  const { language, currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Safely consume staff context if available
  let activeQueueCount = 27;
  let toasts: { id: string; message: string; type: "success" | "info" | "warning" | "error" }[] = [];
  let removeToast = (_id: string) => {};
  let centreName = "ABC Procurement Centre";
  let userName = "Raj Kumar";
  let userRole = "Centre Manager";
  let staffId = "KS-STAFF-014";

  try {
    const ctx = useStaffContext();
    activeQueueCount = ctx.activeQueueCount;
    toasts = ctx.toasts;
    removeToast = ctx.removeToast;
    centreName = ctx.centre.name;
    userName = ctx.currentUser.name;
    userRole = ctx.currentUser.role;
    staffId = ctx.currentUser.staffId;
  } catch {
    // Fallback if rendered outside provider
  }

  const navItems = [
    { id: "staff-dashboard",     icon: "home",       label: t("tab_dashboard", "Dashboard") },
    { id: "staff-queue",         icon: "queue",      label: t("tab_queue", "Queue") },
    { id: "staff-slots",         icon: "booking",    label: t("nav_slots", "Slots") },
    { id: "staff-farmers",       icon: "profile",    label: t("nav_farmers", "Farmers") },
    { id: "staff-reports",       icon: "reports",    label: t("nav_reports", "Reports") },
    { id: "staff-notifications", icon: "bell",       label: t("nav_alerts", "Alerts") },
    { id: "staff-settings",      icon: "settings",   label: t("nav_settings", "Settings") },
  ];

  return (
    <div className="flex h-screen bg-[#f7f4ef] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-[#1a2319] flex-col shrink-0 border-r border-white/5">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Logo size={32} white />
            <span className="font-bold text-white font-display text-lg tracking-tight">KisanSetu</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("staff_portal", "Staff Portal")}</p>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/50">
              Online
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {navItems.map(n => {
            const active = current === n.id;
            return (
              <button
                key={n.id}
                onClick={() => navigate(n.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                  active
                    ? "bg-white/15 text-white shadow-sm font-semibold"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon name={n.icon} size={19} className={active ? "text-emerald-400" : "text-white/55"} />
                <span className="flex-1 truncate text-sm">{n.label}</span>
                {n.id === "staff-queue" && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {activeQueueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Staff Profile in Sidebar */}
        <div className="p-4 border-t border-white/10 bg-black/15">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10 shrink-0">
              RK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate leading-tight">{userName}</p>
              <p className="text-white/60 text-xs truncate mt-0.5">{userRole}</p>
              <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">{staffId}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("landing")}
            className="w-full mt-3 text-left px-2.5 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
          >
            <Icon name="arrow_left" size={15} />
            <span>{t("exit_to_main", "Exit to main site")}</span>
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border h-16 flex items-center px-5 gap-3 shrink-0 z-10">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted text-foreground cursor-pointer"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle navigation menu"
          >
            <Icon name="menu" size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <p className="text-base font-bold text-foreground truncate">{centreName}</p>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t("badge_live", "Live")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Thursday, 12 September 2026 · Operating Hours 08:00–17:00</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#f7f4ef] border border-border text-foreground hover:bg-muted cursor-pointer"
              >
                <Icon name="language" size={16} className="text-primary" />
                <span>{currentLanguage.native}</span>
                <Icon name="chevron_down" size={14} className="text-muted-foreground" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg p-1.5 z-50 w-48">
                  {supportedLanguages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer ${
                        language === l.code ? "bg-primary text-white" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {l.native} ({l.name})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Alert quick badge */}
            <button
              onClick={() => navigate("staff-notifications")}
              className="relative p-2.5 rounded-xl hover:bg-muted text-muted-foreground cursor-pointer transition-colors border border-border bg-[#f7f4ef]"
              title="Centre alerts"
            >
              <Icon name="bell" size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
            </button>
          </div>
        </header>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex" onClick={() => setMobileOpen(false)}>
            <aside
              className="w-64 h-full bg-[#1a2319] flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Logo size={24} white />
                  <span className="font-bold text-white font-display text-sm">KisanSetu</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded text-white/70 hover:text-white cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                <p className="text-white text-sm font-semibold">{userName}</p>
                <p className="text-white/70 text-xs mt-0.5">{userRole} · {staffId}</p>
              </div>

              <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
                {navItems.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      navigate(n.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      current === n.id
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/70 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon name={n.icon} size={18} />
                    <span className="flex-1 text-left">{n.label}</span>
                    {n.id === "staff-queue" && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {activeQueueCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="p-3 border-t border-white/10">
                <button
                  onClick={() => {
                    navigate("landing");
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-white/50 hover:text-white"
                >
                  {t("exit_to_main", "← Exit to main site")}
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content View */}
        <main className="flex-1 overflow-y-auto relative">
          {children}

          {/* Floating Live Toasts */}
          {toasts.length > 0 && (
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
              {toasts.map(toast => (
                <div
                  key={toast.id}
                  className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 ${
                    toast.type === "success"
                      ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                      : toast.type === "error"
                      ? "bg-red-50 text-red-950 border-red-200"
                      : toast.type === "warning"
                      ? "bg-amber-50 text-amber-950 border-amber-200"
                      : "bg-blue-50 text-blue-950 border-blue-200"
                  }`}
                >
                  <Icon
                    name={
                      toast.type === "success"
                        ? "check_circle"
                        : toast.type === "error"
                        ? "cross"
                        : toast.type === "warning"
                        ? "warning"
                        : "info_icon"
                    }
                    size={16}
                    className={
                      toast.type === "success"
                        ? "text-emerald-600 shrink-0"
                        : toast.type === "error"
                        ? "text-red-600 shrink-0"
                        : toast.type === "warning"
                        ? "text-amber-600 shrink-0"
                        : "text-blue-600 shrink-0"
                    }
                  />
                  <span className="flex-1 leading-snug">{toast.message}</span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-foreground/40 hover:text-foreground cursor-pointer shrink-0"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
