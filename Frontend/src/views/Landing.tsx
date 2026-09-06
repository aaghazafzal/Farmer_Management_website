"use client";

import { useState } from "react";
import Link from "next/link";

import { Logo, Button, Icon, Card } from "../components/ui";

import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
}

export default function Landing({ navigate }: Props) {
  const { language, currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(false);

  const problems = [
    { icon: "clock", title: t("problem_1_title", "Unpredictable waiting times"), text: t("problem_1_desc", "Farmers arrive at dawn and often wait hours or days without knowing when their turn will come.") },
    { icon: "route", title: t("problem_2_title", "Unnecessary Mandi trips"), text: t("problem_2_desc", "Making the journey only to find the centre closed, at capacity, or facing equipment breakdown.") },
    { icon: "queue", title: t("problem_3_title", "No live queue visibility"), text: t("problem_3_desc", "Zero transparency on how many tractors are ahead or how fast the line is moving.") },
  ];

  const steps = [
    { n: "01", title: t("solution_1_title", "Book Before You Travel"), sub: t("solution_1_desc", "Choose a date and arrival time block that works for you.") },
    { n: "02", title: t("step_find_center_title", "Find Centre"), sub: t("step_find_center_desc", "By village or district.") },
    { n: "03", title: t("solution_2_title", "Track the Queue Live"), sub: t("solution_2_desc", "See your token number and estimated wait time directly on your phone.") },
    { n: "04", title: t("step_visit_center_title", "Visit Centre"), sub: t("step_visit_center_desc", "Arrive near your slot. No surprise wait on arrival.") },
    { n: "05", title: t("solution_3_title", "Know Procurement Status"), sub: t("solution_3_desc", "Follow weighing, quality check, and receipt generation step-by-step.") },
  ];

  const features = [
    { icon: "phone", title: t("feat_1_title", "Live Queue Tracking"), sub: t("feat_1_desc", "Real-time token and wait-time updates right on your screen.") },
    { icon: "language", title: t("feat_4_title", "Multilingual Support"), sub: t("feat_4_desc", "Available in Hindi, Marathi, Bengali, Punjabi, Urdu, and English.") },
    { icon: "lightning", title: t("feat_5_title", "Simple Interface"), sub: t("feat_5_desc", "Large readable buttons, plain language, and no confusing technical jargon.") },
    { icon: "refresh", title: t("feat_3_title", "Transparent Verification"), sub: t("feat_3_desc", "Gross weight, tare weight, moisture inspection, and MSP receipt digitally recorded.") },
    { icon: "shield", title: t("feat_2_title", "Multi-Crop Support"), sub: t("feat_2_desc", "Wheat, Paddy, Mustard, Cotton, Gram and all major crops.") },
  ];

  const staffFeatures = [
    { icon: "chart", label: t("stat_center_status", "Daily Capacity") },
    { icon: "calendar", label: t("tab_book_slot", "Slot Management") },
    { icon: "users", label: t("tab_queue", "Queue Monitoring") },
    { icon: "profile", label: t("step_farmer_title", "Farmer Records") },
    { icon: "procurement", label: t("tab_status", "Procurement Updates") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate("landing")} className="flex items-center gap-2.5 shrink-0 cursor-pointer">
            <Logo size={36} />
            <span className="text-xl font-bold text-foreground font-display tracking-tight">{t("brand_name", "KisanSetu")}</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">{t("nav_how_it_works", "How it works")}</a>
            <a href="#features" className="hover:text-foreground transition-colors">{t("nav_features", "Features")}</a>
            <a href="#staff" className="hover:text-foreground transition-colors">{t("nav_for_centres", "For Centres")}</a>
            <Link href="/about" className="hover:text-foreground transition-colors">{t("nav_about", "About")}</Link>
            <Link href="/help" className="hover:text-foreground transition-colors">{t("nav_help", "Help")}</Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setActiveLang(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Icon name="language" size={16} />
                <span>{currentLanguage.native}</span>
                <Icon name="arrow_right" size={14} className="rotate-90" />
              </button>
              {activeLang && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50 w-44">
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("select_language", "Select Language")}
                  </div>
                  {supportedLanguages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code); setActiveLang(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors flex items-center justify-between cursor-pointer ${language === l.code ? "text-primary font-semibold bg-green-50/60" : ""}`}
                    >
                      <span>{l.native}</span>
                      <span className="text-xs text-muted-foreground">({l.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("farmer-login")}>{t("btn_login", "Log in")}</Button>
            <Button size="sm" onClick={() => navigate("farmer-login")}>{t("btn_book_slot", "Book a Slot")}</Button>
          </div>

          {/* Mobile icons */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setActiveLang(v => !v)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
              <Icon name="language" size={20} />
            </button>
            {activeLang && (
              <div className="absolute right-4 top-16 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50 w-44">
                <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("select_language", "Select Language")}
                </div>
                {supportedLanguages.map(l => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); setActiveLang(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted flex items-center justify-between cursor-pointer ${language === l.code ? "text-primary font-semibold bg-green-50/60" : ""}`}
                  >
                    <span>{l.native}</span>
                    <span className="text-xs text-muted-foreground">({l.name})</span>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setMenuOpen(v => !v)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
              <Icon name={menuOpen ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-2">
            <a href="#how" onClick={() => setMenuOpen(false)} className="text-left py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">How it works</a>
            <a href="#features" onClick={() => setMenuOpen(false)} className="text-left py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">Features</a>
            <a href="#staff" onClick={() => setMenuOpen(false)} className="text-left py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">For Centres</a>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="text-left py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">About</Link>
            <Link href="/help" onClick={() => setMenuOpen(false)} className="text-left py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">Help & FAQs</Link>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate("farmer-login")}>Log in</Button>
              <Button size="sm" fullWidth onClick={() => navigate("farmer-login")}>Book a Slot</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-semibold mb-5 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {t("sih_badge", "Smart India Hackathon 2026 · SIH26032")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-5">
            {t("hero_title_1", "Plan your visit.")}<br />
            <span className="text-primary">{t("hero_title_2", "Skip the unnecessary wait.")}</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
            {t("hero_desc", "KisanSetu helps farmers book procurement slots, track their queue, and know the status of their procurement before making the journey.")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("farmer-login")} icon={<Icon name="calendar" size={20} />}>
              {t("btn_book_procurement_slot", "Book a Procurement Slot")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("farmer-login")} icon={<Icon name="search" size={20} />}>
              {t("btn_track_booking", "Track My Booking")}
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Free · No installation required · Works on any phone
          </p>
        </div>

        {/* Journey diagram */}
        <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            {t("your_procurement_journey", "YOUR PROCUREMENT JOURNEY")}
          </p>
          <div className="space-y-3">
            {[
              { icon: "profile", label: t("step_farmer_title", "Farmer"), color: "bg-green-50 text-green-700", sub: t("step_farmer_desc", "Registers once") },
              { icon: "search", label: t("step_find_center_title", "Find Centre"), color: "bg-blue-50 text-blue-700", sub: t("step_find_center_desc", "By village or district") },
              { icon: "calendar", label: t("step_book_slot_title", "Book a Slot"), color: "bg-green-50 text-green-700", sub: t("step_book_slot_desc", "Choose date & time") },
              { icon: "queue", label: t("step_queue_pos_title", "Queue Position"), color: "bg-amber-50 text-amber-700", sub: t("step_queue_pos_desc", "Know your number") },
              { icon: "warehouse", label: t("step_visit_center_title", "Visit Centre"), color: "bg-green-50 text-green-700", sub: t("step_visit_center_desc", "Arrive near your time") },
              { icon: "check_circle", label: t("step_completed_title", "Completed"), color: "bg-green-100 text-green-800", sub: t("step_completed_desc", "Procurement done") },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <Icon name={s.icon} size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
                {i < 5 && (
                  <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground">
                    <Icon name="arrow_right" size={12} className="rotate-90" />
                  </div>
                )}
                {i === 5 && (
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    {t("step_done_badge", "Done!")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem cards ── */}
      <section className="bg-muted py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">{t("problem_title", "Why procurement visits are difficult today")}</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              {t("hero_desc", "Farmers make unnecessary trips. They wait for hours. KisanSetu fixes that.")}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {problems.map((p) => (
              <Card key={p.title} className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-4">
                  <Icon name={p.icon} size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">{t("solution_badge", "How KisanSetu works")}</h2>
            <p className="text-muted-foreground mt-2">{t("solution_title", "From field to Mandi, with complete clarity")}</p>
          </div>
          <div className="grid sm:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-lg font-bold mx-auto mb-3 font-display">
                  {s.n}
                </div>
                <h4 className="font-bold text-foreground text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button size="lg" onClick={() => navigate("farmer-login")}>{t("btn_book_slot", "Book a Slot")}</Button>
          </div>
        </div>
      </section>

      {/* ── Built for field conditions ── */}
      <section id="features" className="bg-primary py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">{t("features_title", "Built for real field conditions")}</h2>
            <p className="text-green-200 mt-2">
              {t("hero_desc", "Designed for low-cost phones, limited internet, and users with minimal digital experience.")}
            </p>
          </div>
          <div className="grid sm:grid-cols-5 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-white/10 rounded-2xl p-5 text-center border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white mx-auto mb-3">
                  <Icon name={f.icon} size={20} />
                </div>
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="text-xs text-green-200 mt-1 leading-relaxed">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Staff section ── */}
      <section id="staff" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-widest">{t("nav_for_centres", "For Procurement Centres")}</span>
            <h2 className="text-3xl font-bold text-foreground mt-2 mb-4">From crowded queues to coordinated operations.</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Give your staff real-time tools to manage capacity, control queues, update farmer status, and run a smoother operation every day.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {staffFeatures.map(f => (
                <div key={f.label} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-full text-sm font-medium text-secondary-foreground border border-green-200">
                  <Icon name={f.icon} size={15} />
                  {f.label}
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={() => navigate("staff-login")} icon={<Icon name="warehouse" size={18} />}>
              {t("btn_staff_portal", "Staff Portal Login")}
            </Button>
          </div>

          {/* Staff preview card */}
          <Card className="p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">ABC Procurement Centre · Today</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{t("tab_queue", "Live Queue Dashboard")}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[["142", "Today's Farmers"], ["128", "Booked Slots"], ["27", "In Queue"], ["84", "Completed"]].map(([v, l]) => (
                <div key={l} className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-foreground font-display">{v}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { n: "#05", name: "Gurpreet Singh", status: "Processing", color: "text-blue-700 bg-blue-50" },
                { n: "#06", name: "Suresh Patel", status: "Waiting", color: "text-amber-700 bg-amber-50" },
                { n: "#07", name: "Anjali Devi", status: "Waiting", color: "text-amber-700 bg-amber-50" },
                { n: "#08", name: "Ramesh Kumar", status: "Waiting", color: "text-emerald-700 bg-emerald-50" },
              ].map(r => (
                <div key={r.n} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted text-sm">
                  <span className="font-bold text-foreground w-8">{r.n}</span>
                  <span className="flex-1 text-muted-foreground ml-2">{r.name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.color}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-foreground text-white py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Logo size={32} white />
                <span className="text-xl font-bold font-display text-white">{t("brand_name", "KisanSetu")}</span>
              </div>
              <p className="text-xs text-white/70 max-w-sm leading-relaxed">
                {t("footer_tagline", "KisanSetu helps farmers plan procurement-center visits, manage slots and track procurement status.")}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
                <Link href="/about" className="text-white/80 hover:text-white transition-colors cursor-pointer">{t("nav_about", "About")}</Link>
                <Link href="/help" className="text-white/80 hover:text-white transition-colors cursor-pointer">{t("nav_help", "Help")}</Link>
                <Link href="/privacy" className="text-white/80 hover:text-white transition-colors cursor-pointer">{t("nav_privacy", "Privacy")}</Link>
                <Link href="/terms" className="text-white/80 hover:text-white transition-colors cursor-pointer">{t("nav_terms", "Terms")}</Link>
                <Link href="/contact" className="text-white/80 hover:text-white transition-colors cursor-pointer">{t("nav_contact", "Contact")}</Link>
              </div>

              {/* Language Selector Pills */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                  {t("language_support", "Language Support")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {supportedLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                        language === l.code
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/50">
            <p>Smart India Hackathon 2026 · Problem Statement ID: SIH26032</p>
            <p>{t("active_language", "Active Language:")} <strong className="text-white">{currentLanguage.native} ({currentLanguage.name})</strong></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
