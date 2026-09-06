"use client";

import { useState } from "react";
import { Button, Icon, Card, MetricCard } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext, QueueItem } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

const statusColors: Record<string, string> = {
  processing: "text-blue-700 bg-blue-50 border-blue-200",
  waiting:    "text-amber-700 bg-amber-50 border-amber-200",
  arrived:    "text-emerald-700 bg-emerald-50 border-emerald-200",
  delayed:    "text-red-700 bg-red-50 border-red-200",
  completed:  "text-gray-600 bg-gray-50 border-gray-200",
};

export default function StaffDashboard({ navigate }: Props) {
  const { t } = useLanguage();
  const {
    centre,
    queue,
    slots,
    alerts,
    activeQueueCount,
    completedTodayCount,
    delayedCount,
    totalBookedSlots,
    todaysFarmersCount,
    updateQueueStatus,
    callNextToken,
    showToast,
    createAlert,
  } = useStaffContext();

  const [inspectItem, setInspectItem] = useState<QueueItem | null>(null);
  const [quickAlertOpen, setQuickAlertOpen] = useState(false);
  const [quickAlertMsg, setQuickAlertMsg] = useState("");
  const [quickAlertType, setQuickAlertType] = useState<"queue" | "centre" | "procurement">("queue");

  // Get active queue items (first 6 for dashboard preview)
  const activeQueue = queue.filter(q => q.status !== "completed").slice(0, 6);

  // Quick Action: Call Next
  const handleCallNext = () => {
    const res = callNextToken();
    if (!res) {
      showToast("No farmers waiting in queue to call", "info");
    }
  };

  // Quick Action: Broadcast Alert
  const handleSendQuickAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAlertMsg.trim()) return;
    createAlert({
      type: quickAlertType,
      title: quickAlertType === "queue" ? "Queue Update" : "Centre Notification",
      message: quickAlertMsg.trim(),
      audience: "All active farmers in queue",
    });
    setQuickAlertMsg("");
    setQuickAlertOpen(false);
  };

  return (
    <StaffShell navigate={navigate} current="staff-dashboard">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                {t("operational_dashboard", "Operations Dashboard")}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Hub
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {centre.name} · {centre.location} · {centre.operatingHours}
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              icon={<Icon name="lightning" size={15} />}
              onClick={handleCallNext}
              className="bg-primary text-white hover:bg-[#155c30] shadow-sm font-semibold"
            >
              {t("call_next", "Call Next Token")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Icon name="booking" size={15} />}
              onClick={() => navigate("staff-slots")}
            >
              {t("nav_slots", "Manage Slots")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Icon name="profile" size={15} />}
              onClick={() => navigate("staff-farmers")}
            >
              {t("find_farmer", "Find Farmer")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Icon name="bell" size={15} />}
              onClick={() => setQuickAlertOpen(true)}
            >
              {t("broadcast_alert", "Broadcast Alert")}
            </Button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <MetricCard
            label={t("todays_farmers", "Today's Farmers")}
            value={todaysFarmersCount}
            icon="users"
            color="green"
            sub="Registered today"
          />
          <MetricCard
            label={t("booked_slots", "Booked Slots")}
            value={totalBookedSlots}
            icon="booking"
            color="blue"
            sub="Out of 140 capacity"
          />
          <MetricCard
            label={t("current_queue", "Active Queue")}
            value={activeQueueCount}
            icon="queue"
            color="amber"
            sub={t("active_now", "Active on site")}
          />
          <MetricCard
            label={t("status_completed", "Completed")}
            value={completedTodayCount}
            icon="check_circle"
            color="green"
            sub="Procurement verified"
          />
          <MetricCard
            label={t("delayed", "Delayed")}
            value={delayedCount}
            icon="warning"
            color="red"
            sub="Need attention"
          />
        </div>

        {/* Main Grid: Live Queue & Operational Sidebar */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Live Queue Table (2 cols on xl) */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="overflow-hidden border border-border bg-white shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-border gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-foreground font-display text-base">
                      {t("live_queue_preview", "Live Centre Queue")}
                    </h2>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                      {activeQueueCount} {t("in_queue", "waiting")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time token workflow and weighbridge handoff
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Icon name="refresh" size={13} />}
                    onClick={() => showToast("Live queue refreshed", "info")}
                  >
                    {t("btn_refresh", "Refresh")}
                  </Button>
                  <Button size="sm" onClick={() => navigate("staff-queue")}>
                    {t("manage_queue", "Full Queue →")}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[620px]">
                  <thead>
                    <tr className="border-b border-border bg-[#fbf9f5] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3.5">Token #</th>
                      <th className="px-4 py-3.5">Farmer & Phone</th>
                      <th className="px-4 py-3.5">Slot / Commodity</th>
                      <th className="px-4 py-3.5">Est. Wait</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeQueue.map(r => {
                      const isProcessing = r.status === "processing";
                      const isDelayed = r.status === "delayed";
                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            isProcessing ? "bg-blue-50/40" : isDelayed ? "bg-red-50/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3.5 font-mono font-bold text-foreground text-sm whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-muted font-bold text-foreground text-sm">
                              {r.n}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-semibold text-foreground">{r.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{r.phoneMasked}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-xs font-semibold text-foreground">{r.slot}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.commodity} · {r.quantity}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`text-xs sm:text-sm font-medium ${
                                isProcessing
                                  ? "text-blue-600 font-bold"
                                  : isDelayed
                                  ? "text-red-600 font-semibold"
                                  : "text-foreground"
                              }`}
                            >
                              {r.estimatedWait}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                                statusColors[r.status] || "text-gray-700 bg-gray-50 border-gray-200"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  r.status === "processing"
                                    ? "bg-blue-500 animate-pulse"
                                    : r.status === "delayed"
                                    ? "bg-red-500"
                                    : r.status === "arrived"
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isProcessing ? (
                                <button
                                  onClick={() => updateQueueStatus(r.n, "completed")}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
                                >
                                  {t("mark_complete", "Complete")}
                                </button>
                              ) : isDelayed ? (
                                <button
                                  onClick={() => updateQueueStatus(r.n, "waiting")}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-2xs"
                                >
                                  {t("resume_label", "Resume")}
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateQueueStatus(r.n, "processing")}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                                >
                                  {t("start_processing", "Start")}
                                </button>
                              )}
                              <button
                                onClick={() => setInspectItem(r)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                title="Inspect Farmer Details"
                              >
                                <Icon name="eye" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3.5 border-t border-border bg-[#fbf9f5] flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Showing {activeQueue.length} of {activeQueueCount} active tokens
                </span>
                <button
                  onClick={() => navigate("staff-queue")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{t("view_full_queue", "Go to Queue Management")}</span>
                  <Icon name="arrow_right" size={13} />
                </button>
              </div>
            </Card>

            {/* Operational Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <Icon name="check_circle" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Weighbridge Bay 1 &amp; Bay 2 Synchronized
                  </h3>
                  <p className="text-xs text-emerald-800/90 mt-0.5">
                    Moisture meter calibrated at 08:00 AM · Average weigh-in turnaround 12 minutes.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-emerald-300 text-emerald-900 shrink-0"
                onClick={() => navigate("staff-reports")}
              >
                View Analytics
              </Button>
            </div>
          </div>

          {/* Right Column: Centre Operating Status & Slot Capacity */}
          <div className="space-y-4">
            {/* Centre Operating Status Card */}
            <Card className="p-4 sm:p-5 border border-border bg-white shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="font-bold text-foreground font-display text-sm">
                    {t("centre_status", "Centre Operating Status")}
                  </h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Open
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Operating Hours:</span>
                  <span className="font-semibold text-foreground font-mono">08:00 – 17:00</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Daily Capacity Utilization:</span>
                  <span className="font-semibold text-foreground font-mono">68% (95 / 140 Bags)</span>
                </div>
                <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: "68%" }} />
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Next Review Time:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 text-xs">
                    12:30 PM (Midday Sync)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-border pt-2.5">
                  <span className="text-muted-foreground">Duty Incharge:</span>
                  <span className="font-semibold text-foreground">Raj Kumar (KS-STAFF-014)</span>
                </div>
              </div>
            </Card>

            {/* Slot Capacity Overview */}
            <Card className="p-4 sm:p-5 border border-border bg-white shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground font-display text-sm">
                  {t("todays_capacity", "Today's Slot Utilization")}
                </h2>
                <button
                  onClick={() => navigate("staff-slots")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Manage →
                </button>
              </div>

              <div className="space-y-2.5">
                {slots.slice(0, 6).map(s => {
                  const pct = Math.round((s.booked / s.capacity) * 100);
                  const isFull = s.status === "full" || pct >= 100;
                  const isClosed = s.status === "closed";
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-muted-foreground w-12 shrink-0">
                        {s.time}
                      </span>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isClosed
                              ? "bg-gray-400"
                              : isFull
                              ? "bg-red-500"
                              : pct >= 80
                              ? "bg-amber-500"
                              : "bg-primary"
                          }`}
                          style={{ width: `${isClosed ? 100 : pct}%` }}
                        />
                        <span className="absolute right-2 top-0.5 text-xs font-bold text-foreground drop-shadow-xs">
                          {isClosed ? "CLOSED" : `${s.booked}/${s.capacity}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Available
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> &gt;80%
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Full
                </div>
              </div>
            </Card>

            {/* Recent Alerts Feed */}
            <Card className="p-4 sm:p-5 border border-border bg-white shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground font-display text-sm">
                  {t("recent_alerts", "Active Alerts & Advisories")}
                </h2>
                <button
                  onClick={() => navigate("staff-notifications")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  All alerts →
                </button>
              </div>

              <div className="space-y-2">
                {alerts.slice(0, 3).map(a => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border text-xs flex gap-2.5 ${
                      a.type === "queue"
                        ? "bg-amber-50 border-amber-200 text-amber-950"
                        : a.type === "centre"
                        ? "bg-blue-50 border-blue-200 text-blue-950"
                        : "bg-emerald-50 border-emerald-200 text-emerald-950"
                    }`}
                  >
                    <Icon
                      name={a.type === "queue" ? "warning" : "info_icon"}
                      size={16}
                      className="shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate text-sm">{a.title}</p>
                      <p className="text-xs text-foreground/85 leading-snug line-clamp-2 mt-0.5">
                        {a.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.timestamp} · {a.audience}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Farmer Inspection Modal */}
        {inspectItem && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setInspectItem(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary text-white font-mono font-bold text-sm">
                    {inspectItem.n}
                  </span>
                  <h3 className="font-bold text-foreground font-display text-base">Farmer Detail</h3>
                </div>
                <button
                  onClick={() => setInspectItem(null)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-[#f7f4ef] p-3 rounded-xl">
                  <div>
                    <span className="text-muted-foreground">Farmer Name:</span>
                    <p className="font-bold text-foreground text-sm">{inspectItem.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Masked Contact:</span>
                    <p className="font-bold text-foreground text-sm font-mono">{inspectItem.phoneMasked}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Booking ID:</span>
                    <p className="font-mono text-foreground">{inspectItem.bookingId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slot Window:</span>
                    <p className="font-semibold text-foreground">{inspectItem.slot}</p>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commodity:</span>
                    <span className="font-semibold text-foreground">{inspectItem.commodity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Declared Quantity:</span>
                    <span className="font-semibold text-foreground">{inspectItem.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned Bay:</span>
                    <span className="font-semibold text-foreground font-mono">
                      {inspectItem.weighbridgeBay || "Bay 1 (Standard)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Status:</span>
                    <span className="font-semibold capitalize text-primary">{inspectItem.status}</span>
                  </div>
                  {inspectItem.delayReason && (
                    <div className="p-2 rounded bg-red-50 text-red-700 border border-red-200 mt-2">
                      <span className="font-bold">Delay Note:</span> {inspectItem.delayReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                {inspectItem.status !== "completed" && (
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => {
                      updateQueueStatus(inspectItem.n, "completed");
                      setInspectItem(null);
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setInspectItem(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Broadcast Alert Modal */}
        {quickAlertOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setQuickAlertOpen(false)}
          >
            <form
              onSubmit={handleSendQuickAlert}
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="bell" size={18} className="text-primary" />
                  <h3 className="font-bold text-foreground font-display text-base">
                    Quick Broadcast Alert
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickAlertOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Alert Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "queue", label: "Queue Delay" },
                      { id: "procurement", label: "Weighbridge" },
                      { id: "centre", label: "General" },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setQuickAlertType(cat.id as any)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center cursor-pointer transition-colors ${
                          quickAlertType === cat.id
                            ? "bg-primary text-white border-primary"
                            : "bg-[#f7f4ef] border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Target Farmers
                  </label>
                  <div className="p-2 rounded-lg bg-muted text-xs text-foreground font-medium">
                    All {activeQueueCount} farmers currently waiting in today&apos;s queue
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    rows={3}
                    value={quickAlertMsg}
                    onChange={e => setQuickAlertMsg(e.target.value)}
                    placeholder="e.g. Weighbridge Bay 2 moisture testing in progress. Token #07 please report to Desk A."
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button type="submit" size="sm" fullWidth>
                  Broadcast Immediately
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setQuickAlertOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
