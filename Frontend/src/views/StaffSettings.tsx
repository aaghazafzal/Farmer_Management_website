"use client";

import { useState } from "react";
import { Button, Icon, Card } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

export default function StaffSettings({ navigate }: Props) {
  const { language, currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const {
    centre,
    currentUser,
    updateCentreProfile,
    notificationSettings,
    updateNotificationSetting,
    showToast,
  } = useStaffContext();

  const [centreName, setCentreName] = useState(centre.name);
  const [centreAddress, setCentreAddress] = useState(centre.address);
  const [operatingHours, setOperatingHours] = useState(centre.operatingHours);
  const [defaultCap, setDefaultCap] = useState(centre.defaultSlotCapacity.toString());
  const [maxDailyCap, setMaxDailyCap] = useState(centre.maxDailyCapacity.toString());

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCentreProfile({
      name: centreName,
      address: centreAddress,
      operatingHours,
      defaultSlotCapacity: parseInt(defaultCap, 10) || 20,
      maxDailyCapacity: parseInt(maxDailyCap, 10) || 140,
    });
    showToast("Centre profile configuration saved successfully", "success");
  };

  return (
    <StaffShell navigate={navigate} current="staff-settings">
      <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
              {t("centre_settings_title", "Centre & Portal Settings")}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Station Config
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure ABC Procurement Centre operating rules, notification triggers, and hardware interfaces
          </p>
        </div>

        {/* Section 1: Centre Profile */}
        <Card className="p-5 border border-border bg-white shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Icon name="warehouse" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-foreground font-display text-sm">
                1. Centre Profile &amp; Jurisdiction
              </h2>
              <p className="text-xs text-muted-foreground">Mandated agricultural procurement location details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Centre Name
                </label>
                <input
                  type="text"
                  value={centreName}
                  onChange={e => setCentreName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Centre Code (Permanent)
                </label>
                <input
                  type="text"
                  value={centre.id}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-border bg-muted text-muted-foreground font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-foreground mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={centreAddress}
                  onChange={e => setCentreAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  District &amp; State
                </label>
                <input
                  type="text"
                  value={centre.location}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-border bg-muted text-muted-foreground"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Operating Hours (Daily)
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={e => setOperatingHours(e.target.value)}
                  placeholder="08:00–17:00"
                  className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Section 2: Capacity & Slot Rules */}
        <Card className="p-5 border border-border bg-white shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <Icon name="booking" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-foreground font-display text-sm">
                2. Capacity Quotas &amp; Overbooking Safeguards
              </h2>
              <p className="text-xs text-muted-foreground">Regulate max arrivals per slot window to avoid congestion</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-[#f7f4ef] border border-border">
              <label className="block font-semibold text-foreground mb-1">
                Default Slot Capacity
              </label>
              <input
                type="number"
                value={defaultCap}
                onChange={e => setDefaultCap(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-white text-foreground font-bold text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Farmers allowed per 1-hour window
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f7f4ef] border border-border">
              <label className="block font-semibold text-foreground mb-1">
                Max Daily Intake Quota
              </label>
              <input
                type="number"
                value={maxDailyCap}
                onChange={e => setMaxDailyCap(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border bg-white text-foreground font-bold text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Overall daily ceiling across all bays
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f7f4ef] border border-border">
              <span className="block font-semibold text-foreground mb-1">
                Emergency Overbooking Buffer
              </span>
              <p className="text-base font-bold text-emerald-700 mt-1">10% Allowance</p>
              <p className="text-xs text-muted-foreground mt-1">
                Allows walk-in priority distress cases
              </p>
            </div>
          </div>
        </Card>

        {/* Section 3: Notification & SMS Gateways */}
        <Card className="p-5 border border-border bg-white shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Icon name="bell" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-foreground font-display text-sm">
                3. Automated SMS &amp; Dispatch Gateways
              </h2>
              <p className="text-xs text-muted-foreground">Manage farmer notification dispatch triggers</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {[
              {
                id: "smsEnabled",
                label: "Automated SMS Dispatch",
                desc: "Send arrival token and weighment confirmations via KisanSetu SMS gateway.",
              },
              {
                id: "advanceAlerts",
                label: "30-Minute Queue Advance Alerts",
                desc: "Notify farmers automatically when their token is 3 positions away.",
              },
              {
                id: "delayWarnings",
                label: "Moisture & Delay Warning Broadcasts",
                desc: "Immediately dispatch notifications when verification takes longer than 20 mins.",
              },
              {
                id: "dailySummaryEmail",
                label: "Daily Operations Digest",
                desc: "Send consolidated PDF & CSV throughput summary to district authorities at 17:30.",
              },
            ].map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-[#f7f4ef]"
              >
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!notificationSettings[item.id]}
                    onChange={e => updateNotificationSetting(item.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 4: Staff Access & Credentials */}
        <Card className="p-5 border border-border bg-white shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
              <Icon name="profile" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-foreground font-display text-sm">
                4. Staff Access &amp; Station Operators
              </h2>
              <p className="text-xs text-muted-foreground">Active authenticated personnel on shift</p>
            </div>
          </div>

          <div className="divide-y divide-border text-sm">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  RK
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{currentUser.name} (You)</p>
                  <p className="text-muted-foreground font-mono text-xs">{currentUser.staffId} · {currentUser.role}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Active Session
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-muted text-foreground text-xs font-bold flex items-center justify-center">
                  SS
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Surjit Singh</p>
                  <p className="text-muted-foreground font-mono text-xs">KS-STAFF-022 · Weighbridge Operator Bay 1</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Shift: 08:00–16:00
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-muted text-foreground text-xs font-bold flex items-center justify-center">
                  HK
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Harpreet Kaur</p>
                  <p className="text-muted-foreground font-mono text-xs">KS-STAFF-029 · Moisture &amp; Quality Inspector</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Shift: 08:00–16:00
              </span>
            </div>
          </div>
        </Card>

        {/* Section 5: Language & Accessibility */}
        <Card className="p-5 border border-border bg-white shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Icon name="language" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-foreground font-display text-sm">
                5. Language &amp; Regional Preferences
              </h2>
              <p className="text-xs text-muted-foreground">Select interface display language with bidirectional text support</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 text-sm">
            {supportedLanguages.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  showToast(`Language set to ${l.name}`, "info");
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  language === l.code
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-[#f7f4ef] border-border text-foreground hover:bg-muted"
                }`}
              >
                <p className="font-bold text-base">{l.native}</p>
                <p className={`text-xs mt-0.5 ${language === l.code ? "text-white/80" : "text-muted-foreground"}`}>
                  {l.name}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Section 6: Hardware & Diagnostics */}
        <Card className="p-5 border border-border bg-white shadow-xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <Icon name="reports" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-foreground font-display text-sm">
                6. Connected Hardware &amp; Diagnostic Interfaces
              </h2>
              <p className="text-xs text-muted-foreground">Peripheral status checks for automated receipt and weighing</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Weighbridge Bay 1 Scale</p>
                <p className="text-xs text-emerald-800 mt-0.5">Serial COM4 · 0.00 kg tare</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Thermal Receipt Printer</p>
                <p className="text-xs text-emerald-800 mt-0.5">USB001 · Paper roll 82%</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Digital Moisture Meter</p>
                <p className="text-xs text-emerald-800 mt-0.5">Bluetooth BLE · Calibrated</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    </StaffShell>
  );
}
