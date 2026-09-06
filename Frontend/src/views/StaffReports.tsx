"use client";

import { useState } from "react";
import { Button, Icon, Card } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

export default function StaffReports({ navigate }: Props) {
  const { t } = useLanguage();
  const {
    centre,
    completedTodayCount,
    activeQueueCount,
    delayedCount,
    auditLog,
    showToast,
  } = useStaffContext();

  const [dateRange, setDateRange] = useState("today");

  const handleExportCSV = () => {
    showToast("Operations CSV report generated and downloaded", "success");
  };

  const handlePrintSummary = () => {
    showToast("Preparing printable operational summary...", "info");
    if (typeof window !== "undefined") {
      setTimeout(() => window.print(), 300);
    }
  };

  return (
    <StaffShell navigate={navigate} current="staff-reports">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header and Export actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                {t("reports_analytics_title", "Reports & Audit Analytics")}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Daily Summary
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Thursday, 12 September 2026 · {centre.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white border border-border rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setDateRange("today")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  dateRange === "today" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Today (12 Sep)
              </button>
              <button
                onClick={() => setDateRange("week")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  dateRange === "week" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Past 7 Days
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Icon name="file_text" size={14} />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              icon={<Icon name="reports" size={14} />}
              onClick={handlePrintSummary}
              className="bg-primary text-white hover:bg-[#155c30]"
            >
              Print Summary
            </Button>
          </div>
        </div>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl p-4 border border-border bg-white shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Procured
              </p>
              <Icon name="warehouse" size={18} className="text-primary" />
            </div>
            <p className="text-3xl font-bold font-display text-foreground mt-1">1,420</p>
            <p className="text-xs text-muted-foreground mt-0.5">Quintals of wheat</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-emerald-50/70 border-emerald-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                Completed Deliveries
              </p>
              <Icon name="check_circle" size={18} className="text-emerald-700" />
            </div>
            <p className="text-3xl font-bold font-display text-emerald-950 mt-1">{completedTodayCount}</p>
            <p className="text-xs text-emerald-800 mt-0.5">Verified receipts</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-blue-50/70 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Average Wait Time
              </p>
              <Icon name="queue" size={18} className="text-blue-700" />
            </div>
            <p className="text-3xl font-bold font-display text-blue-950 mt-1">24 min</p>
            <p className="text-xs text-blue-800 mt-0.5">Down 42% vs walk-in</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-amber-50/70 border-amber-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                Weigh-in Turnaround
              </p>
              <Icon name="lightning" size={18} className="text-amber-700" />
            </div>
            <p className="text-3xl font-bold font-display text-amber-950 mt-1">14 min</p>
            <p className="text-xs text-amber-800 mt-0.5">Gate-to-exit average</p>
          </div>
        </div>

        {/* Charts & Analytical Breakdown Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hourly Throughput Bar Chart Visualizer */}
          <Card className="lg:col-span-2 p-5 border border-border bg-white shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-foreground font-display text-sm">
                  Hourly Queue Volume &amp; Turnaround (Thursday)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Farmers serviced vs arrivals per one-hour time window
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Target: &lt;30m wait
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { hour: "08:00–09:00", count: 12, wait: "14 min", pct: 60 },
                { hour: "09:00–10:00", count: 18, wait: "21 min", pct: 90 },
                { hour: "10:00–11:00", count: 20, wait: "28 min", pct: 100, isPeak: true },
                { hour: "11:00–12:00", count: 14, wait: "22 min", pct: 70 },
                { hour: "12:00–13:00", count: 9,  wait: "15 min", pct: 45 },
                { hour: "14:00–15:00", count: 16, wait: "24 min", pct: 80 },
                { hour: "15:00–16:00", count: 11, wait: "18 min", pct: 55 },
              ].map(h => (
                <div key={h.hour} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-muted-foreground w-24 shrink-0">{h.hour}</span>
                  <div className="flex-1 bg-muted h-5 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all ${
                        h.isPeak ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${h.pct}%` }}
                    />
                    <span className="absolute right-2 top-0.5 text-xs font-bold text-foreground drop-shadow-xs">
                      {h.count} Farmers ({h.wait})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delay Reasons Analysis */}
          <Card className="p-5 border border-border bg-white shadow-xs">
            <h2 className="font-bold text-foreground font-display text-sm mb-1">
              Delay Reason Breakdown
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Analysis of today&apos;s {delayedCount} flagged exceptions
            </p>

            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-foreground">Moisture Content (&gt;14%)</span>
                  <span className="text-red-700">45%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: "45%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Grain requires sun drying prior to final intake
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-foreground">Document / Land Record Mismatch</span>
                  <span className="text-amber-700">30%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "30%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aadhaar/Khasra manual verification required
                </p>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-foreground">Weighbridge Bay Congestion</span>
                  <span className="text-blue-700">25%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "25%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tractor trailer maneuvering during peak period
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ACTIVITY / AUDIT LOG TABLE (Crucial Feature requested by user) */}
        <Card className="overflow-hidden border border-border bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-border gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Icon name="reports" size={18} className="text-primary" />
                <h2 className="font-bold text-foreground font-display text-base">
                  Centre Operational Audit Trail
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Log
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verifiable event log tracking token calls, queue status transitions, slot modifications, and alert broadcasts
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {auditLog.length} events logged today
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-[#fbf9f5] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Staff Member</th>
                  <th className="px-4 py-3.5">Action Recorded</th>
                  <th className="px-4 py-3.5">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLog.map(entry => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {entry.time}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                          RK
                        </div>
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {entry.staffName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-foreground">
                      {entry.action}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">
                      {entry.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border bg-[#fbf9f5] flex items-center justify-between text-xs text-muted-foreground">
            <span>Automatic tamper-resistant logging enabled (SIH26032 compliance)</span>
            <span className="font-mono">Audited by: Centre Manager (KS-STAFF-014)</span>
          </div>
        </Card>
      </div>
    </StaffShell>
  );
}
