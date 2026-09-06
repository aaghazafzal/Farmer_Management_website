"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, StatusBadge, Tabs, Modal, Input, Select } from "@/components/ui";
import { api } from "@/lib/api";
import { queueWs } from "@/lib/websocket";
import { QueueEntry } from "@/lib/types";
import { useAdmin } from "@/lib/adminContext";

export default function QueueControllerPage() {
  const { selectedCentreId: centreId, currentCentre } = useAdmin();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [modalAction, setModalAction] = useState<"status" | "delay" | null>(null);
  const [newStatus, setNewStatus] = useState<string>("arrived");
  const [selectedBay, setSelectedBay] = useState<string>("Weighbridge Bay 1");
  const [delayReason, setDelayReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [wsLive, setWsLive] = useState(false);

  const refreshQueue = async () => {
    if (!centreId) return;
    const data = await api.getQueue(centreId);
    setQueue(data);
  };

  useEffect(() => {
    refreshQueue();

    if (!centreId) return;

    // Connect WebSocket
    queueWs.connect(centreId);
    const unsubscribe = queueWs.subscribe((data) => {
      if (data.type === "CONNECTION_OPEN") setWsLive(true);
      if (data.type === "CONNECTION_CLOSED") setWsLive(false);
      if (data.type === "QUEUE_SNAPSHOT" && data.data?.entries) {
        setQueue(data.data.entries);
      }
      if (data.type === "QUEUE_UPDATE") {
        refreshQueue();
      }
    });

    return () => {
      unsubscribe();
      queueWs.disconnect();
    };
  }, [centreId]);

  // Filter queue
  const filtered = queue.filter((item) => {
    const matchesTab = activeTab === "all" ? true : item.status === activeTab;
    const farmer = item.farmer_name || "";
    const tok = item.token || "";
    const comm = item.commodity || "";
    const matchesSearch =
      farmer.toLowerCase().includes(search.toLowerCase()) ||
      tok.toLowerCase().includes(search.toLowerCase()) ||
      comm.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const currentlyProcessing = queue.find((q) => q.status === "processing");

  const handleCallNext = async () => {
    setLoading(true);
    await api.callNextToken(centreId, selectedBay);
    await refreshQueue();
    setLoading(false);
  };

  const handleStatusSubmit = async () => {
    if (!selectedEntry) return;
    setLoading(true);
    await api.updateQueueStatus(selectedEntry.id, newStatus, newStatus === "processing" ? selectedBay : undefined);
    setModalAction(null);
    setSelectedEntry(null);
    await refreshQueue();
    setLoading(false);
  };

  const handleDelaySubmit = async () => {
    if (!selectedEntry || !delayReason.trim()) return;
    setLoading(true);
    await api.delayQueueEntry(selectedEntry.id, delayReason);
    setModalAction(null);
    setSelectedEntry(null);
    setDelayReason("");
    await refreshQueue();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
              Live Queue Controller
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                wsLive ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${wsLive ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
              {wsLive ? "WebSocket Live" : "Polling Mode"}
            </span>
          </div>
          <p className="text-sm text-[#697067] mt-1">
            Real-time token dispatch, weighbridge bay routing, and arrival status for {currentCentre?.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon="📢"
            onClick={handleCallNext}
            disabled={loading || !!currentlyProcessing}
          >
            {currentlyProcessing ? "Bay In-Use" : "Call Next in Line"}
          </Button>
        </div>
      </div>

      {/* ── Currently Serving Banner ────────────────────────────────────────── */}
      <Card highlight className="bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1d6b3a] text-white flex items-center justify-center font-display font-black text-2xl shadow-sm shrink-0">
              {currentlyProcessing ? currentlyProcessing.token : "—"}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#697067]">
                Now Serving at {currentlyProcessing?.weighbridge_bay || "Bay 1"}
              </span>
              <div className="text-lg font-bold text-[#1a2319]">
                {currentlyProcessing ? currentlyProcessing.farmer_name : "No active vehicle in weighbridge bay"}
              </div>
              {currentlyProcessing && (
                <div className="text-xs text-[#697067] mt-0.5">
                  {currentlyProcessing.commodity} · {currentlyProcessing.quantity} · Started: {currentlyProcessing.processing_started_at || "Just now"}
                </div>
              )}
            </div>
          </div>

          {currentlyProcessing && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEntry(currentlyProcessing);
                  setModalAction("delay");
                }}
              >
                Mark Delayed
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedEntry(currentlyProcessing);
                  setNewStatus("completed");
                  setModalAction("status");
                }}
              >
                Mark Completed ✓
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Search & Filter Tabs ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="overflow-x-auto min-w-0 flex-1">
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: "all", label: "All Tokens", count: queue.length },
              { id: "waiting", label: "Waiting", count: queue.filter((q) => q.status === "waiting").length },
              { id: "arrived", label: "Arrived at Gate", count: queue.filter((q) => q.status === "arrived").length },
              { id: "processing", label: "Weighing", count: queue.filter((q) => q.status === "processing").length },
              { id: "delayed", label: "Delayed", count: queue.filter((q) => q.status === "delayed").length },
              { id: "completed", label: "Completed", count: queue.filter((q) => q.status === "completed").length },
            ]}
          />
        </div>
        <div className="w-full lg:w-72 shrink-0">
          <Input
            placeholder="Search farmer or token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Queue Table ─────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0 border border-[#ddd9d2] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="bg-[#f7f4ef] border-b border-[#ddd9d2] text-[#697067] uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Token</th>
                <th className="py-3.5 px-4 font-bold">Farmer Name</th>
                <th className="py-3.5 px-4 font-bold">Phone</th>
                <th className="py-3.5 px-4 font-bold">Commodity</th>
                <th className="py-3.5 px-4 font-bold">Slot Time</th>
                <th className="py-3.5 px-4 font-bold">Assigned Bay</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeae4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-[#697067]">
                    No queue tokens match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7f4ef]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold font-display text-sm text-[#1d6b3a]">
                      {item.token}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1a2319]">
                      <div>{item.farmer_name}</div>
                      {item.delay_reason && (
                        <div className="text-[11px] text-orange-700 font-medium mt-0.5">
                          ⚠️ {item.delay_reason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#697067]">{item.phone_masked}</td>
                    <td className="py-3.5 px-4">
                      {item.commodity} <span className="text-[#697067]">({item.quantity})</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#697067]">{item.slot_time}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1a2319]">
                      {item.weighbridge_bay || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {item.status === "waiting" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedEntry(item);
                            setNewStatus("arrived");
                            setModalAction("status");
                          }}
                        >
                          Check In
                        </Button>
                      )}
                      {item.status === "arrived" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedEntry(item);
                            setNewStatus("processing");
                            setModalAction("status");
                          }}
                        >
                          Send to Bay
                        </Button>
                      )}
                      {item.status === "processing" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedEntry(item);
                            setNewStatus("completed");
                            setModalAction("status");
                          }}
                        >
                          Complete
                        </Button>
                      )}
                      {item.status !== "completed" && item.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEntry(item);
                            setModalAction("delay");
                          }}
                        >
                          Delay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Status Transition Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={modalAction === "status"}
        onClose={() => setModalAction(null)}
        title={`Advance Token ${selectedEntry?.token} (${selectedEntry?.farmer_name})`}
      >
        <div className="space-y-4">
          <Select
            label="Next Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: "arrived", label: "Arrived at Mandi Gate" },
              { value: "processing", label: "Weighing In-Process" },
              { value: "completed", label: "Procurement Completed" },
              { value: "cancelled", label: "Cancelled / No-Show" },
            ]}
          />

          {newStatus === "processing" && (
            <Select
              label="Assign Weighbridge Bay"
              value={selectedBay}
              onChange={(e) => setSelectedBay(e.target.value)}
              options={[
                { value: "Weighbridge Bay 1", label: "Weighbridge Bay 1 (Active)" },
                { value: "Weighbridge Bay 2", label: "Weighbridge Bay 2 (Active)" },
              ]}
            />
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ddd9d2]">
            <Button variant="ghost" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStatusSubmit} disabled={loading}>
              {loading ? "Updating..." : "Confirm Status"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delay Notice Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modalAction === "delay"}
        onClose={() => setModalAction(null)}
        title={`Report Delay for Token ${selectedEntry?.token}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#697067]">
            Reporting a delay sends an immediate alert to the farmer's mobile screen and records an
            entry in the audit log.
          </p>
          <Input
            label="Reason for Delay"
            placeholder="e.g., High moisture (15.2%), yard aeration needed..."
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ddd9d2]">
            <Button variant="ghost" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleDelaySubmit} disabled={loading || !delayReason.trim()}>
              {loading ? "Saving..." : "Submit Delay Notice"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
