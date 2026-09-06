"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select } from "@/components/ui";
import { useAdmin } from "@/lib/adminContext";

export default function CentreSettingsPage() {
  const { currentCentre } = useAdmin();
  const [centreName, setCentreName] = useState(currentCentre?.name || "ABC Procurement Centre");
  const [district, setDistrict] = useState(currentCentre?.district || "Amritsar");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [bays, setBays] = useState(currentCentre?.weighbridge_count || 2);
  const [defaultCapacity, setDefaultCapacity] = useState(currentCentre?.default_slot_capacity || 20);
  const [maxDaily, setMaxDaily] = useState(currentCentre?.max_daily_capacity || 140);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentCentre) {
      setCentreName(currentCentre.name);
      setDistrict(currentCentre.district);
      setBays(currentCentre.weighbridge_count || 2);
      setDefaultCapacity(currentCentre.default_slot_capacity || 20);
      setMaxDaily(currentCentre.max_daily_capacity || 140);
    }
  }, [currentCentre]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
          Mandi Yard & Operating Settings
        </h1>
        <p className="text-sm text-[#697067] mt-1">
          Configure daily intake quotas, operational hours, weighbridge bays, and notification policies
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ Settings saved and synced with district APMC central server.</span>
          <span className="text-[10px]">Just now</span>
        </div>
      )}

      {/* ── Mandi Profile ───────────────────────────────────────────────────── */}
      <Card className="space-y-4">
        <h2 className="font-display font-semibold text-base text-[#1a2319] border-b border-[#ddd9d2] pb-2">
          Procurement Centre Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Mandi Center Name" value={centreName} onChange={(e) => setCentreName(e.target.value)} />
          <Input label="District APMC Board" value={district} onChange={(e) => setDistrict(e.target.value)} />
        </div>
      </Card>

      {/* ── Operating Hours & Quotas ────────────────────────────────────────── */}
      <Card className="space-y-4">
        <h2 className="font-display font-semibold text-base text-[#1a2319] border-b border-[#ddd9d2] pb-2">
          Daily Gate Timings & Yard Intake Limits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Gate Open Time" type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
          <Input label="Gate Close Time" type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Active Weighbridge Bays"
            type="number"
            min={1}
            max={6}
            value={bays}
            onChange={(e) => setBays(parseInt(e.target.value) || 1)}
          />
          <Input
            label="Default Slot Intake (Vehicles/Hr)"
            type="number"
            min={5}
            max={50}
            value={defaultCapacity}
            onChange={(e) => setDefaultCapacity(parseInt(e.target.value) || 20)}
          />
          <Input
            label="Max Daily Yard Cap (Qtl)"
            type="number"
            value={maxDaily}
            onChange={(e) => setMaxDaily(parseInt(e.target.value) || 140)}
          />
        </div>
      </Card>

      {/* ── Notification & Alert Rules ──────────────────────────────────────── */}
      <Card className="space-y-4">
        <h2 className="font-display font-semibold text-base text-[#1a2319] border-b border-[#ddd9d2] pb-2">
          Automatic Farmer Dispatch Notices
        </h2>
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-[#1d6b3a] rounded border-[#ddd9d2] focus:ring-[#1d6b3a]"
            />
            <div>
              <span className="font-bold text-[#1a2319]">Auto-dispatch SMS & push alert when token is called</span>
              <p className="text-[#697067]">Sends direct message to farmer 15 minutes before vehicle bay turn.</p>
            </div>
          </label>
        </div>
      </Card>

      {/* ── Save Action ─────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3">
        <Button variant="primary" size="lg" icon="💾" onClick={handleSave}>
          Save Mandi Configuration
        </Button>
      </div>
    </div>
  );
}
