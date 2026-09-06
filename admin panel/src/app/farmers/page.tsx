"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, StatusBadge, Input, Modal } from "@/components/ui";
import { api } from "@/lib/api";
import { FarmerRecord } from "@/lib/types";

export default function FarmersRegistryPage() {
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRecord | null>(null);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const data = await api.getFarmers();
      setFarmers(data);
    }
    load();
  }, []);

  const filtered = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.farmer_reference.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search) ||
      f.village.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = (farmerId: string) => {
    setCheckedInIds((prev) => new Set(prev).add(farmerId));
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
            Farmer Verification Registry
          </h1>
          <p className="text-sm text-[#697067] mt-1">
            Verify booked arrivals against land records, Aadhaar references, and passbooks
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by name, ID (F-XXXXX), phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Farmers Table ───────────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f7f4ef] border-b border-[#ddd9d2] text-[#697067] uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Farmer ID</th>
                <th className="py-3.5 px-4">Farmer Name</th>
                <th className="py-3.5 px-4">Village / District</th>
                <th className="py-3.5 px-4">Land Holding</th>
                <th className="py-3.5 px-4">Today's Token</th>
                <th className="py-3.5 px-4">Total Deliveries</th>
                <th className="py-3.5 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeae4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-sm text-[#697067]">
                    No farmers found matching "{search}".
                  </td>
                </tr>
              ) : (
                filtered.map((farmer) => {
                  const isCheckedIn = checkedInIds.has(farmer.id);

                  return (
                    <tr key={farmer.id} className="hover:bg-[#f7f4ef] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1d6b3a]">
                        {farmer.farmer_reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1a2319]">{farmer.name}</div>
                        <div className="text-[11px] text-[#697067]">{farmer.phone_masked}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {farmer.village}, {farmer.district}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{farmer.land_area}</td>
                      <td className="py-3.5 px-4">
                        {farmer.active_booking ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1d6b3a]">
                              {farmer.active_booking.token}
                            </span>
                            <StatusBadge
                              status={farmer.active_booking.status as any}
                              size="sm"
                            />
                          </div>
                        ) : (
                          <span className="text-[#697067] italic">No active booking</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1a2319]">
                        {farmer.total_deliveries} times
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedFarmer(farmer)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant={isCheckedIn ? "secondary" : "primary"}
                          disabled={isCheckedIn}
                          onClick={() => handleCheckIn(farmer.id)}
                        >
                          {isCheckedIn ? "Verified ✓" : "Gate Check-In"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Farmer Details Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedFarmer}
        onClose={() => setSelectedFarmer(null)}
        title={`Farmer Profile · ${selectedFarmer?.farmer_reference}`}
        maxWidth="max-w-lg"
      >
        {selectedFarmer && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#f7f4ef] rounded-xl p-4 border border-[#ddd9d2]">
              <div className="text-base font-bold text-[#1a2319]">{selectedFarmer.name}</div>
              <div className="text-[#697067] mt-0.5">
                Phone: {selectedFarmer.phone} · {selectedFarmer.village}, {selectedFarmer.district}, {selectedFarmer.state}
              </div>
              <div className="mt-2 text-[#1d6b3a] font-semibold">
                Land Parcel: {selectedFarmer.land_area} verified under Punjab Land Records (PLRS)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#ddd9d2]">
                <div className="text-[#697067] text-[10px] uppercase font-bold">Past Deliveries</div>
                <div className="text-xl font-bold text-[#1a2319] mt-1">
                  {selectedFarmer.total_deliveries} completed
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#ddd9d2]">
                <div className="text-[#697067] text-[10px] uppercase font-bold">Aadhaar Status</div>
                <div className="text-sm font-bold text-emerald-700 mt-1">
                  ✓ Biometrically Linked
                </div>
              </div>
            </div>

            {selectedFarmer.active_booking && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="font-bold text-[#1d6b3a] text-sm">Today's Procurement Window</div>
                <div className="text-[#1a2319] mt-1">
                  Token: <strong>{selectedFarmer.active_booking.token}</strong> ·{" "}
                  {selectedFarmer.active_booking.commodity} (
                  {selectedFarmer.active_booking.quantity})
                </div>
                <div className="text-[#697067] mt-0.5">
                  Slot: {selectedFarmer.active_booking.slot_time}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#ddd9d2] flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedFarmer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
