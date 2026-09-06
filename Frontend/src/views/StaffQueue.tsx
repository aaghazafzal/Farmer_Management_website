"use client";

import { useState } from "react";
import { Button, Icon, Card } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext, QueueItem, QueueStatus } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

const statusColors: Record<QueueStatus, string> = {
  processing: "text-blue-700 bg-blue-50 border-blue-200",
  waiting:    "text-amber-700 bg-amber-50 border-amber-200",
  arrived:    "text-emerald-700 bg-emerald-50 border-emerald-200",
  delayed:    "text-red-700 bg-red-50 border-red-200",
  completed:  "text-gray-600 bg-gray-50 border-gray-200",
};

export default function StaffQueue({ navigate }: Props) {
  const { t } = useLanguage();
  const {
    queue,
    activeQueueCount,
    completedTodayCount,
    delayedCount,
    updateQueueStatus,
    callNextToken,
    showToast,
  } = useStaffContext();

  const [filter, setFilter] = useState<"all" | QueueStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<QueueItem | null>(null);

  // Modal Dialogs
  const [callNextConfirm, setCallNextConfirm] = useState<QueueItem | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<QueueItem | null>(null);
  const [delayModal, setDelayModal] = useState<QueueItem | null>(null);
  const [delayReason, setDelayReason] = useState("Verification taking longer");

  const processingCount = queue.filter(q => q.status === "processing").length;

  // Filtered queue
  const filteredQueue = queue.filter(item => {
    if (filter !== "all" && item.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchToken = item.n.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchPhone = item.phoneMasked.toLowerCase().includes(q);
      const matchBooking = item.bookingId.toLowerCase().includes(q);
      const matchCommodity = item.commodity.toLowerCase().includes(q);
      if (!matchToken && !matchName && !matchPhone && !matchBooking && !matchCommodity) {
        return false;
      }
    }
    return true;
  });

  // Handle Call Next Trigger
  const promptCallNext = () => {
    const nextWaiting = queue.find(f => f.status === "waiting" || f.status === "arrived");
    if (!nextWaiting) {
      showToast("No farmers currently in waiting or arrived status", "info");
      return;
    }
    setCallNextConfirm(nextWaiting);
  };

  const handleConfirmCallNext = () => {
    if (!callNextConfirm) return;
    callNextToken();
    setCallNextConfirm(null);
  };

  const handleConfirmComplete = () => {
    if (!completeConfirm) return;
    updateQueueStatus(completeConfirm.n, "completed");
    setCompleteConfirm(null);
  };

  const handleConfirmDelay = () => {
    if (!delayModal) return;
    updateQueueStatus(delayModal.n, "delayed", delayReason);
    setDelayModal(null);
  };

  return (
    <StaffShell navigate={navigate} current="staff-queue">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header and Call Next action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                {t("queue_management_title", "Queue Management")}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Dispatch
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {activeQueueCount} {t("active_now", "active in queue")} · {completedTodayCount} {t("status_completed", "completed today")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Icon name="refresh" size={14} />}
              onClick={() => showToast("Queue refreshed from dispatch gateway", "info")}
            >
              {t("btn_refresh", "Refresh")}
            </Button>
            <Button
              size="sm"
              icon={<Icon name="lightning" size={15} />}
              onClick={promptCallNext}
              className="bg-primary text-white hover:bg-[#155c30] shadow-sm font-semibold"
            >
              {t("call_next", "Call Next Token")}
            </Button>
          </div>
        </div>

        {/* Summary metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl p-4 border border-border bg-amber-50/70 border-amber-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                {t("current_queue", "Active Queue")}
              </p>
              <Icon name="queue" size={18} className="text-amber-700" />
            </div>
            <p className="text-3xl font-bold font-display text-amber-950 mt-1">{activeQueueCount}</p>
            <p className="text-xs text-amber-800 mt-0.5">Tokens on site</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-blue-50/70 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                {t("status_processing", "Processing")}
              </p>
              <Icon name="check_circle" size={18} className="text-blue-700" />
            </div>
            <p className="text-3xl font-bold font-display text-blue-950 mt-1">{processingCount}</p>
            <p className="text-xs text-blue-800 mt-0.5">At weighbridge bays</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-red-50/70 border-red-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-red-900 uppercase tracking-wide">
                {t("delayed", "Delayed")}
              </p>
              <Icon name="warning" size={18} className="text-red-700" />
            </div>
            <p className="text-3xl font-bold font-display text-red-950 mt-1">{delayedCount}</p>
            <p className="text-xs text-red-800 mt-0.5">Pending verification</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Est. Total Wait
              </p>
              <Icon name="reports" size={18} className="text-gray-600" />
            </div>
            <p className="text-3xl font-bold font-display text-gray-900 mt-1">1h 45m</p>
            <p className="text-xs text-muted-foreground mt-0.5">Across all bays</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border shadow-2xs">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Tokens" },
              { id: "waiting", label: "Waiting" },
              { id: "arrived", label: "Arrived" },
              { id: "processing", label: "Processing" },
              { id: "delayed", label: "Delayed" },
              { id: "completed", label: "Completed" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  filter === tab.id
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-[#f7f4ef] text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Icon
              name="search"
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search token, name, phone, booking ID..."
              className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        {/* Queue Table */}
        <Card className="overflow-hidden border border-border bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-[#fbf9f5] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3.5">Token #</th>
                  <th className="px-4 py-3.5">Farmer & Phone</th>
                  <th className="px-4 py-3.5">Slot Window</th>
                  <th className="px-4 py-3.5">Arrival Time</th>
                  <th className="px-4 py-3.5">Commodity & Bay</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      <Icon name="search" size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                      No queue items found matching your filter or query.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(f => {
                    const isProcessing = f.status === "processing";
                    const isDelayed = f.status === "delayed";
                    const isCompleted = f.status === "completed";

                    return (
                      <tr
                        key={f.id}
                        className={`hover:bg-muted/30 transition-colors ${
                          isProcessing ? "bg-blue-50/30" : isDelayed ? "bg-red-50/20" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-muted font-mono font-bold text-foreground text-sm">
                            {f.n}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-foreground">{f.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{f.phoneMasked}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-semibold text-foreground">{f.slot}</span>
                          <p className="text-xs text-muted-foreground font-mono">{f.bookingId}</p>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap font-mono">
                          {f.arrived}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-foreground">{f.commodity}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.quantity} · {f.weighbridgeBay || "Bay 1"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                              statusColors[f.status]
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                f.status === "processing"
                                  ? "bg-blue-500 animate-pulse"
                                  : f.status === "delayed"
                                  ? "bg-red-500"
                                  : f.status === "completed"
                                  ? "bg-gray-400"
                                  : f.status === "arrived"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            {f.status}
                          </span>
                          {f.delayReason && (
                            <p className="text-xs text-red-600 mt-0.5 truncate max-w-[180px]" title={f.delayReason}>
                              {f.delayReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {f.status === "arrived" && (
                              <button
                                onClick={() => updateQueueStatus(f.n, "processing")}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                              >
                                {t("start_processing", "Start")}
                              </button>
                            )}

                            {f.status === "waiting" && (
                              <button
                                onClick={() => updateQueueStatus(f.n, "processing")}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                              >
                                {t("start_processing", "Start")}
                              </button>
                            )}

                            {f.status === "processing" && (
                              <button
                                onClick={() => setCompleteConfirm(f)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
                              >
                                {t("mark_complete", "Complete")}
                              </button>
                            )}

                            {f.status === "delayed" && (
                              <button
                                onClick={() => updateQueueStatus(f.n, "waiting")}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-2xs"
                              >
                                {t("resume_label", "Resume")}
                              </button>
                            )}

                            {!isCompleted && !isDelayed && (
                              <button
                                onClick={() => setDelayModal(f)}
                                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Flag Delay"
                              >
                                Delay
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedFarmer(f)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Icon name="eye" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Call Next Farmer Confirmation */}
        {callNextConfirm && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setCallNextConfirm(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Icon name="lightning" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground font-display text-base">
                    Call Next Waiting Farmer
                  </h3>
                  <p className="text-xs text-muted-foreground">Confirm token dispatch to weighbridge bay</p>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 rounded-xl bg-[#f7f4ef] border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Token & Name:</span>
                    <p className="font-bold text-foreground text-sm">
                      <span className="font-mono text-primary mr-2">{callNextConfirm.n}</span>
                      {callNextConfirm.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">{callNextConfirm.phoneMasked}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 capitalize">
                    {callNextConfirm.status}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Slot window: <strong>{callNextConfirm.slot}</strong></p>
                  <p>• Commodity: <strong>{callNextConfirm.commodity} ({callNextConfirm.quantity})</strong></p>
                  <p>• Assigned bay: <strong>Bay 1 (Standard Weighbridge)</strong></p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" fullWidth onClick={handleConfirmCallNext}>
                  Confirm & Call Token
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setCallNextConfirm(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Mark Complete Confirmation */}
        {completeConfirm && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setCompleteConfirm(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Icon name="check_circle" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground font-display text-base">
                    Complete Procurement
                  </h3>
                  <p className="text-xs text-muted-foreground">Verify final receipt and release farmer</p>
                </div>
              </div>

              <div className="py-4 space-y-2 text-xs">
                <p className="text-foreground">
                  Confirm procurement completion for token <strong>{completeConfirm.n} — {completeConfirm.name}</strong>?
                </p>
                <div className="p-3 bg-muted/60 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weighment Slip:</span>
                    <span className="font-mono font-semibold text-emerald-700">WS-AMR-2026-0842</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Moisture Content:</span>
                    <span className="font-semibold text-foreground">11.8% (Passed &lt;14%)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" fullWidth onClick={handleConfirmComplete}>
                  Confirm Completion
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setCompleteConfirm(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Delay Reason */}
        {delayModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setDelayModal(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="p-2 rounded-xl bg-red-100 text-red-800">
                  <Icon name="warning" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground font-display text-base">
                    Flag Queue Delay
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Record delay reason for {delayModal.n} ({delayModal.name})
                  </p>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Select Delay Reason
                  </label>
                  <select
                    value={delayReason}
                    onChange={e => setDelayReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Verification taking longer">Verification taking longer</option>
                    <option value="Moisture re-test required">Moisture re-test required (&gt;14%)</option>
                    <option value="Documentation mismatch">Documentation / Land record mismatch</option>
                    <option value="Weighbridge bay calibration">Weighbridge bay calibration in progress</option>
                    <option value="Farmer momentarily unavailable">Farmer momentarily unavailable at vehicle</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" variant="danger" fullWidth onClick={handleConfirmDelay}>
                  Mark as Delayed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setDelayModal(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Slide-out Farmer Detail Drawer */}
        {selectedFarmer && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
            onClick={() => setSelectedFarmer(null)}
          >
            <div
              className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-primary text-white font-mono font-bold text-sm">
                      {selectedFarmer.n}
                    </span>
                    <h3 className="font-bold text-foreground font-display text-lg">
                      Queue Record
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#f7f4ef] border border-border space-y-2">
                  <p className="text-xs text-muted-foreground">Farmer Name</p>
                  <p className="text-base font-bold text-foreground">{selectedFarmer.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{selectedFarmer.phoneMasked}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Booking Reference:</span>
                    <span className="font-mono font-semibold text-foreground">{selectedFarmer.bookingId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Allocated Slot:</span>
                    <span className="font-semibold text-foreground">{selectedFarmer.slot}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Arrival Logged:</span>
                    <span className="font-semibold text-foreground">{selectedFarmer.arrived}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Crop & Quantity:</span>
                    <span className="font-semibold text-foreground">
                      {selectedFarmer.commodity} · {selectedFarmer.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Assigned Weighbridge:</span>
                    <span className="font-semibold text-foreground">
                      {selectedFarmer.weighbridgeBay || "Bay 1"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Current Status:</span>
                    <span className="font-semibold capitalize text-primary">{selectedFarmer.status}</span>
                  </div>
                  {selectedFarmer.delayReason && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
                      <strong>Delay Reason:</strong> {selectedFarmer.delayReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {selectedFarmer.status !== "completed" && (
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => {
                      updateQueueStatus(selectedFarmer.n, "completed");
                      setSelectedFarmer(null);
                    }}
                  >
                    Mark Procurement Completed
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setSelectedFarmer(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
