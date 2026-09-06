"use client";

import { useState } from "react";
import FooterShell from "./FooterShell";
import { Card, Icon } from "../components/ui";
import { useLanguage } from "../lib/languageContext";

export default function PrivacyView() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>("collection");

  const sections = [
    { id: "notice", title: t("privacy_sections_title", "Project Notice") },
    { id: "collection", title: t("privacy_sec_1_title", "Information We May Use") },
    { id: "usage", title: t("privacy_sec_2_title", "How Information Is Used") },
    { id: "location", title: t("privacy_sec_3_title", "Location Information") },
    { id: "security", title: t("privacy_sec_4_title", "Protecting Information") },
    { id: "sharing", title: t("privacy_sec_5_title", "Who Can Access Information") },
    { id: "retention", title: t("privacy_sec_6_title", "Data Retention") },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <FooterShell currentPage="privacy" breadcrumb={[{ label: t("nav_privacy", "Privacy") }]}>
      <div className="space-y-10">
        
        {/* ── 1. Hero ────────────────────────────────────────────────────── */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-green-200">
            <Icon name="shield" size={14} className="text-primary" />
            <span>{t("privacy_hero_title", "Product Privacy Notice")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
            {t("nav_privacy", "Privacy Notice")}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("privacy_hero_sub", "KisanSetu is designed with privacy in mind. This page explains, in simple language, how information is handled within the product.")}
          </p>
        </section>

        {/* ── 2. Prototype Notice Banner ─────────────────────────────────── */}
        <div id="notice" className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border border-amber-200 flex gap-4 items-start">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <Icon name="warning" size={20} />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-amber-900">{t("privacy_sections_title", "Project Privacy Notice")}</p>
            <p className="text-amber-800/90 leading-relaxed">
              {t("privacy_prototype_banner", "KisanSetu is an agricultural queue coordination prototype designed for Smart India Hackathon 2026. Data displayed is for demonstrative, testing, and operational simulation purposes.")}
            </p>
          </div>
        </div>

        {/* ── 3. Desktop Layout with Sidebar Table of Contents ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky Table of Contents (Desktop lg:block) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="p-5 rounded-2xl bg-white border border-border shadow-2xs space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("privacy_sections_title", "Document Sections")}
              </p>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                      activeSection === sec.id
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{sec.title}</span>
                    {activeSection === sec.id && <Icon name="arrow_right" size={12} />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Document Content Blocks (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Information We May Use */}
            <section id="collection" className="space-y-3 pt-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {t("privacy_sec_1_title", "Information We May Use")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("privacy_sec_1_desc", "Only essential information needed for booking verification, SMS alerts, and queue coordination is gathered: farmer name, mobile number, commodity, and vehicle type.")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Card className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-1.5 text-primary">
                    <Icon name="profile" size={18} />
                    <h3 className="text-sm font-bold text-foreground">{t("step_farmer_title", "Farmer Details")}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("form_full_name", "Full Name")}, {t("mobile_label", "Mobile Number")}, {t("step_1_crop", "Commodity")}
                  </p>
                </Card>
                <Card className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-1.5 text-primary">
                    <Icon name="calendar" size={18} />
                    <h3 className="text-sm font-bold text-foreground">{t("tab_bookings", "Booking Data")}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("centre", "Centre:")}, {t("reserved_slot", "Reserved Slot")}, {t("booking_token_label", "Your Digital Token")}
                  </p>
                </Card>
              </div>
            </section>

            {/* 2. How Information Is Used */}
            <section id="usage" className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {t("privacy_sec_2_title", "How Information Is Used")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("privacy_sec_2_desc", "Information is used strictly to reserve procurement slots, calculate queue wait times, send SMS updates, and facilitate weighing receipts at the Mandi.")}
              </p>
            </section>

            {/* 3. Location Information */}
            <section id="location" className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {t("privacy_sec_3_title", "Location Information")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("privacy_sec_3_desc", "Location access is used only to show your distance to the nearest procurement centres. Your exact live location is never tracked or shared.")}
              </p>
            </section>

            {/* 4. Protecting Information */}
            <section id="security" className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {t("privacy_sec_4_title", "Protecting Information")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("privacy_sec_4_desc", "All communication is encrypted via modern HTTPS/TLS protocols. Access is restricted to authorized Mandi procurement staff.")}
              </p>
            </section>

            {/* 5. Who Can Access Information */}
            <section id="sharing" className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {t("privacy_sec_5_title", "Who Can Access Information")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("privacy_sec_5_desc", "Only designated Mandi operators and authorized procurement agencies see your booking details for the purpose of weighing and MSP settlement.")}
              </p>
            </section>

            {/* 6. Data Retention */}
            <section id="retention" className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {t("privacy_sec_6_title", "Data Retention")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("privacy_sec_6_desc", "Operational records are stored for the duration of the procurement season to ensure transparent audit trails for farmers.")}
              </p>
            </section>

          </div>
        </div>
      </div>
    </FooterShell>
  );
}
