"use client";

import Link from "next/link";
import FooterShell from "./FooterShell";
import { Card, Button, Icon } from "../components/ui";

import { useLanguage } from "../lib/languageContext";

export default function AboutView() {
  const { t } = useLanguage();

  const steps = [
    { num: "01", title: t("solution_1_title", "Find a procurement center"), desc: t("step_find_center_desc", "Locate nearby Mandi centers with available capacity and active crop intake.") },
    { num: "02", title: t("step_book_slot_title", "Choose a suitable slot"), desc: t("step_book_slot_desc", "Select a date and scheduled time window that fits your harvesting schedule.") },
    { num: "03", title: t("booking_success_title", "Receive booking confirmation"), desc: t("booking_advice", "Get an instant reference token with scheduled slot timing and requirements.") },
    { num: "04", title: t("tab_queue", "Track queue position"), desc: t("feat_1_desc", "Check real-time queue movement and estimated waiting time before departing.") },
    { num: "05", title: t("tab_status", "Follow procurement status"), desc: t("feat_3_desc", "Monitor verification, weighing, quality assessment, and documentation.") },
    { num: "06", title: t("step_completed_title", "Complete the visit"), desc: t("step_completed_desc", "Finish procurement smoothly with transparent records and minimal Mandi waiting.") },
  ];

  const farmerFeatures = [
    {
      title: t("quick_help_book_slot", "Simple booking"),
      desc: t("feat_5_desc", "Book a procurement slot without navigating a complicated interface."),
      icon: "booking",
    },
    {
      title: t("feat_1_title", "Queue visibility"),
      desc: t("feat_1_desc", "See your current position and estimated waiting time."),
      icon: "queue",
    },
    {
      title: t("tab_status", "Status tracking"),
      desc: t("solution_3_desc", "Follow the progress of your procurement through clear status stages."),
      icon: "procurement",
    },
    {
      title: t("feat_4_title", "Multilingual access"),
      desc: t("feat_4_desc", "Use the interface in a preferred supported language."),
      icon: "language",
    },
    {
      title: t("feat_5_title", "Simple information"),
      desc: t("feat_5_desc", "Important information is presented using clear language, recognizable icons and visible statuses."),
      icon: "info_icon",
    },
  ];

  const staffOperations = [
    { title: t("tab_book_slot", "Managing slots"), desc: "Configure hourly arrival windows and limit per-hour farmer intake to avoid gate congestion.", icon: "calendar" },
    { title: t("stat_center_status", "Managing daily capacity"), desc: "Balance daily weighing capacity against storage and handling limits at the center.", icon: "chart" },
    { title: t("tab_queue", "Monitoring queues"), desc: "Track physical queue status, token progress, and current waiting duration in real-time.", icon: "users" },
    { title: t("step_farmer_title", "Managing farmer bookings"), desc: "Verify incoming tokens, check appointment validity, and inspect scheduled documents.", icon: "profile" },
    { title: t("tab_status", "Updating procurement status"), desc: "Log transitions across gate entry, quality analysis, digital weighing, and receipt generation.", icon: "check_circle" },
    { title: t("problem_1_title", "Handling delays & operational changes"), desc: "Publish immediate advisories to farmers if equipment maintenance or weather causes delays.", icon: "warning" },
  ];

  const designPrinciples = [
    { name: t("feat_5_title", "Simplicity"), text: "Keep important tasks easy to understand.", tag: "Clarity" },
    { name: t("feat_4_title", "Accessibility"), text: "Design for different levels of digital familiarity.", tag: "Inclusion" },
    { name: t("feat_3_title", "Transparency"), text: "Make status and operational changes visible.", tag: "Trust" },
    { name: t("nav_privacy", "Privacy"), text: "Treat farmer information as sensitive.", tag: "Protection" },
    { name: t("stat_center_status", "Reliability"), text: "Present operational information with timestamps and clear system states.", tag: "Accuracy" },
  ];

  return (
    <FooterShell currentPage="about" breadcrumb={[{ label: t("nav_about", "About") }]}>
      <div className="space-y-16 sm:space-y-20">
        
        {/* ── 1. Hero Section ────────────────────────────────────────────── */}
        <section className="text-center max-w-3xl mx-auto pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-4 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>{t("sih_badge", "Smart India Hackathon 2026 · SIH26032")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight leading-tight mb-5">
            {t("about_hero_title", "Making procurement visits more predictable.")}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("about_hero_sub", "KisanSetu is a digital platform designed to help farmers plan procurement-center visits, book available slots, track queues, and stay informed about procurement status.")}
          </p>

          {/* Subtle Visual Flow (Farmer → Slot → Queue → Procurement → Completed) */}
          <div className="mt-8 p-3.5 sm:p-4 rounded-2xl bg-white border border-border shadow-xs max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground overflow-x-auto gap-2 py-1">
              <span className="flex items-center gap-1.5 shrink-0 text-foreground">
                <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-[11px]">1</span>
                {t("step_farmer_title", "Farmer")}
              </span>
              <Icon name="arrow_right" size={14} className="text-muted-foreground/50 shrink-0" />
              <span className="flex items-center gap-1.5 shrink-0 text-foreground">
                <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-[11px]">2</span>
                {t("step_book_slot_title", "Slot")}
              </span>
              <Icon name="arrow_right" size={14} className="text-muted-foreground/50 shrink-0" />
              <span className="flex items-center gap-1.5 shrink-0 text-foreground">
                <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-[11px]">3</span>
                {t("step_queue_pos_title", "Queue")}
              </span>
              <Icon name="arrow_right" size={14} className="text-muted-foreground/50 shrink-0" />
              <span className="flex items-center gap-1.5 shrink-0 text-foreground">
                <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-[11px]">4</span>
                {t("tab_status", "Procurement")}
              </span>
              <Icon name="arrow_right" size={14} className="text-muted-foreground/50 shrink-0" />
              <span className="flex items-center gap-1.5 shrink-0 text-primary font-bold">
                <Icon name="check_circle" size={18} className="text-primary" />
                {t("step_completed_title", "Completed")}
              </span>
            </div>
          </div>
        </section>

        {/* ── 2. Why KisanSetu? ───────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">
              {t("why_kisansetu_title", "Why KisanSetu?")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2.5 leading-relaxed">
              {t("why_kisansetu_desc", "Farmers can face long waiting times, unnecessary trips, unclear procurement schedules, and uncertainty about what happens after booking.")}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
              {t("about_hero_sub", "KisanSetu is designed to bring the important information together in one simple interface so farmers can better plan their visit and procurement-center staff can coordinate daily operations more effectively.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-6 flex flex-col justify-between border-t-4 border-t-primary">
              <div>
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4">
                  <Icon name="clock" size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t("card_reduce_wait", "Reduce Waiting")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("card_reduce_wait_desc", "Help farmers choose a suitable slot and understand the expected queue before arriving.")}
                </p>
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between border-t-4 border-t-primary">
              <div>
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4">
                  <Icon name="route" size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t("card_reduce_trips", "Reduce Unnecessary Trips")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("card_reduce_trips_desc", "Make procurement schedules and slot availability easier to understand before a farmer travels to the center.")}
                </p>
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between border-t-4 border-t-primary">
              <div>
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4">
                  <Icon name="eye" size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t("card_improve_transparency", "Improve Transparency")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("card_improve_transparency_desc", "Provide booking, queue and procurement-status information with visible updates.")}
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 3. What KisanSetu Does (Timeline) ────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Process Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight mt-1">
              From booking to completion
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              A structured 6-step flow designed to simplify every stage of the procurement center visit.
            </p>
          </div>

          {/* Desktop Horizontal Timeline (md:grid) */}
          <div className="hidden md:grid md:grid-cols-6 gap-3 relative">
            <div className="absolute top-7 left-6 right-6 h-0.5 bg-border -z-0" />
            {steps.map((s, idx) => (
              <div key={idx} className="relative z-10 flex flex-col bg-white p-4 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-full bg-secondary border-2 border-primary text-primary font-bold text-xs flex items-center justify-center mb-3">
                  {s.num}
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile Vertical Timeline (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {steps.map((s, idx) => (
              <div key={idx} className="flex gap-3.5 p-4 rounded-xl bg-white border border-border">
                <div className="w-8 h-8 rounded-full bg-secondary border-2 border-primary text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {s.num}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. For Farmers ─────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Farmer Experience</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight mt-1">
              Designed around the farmer’s journey
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              Built specifically for field accessibility, straightforward choices, and minimal digital friction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmerFeatures.map((f, i) => (
              <Card key={i} className="p-5 flex gap-3.5 items-start">
                <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
                  <Icon name={f.icon} size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── 5. For Procurement Centers ─────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Center Operations</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight mt-1">
              Built for procurement-center operations
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              Tools enabling Mandi staff to manage arrival pacing, optimize daily operations, and reduce peak-hour congestion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffOperations.map((op, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-border shadow-2xs hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="p-2 rounded-lg bg-muted text-primary">
                    <Icon name={op.icon} size={18} />
                  </span>
                  <h3 className="text-sm font-bold text-foreground">{op.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{op.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Design Principles ───────────────────────────────────────── */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Foundational Values</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight mt-1">
              Built for real-world use
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
              Ground-truth constraints that guide every screen, workflow, and message in KisanSetu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {designPrinciples.map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-primary mb-2">
                    {p.tag}
                  </span>
                  <h3 className="text-base font-bold text-foreground mb-1.5">{p.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Smart India Hackathon Section ───────────────────────────── */}
        <section className="rounded-2xl bg-secondary/50 border border-green-200/80 p-6 sm:p-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-green-200 text-xs font-bold text-primary">
              <Icon name="check_circle" size={14} />
              <span>Smart India Hackathon 2026</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">
              Developed as a Smart India Hackathon 2026 solution
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              KisanSetu has been conceptualized as a software solution for Smart India Hackathon 2026, addressing the challenge of long waiting times, unnecessary procurement-center visits, and limited visibility into procurement status.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-xl border border-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Problem Statement ID</p>
                <p className="text-base font-bold font-display text-foreground mt-0.5">SIH26032</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Theme</p>
                <p className="text-base font-bold font-display text-foreground mt-0.5">Smart Automation</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-border">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
                <p className="text-base font-bold font-display text-foreground mt-0.5">Software</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/80 italic pt-1">
              Note: This is a software prototype created for the hackathon evaluation and does not represent an official Government of India system.
            </p>
          </div>
        </section>

        {/* ── 8. Final Call to Action ────────────────────────────────────── */}
        <section className="bg-foreground text-white rounded-2xl p-8 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
            Plan the visit before you make the journey.
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            Check slot availability at your nearest procurement center, view live queues, and complete your Mandi visit with confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/farmer/login">
              <Button variant="primary" size="lg" className="bg-primary hover:bg-[#155c30] text-white">
                Book a Slot
              </Button>
            </Link>
            <Link href="/farmer/centers">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                Find a Procurement Center
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </FooterShell>
  );
}
