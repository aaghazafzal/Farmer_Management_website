"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, StatusBadge, Input, Select, Modal } from "@/components/ui";
import { api } from "@/lib/api";
import { ProcurementRecord } from "@/lib/types";

export default function ProcurementOperationsPage() {
  const [procurements, setProcurements] = useState<ProcurementRecord[]>([]);
  const [selectedProc, setSelectedProc] = useState<ProcurementRecord | null>(null);
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [moisture, setMoisture] = useState<number>(12.0);
  const [grade, setGrade] = useState<"Grade A" | "Standard" | "Substandard">("Grade A");
  const [bay, setBay] = useState<string>("Weighbridge Bay 1");
  const [loading, setLoading] = useState(false);
  const [receiptModal, setReceiptModal] = useState<ProcurementRecord | null>(null);

  const refreshProcurements = async () => {
    const data = await api.getProcurements();
    setProcurements(data);
  };

  useEffect(() => {
    refreshProcurements();
  }, []);

  const handleOpenWeighModal = (proc: ProcurementRecord) => {
    setSelectedProc(proc);
    setGrossWeight(proc.gross_weight_quintals || 60);
    setTareWeight(proc.tare_weight_quintals || 15);
    setMoisture(proc.moisture_percent || 12.0);
    setGrade(proc.grade || "Grade A");
    setBay(proc.weighbridge_bay || "Weighbridge Bay 1");
  };

  const netWeight = Math.max(0, Math.round((grossWeight - tareWeight) * 10) / 10);
  const mspRate = selectedProc?.msp_per_quintal || 2275;
  const calculatedPayout = Math.round(netWeight * mspRate);

  const handleSaveWeights = async () => {
    if (!selectedProc) return;
    setLoading(true);
    const updated = await api.updateProcurement(selectedProc.id, {
      gross_weight_quintals: grossWeight,
      tare_weight_quintals: tareWeight,
      net_weight_quintals: netWeight,
      moisture_percent: moisture,
      grade: grade,
      weighbridge_bay: bay,
      total_payout: calculatedPayout,
      status: "completed",
    });
    setSelectedProc(null);
    await refreshProcurements();
    setLoading(false);
    if (updated) {
      setReceiptModal(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
            Weighbridge & Quality Grading
          </h1>
          <p className="text-sm text-[#697067] mt-1">
            Capture gross/tare vehicle weights, test moisture levels, and issue MSP settlement vouchers
          </p>
        </div>
      </div>

      {/* ── Active Weighbridge Bays Status ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="flex items-center justify-between p-4 border-l-4 border-l-emerald-600">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase text-[#697067]">Weighbridge Bay 1</span>
            </div>
            <div className="text-lg font-bold text-[#1a2319] mt-1">Active · Token #01</div>
            <div className="text-xs text-[#697067]">Gurpreet Singh · 62.4 Qtl Gross Recorded</div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleOpenWeighModal(procurements[0])}
          >
            Record Tare & Complete
          </Button>
        </Card>

        <Card className="flex items-center justify-between p-4 border-l-4 border-l-blue-600">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold uppercase text-[#697067]">Weighbridge Bay 2</span>
            </div>
            <div className="text-lg font-bold text-[#1a2319] mt-1">Ready for Vehicle</div>
            <div className="text-xs text-[#697067]">Certified accurate under Weights & Measures Act</div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
            Standby
          </span>
        </Card>
      </div>

      {/* ── Procurements List ───────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[#ddd9d2] flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-[#1a2319]">
            Daily Intake & Weighing Queue
          </h2>
          <span className="text-xs text-[#697067]">Today's MSP: Wheat ₹2,275/Qtl · Paddy ₹2,320/Qtl</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f7f4ef] border-b border-[#ddd9d2] text-[#697067] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Net Weight</th>
                <th className="py-3 px-4">Moisture %</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Total Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeae4]">
              {procurements.map((item) => (
                <tr key={item.id} className="hover:bg-[#f7f4ef] transition-colors">
                  <td className="py-3.5 px-4 font-display font-bold text-[#1d6b3a]">{item.token}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#1a2319]">{item.farmer_name}</td>
                  <td className="py-3.5 px-4">{item.commodity}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {item.net_weight_quintals ? `${item.net_weight_quintals} Qtl` : "Pending Tare"}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.moisture_percent ? (
                      <span className={item.moisture_percent > 12.5 ? "text-orange-700 font-bold" : "text-emerald-800"}>
                        {item.moisture_percent}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3.5 px-4">{item.grade || "Pending"}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1d6b3a]">
                    {item.total_payout ? `₹${item.total_payout.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status as any} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {item.status !== "completed" ? (
                      <Button size="sm" variant="primary" onClick={() => handleOpenWeighModal(item)}>
                        Record Weight
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setReceiptModal(item)}>
                        View Receipt
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Weighbridge Entry Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedProc}
        onClose={() => setSelectedProc(null)}
        title={`Weighing & Quality Certificate — Token ${selectedProc?.token}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#f7f4ef] rounded-xl border border-[#ddd9d2] text-xs">
            <div className="font-bold text-[#1a2319] text-sm">{selectedProc?.farmer_name}</div>
            <div className="text-[#697067]">
              Crop: {selectedProc?.commodity} · Benchmark MSP: ₹{selectedProc?.msp_per_quintal}/Qtl
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Gross Vehicle Weight (Qtl)"
              type="number"
              step="0.1"
              value={grossWeight}
              onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
              help="Loaded tractor / truck weight"
            />
            <Input
              label="Tare Vehicle Weight (Qtl)"
              type="number"
              step="0.1"
              value={tareWeight}
              onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
              help="Empty vehicle return weight"
            />
          </div>

          {/* Auto-computed Net Produce */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[#1d6b3a] text-sm">Net Produce Delivered:</span>
              <div className="text-[#697067] text-[11px]">Gross minus Tare</div>
            </div>
            <div className="text-xl font-bold font-mono text-[#1d6b3a]">
              {netWeight} Quintals
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Moisture Meter Reading (%)"
              type="number"
              step="0.1"
              value={moisture}
              onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
              help="Acceptable limit <= 12.0%"
            />
            <Select
              label="Quality Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value as any)}
              options={[
                { value: "Grade A", label: "Grade A (Prime Quality)" },
                { value: "Standard", label: "Standard" },
                { value: "Substandard", label: "Substandard (Aeration needed)" },
              ]}
            />
          </div>

          {/* Payout calculation preview */}
          <div className="p-3 bg-[#eeeae4] rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1a2319]">Total MSP Payout (DBT):</span>
            <span className="text-base font-bold font-display text-[#1d6b3a]">
              ₹{calculatedPayout.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ddd9d2]">
            <Button variant="ghost" onClick={() => setSelectedProc(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveWeights} disabled={loading || netWeight <= 0}>
              {loading ? "Calculating..." : "Authorize & Complete Settlement"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Procurement Receipt Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={!!receiptModal}
        onClose={() => setReceiptModal(null)}
        title="Procurement Settlement Receipt"
        maxWidth="max-w-md"
      >
        {receiptModal && (
          <div className="space-y-4 text-xs font-sans">
            <div className="border border-dashed border-[#1d6b3a] rounded-xl p-5 bg-[#f7f4ef]">
              <div className="text-center pb-3 border-b border-[#ddd9d2]">
                <div className="font-display font-bold text-base text-[#1d6b3a]">
                  PUNJAB STATE APMC MANDI BOARD
                </div>
                <div className="text-[11px] text-[#697067]">Procurement Receipt · Form 8-A</div>
              </div>

              <div className="py-3 space-y-1.5 border-b border-[#ddd9d2]">
                <div className="flex justify-between">
                  <span className="text-[#697067]">Token No:</span>
                  <span className="font-bold text-[#1d6b3a]">{receiptModal.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697067]">Farmer:</span>
                  <span className="font-bold">{receiptModal.farmer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697067]">Commodity:</span>
                  <span>{receiptModal.commodity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697067]">Net Produce:</span>
                  <span className="font-bold">{receiptModal.net_weight_quintals} Quintals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697067]">Moisture Tested:</span>
                  <span>{receiptModal.moisture_percent}% ({receiptModal.grade})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697067]">MSP Rate:</span>
                  <span>₹{receiptModal.msp_per_quintal}/Qtl</span>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center text-sm font-bold text-[#1a2319]">
                <span>Total DBT Payout:</span>
                <span className="text-base text-[#1d6b3a]">
                  ₹{receiptModal.total_payout?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                Print Voucher 🖨
              </Button>
              <Button size="sm" variant="primary" onClick={() => setReceiptModal(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
