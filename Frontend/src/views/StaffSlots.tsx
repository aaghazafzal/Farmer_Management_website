"use client";

import { useState } from "react";
import { Button, Icon, Card } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext, ProcurementSlot, SlotStatus } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

const statusColors: Record<SlotStatus, string> = {
  available: "text-emerald-700 bg-emerald-50 border-emerald-200",
  limited:   "text-amber-700 bg-amber-50 border-amber-200",
  full:      "text-red-700 bg-red-50 border-red-200",
  closed:    "text-gray-600 bg-gray-100 border-gray-300",
};

export default function StaffSlots({ navigate }: Props) {
  const { t } = useLanguage();
  const {
    slots,
    createSlot,
    updateSlotCapacity,
    toggleSlotStatus,
    showToast,
  } = useStaffContext();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:00");
  const [capacity, setCapacity] = useState("20");
  const [commodity, setCommodity] = useState("Wheat (Kanak)");
  const [note, setNote] = useState("");

  const [capacityEditModal, setCapacityEditModal] = useState<ProcurementSlot | null>(null);
  const [newCapVal, setNewCapVal] = useState(20);

  // Compute stats
  const totalCap = slots.reduce((acc, s) => acc + s.capacity, 0);
  const totalBooked = slots.reduce((acc, s) => acc + s.booked, 0);
  const totalAvailable = Math.max(0, totalCap - totalBooked);
  const fullSlotsCount = slots.filter(s => s.status === "full" || s.booked >= s.capacity).length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      showToast("Capacity must be greater than 0", "error");
      return;
    }

    createSlot({
      time: `${startTime}–${endTime}`,
      startTime,
      endTime,
      capacity: capNum,
      commodity,
      note: note.trim() || undefined,
    });

    setCreateModalOpen(false);
    setNote("");
  };

  const handleOpenCapEdit = (slot: ProcurementSlot) => {
    setCapacityEditModal(slot);
    setNewCapVal(slot.capacity);
  };

  const handleSaveCapEdit = () => {
    if (!capacityEditModal) return;
    updateSlotCapacity(capacityEditModal.id, newCapVal);
    setCapacityEditModal(null);
  };

  return (
    <StaffShell navigate={navigate} current="staff-slots">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                {t("slot_management_title", "Slot & Capacity Management")}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Active Schedule
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Thursday, 12 September 2026 · ABC Procurement Centre
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              icon={<Icon name="booking" size={15} />}
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary text-white hover:bg-[#155c30] shadow-sm font-semibold"
            >
              + Create New Slot
            </Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl p-4 border border-border bg-white shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Capacity
              </p>
              <Icon name="warehouse" size={18} className="text-primary" />
            </div>
            <p className="text-3xl font-bold font-display text-foreground mt-1">{totalCap}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Farmers allowed</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-blue-50/70 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Booked Slots
              </p>
              <Icon name="booking" size={18} className="text-blue-700" />
            </div>
            <p className="text-3xl font-bold font-display text-blue-950 mt-1">{totalBooked}</p>
            <p className="text-xs text-blue-800 mt-0.5">
              {Math.round((totalBooked / (totalCap || 1)) * 100)}% utilized
            </p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-emerald-50/70 border-emerald-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                Remaining Space
              </p>
              <Icon name="check_circle" size={18} className="text-emerald-700" />
            </div>
            <p className="text-3xl font-bold font-display text-emerald-950 mt-1">{totalAvailable}</p>
            <p className="text-xs text-emerald-800 mt-0.5">Open for booking</p>
          </div>

          <div className="rounded-2xl p-4 border border-border bg-amber-50/70 border-amber-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                Full Slots
              </p>
              <Icon name="warning" size={18} className="text-amber-700" />
            </div>
            <p className="text-3xl font-bold font-display text-amber-950 mt-1">{fullSlotsCount}</p>
            <p className="text-xs text-amber-800 mt-0.5">Out of {slots.length} windows</p>
          </div>
        </div>

        {/* Timeline Visualizer */}
        <Card className="p-4 sm:p-5 border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-foreground font-display text-sm">
                Hourly Throughput &amp; Load Distribution
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribution of arrivals throughout Thursday operational hours
              </p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Peak: 10:00–11:00 AM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {slots.map(s => {
              const pct = Math.round((s.booked / (s.capacity || 1)) * 100);
              const isFull = s.status === "full" || pct >= 100;
              const isClosed = s.status === "closed";

              return (
                <div key={s.id} className="p-3 rounded-xl border border-border bg-[#fbf9f5] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-foreground">{s.startTime}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isClosed ? "bg-gray-400" : isFull ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                  <div className="my-2">
                    <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isClosed ? "bg-gray-400" : isFull ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${isClosed ? 100 : pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{isClosed ? "Closed" : `${s.booked}/${s.capacity}`}</span>
                    <span className="font-semibold text-foreground">{isClosed ? "—" : `${pct}%`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Slot Table */}
        <Card className="overflow-hidden border border-border bg-white shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="font-bold text-foreground font-display text-base">
                Procurement Slot Registry
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage quotas, toggle window statuses, or adjust capacities in real time
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {slots.length} time windows configured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[680px]">
              <thead>
                <tr className="border-b border-border bg-[#fbf9f5] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3.5">Time Window</th>
                  <th className="px-4 py-3.5">Commodity</th>
                  <th className="px-4 py-3.5">Capacity</th>
                  <th className="px-4 py-3.5">Booked</th>
                  <th className="px-4 py-3.5">Utilization</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {slots.map(slot => {
                  const pct = Math.round((slot.booked / (slot.capacity || 1)) * 100);
                  const isClosed = slot.status === "closed";

                  return (
                    <tr key={slot.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Icon name="booking" size={16} className="text-primary shrink-0" />
                          <div>
                            <p className="font-mono font-bold text-sm text-foreground">{slot.time}</p>
                            {slot.note && (
                              <p className="text-xs text-muted-foreground italic">{slot.note}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-foreground">
                        {slot.commodity}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-foreground text-sm">
                          {slot.capacity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">bags</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-primary text-sm">
                          {slot.booked}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">farmers</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="w-28 space-y-1">
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isClosed
                                  ? "bg-gray-400"
                                  : pct >= 100
                                  ? "bg-red-500"
                                  : pct >= 80
                                  ? "bg-amber-500"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${isClosed ? 100 : pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{pct}% filled</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                            statusColors[slot.status]
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              slot.status === "available"
                                ? "bg-emerald-500"
                                : slot.status === "limited"
                                ? "bg-amber-500"
                                : slot.status === "full"
                                ? "bg-red-500"
                                : "bg-gray-400"
                            }`}
                          />
                          {slot.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCapEdit(slot)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-white hover:bg-muted text-foreground transition-colors cursor-pointer"
                          >
                            Edit Cap
                          </button>
                          <button
                            onClick={() => toggleSlotStatus(slot.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              isClosed
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                            }`}
                          >
                            {isClosed ? "Reopen" : "Close"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Create New Slot */}
        {createModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setCreateModalOpen(false)}
          >
            <form
              onSubmit={handleCreateSubmit}
              className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="booking" size={18} className="text-primary" />
                  <h3 className="font-bold text-foreground font-display text-base">
                    Create Procurement Slot
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Commodity
                  </label>
                  <select
                    value={commodity}
                    onChange={e => setCommodity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Wheat (Kanak)">Wheat (Kanak)</option>
                    <option value="Paddy (Dhan)">Paddy (Dhan)</option>
                    <option value="Mustard (Sarson)">Mustard (Sarson)</option>
                    <option value="Maize (Makka)">Maize (Makka)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Farmer / Bag Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Operational Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dedicated for tractor trolleys, Bay 2 priority"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button type="submit" size="sm" fullWidth>
                  Save & Publish Slot
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Edit Capacity */}
        {capacityEditModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setCapacityEditModal(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-sm w-full p-5 border border-border shadow-2xl animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-foreground font-display text-base">
                  Update Slot Capacity
                </h3>
                <button
                  onClick={() => setCapacityEditModal(null)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <p className="text-muted-foreground">
                  Window: <strong>{capacityEditModal.time}</strong> ({capacityEditModal.commodity})
                </p>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    New Capacity (Currently: {capacityEditModal.capacity}, Booked: {capacityEditModal.booked})
                  </label>
                  <input
                    type="number"
                    min={capacityEditModal.booked}
                    max={100}
                    value={newCapVal}
                    onChange={e => setNewCapVal(parseInt(e.target.value, 10) || capacityEditModal.booked)}
                    className="w-full p-2.5 rounded-xl border border-border bg-[#f7f4ef] text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cannot be lower than current bookings ({capacityEditModal.booked}).
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" fullWidth onClick={handleSaveCapEdit}>
                  Save Capacity
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setCapacityEditModal(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
