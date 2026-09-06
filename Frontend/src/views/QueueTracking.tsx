"use client";

import { useState } from "react";
import { Button, Icon, Card } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";
import { ACTIVE_BOOKING } from "../lib/mockData";
import { useStaffContext } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

export default function QueueTracking({ navigate }: Props) {
  const { t, isRTL } = useLanguage();
  const { farmerBooking, queue } = useStaffContext();
  const booking = farmerBooking || ACTIVE_BOOKING;

  const [refreshing, setRefreshing] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(booking.lastUpdated || "10:48 AM");

  // Determine currently serving item
  const servingItem = queue.find(q => q.status === "processing");
  const nowServingToken = servingItem ? servingItem.n : booking.nowServing;

  // Build live queue sequence from staff queue
  const userToken = booking.queuePosition;
  const activeItems = queue.filter(q => q.status !== "completed").slice(0, 5);
  const queueSequence = activeItems.length > 0
    ? activeItems.map(item => {
        const isYou = item.n === userToken || item.name.toLowerCase().includes("ramesh");
        const isServing = item.status === "processing";
        return {
          token: item.n,
          status: isYou ? "you" : isServing ? "serving" : "waiting",
          label: isYou ? t("you_label", "YOU") : isServing ? t("now_serving_label", "Now serving") : t("waiting_label", "Waiting"),
          time: isServing
            ? `Started ${booking.servingStarted || "10:48 AM"}`
            : `Estimated wait: ~${item.estimatedWait || "15 mins"}`,
        };
      })
    : [
        { token: "#05", status: "serving", label: t("now_serving_label", "Now serving"), time: "Started 10:48 AM" },
        { token: "#06", status: "waiting", label: t("waiting_label", "Waiting"), time: "Estimated turn 11:00 AM" },
        { token: "#07", status: "waiting", label: t("waiting_label", "Waiting"), time: "Estimated turn 11:10 AM" },
        { token: "#08", status: "you",     label: t("you_label", "YOU"), time: "Estimated turn 11:15 AM" },
        { token: "#09", status: "waiting", label: t("waiting_label", "Waiting"), time: "Estimated turn 11:30 AM" },
      ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdatedTime("Just now");
    }, 600);
  };

  return (
    <FarmerShell navigate={navigate} current="queue-tracking" title={t("queue_tracker_page_title", "Live Queue Tracker")}>

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP QUEUE CONSOLE (Tight Spacing, Restrained Green, Fit-to-Screen)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-3.5 max-w-7xl mx-auto px-6 pt-3 pb-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-foreground tracking-tight">
                {t("queue_tracker_page_title", "Live Queue Tracker")}
              </h1>
              <span className="text-xs font-mono font-bold bg-[#f7f4ef] text-muted-foreground px-2 py-0.5 rounded border border-border">
                {booking.id}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {booking.centre} · {booking.weighbridgeBay}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white px-2.5 py-1 rounded-full border border-border shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t("live_queue_updates", "Live Queue Updates")}
            </span>

            <button
              onClick={handleRefresh}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-white border border-border rounded-xl hover:bg-muted text-foreground transition-all cursor-pointer ${
                refreshing ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <Icon name="refresh" size={13} className={refreshing ? "animate-spin text-primary" : "text-muted-foreground"} />
              {refreshing ? t("updating", "Updating...") : t("btn_refresh", "Refresh")}
            </button>
          </div>
        </div>

        {/* 12-Col Split: 6 cols Main Token Card + 6 cols Queue Sequence */}
        <div className="grid grid-cols-12 gap-4 items-start">
          
          {/* LEFT: Authoritative, Calm Token Card & Instructions (6 Cols) */}
          <div className="col-span-6 space-y-3">
            
            {/* Main Token Position Card (Calm white, restrained green) */}
            <Card className="overflow-hidden border border-border shadow-2xs bg-white">
              {/* Header Bar */}
              <div className="bg-[#fcfaf7] border-b border-border px-4 py-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("your_queue_position_label", "YOUR QUEUE POSITION")}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {t("queue_status_normal", "Moving normally")}
                </span>
              </div>

              {/* Large, Authoritative Token Number */}
              <div className="px-4 py-4 text-center bg-white">
                <div className="text-5xl font-black font-display text-primary tracking-tight leading-none">
                  {booking.queuePosition}
                </div>
                <p className="text-xs font-medium text-muted-foreground mt-1.5">
                  <strong className="text-foreground font-semibold">{booking.tokensAhead} tokens ahead</strong> · Currently serving <span className="font-bold text-foreground">{nowServingToken}</span>
                </p>

                {/* 2-Column Compact Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#fcfaf7] border border-border/80 mt-3 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("estimated_waiting_label", "Estimated Wait")}</p>
                    <p className="text-lg font-bold font-display text-amber-700 mt-0.5">~{booking.estimatedWait}</p>
                    <p className="text-[10px] text-muted-foreground">Based on bay speed</p>
                  </div>
                  <div className="border-l border-border/80">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("approx_turn_label", "Approximate Turn")}</p>
                    <p className="text-lg font-bold font-display text-foreground mt-0.5">{booking.approxTurn}</p>
                    <p className="text-[10px] text-muted-foreground">Arrive before turn</p>
                  </div>
                </div>
              </div>

              {/* Footer status line */}
              <div className="px-4 py-2 bg-[#fdfbf9] border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{booking.commodity} · {booking.quantity}</span>
                <span>{t("last_updated_label", "Last updated:")} <strong>{lastUpdatedTime}</strong></span>
              </div>
            </Card>

            {/* Queue Alerts Switch Card (Compact, Quiet, Restrained) */}
            <Card className="p-3 border border-border bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#f7f4ef] text-muted-foreground flex items-center justify-center border border-border">
                    <Icon name="bell" size={13} />
                  </span>
                  <div>
                    <h2 className="text-xs font-bold text-foreground font-display">
                      {t("queue_alerts_title", "Queue Alerts")}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {t("queue_alerts_desc", "Get notified when your turn is getting closer.")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setAlertsEnabled(v => !v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    alertsEnabled
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-[#f7f4ef] text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {alertsEnabled ? "Alerts: On" : "Alerts: Off"}
                </button>
              </div>

              {alertsEnabled && (
                <div className="mt-2 pt-1.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Notification rule:</span>
                  <span className="font-medium text-foreground bg-[#fcfaf7] px-2 py-0.5 rounded border border-border">
                    {t("queue_alerts_rule", "Notify me when: 3 tokens ahead")}
                  </span>
                </div>
              )}
            </Card>

            {/* Before You Arrive Instructions Card (Tight, Compact) */}
            <Card className="p-3 border border-border bg-[#fdfbf9] shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t("before_you_arrive_title", "BEFORE YOU ARRIVE")}
              </p>
              <div className="space-y-1 text-xs text-foreground/90">
                {booking.arrivalInstructions.map((instruction, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-secondary text-primary font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{instruction}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* RIGHT: Live Queue Sequence (6 Cols, Tight Spacing, No Overkill Green) */}
          <div className="col-span-6 space-y-2.5">
            
            <Card className="p-3.5 border border-border bg-white shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h2 className="text-sm font-bold font-display text-foreground">
                    {t("live_queue_sequence_title", "Live Queue Sequence")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {booking.centre} · {booking.weighbridgeBay}
                  </p>
                </div>

                <span className="text-[11px] font-semibold text-foreground bg-[#f7f4ef] px-2 py-0.5 rounded-full border border-border">
                  {t("serving_badge", `Now Serving ${nowServingToken}`)}
                </span>
              </div>

              {/* Queue List with Tight, Clean Cards */}
              <div className="space-y-1.5">
                {queueSequence.map(item => {
                  const isYou = item.status === "you";
                  const isServing = item.status === "serving";

                  return (
                    <div
                      key={item.token}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        isYou
                          ? "bg-secondary/60 border-primary shadow-2xs"
                          : isServing
                          ? "bg-green-50/50 border-green-200"
                          : "bg-white border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs font-display ${
                            isYou
                              ? "bg-primary text-white"
                              : isServing
                              ? "bg-green-700 text-white"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {item.token}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-bold ${isYou ? "text-primary" : "text-foreground"}`}>
                              {item.label}
                            </p>
                            {isServing && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-1 py-0.2 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {item.time}
                          </p>
                        </div>
                      </div>

                      {isYou && (
                        <span className="text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded border border-primary/30">
                          {t("your_turn_indicator", "Your Reserved Turn")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px]">Tokens advance as produce is weighed.</span>
                <button
                  onClick={() => navigate("procurement-status")}
                  className="font-bold text-primary hover:underline text-xs cursor-pointer"
                >
                  {t("btn_track_procurement", "Procurement Status →")}
                </button>
              </div>
            </Card>

          </div>

        </div>

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE QUEUE VIEW (md:hidden, Tight, Polished)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3 px-4 pt-3 pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-display text-foreground">
              {t("queue_tracker_page_title", "Live Queue Tracker")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {booking.centre} · {booking.weighbridgeBay}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh} icon={<Icon name="refresh" size={13} />}>
            {refreshing ? "..." : t("btn_refresh", "Refresh")}
          </Button>
        </div>

        {/* Token Card Mobile (Clean white card with primary green token) */}
        <Card className="p-3.5 text-center border border-border bg-white space-y-1.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("your_queue_position_label", "YOUR QUEUE POSITION")}
          </p>
          <div className="text-4xl font-black font-display text-primary my-0.5">
            {booking.queuePosition}
          </div>
          <p className="text-xs text-muted-foreground font-semibold">
            {booking.tokensAhead} tokens ahead · Currently serving {nowServingToken}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-center text-xs mt-2">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold">Estimated Wait</p>
              <p className="font-bold text-amber-700 text-sm">~{booking.estimatedWait}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold">Approx. Turn</p>
              <p className="font-bold text-foreground text-sm">{booking.approxTurn}</p>
            </div>
          </div>
        </Card>

        {/* Operational Status Pill */}
        <div className="p-2 bg-white border border-border rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-600" />
            <span className="font-bold text-foreground">{t("queue_status_normal", "Queue moving normally")}</span>
          </div>
          <span className="text-muted-foreground text-[11px]">{t("last_updated_label", "Updated:")} {lastUpdatedTime}</span>
        </div>

        {/* Arrival Instructions Mobile Card */}
        <Card className="p-3 space-y-1 bg-[#fdfbf9] border border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            {t("before_you_arrive_title", "BEFORE YOU ARRIVE")}
          </p>
          {booking.arrivalInstructions.map((instruction, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
              <span className="w-3.5 h-3.5 rounded-full bg-secondary text-primary font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{instruction}</span>
            </div>
          ))}
        </Card>

        {/* Queue Sequence Mobile List */}
        <Card className="p-3 space-y-2 border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Queue Sequence</h2>
            <span className="text-[11px] font-semibold text-muted-foreground">Serving {nowServingToken}</span>
          </div>

          <div className="space-y-1.5">
            {queueSequence.map(item => {
              const isYou = item.status === "you";
              const isServing = item.status === "serving";

              return (
                <div
                  key={item.token}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                    isYou
                      ? "bg-secondary/60 border-primary font-bold"
                      : isServing
                      ? "bg-green-50/60 border-green-200"
                      : "bg-white border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                      isYou ? "bg-primary text-white" : isServing ? "bg-green-700 text-white" : "bg-muted text-foreground"
                    }`}>
                      {item.token}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">{item.time}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mobile Sticky Action Bar */}
        <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-border z-30">
          <div className="max-w-md mx-auto">
            <Button fullWidth size="md" onClick={() => navigate("procurement-status")} icon={<Icon name="procurement" size={16} />}>
              {t("btn_track_procurement", "Track Procurement Status")}
            </Button>
          </div>
        </div>

      </div>

    </FarmerShell>
  );
}
