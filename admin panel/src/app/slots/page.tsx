"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, StatusBadge, Modal, Input, Select } from "@/components/ui";
import { api } from "@/lib/api";
import { Slot } from "@/lib/types";
import { useAdmin } from "@/lib/adminContext";

export default function SlotManagerPage() {
  const { selectedCentreId: centreId, currentCentre } = useAdmin();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalAction, setModalAction] = useState<"editCapacity" | "addSlot" | null>(null);
  const [newCapacity, setNewCapacity] = useState<number>(20);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  const [commodity, setCommodity] = useState("Wheat (Kanak)");
  const [loading, setLoading] = useState(false);

  const refreshSlots = async () => {
    if (!centreId) return;
    setLoading(true);
    const data = await api.getSlots(centreId, selectedDate);
    setSlots(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshSlots();
  }, [centreId, selectedDate]);

  const handleToggleClose = async (slot: Slot) => {
    setLoading(true);
    await api.toggleSlotClosed(slot.id, !slot.is_closed);
    await refreshSlots();
    setLoading(false);
  };

  const handleCapacitySubmit = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    await api.updateSlotCapacity(selectedSlot.id, newCapacity);
    setModalAction(null);
    setSelectedSlot(null);
    await refreshSlots();
    setLoading(false);
  };

  const totalBooked = slots.reduce((acc, s) => acc + s.booked, 0);
  const totalCapacity = slots.reduce((acc, s) => acc + s.capacity, 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
            Slot & Daily Capacity Manager
          </h1>
          <p className="text-sm text-[#697067] mt-1">
            Control hourly mandi intake quotas, emergency weather closures, and yard scheduling
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold bg-white border border-[#ddd9d2] rounded-xl text-[#1a2319] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1d6b3a]"
          />
          <Button variant="primary" icon="➕" onClick={() => setModalAction("addSlot")}>
            Add Time Block
          </Button>
        </div>
      </div>

      {/* ── Daily Summary Bar ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between p-4">
          <div>
            <span className="text-xs text-[#697067] uppercase font-bold">Total Daily Allocation</span>
            <div className="text-xl font-bold font-display text-[#1a2319] mt-0.5">
              {totalCapacity} Deliveries Max
            </div>
          </div>
          <span className="text-2xl">📅</span>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <span className="text-xs text-[#697067] uppercase font-bold">Current Bookings</span>
            <div className="text-xl font-bold font-display text-[#1d6b3a] mt-0.5">
              {totalBooked} of {totalCapacity} Booked
            </div>
          </div>
          <span className="text-2xl">🚜</span>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <span className="text-xs text-[#697067] uppercase font-bold">Yard Utilization</span>
            <div className="text-xl font-bold font-display text-[#b87333] mt-0.5">
              {totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0}% Filled
            </div>
          </div>
          <span className="text-2xl">⚖</span>
        </Card>
      </div>

      {/* ── Hourly Time Block Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot) => {
          const isFull = slot.booked >= slot.capacity;
          const pct = Math.round((slot.booked / slot.capacity) * 100);

          return (
            <Card
              key={slot.id}
              className={`flex flex-col justify-between transition-all ${
                slot.is_closed ? "opacity-60 bg-gray-50 border-dashed" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#697067]">{slot.slot_ref}</span>
                  <StatusBadge status={slot.status} size="sm" />
                </div>

                <div className="text-lg font-bold font-display text-[#1a2319]">{slot.time}</div>
                <div className="text-xs text-[#697067] mt-0.5">{slot.commodity}</div>

                {slot.note && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 text-amber-900 text-xs">
                    ⚠️ {slot.note}
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#697067]">Capacity Reserved</span>
                    <span className="font-bold text-[#1a2319]">
                      {slot.booked} / {slot.capacity}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#eeeae4] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? "bg-red-500" : pct > 75 ? "bg-amber-500" : "bg-[#1d6b3a]"
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#ddd9d2] flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setNewCapacity(slot.capacity);
                    setModalAction("editCapacity");
                  }}
                >
                  Adjust Quota
                </Button>

                <Button
                  size="sm"
                  variant={slot.is_closed ? "secondary" : "ghost"}
                  onClick={() => handleToggleClose(slot)}
                >
                  {slot.is_closed ? "Reopen Slot" : "Emergency Close"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Edit Capacity Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={modalAction === "editCapacity"}
        onClose={() => setModalAction(null)}
        title={`Adjust Quota for ${selectedSlot?.time}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#697067]">
            Currently booked: <strong>{selectedSlot?.booked} farmers</strong>. You cannot reduce capacity below the booked count.
          </p>

          <Input
            label="Slot Intake Limit (Farmers / Vehicles)"
            type="number"
            min={selectedSlot?.booked || 1}
            max={50}
            value={newCapacity}
            onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ddd9d2]">
            <Button variant="ghost" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCapacitySubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Quota"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Add Time Block Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={modalAction === "addSlot"}
        onClose={() => setModalAction(null)}
        title="Add New Intake Window"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <Select
            label="Commodity"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            options={[
              { value: "Wheat (Kanak)", label: "Wheat (Kanak)" },
              { value: "Paddy", label: "Paddy" },
              { value: "Mustard", label: "Mustard" },
            ]}
          />

          <Input
            label="Default Capacity"
            type="number"
            value={newCapacity}
            onChange={(e) => setNewCapacity(parseInt(e.target.value) || 20)}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ddd9d2]">
            <Button variant="ghost" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalAction(null);
                refreshSlots();
              }}
            >
              Create Window
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
