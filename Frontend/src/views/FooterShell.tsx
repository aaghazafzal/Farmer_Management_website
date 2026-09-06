"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, Button, Icon } from "../components/ui";

import { useLanguage } from "../lib/languageContext";

interface FooterShellProps {
  children: ReactNode;
  currentPage: "about" | "help" | "privacy" | "terms" | "contact";
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function FooterShell({
  children,
  currentPage,
  breadcrumb,
}: FooterShellProps) {
  const router = useRouter();
  const { language, currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const [langModalOpen, setLangModalOpen] = useState(false);

  const navLinks = [
    { id: "about", label: t("nav_about", "About"), href: "/about" },
    { id: "help", label: t("nav_help", "Help"), href: "/help" },
    { id: "privacy", label: t("nav_privacy", "Privacy"), href: "/privacy" },
    { id: "terms", label: t("nav_terms", "Terms"), href: "/terms" },
    { id: "contact", label: t("nav_contact", "Contact"), href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* ── Top Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border transition-shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand and back navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex items-center gap-1 text-sm font-medium cursor-pointer"
              aria-label="Go back to previous page"
            >
              <Icon name="arrow_left" size={20} />
              <span className="hidden sm:inline">{t("btn_back", "Back")}</span>
            </button>

            <div className="h-5 w-px bg-border hidden sm:block" />

            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo size={32} />
              <div className="flex flex-col">
                <span className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors leading-none tracking-tight">
                  {t("brand_name", "KisanSetu")}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                  {t("mandi_visit_planner", "Mandi Visit Planner")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`transition-colors py-1 ${
                  currentPage === item.id
                    ? "text-primary font-semibold border-b-2 border-primary"
                    : "hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Button */}
            <div className="relative">
              <button
                onClick={() => setLangModalOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-expanded={langModalOpen}
                aria-label="Select language"
              >
                <Icon name="language" size={16} className="text-primary" />
                <span>{currentLanguage.native}</span>
                <Icon name="chevron_down" size={14} className="text-muted-foreground" />
              </button>

              {langModalOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("select_language", "Select Language")}
                  </div>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangModalOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                        language === lang.code ? "text-primary font-bold bg-green-50/60" : "text-foreground"
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">({lang.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Portal Button */}
            <Link href="/farmer/login" className="hidden sm:inline-block">
              <Button variant="primary" size="sm">
                {t("btn_farmer_login", "Farmer Login")}
              </Button>
            </Link>
            <Link href="/farmer/login" className="sm:hidden">
              <Button variant="primary" size="sm" className="text-xs px-2.5 py-1 min-h-[36px]">
                {t("btn_login", "Login")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb Bar ──────────────────────────────────────────────── */}
      <div className="bg-secondary/40 border-b border-border/60 py-2.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Icon name="arrow_right" size={12} className="text-muted-foreground/60" />
          {breadcrumb ? (
            breadcrumb.map((bc, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-foreground transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-semibold capitalize">{bc.label}</span>
                )}
                {idx < breadcrumb.length - 1 && (
                  <Icon name="arrow_right" size={12} className="text-muted-foreground/60" />
                )}
              </span>
            ))
          ) : (
            <span className="text-foreground font-semibold capitalize">{currentPage}</span>
          )}
        </div>
      </div>

      {/* ── Page Content Container ──────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        {children}
      </main>

      {/* ── Global KisanSetu Footer ───────────────────────────────────────── */}
      <footer className="bg-foreground text-white mt-auto pt-12 pb-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
            
            {/* Branding & Mission */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <Logo size={32} white />
                <span className="text-2xl font-bold font-display tracking-tight text-white">
                  KisanSetu
                </span>
              </div>
              <p className="text-sm text-white/70 max-w-sm leading-relaxed">
                {t("footer_tagline", "KisanSetu helps farmers plan procurement-center visits, manage slots and track procurement status.")}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Smart India Hackathon 2026 Solution</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                  {t("footer_col_platform", "Platform & Support")}
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/about"
                      className={`hover:text-white transition-colors ${
                        currentPage === "about" ? "text-white font-semibold" : "text-white/70"
                      }`}
                    >
                      {t("footer_about", "About KisanSetu")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/help"
                      className={`hover:text-white transition-colors ${
                        currentPage === "help" ? "text-white font-semibold" : "text-white/70"
                      }`}
                    >
                      {t("footer_help", "Help & FAQs")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className={`hover:text-white transition-colors ${
                        currentPage === "contact" ? "text-white font-semibold" : "text-white/70"
                      }`}
                    >
                      {t("footer_contact", "Contact Support")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                  {t("nav_terms", "Policy & Terms")}
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/privacy"
                      className={`hover:text-white transition-colors ${
                        currentPage === "privacy" ? "text-white font-semibold" : "text-white/70"
                      }`}
                    >
                      {t("footer_privacy", "Privacy Notice")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className={`hover:text-white transition-colors ${
                        currentPage === "terms" ? "text-white font-semibold" : "text-white/70"
                      }`}
                    >
                      {t("footer_terms", "Terms of Use")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/farmer/centers"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {t("footer_find_center", "Find Centers")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Language & Attribution */}
            <div className="md:col-span-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                {t("language_support", "Language Support")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {supportedLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      language === l.code
                        ? "bg-primary text-white font-medium"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {l.native}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/50 pt-2">
                {t("active_language", "Active Language:")} <strong className="text-white">{currentLanguage.native} ({currentLanguage.name})</strong>
              </p>
            </div>
          </div>

          {/* Bottom Disclaimer & Attribution Bar */}
          <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/50">
            <div>
              <p className="font-medium text-white/70">
                Smart India Hackathon 2026 · Problem Statement ID: SIH26032
              </p>
              <p className="text-white/40 mt-0.5">
                Theme: Smart Automation · Category: Software · Agricultural Procurement Queue Management
              </p>
            </div>
            <p className="text-white/40">
              © 2026 KisanSetu Prototype. All operational procedures remain subject to local Mandi guidelines.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
