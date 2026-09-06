"use client";

import { useState } from "react";
import { Button, Icon, Card, Timeline } from "../components/ui";
import type { TimelineStep } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";
import { ACTIVE_BOOKING } from "../lib/mockData";
import { useStaffContext } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

export default function FarmerDashboard({ navigate }: Props) {
  const { t } = useLanguage();
  const { farmerBooking, farmerNotifications } = useStaffContext();
  const booking = farmerBooking || ACTIVE_BOOKING;

  const isCompleted = booking.status === "completed";
  const isProcessing = booking.status === "processing";
  const isDelayed = booking.status === "delayed";

  // Snug vertical procurement timeline matching live application state
  const timelineSteps: TimelineStep[] = [
    { label: t("stage_booking_confirmed", "Booking Confirmed"), time: "11 Sep · 3:42 PM", status: "done" },
    { label: t("stage_visited_centre", "Visit Centre"), time: "12 Sep · 10:18 AM", status: "done" },
    { label: t("stage_queue_assigned", "Queue Assigned"), time: "12 Sep · 10:20 AM", status: "done" },
    {
      label: t("stage_procurement_progress", "Procurement in Progress"),
      time: isCompleted
        ? "10:48 AM · Finished"
        : isProcessing
        ? `${t("in_progress", "In progress")} · ${booking.weighbridgeBay}`
        : isDelayed
        ? "Delayed · Moisture Check"
        : t("pending", "Pending"),
      status: isCompleted ? "done" : isProcessing || isDelayed ? "active" : "pending",
    },
    {
      label: t("stage_quality_verification", "Quality Verification"),
      time: isCompleted ? "11:08 AM · Passed" : isProcessing ? "Sampling in progress" : t("pending", "Pending"),
      status: isCompleted ? "done" : isProcessing ? "active" : "pending",
    },
    {
      label: t("stage_completed", "Completed"),
      time: isCompleted ? "Receipt Generated" : t("pending", "Pending"),
      status: isCompleted ? "done" : "pending",
    },
  ];

  // Exactly four actions without unsupported claims
  const quickActions = [
    {
      icon: "calendar",
      label: t("book_new_slot", "Book Slot"),
      sub: t("choose_date_time", "Choose date & time"),
      view: "slot-booking",
      color: "bg-primary text-white",
    },
    {
      icon: "search",
      label: t("find_nearby_centre", "Find Centre"),
      sub: t("compare_centres", "Compare queues & slots"),
      view: "find-center",
      color: "bg-secondary text-primary",
    },
    {
      icon: "booking",
      label: t("tab_bookings", "My Bookings"),
      sub: t("view_booking_history", "Active & past visits"),
      view: "my-bookings",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: "help",
      label: t("help_faqs", "Help & FAQs"),
      sub: t("guide_support", "Guide & procedures"),
      view: "help",
      color: "bg-amber-100 text-amber-800",
    },
  ];

  // Operational notifications with real timestamps + dynamic broadcast alerts from centre staff
  const baselineNotifications = [
    {
      title: t("procurement_update_title", "Procurement in Progress"),
      desc: t("procurement_update_desc", "Produce received on Bay 2 weighbridge."),
      time: "10:48 AM",
      type: "success" as const,
    },
    {
      title: t("queue_updated_title", "Queue Token Assigned"),
      desc: t("queue_updated_desc", "You are token #08 in the queue."),
      time: "10:20 AM",
      type: "info" as const,
    },
    {
      title: t("wait_updated_title", "Estimated Wait"),
      desc: t("wait_updated_desc", "Estimated wait is ~35 minutes."),
      time: "10:14 AM",
      type: "info" as const,
    },
    {
      title: t("booking_confirmed_title", "Booking Confirmed"),
      desc: t("booking_confirmed_desc", "Slot 10:30–11:00 AM reserved for 85 qtl Wheat."),
      time: "11 Sep",
      type: "success" as const,
    },
  ];

  const displayNotifications = [
    ...(farmerNotifications || []).map(a => ({
      title: a.title,
      desc: a.desc,
      time: a.time,
      type: a.type as "success" | "info" | "warning" | "error",
    })),
    ...baselineNotifications,
  ].slice(0, 4);

  const beforeYouVisitItems = [
    t("byv_1", "Keep booking reference KS-240912-0842 ready"),
    t("byv_2", "Bring land records and Aadhaar card"),
    t("byv_3", "Enter through Gate 2 at 10:15 AM"),
    t("byv_4", "Follow centre staff instructions upon arrival"),
  ];

  return (
    <FarmerShell navigate={navigate} current="farmer-dashboard">

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP DASHBOARD (12-Col Split)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:grid grid-cols-12 gap-6 items-start max-w-7xl mx-auto px-6 pt-5 pb-10">
        
        {/* LEFT COLUMN: The Farmer's Visit Hub (8 Cols) */}
        <div className="col-span-8 space-y-5">
          
          {/* Welcome Strip */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-xs font-bold text-primary uppercase tracking-wider bg-secondary px-2.5 py-0.5 rounded-full border border-green-200">
                {t("farmer_coordination_portal", "Farmer Coordination Portal")}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {t("core_promise", "Plan your visit · Know your queue · Track procurement")}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground mt-1">
              {t("welcome_farmer", "Welcome back,")} Ramesh Kumar
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("farmer_dashboard_subtitle", "Here is exactly what you need to know about your procurement visit today.")}
            </p>
          </div>

          {/* PRIMARY CARD: Today's Active Procurement Visit */}
          <Card className="overflow-hidden border-2 border-primary/30 shadow-xs bg-white">
            {/* Header: Clean restrained green accent, NOT overwhelming solid block */}
            <div className="bg-[#fcfaf7] border-b border-border px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {t("active_visit_label", "TODAY'S PROCUREMENT VISIT")}
                  </span>
                  <h2 className="text-lg font-bold font-display text-foreground leading-tight">
                    {booking.centre}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200 capitalize">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {t(booking.status, booking.status)}
                </span>
                <span className="font-mono text-xs text-muted-foreground bg-white px-2 py-0.5 rounded border border-border">
                  {booking.id}
                </span>
              </div>
            </div>

            {/* Core 4-Column Visit Metrics: When, Where, Queue, Wait */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#fcfaf7] border border-border text-center">
                {/* 1. Date & Gate Entry */}
                <div className="text-left px-2">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    {t("appointment_date", "VISIT DATE")}
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {booking.date}
                  </p>
                  <p className="text-xs text-green-800 font-semibold mt-0.5">
                    {t("gate_entry", "Gate Entry")}: {booking.gateEntry}
                  </p>
                </div>

                {/* 2. Reserved Slot */}
                <div className="text-left px-2 border-l border-border">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    {t("reserved_slot", "RESERVED SLOT")}
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {booking.slot}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {booking.weighbridgeBay}
                  </p>
                </div>

                {/* 3. Queue Position (Central Differentiator) */}
                <div className="text-left px-2 border-l border-border bg-green-50/50 rounded-lg p-1.5 -my-1">
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">
                    {t("your_token", "YOUR QUEUE")}
                  </p>
                  <p className="font-black text-2xl text-primary font-display mt-0.5 leading-none">
                    {booking.queuePosition}
                  </p>
                  <p className="text-xs text-green-700 font-bold mt-1">
                    {booking.tokensAhead} {t("tokens_ahead", "tokens ahead")}
                  </p>
                </div>

                {/* 4. Estimated Wait */}
                <div className="text-left px-2 border-l border-border">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    {t("estimated_wait", "ESTIMATED WAIT")}
                  </p>
                  <p className="font-bold text-xl text-amber-700 font-display mt-0.5 leading-none">
                    ~{booking.estimatedWait}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Turn: ~{booking.approxTurn}
                  </p>
                </div>
              </div>

              {/* CTAs with clear primary vs secondary hierarchy */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <Button
                    size="md"
                    onClick={() => navigate("queue-tracking")}
                    icon={<Icon name="queue" size={17} />}
                  >
                    {t("track_live_queue_pos", "Track Live Queue Position")}
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => navigate("procurement-status")}
                    icon={<Icon name="procurement" size={16} />}
                  >
                    {t("view_procurement_status", "Procurement Status")}
                  </Button>
                  <Button
                    size="md"
                    variant="ghost"
                    onClick={() => navigate("center-detail")}
                    icon={<Icon name="pin" size={15} />}
                  >
                    {t("get_directions", "Directions")}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <span>{booking.commodity} · {booking.quantity}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* PROCUREMENT PROGRESS (Snug, compact timeline) */}
          <Card className="p-5 border border-border shadow-2xs bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground font-display tracking-tight">
                  {t("procurement_progress_title", "PROCUREMENT PROGRESS")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("stage_indicator", `Current stage: ${isCompleted ? "Completed" : isProcessing ? "Weighment in Progress" : isDelayed ? "Delayed Verification" : "In Queue"} · ${booking.weighbridgeBay}`)}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("procurement-status")}>
                {t("btn_view_details", "View Full Audit Timeline →")}
              </Button>
            </div>
            <Timeline steps={timelineSteps} compact />
          </Card>

          {/* BEFORE YOU VISIT CHECKLIST */}
          <Card className="p-4 border border-border bg-[#fdfbf9] shadow-2xs">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {t("before_you_visit", "BEFORE YOU ARRIVE")}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-foreground/85">
              {beforeYouVisitItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Icon name="check" size={13} className="text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: Operational Context & Smart Recommendations (4 Cols) */}
        <div className="col-span-4 space-y-5">
          
          {/* 1. Centre Operational Summary */}
          <Card className="p-4 border border-border shadow-2xs bg-white">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("centre_status_title", "CENTRE STATUS")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {t("center_open", "Open Now")}
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground font-display">
              {booking.centre}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">{booking.centreAddress}</p>

            <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-border mt-3 text-center text-xs">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">{t("current_queue", "Queue")}</p>
                <p className="text-base font-bold text-foreground mt-0.5 font-display">27</p>
                <p className="text-[10px] text-muted-foreground">{t("farmers", "farmers")}</p>
              </div>
              <div className="border-x border-border">
                <p className="text-[10px] text-muted-foreground uppercase">{t("est_center_wait", "Avg Wait")}</p>
                <p className="text-base font-bold text-amber-700 mt-0.5 font-display">~35 min</p>
                <p className="text-[10px] text-muted-foreground">{t("est_average", "flow normal")}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">{t("next_slot", "Next Slot")}</p>
                <p className="text-base font-bold text-primary mt-0.5 font-display">2:30 PM</p>
                <p className="text-[10px] text-muted-foreground">{t("available", "available")}</p>
              </div>
            </div>
          </Card>

          {/* 2. Smart Slot Recommendation Card */}
          <Card className="p-4 border border-green-200 bg-secondary/60 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <Icon name="star" size={14} className="text-amber-500" />
                {t("smart_recommendation", "RECOMMENDED SLOT")}
              </span>
              <span className="text-[10px] font-bold text-green-800 bg-white px-2 py-0.5 rounded border border-green-200">
                {t("fastest", "Lowest Wait")}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-foreground text-sm">Tomorrow · 10:30–11:00 AM</p>
              <p className="text-muted-foreground">Estimated wait: <strong className="text-primary">~20 min</strong></p>
              <p className="text-[11px] text-muted-foreground pt-1">
                Why recommended: Lower expected queue traffic than afternoon slots.
              </p>
            </div>

            <Button
              fullWidth
              size="sm"
              variant="outline"
              className="mt-3 bg-white"
              onClick={() => navigate("slot-booking")}
            >
              {t("btn_book_recommended", "Book This Slot")}
            </Button>
          </Card>

          {/* 3. Quick Actions Grid (Exactly 4 clean buttons) */}
          <Card className="p-4 border border-border shadow-2xs bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              {t("quick_actions", "QUICK ACTIONS")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(a => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.view)}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-border hover:border-primary/50 hover:bg-secondary/20 transition-all text-left group cursor-pointer"
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${a.color} shadow-2xs`}>
                    <Icon name={a.icon} size={15} />
                  </span>
                  <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors leading-tight">
                    {a.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {a.sub}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* 4. Operational Activity / Bulletins */}
          <Card className="p-4 border border-border shadow-2xs bg-white">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              {t("recent_activity", "CENTRE BULLETINS")}
            </p>
            <div className="space-y-2">
              {displayNotifications.map((n, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-xl bg-[#fcfaf7] border border-border/80 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    n.type === "success" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    <Icon name={n.type === "success" ? "check" : "info"} size={11} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-foreground truncate text-[11px]">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE DASHBOARD (md:hidden compact layout)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-4 px-4 pt-4 pb-20">
        
        {/* Mobile Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">
              {t("welcome_farmer", "Welcome back,")} Ramesh
            </h1>
            <p className="text-xs text-muted-foreground">
              {booking.centre}
            </p>
          </div>
          <span className="text-xs font-bold text-primary bg-secondary px-2.5 py-1 rounded-full border border-green-200">
            {booking.queuePosition}
          </span>
        </div>

        {/* Primary Mobile Card: Active Procurement Visit */}
        <Card className="p-4 border-2 border-primary/30 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {t("active_visit_label", "TODAY'S VISIT")}
            </span>
            <span className="text-xs font-semibold text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              {t("confirmed", "Confirmed")}
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold font-display text-foreground">{booking.centre}</h2>
            <p className="text-xs text-muted-foreground">{booking.commodity} · {booking.quantity}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#fcfaf7] border border-border text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("label_slot", "Slot")}</p>
              <p className="font-bold text-foreground">{booking.slot}</p>
              <p className="text-[10px] text-muted-foreground">{t("gate_entry", "Gate")}: {booking.gateEntry}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("queue_position_label", "Queue")}</p>
              <p className="text-lg font-bold text-primary">{booking.queuePosition}</p>
              <p className="text-[10px] text-green-700 font-semibold">{booking.tokensAhead} {t("tokens_ahead", "ahead")}</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Button fullWidth size="sm" onClick={() => navigate("queue-tracking")} icon={<Icon name="queue" size={15} />}>
              {t("track_live_queue_pos", "Track Live Queue")}
            </Button>
            <Button fullWidth size="sm" variant="outline" onClick={() => navigate("procurement-status")} icon={<Icon name="procurement" size={15} />}>
              {t("view_procurement_status", "Procurement Status")}
            </Button>
          </div>
        </Card>

        {/* Mobile Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.view)}
              className="p-3 bg-white rounded-xl border border-border flex items-center gap-2.5 text-left cursor-pointer"
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`}>
                <Icon name={a.icon} size={16} />
              </span>
              <div>
                <p className="font-bold text-xs text-foreground leading-tight">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile Timeline */}
        <Card className="p-4 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("procurement_progress_title", "PROCUREMENT PROGRESS")}
          </p>
          <Timeline steps={timelineSteps} compact />
        </Card>

      </div>

    </FarmerShell>
  );
}
