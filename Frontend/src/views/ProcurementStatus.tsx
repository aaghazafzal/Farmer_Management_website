"use client";

import { useState } from "react";
import { Icon, Card, Button } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";
import { ACTIVE_BOOKING } from "../lib/mockData";
import { useStaffContext } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

export default function ProcurementStatus({ navigate }: Props) {
  const { t, isRTL } = useLanguage();
  const { farmerBooking } = useStaffContext();
  const booking = farmerBooking || ACTIVE_BOOKING;

  const isCompleted = booking.status === "completed";
  const isProcessing = booking.status === "processing";
  const isDelayed = booking.status === "delayed";

  const workflowSteps = [
    { title: t("stage_booking_confirmed", "Booking Confirmed"), time: "11 Sep · 3:42 PM", status: "completed" as const, desc: "Reserved slot confirmed for 85 qtl Wheat." },
    { title: t("stage_visited_centre", "Visit Centre"), time: "12 Sep · 10:18 AM", status: "completed" as const, desc: "Arrived at Gate 2 and vehicle checked in." },
    { title: t("stage_queue_assigned", "Queue Assigned"), time: "12 Sep · 10:20 AM", status: "completed" as const, desc: `Token ${booking.queuePosition} assigned to weighment bay.` },
    {
      title: t("stage_procurement_progress", "Procurement in Progress"),
      time: isCompleted ? "10:48 AM · Finished" : isProcessing ? `${t("in_progress", "In progress")} · ${booking.weighbridgeBay}` : isDelayed ? "Delayed · Moisture Check" : t("pending_label", "Pending"),
      status: isCompleted ? ("completed" as const) : (isProcessing || isDelayed) ? ("active" as const) : ("pending" as const),
      desc: isCompleted ? "Produce weighed and passed." : isDelayed ? (booking.delayReason || "Awaiting recalibration.") : "Produce received and processing has begun.",
    },
    {
      title: t("stage_quality_verification", "Quality Verification"),
      time: isCompleted ? "11:08 AM · Passed" : isProcessing ? "Sampling in progress" : t("pending_label", "Pending"),
      status: isCompleted ? ("completed" as const) : isProcessing ? ("active" as const) : ("pending" as const),
      desc: "Moisture and foreign matter inspection.",
    },
    {
      title: t("stage_completed", "Completed"),
      time: isCompleted ? "Receipt Generated" : t("pending_label", "Pending"),
      status: isCompleted ? ("completed" as const) : ("pending" as const),
      desc: "Final weighment slip and procurement record generated.",
    },
  ];

  const auditEvents = [
    {
      time: "10:48 AM",
      title: t("event_procurement_started", "Procurement Started"),
      desc: t("event_procurement_started_desc", "Produce received on Bay 2 weighbridge."),
      type: "active",
    },
    {
      time: "10:20 AM",
      title: t("event_queue_assigned", "Queue Assigned"),
      desc: t("event_queue_assigned_desc", "Token #08 verified and queued for weighment."),
      type: "completed",
    },
    {
      time: "10:18 AM",
      title: t("event_visited_centre", "Visited Centre"),
      desc: t("event_visited_centre_desc", "Gate 2 arrival registered by staff."),
      type: "completed",
    },
    {
      time: "11 Sep · 3:42 PM",
      title: t("event_booking_confirmed", "Booking Confirmed"),
      desc: t("event_booking_confirmed_desc", "Slot 10:30–11:00 AM reserved by farmer."),
      type: "completed",
    },
  ];

  return (
    <FarmerShell navigate={navigate} current="procurement-status" title={t("procurement_status_page_title", "Procurement Status")}>

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP CONSOLE (Tight Spacing, Restrained Aesthetics, Fit-to-Screen)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-3.5 max-w-7xl mx-auto px-6 pt-3 pb-8">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display text-foreground tracking-tight">
              {t("procurement_status_page_title", "Procurement Status")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("procurement_status_page_sub", "Follow your procurement from arrival to completion.")}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isCompleted
                ? "text-green-800 bg-green-50 border-green-200"
                : isProcessing
                ? "text-blue-800 bg-blue-50 border-blue-200"
                : "text-amber-800 bg-amber-50 border-amber-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCompleted ? "bg-green-600" : isProcessing ? "bg-blue-600 animate-pulse" : "bg-amber-600"}`} />
              {isCompleted ? t("status_completed", "Completed · Slip Issued") : isProcessing ? `${t("in_progress", "In Progress")} · ${booking.weighbridgeBay}` : t("confirmed", "Confirmed · Gate 2")}
            </span>
            <Button size="sm" variant="outline" onClick={() => navigate("queue-tracking")} icon={<Icon name="queue" size={14} />}>
              {t("btn_back_to_queue", `Queue Position (${booking.queuePosition})`)}
            </Button>
          </div>
        </div>

        {/* 12-Col Grid: 7 cols Status & Details + 5 cols Timeline & Summary */}
        <div className="grid grid-cols-12 gap-4 items-start">
          
          {/* LEFT: Current Status & Details (7 Cols) */}
          <div className="col-span-7 space-y-3">
            
            {/* CENTRE STATUS Header Card */}
            <Card className="p-3.5 border border-border bg-white shadow-2xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("centre_status_header", "CENTRE STATUS")}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? "bg-green-600" : isProcessing ? "bg-blue-600 animate-pulse" : "bg-amber-600"}`} />
                    <h2 className="text-lg font-bold font-display text-foreground">
                      {isCompleted ? t("stage_completed", "Procurement Completed") : isProcessing ? t("weighment_in_progress_title", "Weighment in Progress") : isDelayed ? "Inspection Delayed" : t("scheduled", "Visit Scheduled")}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {booking.centre} · {booking.weighbridgeBay}
                  </p>
                </div>

                <div className="text-right text-xs">
                  <span className="text-muted-foreground">{t("last_updated_label", "Last updated:")} </span>
                  <strong className="text-foreground">{booking.lastUpdated || "10:48 AM"}</strong>
                </div>
              </div>

              {/* Booking Summary Strip */}
              <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-[#fcfaf7] border border-border text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{t("centre", "Centre")}</p>
                  <p className="font-bold text-foreground truncate mt-0.5">{booking.centre}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{t("booking_id_label", "Booking ID")}</p>
                  <p className="font-mono font-bold text-foreground mt-0.5">{booking.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{t("label_date", "Date")}</p>
                  <p className="font-bold text-foreground mt-0.5">{booking.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{t("label_slot", "Slot")}</p>
                  <p className="font-bold text-foreground mt-0.5">{booking.slot}</p>
                </div>
              </div>

              {/* Status Details: Procurement Details */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("procurement_details_heading", "PROCUREMENT DETAILS")}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    {t("prototype_demo_note", "Recorded at weighbridge")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div className="p-2 bg-[#fcfaf7] rounded-xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("gross_weight_label", "Gross Weight")}</p>
                    <p className="text-sm font-bold font-display text-foreground mt-0.5">{booking.procurementDetails.grossWeight}</p>
                    <span className="inline-block text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.2 rounded border border-green-200 mt-1">
                      {booking.procurementDetails.grossWeightStatus}
                    </span>
                  </div>

                  <div className="p-2 bg-[#fcfaf7] rounded-xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("moisture_label", "Moisture")}</p>
                    <p className="text-sm font-bold font-display text-foreground mt-0.5">{booking.procurementDetails.moisture}</p>
                    <span className="inline-block text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.2 rounded border border-green-200 mt-1">
                      {booking.procurementDetails.moistureStatus}
                    </span>
                  </div>

                  <div className="p-2 bg-[#fcfaf7] rounded-xl border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("grade_label", "Grade")}</p>
                    <p className="text-sm font-bold font-display text-primary mt-0.5">{booking.procurementDetails.grade}</p>
                    <span className="inline-block text-[10px] font-semibold text-primary bg-secondary px-1.5 py-0.2 rounded border border-green-200 mt-1">
                      {booking.procurementDetails.gradeStatus}
                    </span>
                  </div>
                </div>

                {/* Inspector Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border/70">
                  <span>{t("assigned_inspector_label", "Assigned inspector:")} <strong className="text-foreground">{booking.procurementDetails.inspector}</strong></span>
                  <span className={isCompleted ? "text-green-700 font-semibold" : "text-blue-700 font-semibold"}>
                    {isCompleted ? t("inspection_passed", "Procurement verified and completed") : t("inspection_in_progress", "Quality verification in progress")}
                  </span>
                </div>
              </div>
            </Card>

            {/* Event Audit Log */}
            <Card className="p-3 border border-border bg-white space-y-1.5 shadow-2xs">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t("status_history_heading", "STATUS HISTORY")}
              </h3>

              <div className="space-y-1.5">
                {auditEvents.map((evt, idx) => (
                  <div key={idx} className="p-2 rounded-xl border border-border bg-[#fcfaf7] flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{evt.title}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{evt.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{evt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* RIGHT: Compact Timeline & Summary (5 Cols) */}
          <div className="col-span-5 space-y-3">
            
            {/* FROM BOOKING TO COMPLETION Compact Timeline */}
            <Card className="p-3.5 border border-border bg-white shadow-2xs">
              <div className="mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t("timeline_heading", "FROM BOOKING TO COMPLETION")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("timeline_sub", "Progress through the procurement process")}
                </p>
              </div>

              <div className="space-y-2 relative pl-1.5">
                {/* Connecting Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

                {workflowSteps.map((step, idx) => {
                  const isDone = step.status === "completed";
                  const isActive = step.status === "active";

                  return (
                    <div key={idx} className="relative flex items-start gap-2.5 text-xs">
                      {/* Node Bullet */}
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 z-10 ${
                          isDone
                            ? "bg-primary text-white"
                            : isActive
                            ? "bg-blue-600 text-white ring-2 ring-blue-100"
                            : "bg-[#f7f4ef] text-muted-foreground border border-border"
                        }`}
                      >
                        {isDone ? "✓" : isActive ? "●" : "○"}
                      </span>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-bold ${isActive ? "text-blue-700" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono">{step.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* PROCUREMENT SUMMARY Card */}
            <Card className="p-3 border border-border bg-[#fcfaf7] shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name="shield" size={14} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t("procurement_summary_title", "PROCUREMENT SUMMARY")}
                </h3>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">{t("current_stage_label", "Current stage:")}</span>
                  <span className="font-bold text-foreground">
                    {isCompleted ? t("stage_completed", "Completed & Slip Issued") : isProcessing ? t("weighment_in_progress", "Weighment in Progress") : t("scheduled", "Visit Scheduled")}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">{t("next_stage_label", "Next:")}</span>
                  <span className="font-semibold text-primary">
                    {isCompleted ? "Payment & Settlement" : isProcessing ? t("quality_verification", "Quality Verification") : "Bay Weighment"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t("token_ref", "Reference:")}</span>
                  <span className="font-mono text-muted-foreground">{booking.queuePosition} · {booking.id}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border/60 leading-snug">
                Official weighment slip is generated upon quality verification by centre staff.
              </p>
            </Card>

          </div>

        </div>

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE VIEW (md:hidden, Tight, Polished)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3 px-4 pt-3 pb-24">
        
        <div>
          <h1 className="text-lg font-bold font-display text-foreground">
            {t("procurement_status_page_title", "Procurement Status")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("procurement_status_page_sub", "Follow your procurement from arrival to completion.")}
          </p>
        </div>

        {/* Current Status Mobile Card */}
        <Card className="p-3 border border-border space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("centre_status_header", "CENTRE STATUS")}
            </span>
            <span className="text-xs font-semibold text-primary">{booking.weighbridgeBay}</span>
          </div>

          <div>
            <h2 className="text-sm font-bold font-display text-foreground">
              ● {isCompleted ? t("stage_completed", "Completed & Slip Issued") : isProcessing ? t("weighment_in_progress_title", "Weighment in Progress") : t("scheduled", "Scheduled Visit")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {booking.centre} · Booking {booking.id}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-[#fcfaf7] border border-border text-center text-xs">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase">Gross Wt</p>
              <p className="font-bold text-foreground mt-0.5">{booking.procurementDetails.grossWeight}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase">Moisture</p>
              <p className="font-bold text-foreground mt-0.5">{booking.procurementDetails.moisture}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase">Grade</p>
              <p className="font-bold text-primary mt-0.5">{booking.procurementDetails.grade}</p>
            </div>
          </div>
        </Card>

        {/* Compact Workflow Timeline Mobile */}
        <Card className="p-3 space-y-2 border border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("timeline_heading", "FROM BOOKING TO COMPLETION")}
          </p>

          <div className="space-y-1.5">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                    step.status === "completed" ? "bg-primary text-white" : step.status === "active" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {step.status === "completed" ? "✓" : step.status === "active" ? "●" : "○"}
                  </span>
                  <span className={step.status === "active" ? "font-bold text-blue-700" : ""}>{step.title}</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{step.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Procurement Summary Mobile */}
        <div className="p-2.5 bg-[#fcfaf7] border border-border rounded-xl text-xs space-y-1">
          <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">{t("procurement_summary_title", "PROCUREMENT SUMMARY")}</p>
          <p className="text-foreground">{t("current_stage_label", "Current stage:")} <strong>{isCompleted ? t("stage_completed", "Completed & Slip Issued") : isProcessing ? t("weighment_in_progress", "Weighment in Progress") : t("scheduled", "Visit Scheduled")}</strong></p>
          <p className="text-muted-foreground">{t("next_stage_label", "Next:")} <strong>{isCompleted ? "Settlement Processing" : t("quality_verification", "Quality Verification")}</strong></p>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-border z-30">
          <div className="max-w-md mx-auto">
            <Button fullWidth size="md" onClick={() => navigate("queue-tracking")} icon={<Icon name="queue" size={16} />}>
              {t("btn_back_to_queue", `View Queue Tracker (${booking.queuePosition})`)}
            </Button>
          </div>
        </div>

      </div>

    </FarmerShell>
  );
}
