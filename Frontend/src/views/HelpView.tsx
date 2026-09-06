"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import FooterShell from "./FooterShell";
import { Card, Button, Icon } from "../components/ui";
import { useLanguage } from "../lib/languageContext";

interface FAQDef {
  id: string;
  category: "booking" | "queue" | "status" | "general";
  qKey: string;
  aKey: string;
}

const FAQ_DEFINITIONS: FAQDef[] = [
  { id: "faq-1", category: "booking", qKey: "faq_1_q", aKey: "faq_1_a" },
  { id: "faq-2", category: "booking", qKey: "faq_2_q", aKey: "faq_2_a" },
  { id: "faq-3", category: "queue",   qKey: "faq_3_q", aKey: "faq_3_a" },
  { id: "faq-4", category: "queue",   qKey: "faq_4_q", aKey: "faq_4_a" },
  { id: "faq-5", category: "status",  qKey: "faq_5_q", aKey: "faq_5_a" },
  { id: "faq-6", category: "booking", qKey: "faq_6_q", aKey: "faq_6_a" },
  { id: "faq-7", category: "booking", qKey: "faq_7_q", aKey: "faq_7_a" },
  { id: "faq-8", category: "general", qKey: "faq_8_q", aKey: "faq_8_a" },
  { id: "faq-9", category: "general", qKey: "faq_9_q", aKey: "faq_9_a" },
  { id: "faq-10", category: "status", qKey: "faq_10_q", aKey: "faq_10_a" },
];

export default function HelpView() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    "faq-1": true,
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const localizedFaqs = useMemo(() => {
    return FAQ_DEFINITIONS.map((item) => ({
      id: item.id,
      category: item.category,
      question: t(item.qKey),
      answer: t(item.aKey),
    }));
  }, [t]);

  const filteredFaqs = useMemo(() => {
    return localizedFaqs.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [localizedFaqs, searchQuery, selectedCategory]);

  return (
    <FooterShell currentPage="help" breadcrumb={[{ label: t("nav_help", "Help") }]}>
      <div className="space-y-12 sm:space-y-16">
        
        {/* ── 1. Hero & Interactive Search ───────────────────────────────── */}
        <section className="text-center max-w-2xl mx-auto space-y-4 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-green-200">
            <Icon name="help_circle" size={14} className="text-primary" />
            <span>{t("help_title", "KisanSetu Help Center")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight leading-tight">
            {t("help_how_can_we_help", "How can we help?")}
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            {t("help_sub_title", "Find answers about booking, queues, procurement status and using KisanSetu.")}
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto mt-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name="search" size={20} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("help_search_placeholder", "Search for help by topic, keyword, or question...")}
              className="w-full bg-white border-2 border-border focus:border-primary rounded-2xl pl-12 pr-10 py-3.5 text-base text-foreground placeholder:text-muted-foreground shadow-xs outline-none transition-all"
              aria-label="Search help topics"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                aria-label="Clear search"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        </section>

        {/* ── 2. Quick Help Cards ────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-foreground">
              {t("quick_help", "Quick Help")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("quick_help_sub", "Select a task to jump in")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/farmer/centers" className="group">
              <Card className="p-5 h-full flex flex-col justify-between border-t-4 border-t-primary group-hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon name="booking" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {t("quick_help_book_slot", "Book a Slot")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("solution_1_desc", "Choose a date and arrival time block that works for you.")}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  <span>{t("explore_slots", "Explore slots")}</span>
                  <Icon name="arrow_right" size={14} />
                </div>
              </Card>
            </Link>

            <Link href="/farmer/queue" className="group">
              <Card className="p-5 h-full flex flex-col justify-between border-t-4 border-t-primary group-hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon name="queue" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {t("quick_help_track_queue", "Track My Queue")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("solution_2_desc", "See your token number and estimated wait time directly on your phone.")}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  <span>{t("view_live_queue", "View live queue")}</span>
                  <Icon name="arrow_right" size={14} />
                </div>
              </Card>
            </Link>

            <Link href="/farmer/procurement" className="group">
              <Card className="p-5 h-full flex flex-col justify-between border-t-4 border-t-primary group-hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon name="procurement" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {t("quick_help_check_status", "Check Status")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("solution_3_desc", "Follow weighing, quality check, and receipt generation step-by-step.")}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  <span>{t("check_status", "Check status")}</span>
                  <Icon name="arrow_right" size={14} />
                </div>
              </Card>
            </Link>

            <Link href="/farmer/bookings" className="group">
              <Card className="p-5 h-full flex flex-col justify-between border-t-4 border-t-primary group-hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon name="calendar" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {t("quick_help_manage_booking", "Manage Booking")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("tab_bookings", "View bookings, token passes and scheduling history.")}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  <span>{t("tab_bookings", "My Bookings")}</span>
                  <Icon name="arrow_right" size={14} />
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* ── 3. Frequently Asked Questions (Accordions) ─────────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-foreground">
                {t("footer_help", "Frequently Asked Questions")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t("help_sub_title", "Clear answers to common questions about visits, queues, and status.")}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: t("faq_cat_all", "All Questions") },
                { id: "booking", label: t("faq_cat_bookings", "Bookings") },
                { id: "queue", label: t("faq_cat_queue", "Queue & Wait") },
                { id: "status", label: t("faq_cat_status", "Status & Delays") },
                { id: "general", label: t("faq_cat_general", "General") },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === c.id
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-white border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = !!openIds[faq.id];
                return (
                  <div
                    key={faq.id}
                    className="border border-border rounded-xl bg-white overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="font-semibold text-foreground text-sm sm:text-base leading-snug">
                        {faq.question}
                      </span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`}>
                        <Icon name="arrow_right" size={16} className="rotate-90" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/50 bg-[#fdfcf9]">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-border p-6">
              <Icon name="search" size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-foreground font-semibold">
                {t("no_faq_found", "No questions found matching your search.")}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {t("show_all_faqs", "Show all questions")}
              </button>
            </div>
          )}
        </section>

        {/* ── 4. Contact Escalation Banner ───────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-foreground">
              {t("still_have_questions", "Still have questions?")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              {t("still_have_questions_sub", "Reach out to our support team for assistance with bookings, account issues, or Mandi information.")}
            </p>
          </div>
          <Link href="/contact">
            <Button variant="primary" icon={<Icon name="mail" size={18} />}>
              {t("contact_support", "Contact support")}
            </Button>
          </Link>
        </section>
      </div>
    </FooterShell>
  );
}
