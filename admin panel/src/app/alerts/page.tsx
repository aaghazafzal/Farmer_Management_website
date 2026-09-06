"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, StatusBadge, Input, Select, Modal } from "@/components/ui";
import { api } from "@/lib/api";
import { AlertItem } from "@/lib/types";

export default function BroadcastAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("warning");
  const [alertType, setAlertType] = useState<"weather" | "queue" | "operational">("weather");
  const [loading, setLoading] = useState(false);

  const refreshAlerts = async () => {
    const data = await api.getAlerts();
    setAlerts(data);
  };

  useEffect(() => {
    refreshAlerts();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    await api.createAlert({
      title,
      message,
      severity,
      type: alertType,
    });
    setTitle("");
    setMessage("");
    setModalOpen(false);
    await refreshAlerts();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
            Broadcast Announcements & Alerts
          </h1>
          <p className="text-sm text-[#697067] mt-1">
            Dispatch urgent weather warnings, mandi intake delays, and MSP advisories to farmers
          </p>
        </div>

        <Button variant="accent" icon="📢" onClick={() => setModalOpen(true)}>
          Broadcast New Notice
        </Button>
      </div>

      {/* ── Active Broadcasts ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const borderColors = {
            critical: "border-l-red-600 bg-red-50/40",
            warning: "border-l-amber-600 bg-amber-50/40",
            info: "border-l-blue-600 bg-blue-50/40",
          };

          return (
            <Card
              key={alert.id}
              className={`border-l-4 ${borderColors[alert.severity]} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={alert.severity} size="sm" />
                  <span className="text-[11px] font-bold uppercase text-[#697067]">
                    {alert.type} Notice · {alert.created_at}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-[#1a2319]">{alert.title}</h3>
                <p className="text-xs text-[#697067]">{alert.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white border border-[#ddd9d2] text-[#1d6b3a]">
                  Delivered to Mobile Screens ✓
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Create Broadcast Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Broadcast Emergency / Operational Notice"
      >
        <div className="space-y-4">
          <Input
            label="Announcement Title"
            placeholder="e.g., Rain Alert: Covered Shed 2 Open for Grain Protection"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Severity Level"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              options={[
                { value: "warning", label: "Warning (Yellow Bar)" },
                { value: "critical", label: "Critical (Red Alert)" },
                { value: "info", label: "Informational (Blue)" },
              ]}
            />
            <Select
              label="Category"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as any)}
              options={[
                { value: "weather", label: "Weather Disruption" },
                { value: "queue", label: "Queue / Traffic Delay" },
                { value: "operational", label: "General Mandi News" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a2319] mb-1.5">
              Notice Details (Broadcast to Farmer App & SMS)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter full details including instructions for farmers arriving today..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#ddd9d2] rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1d6b3a]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ddd9d2]">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleCreate} disabled={loading || !title.trim()}>
              {loading ? "Broadcasting..." : "Dispatch Alert 📢"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
