"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, StatusBadge, Modal, Input, Select } from "@/components/ui";
import { api } from "@/lib/api";
import { Centre } from "@/lib/types";

export default function CentresDirectoryPage() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await api.getCentres();
      setCentres(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-display text-[#1a2319]">
            Mandi Directory & Yard Management
          </h1>
          <p className="text-sm text-[#697067] mt-1">
            District procurement yards, active weighbridge bays, and daily intake quotas
          </p>
        </div>

        <Button variant="primary" icon="➕" onClick={() => setModalOpen(true)}>
          Register New Mandi Yard
        </Button>
      </div>

      {/* ── Centres Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {centres.map((centre) => (
          <Card key={centre.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-[#1d6b3a]">{centre.code}</span>
                  <h2 className="font-display font-bold text-lg text-[#1a2319]">{centre.name}</h2>
                </div>
                <StatusBadge status={centre.status} />
              </div>

              <p className="text-xs text-[#697067] mb-4">📍 {centre.address}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#f7f4ef] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#697067]">Operating Hours</span>
                  <div className="font-semibold text-[#1a2319] mt-0.5">{centre.operating_hours}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#697067]">Weighbridges</span>
                  <div className="font-semibold text-[#1a2319] mt-0.5">{centre.weighbridge_count} Active Bays</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#697067]">Daily Capacity</span>
                  <div className="font-semibold text-[#1d6b3a] mt-0.5">{centre.max_daily_capacity} Qtl Max</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {centre.commodities.map((crop) => (
                  <span
                    key={crop}
                    className="px-2.5 py-0.5 bg-white rounded-md border border-[#ddd9d2] text-[11px] font-medium text-[#1a2319]"
                  >
                    🌾 {crop}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#ddd9d2] flex items-center justify-between">
              <div className="text-xs text-[#697067]">
                Helpline: <strong className="text-[#1a2319]">{centre.phone}</strong>
              </div>
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedCentre(centre)}>
                  Edit Quotas
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Add / Edit Mandi Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen || !!selectedCentre}
        onClose={() => {
          setModalOpen(false);
          setSelectedCentre(null);
        }}
        title={selectedCentre ? `Edit ${selectedCentre.name}` : "Register APMC Procurement Centre"}
      >
        <div className="space-y-4">
          <Input label="Mandi Name" defaultValue={selectedCentre?.name || ""} placeholder="e.g., Majitha Grain Market" />
          <Input label="Location / District" defaultValue={selectedCentre?.location || ""} placeholder="e.g., Majitha, Amritsar" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Operating Hours" defaultValue={selectedCentre?.operating_hours || "08:00 AM – 05:00 PM"} />
            <Input label="Weighbridge Bays" type="number" defaultValue={selectedCentre?.weighbridge_count || 2} />
          </div>
          <Select
            label="Mandi Status"
            defaultValue={selectedCentre?.status || "open"}
            options={[
              { value: "open", label: "Open & Accepting Scheduled Bookings" },
              { value: "limited", label: "Limited Space / Restricted Intake" },
              { value: "closed", label: "Temporarily Closed (Weather / Holiday)" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-[#ddd9d2]">
            <Button
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                setSelectedCentre(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalOpen(false);
                setSelectedCentre(null);
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
