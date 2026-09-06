"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard, Card, Button, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api";
import { QueueEntry, DailyReport, AlertItem } from "@/lib/types";
import { useAdmin } from "@/lib/adminContext";

export default function DashboardPage() {
  const { selectedCentreId: centreId, currentCentre } = useAdmin();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!centreId) return;
      setLoading(true);
      const [qData, rData, aData] = await Promise.all([
        api.getQueue(centreId),
        api.getDailyReport(centreId),
        api.getAlerts(),
      ]);
      setQueue(qData);
      setReport(rData);
      setAlerts(aData);
      setLoading(false);
    }
    loadData();
  }, [centreId]);

  const currentlyProcessing = queue.find((q) => q.status === "processing");
  const waitingCount = queue.filter((q) => q.status === "waiting" || q.status === "arrived").length;
  const delayedCount = queue.filter((q) => q.status === "delayed").length;
  const completedCount = queue.filter((q) => q.status === "completed").length;

  const handleCallNext = async () => {
    if (!centreId) return;
    setCallingNext(true);
    const updated = await api.callNextToken(centreId);
    if (updated) {
      const refreshed = await api.getQueue(centreId);
      setQueue(refreshed);
    }
    setCallingNext(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
            Mandi Operations Overview
          </h1>
          <p className="text-sm text-[#697067] mt-1">
            District Amritsar · Punjab APMC Procurement Coordination Centre
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/slots">
            <Button variant="outline" size="sm" icon="⏱">
              Manage Slots
            </Button>
          </Link>
          <Link href="/queue">
            <Button variant="primary" size="sm" icon="⚡">
              Queue Dispatcher
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Urgent Alert Banner (if any active) ─────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Weather Advisory · {alerts[0].title}
              </div>
              <div className="text-xs text-amber-800 mt-0.5">{alerts[0].message}</div>
            </div>
          </div>
          <Link href="/alerts">
            <span className="text-xs font-bold text-amber-900 underline whitespace-nowrap">View All</span>
          </Link>
        </div>
      )}

      {/* ── Key Operational Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Currently in Yard"
          value={waitingCount}
          subtext="Farmers awaiting bay call"
          icon="🧑‍🌾"
          color="copper"
        />
        <MetricCard
          title="Procured Today"
          value={`${report?.total_procured_quintals || 1845.5} Qtl`}
          trend="+18% vs yesterday"
          icon="🌾"
          color="green"
        />
        <MetricCard
          title="MSP Value Disbursed"
          value={`₹${((report?.total_msp_disbursed || 4198512) / 100000).toFixed(1)} Lakh`}
          subtext="Direct Bank Transfer (DBT)"
          icon="₹"
          color="green"
        />
        <MetricCard
          title="Avg Weigh Time"
          value={`${report?.average_wait_minutes || 14.5} min`}
          trend="Target: <20 min"
          icon="⚖"
          color="blue"
        />
      </div>

      {/* ── Live Queue Call Console ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Weighbridge Bay & Next Token Action */}
        <Card highlight className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#ddd9d2] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="font-display font-bold text-base text-[#1a2319]">
                  Live Token Dispatch Console
                </h2>
              </div>
              <StatusBadge status={currentlyProcessing ? "processing" : "open"} />
            </div>

            {currentlyProcessing ? (
              <div className="bg-[#f7f4ef] rounded-xl p-5 border border-[#ddd9d2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#697067] uppercase tracking-wider">
                    Currently on Weighbridge
                  </span>
                  <div className="text-4xl font-black font-display text-[#1d6b3a] mt-1">
                    {currentlyProcessing.token}
                  </div>
                  <div className="text-sm font-semibold text-[#1a2319] mt-1">
                    {currentlyProcessing.farmer_name} · {currentlyProcessing.commodity}
                  </div>
                  <div className="text-xs text-[#697067]">
                    Slot: {currentlyProcessing.slot_time} · {currentlyProcessing.quantity}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-white rounded-lg border border-[#ddd9d2] text-xs font-bold text-[#1d6b3a]">
                    {currentlyProcessing.weighbridge_bay || "Bay 1"}
                  </span>
                  <Link href="/procurement">
                    <Button size="sm" variant="primary">
                      Record Inspection & Weights ➔
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-[#f7f4ef] rounded-xl p-6 border border-[#ddd9d2] text-center">
                <p className="text-sm font-medium text-[#697067]">
                  No token is currently occupying the weighbridge bay.
                </p>
                <div className="mt-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCallNext}
                    disabled={callingNext || waitingCount === 0}
                    icon="📢"
                  >
                    {callingNext ? "Calling..." : `Call Next Token (${waitingCount} waiting)`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#ddd9d2] flex items-center justify-between text-xs text-[#697067]">
            <span>
              Today's Completed Deliveries: <strong className="text-[#1a2319]">{completedCount}</strong>
            </span>
            <span>
              Flagged Delayed: <strong className="text-amber-700">{delayedCount}</strong>
            </span>
            <Link href="/queue" className="font-bold text-[#1d6b3a] hover:underline">
              Full Queue Table ➔
            </Link>
          </div>
        </Card>

        {/* Yard Capacity Gauge */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-base text-[#1a2319] mb-1">
              Yard Intake Utilization
            </h3>
            <p className="text-xs text-[#697067]">
              Current intake against max daily yard capacity (140 quintals)
            </p>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#eeeae4]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#1d6b3a]"
                    strokeDasharray="78, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black font-display text-[#1a2319]">78%</span>
                  <span className="block text-[10px] uppercase font-bold text-[#697067]">Capacity</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#697067]">Weighbridge Bays Active</span>
                  <span className="font-bold text-[#1a2319]">2 of 2 operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697067]">Open Slots Remaining</span>
                  <span className="font-bold text-[#1d6b3a]">6 slots today</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#ddd9d2]">
            <Link href="/slots" className="block w-full">
              <Button size="sm" variant="outline" fullWidth>
                Adjust Slot Quotas
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Upcoming Arrivals Feed ─────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-base text-[#1a2319]">
              Queue Dispatch Sequence
            </h3>
            <p className="text-xs text-[#697067]">Next scheduled arrivals in line</p>
          </div>
          <Link href="/queue">
            <span className="text-xs font-bold text-[#1d6b3a] hover:underline">View All Tokens ➔</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#ddd9d2] text-[#697067] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Farmer</th>
                <th className="py-2.5 px-3">Commodity</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Slot Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeae4]">
              {queue.slice(0, 5).map((entry) => (
                <tr key={entry.id} className="hover:bg-[#f7f4ef] transition-colors">
                  <td className="py-3 px-3 font-bold font-display text-[#1d6b3a]">{entry.token}</td>
                  <td className="py-3 px-3 font-semibold text-[#1a2319]">{entry.farmer_name}</td>
                  <td className="py-3 px-3">{entry.commodity}</td>
                  <td className="py-3 px-3">{entry.quantity}</td>
                  <td className="py-3 px-3 text-[#697067]">{entry.slot_time}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={entry.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link href={`/queue?token=${entry.token}`}>
                      <span className="text-[#1d6b3a] font-bold hover:underline">Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
