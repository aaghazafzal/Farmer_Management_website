"use client";

import { ReactNode, useState } from "react";
import { Logo, Icon } from "../components/ui";

import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
  current: string;
  title?: string;
  back?: string;
  children: ReactNode;
}

export default function FarmerShell({ navigate, current, title, back, children }: Props) {
  const { language, currentLanguage, setLanguage, supportedLanguages, t, isRTL, formatDate } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const navTabs = [
    { id: "farmer-dashboard", icon: "home", label: t("tab_dashboard", "Dashboard"), shortLabel: t("btn_home", "Home") },
    { id: "find-center", icon: "search", label: t("tab_find_center", "Find Centre"), shortLabel: t("tab_find_short", "Find") },
    { id: "queue-tracking", icon: "queue", label: t("tab_queue", "Queue"), shortLabel: t("tab_queue", "Queue"), badge: "#08" },
    { id: "my-bookings", icon: "booking", label: t("tab_bookings", "Bookings"), shortLabel: t("tab_bookings", "Bookings") },
    { id: "procurement-status", icon: "procurement", label: t("tab_status", "Procurement"), shortLabel: t("tab_status_short", "Status") },
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex flex-col text-foreground font-sans antialiased">
      
      {/* ═══════════════════════════════════════════════════════════════════════
          DESKTOP HEADER (Visible md:block and above)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="hidden md:block sticky top-0 z-40 bg-white border-b border-border shadow-xs">
        {/* Top utility bar */}
        <div className="bg-[#1a2319] text-white text-xs px-6 py-2 flex items-center justify-between border-b border-[#253324]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-medium text-white/95">
              {t("service_status_operational", "KisanSetu Service Status: Operational")}
            </span>
          </div>
          <div className="text-white/70 text-xs">
            Smart India Hackathon 2026 · SIH26032
          </div>
          <div>
            <button
              onClick={() => navigate("staff-login")}
              className="text-white/90 hover:text-green-300 transition-colors font-medium cursor-pointer"
            >
              {t("btn_staff_portal", "Centre Staff Portal →")}
            </button>
          </div>
        </div>

        {/* Primary Desktop Nav */}
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("farmer-dashboard")}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <Logo size={34} />
              <div>
                <span className="font-bold text-xl text-foreground font-display tracking-tight group-hover:text-primary transition-colors">
                  {t("brand_name", "KisanSetu")}
                </span>
                <span className="block text-[11px] uppercase font-bold tracking-wider text-primary">
                  {t("farmer_coordination_portal", "Farmer Coordination Portal")}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-1.5 lg:gap-2">
            {navTabs.map(tab => {
              const active = current === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "text-foreground/85 hover:text-primary hover:bg-secondary/70"
                  }`}
                >
                  <Icon name={tab.icon} size={17} className={active ? "text-white" : "text-primary"} />
                  {tab.label}
                  {tab.badge && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      active ? "bg-white text-primary" : "bg-primary text-white"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Language & Farmer ID Badge */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#f7f4ef] border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
              >
                <Icon name="language" size={15} className="text-primary" />
                <span>{currentLanguage.native}</span>
                <Icon name="arrow_right" size={12} className="rotate-90 text-muted-foreground" />
              </button>

              {langOpen && (
                <div className={`absolute top-full mt-1.5 bg-white border border-border rounded-xl shadow-lg p-1.5 z-50 w-44 ${isRTL ? "left-0" : "right-0"}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    {t("choose_language", "Choose Language")}
                  </p>
                  {supportedLanguages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        language === l.code ? "bg-primary text-white" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[11px] text-muted-foreground">({l.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate("procurement-status")}
              className="relative p-2.5 rounded-xl bg-[#f7f4ef] border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Notifications"
            >
              <Icon name="bell" size={18} />
              <span className={`absolute top-1.5 ${isRTL ? "left-1.5" : "right-1.5"} w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white`} />
            </button>

            {/* Farmer Profile Card */}
            <div className={`flex items-center gap-2.5 ${isRTL ? "pr-3 border-r" : "pl-3 border-l"} border-border`}>
              <div className="w-8 h-8 rounded-full bg-secondary text-primary font-bold flex items-center justify-center border border-green-300 text-xs shadow-2xs">
                RK
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-foreground leading-tight">Ramesh Kumar</p>
                <p className="text-[10px] text-muted-foreground font-mono">ID: F-10482</p>
              </div>
              <button
                onClick={() => navigate("farmer-login")}
                className="text-xs text-muted-foreground hover:text-red-600 font-bold ml-1 px-1.5 py-0.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title={t("btn_sign_out", "Sign out")}
              >
                {t("btn_sign_out", "Sign out")}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Breadcrumbs Context Bar */}
        <div className="bg-[#fcfaf7] border-t border-border px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("farmer-dashboard")} className="hover:text-primary font-medium">{t("btn_home", "Home")}</button>
              <span className={isRTL ? "rtl-flip" : ""}>/</span>
              <span className="font-bold text-foreground capitalize">
                {title || (current.replace("farmer-", "").replace("find-", "Find ").replace("-", " "))}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {t("live_sync_active", "Live updates · Last synchronized 10:49 AM")}
              </span>
              <span>{t("label_today", "Today")} · <strong>{formatDate(new Date())}</strong></span>
            </div>
          </div>
        </div>

      </header>


      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE TOP APP BAR (Visible only on mobile md:hidden)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-40 bg-white/98 backdrop-blur border-b border-border shadow-2xs">
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          {/* Left: Back or Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            {back ? (
              <button
                onClick={() => navigate(back)}
                className="p-2 -ml-2 rounded-xl text-foreground hover:bg-muted transition-colors active:scale-95 cursor-pointer"
                aria-label="Go back"
              >
                <Icon name="arrow_left" size={20} className={isRTL ? "rtl-flip" : ""} />
              </button>
            ) : (
              <button
                onClick={() => navigate("farmer-dashboard")}
                className="flex items-center gap-2 shrink-0 text-left cursor-pointer"
              >
                <Logo size={26} />
                <span className="font-bold text-foreground font-display text-base tracking-tight">{t("brand_name", "KisanSetu")}</span>
              </button>
            )}

            {title && (
              <h1 className="font-bold text-base text-foreground font-display truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Right: Language, Notifications, User */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language dropdown button */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#f7f4ef] border border-border text-foreground transition-colors cursor-pointer"
              >
                <Icon name="language" size={14} className="text-primary" />
                <span>{currentLanguage.native}</span>
              </button>

              {langOpen && (
                <div className={`absolute top-full mt-1 bg-white border border-border rounded-xl shadow-lg p-1.5 z-50 w-44 ${isRTL ? "left-0" : "right-0"}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    {t("choose_language", "Choose Language")}
                  </p>
                  {supportedLanguages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        language === l.code ? "text-primary font-bold bg-secondary/80" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-muted-foreground">({l.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification bell */}
            <button
              onClick={() => navigate("procurement-status")}
              className="relative p-2 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Notifications"
            >
              <Icon name="bell" size={18} />
              <span className={`absolute top-1.5 ${isRTL ? "left-1.5" : "right-1.5"} w-2 h-2 rounded-full bg-primary ring-2 ring-white`} />
            </button>
          </div>
        </div>
      </header>


      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 pb-20 md:pb-12">
        {children}
      </main>


      {/* ═══════════════════════════════════════════════════════════════════════
          DESKTOP FOOTER (Visible md:block)
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="hidden md:block bg-white border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-4 gap-8 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Logo size={28} />
                <span className="font-bold text-lg font-display text-foreground">{t("brand_name", "KisanSetu")}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("footer_tagline", "KisanSetu helps farmers plan procurement-center visits, reduce waiting, avoid unnecessary trips, and track procurement status.")}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">{t("footer_col_services", "Farmer Services")}</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><button onClick={() => navigate("find-center")} className="hover:text-primary cursor-pointer">{t("footer_find_center", "Find Nearby Procurement Centre")}</button></li>
                <li><button onClick={() => navigate("slot-booking")} className="hover:text-primary cursor-pointer">{t("footer_book_slot", "Book Procurement Slot")}</button></li>
                <li><button onClick={() => navigate("queue-tracking")} className="hover:text-primary cursor-pointer">{t("footer_queue_tracking", "Track Queue & Waiting Time")}</button></li>
                <li><button onClick={() => navigate("procurement-status")} className="hover:text-primary cursor-pointer">{t("footer_procurement_status", "Track Procurement Status")}</button></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">{t("footer_col_platform", "Platform & Support")}</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><button onClick={() => navigate("about")} className="hover:text-primary cursor-pointer">{t("footer_about", "About KisanSetu")}</button></li>
                <li><button onClick={() => navigate("help")} className="hover:text-primary cursor-pointer">{t("footer_help", "Help & FAQs")}</button></li>
                <li><button onClick={() => navigate("privacy")} className="hover:text-primary cursor-pointer">{t("footer_privacy", "Privacy Notice")}</button></li>
                <li><button onClick={() => navigate("terms")} className="hover:text-primary cursor-pointer">{t("footer_terms", "Terms of Use")}</button></li>
                <li><button onClick={() => navigate("contact")} className="hover:text-primary cursor-pointer">{t("footer_contact", "Contact Support")}</button></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">{t("footer_col_portals", "Portals & Access")}</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("staff-login")}
                  className="w-full text-left py-2 px-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                >
                  {t("footer_staff_portal_btn", "🏢 Procurement Staff Portal")}
                </button>
                <p className="text-[11px] text-muted-foreground">
                  Smart India Hackathon 2026 solution concept · Problem Statement ID: <strong>SIH26032</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 {t("brand_name", "KisanSetu")} · {t("sih_prototype_theme", "Smart India Hackathon 2026 Solution Concept · Problem Statement SIH26032")}</p>
            <p>{t("footer_supported_in", "Supported in:")} English · हिंदी · ਪੰਜਾਬੀ · मराठी · বাংলা · اردو</p>
          </div>
        </div>
      </footer>


      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (Strictly md:hidden)
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur border-t border-border py-1.5 px-2 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-0.5">
          {navTabs.map(tab => {
            const active = current === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl text-xs font-medium transition-all relative cursor-pointer ${
                  active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon name={tab.icon} size={20} className={active ? "text-primary" : "text-muted-foreground"} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2.5 bg-primary text-white text-[9px] font-bold px-1 rounded-full leading-tight">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[58px]">{tab.shortLabel}</span>
                {active && (
                  <span className="w-5 h-1 bg-primary rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
