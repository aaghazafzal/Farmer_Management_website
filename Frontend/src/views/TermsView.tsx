"use client";

import { useState } from "react";
import FooterShell from "./FooterShell";
import { Icon } from "../components/ui";
import { useLanguage } from "../lib/languageContext";

export default function TermsView() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>("section-1");

  const sections = [
    { id: "section-1", title: t("terms_sec_1", "1.0 Using KisanSetu"), desc: t("terms_sec_1_desc", "KisanSetu is provided to assist farmers in booking arrival slots and tracking queues. All users must provide genuine contact details.") },
    { id: "section-2", title: t("terms_sec_2", "2.0 Bookings and Slots"), desc: t("terms_sec_2_desc", "A booked slot represents an arrival time window at the centre. It helps regulate traffic but is subject to operational conditions at the weighbridge.") },
    { id: "section-3", title: t("terms_sec_3", "3.0 Queue and Waiting-Time"), desc: t("terms_sec_3_desc", "Wait-time estimations are calculated dynamically. Factors such as weather, moisture checks, and emergency vehicle priority may affect timings.") },
    { id: "section-4", title: t("terms_sec_4", "4.0 Procurement Information"), desc: t("terms_sec_4_desc", "Weights, quality inspections, and MSP calculations displayed on the platform are recorded by authorized Mandi operators.") },
    { id: "section-5", title: t("terms_sec_5", "5.0 User Responsibilities"), desc: t("terms_sec_5_desc", "Farmers must arrive with their digital token or SMS pass, clean produce meeting Fair Average Quality (FAQ) standards, and valid registration.") },
    { id: "section-6", title: t("terms_sec_6", "6.0 Platform Availability"), desc: t("terms_sec_6_desc", "While we strive for 99.9% uptime during procurement seasons, offline SMS confirmation remains valid in case of network outages.") },
    { id: "section-7", title: t("terms_sec_7", "7.0 Prohibited Use"), desc: t("terms_sec_7_desc", "Users may not create automated fake bookings, manipulate token positions, or misuse support channels.") },
    { id: "section-8", title: t("terms_sec_8", "8.0 Changes to Terms"), desc: t("terms_sec_8_desc", "Operating policies and procurement rules may be updated in accordance with State Agricultural Marketing Board guidelines.") },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <FooterShell currentPage="terms" breadcrumb={[{ label: t("nav_terms", "Terms") }]}>
      <div className="space-y-10">
        
        {/* ── 1. Hero ────────────────────────────────────────────────────── */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-green-200">
            <Icon name="file_text" size={14} className="text-primary" />
            <span>{t("terms_hero_title", "Terms of Use")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
            {t("nav_terms", "Terms of Use")}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("terms_hero_sub", "These terms describe the intended use of KisanSetu. Final production terms should be reviewed and approved by the operating organization.")}
          </p>
        </section>

        {/* ── 2. Desktop Layout with Sidebar Table of Contents ────────────── */}
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
            {sections.map((sec, index) => (
              <section
                key={sec.id}
                id={sec.id}
                className={`space-y-3 ${index > 0 ? "pt-6 border-t border-border" : "pt-2"}`}
              >
                <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                  {sec.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sec.desc}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </FooterShell>
  );
}
