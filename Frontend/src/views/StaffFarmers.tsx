"use client";

import { useState } from "react";
import { Button, Icon, Card } from "../components/ui";
import StaffShell from "./StaffShell";
import { useLanguage } from "../lib/languageContext";
import { useStaffContext, FarmerRecord, QueueStatus } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

const statusColors: Record<QueueStatus, string> = {
  processing: "text-blue-700 bg-blue-50 border-blue-200",
  waiting:    "text-amber-700 bg-amber-50 border-amber-200",
  arrived:    "text-emerald-700 bg-emerald-50 border-emerald-200",
  delayed:    "text-red-700 bg-red-50 border-red-200",
  completed:  "text-gray-600 bg-gray-50 border-gray-200",
};

export default function StaffFarmers({ navigate }: Props) {
  const { t } = useLanguage();
  const { farmers, showToast, addAuditLog } = useStaffContext();

  const [filter, setFilter] = useState<"all" | QueueStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerRecord | null>(null);

  const filteredFarmers = farmers.filter(f => {
    if (filter !== "all" && f.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const mName = f.name.toLowerCase().includes(q);
      const mRef = f.reference.toLowerCase().includes(q);
      const mPhone = f.phoneMasked.toLowerCase().includes(q);
      const mBooking = f.currentBookingId.toLowerCase().includes(q);
      const mVillage = f.village.toLowerCase().includes(q);
      const mCrop = f.commodity.toLowerCase().includes(q);
      if (!mName && !mRef && !mPhone && !mBooking && !mVillage && !mCrop) {
        return false;
      }
    }
    return true;
  });

  const handleSendSmsNotice = (farmer: FarmerRecord) => {
    showToast(`SMS dispatch sent to ${farmer.name} (${farmer.phoneMasked})`, "success");
    addAuditLog(`Sent SMS notification to ${farmer.name} (${farmer.reference})`);
  };

  return (
    <StaffShell navigate={navigate} current="staff-farmers">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                {t("farmer_directory_title", "Farmer Directory & Records")}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified Farmers
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Thursday, 12 September 2026 · {farmers.length} active registered farmer accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Icon name="refresh" size={14} />}
              onClick={() => showToast("Farmer directory synchronized", "info")}
            >
              {t("btn_refresh", "Sync Records")}
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border shadow-2xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Farmers" },
              { id: "processing", label: "Processing" },
              { id: "waiting", label: "Waiting" },
              { id: "arrived", label: "Arrived" },
              { id: "delayed", label: "Delayed" },
              { id: "completed", label: "Completed" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === tab.id
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-[#f7f4ef] text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Icon
              name="search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, reference (F-10482), phone, village..."
              className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-border bg-[#f7f4ef] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        {/* Farmers Table */}
        <Card className="overflow-hidden border border-border bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-[#fbf9f5] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3.5">Farmer &amp; ID</th>
                  <th className="px-4 py-3.5">Contact (Masked)</th>
                  <th className="px-4 py-3.5">Village &amp; Land</th>
                  <th className="px-4 py-3.5">Booking / Token</th>
                  <th className="px-4 py-3.5">Crop &amp; Quantity</th>
                  <th className="px-4 py-3.5">Today&apos;s Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      <Icon name="search" size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                      No farmers found matching query &ldquo;{search}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredFarmers.map(f => (
                    <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {f.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{f.name}</p>
                            <p className="text-xs font-mono text-muted-foreground">{f.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono text-foreground whitespace-nowrap">
                        {f.phoneMasked}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-foreground">{f.village}</p>
                        <p className="text-xs text-muted-foreground">{f.landArea}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm bg-muted px-2.5 py-0.5 rounded text-foreground">
                            {f.queueNumber}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                            {f.currentBookingId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-foreground">{f.commodity}</p>
                        <p className="text-xs text-muted-foreground">{f.quantity}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                            statusColors[f.status]
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              f.status === "processing"
                                ? "bg-blue-500 animate-pulse"
                                : f.status === "delayed"
                                ? "bg-red-500"
                                : f.status === "completed"
                                ? "bg-gray-400"
                                : f.status === "arrived"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedFarmer(f)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-white hover:bg-muted text-foreground transition-colors cursor-pointer"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Slide-out Farmer Detail Panel */}
        {selectedFarmer && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
            onClick={() => setSelectedFarmer(null)}
          >
            <div
              className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {selectedFarmer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground font-display text-base">
                        {selectedFarmer.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground">
                        {selectedFarmer.reference}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>

                {/* Farmer Profile Card */}
                <div className="p-4 rounded-xl bg-[#f7f4ef] border border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Contact Phone:</span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {selectedFarmer.phoneMasked}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Village & District:</span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedFarmer.village}, Amritsar
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Cultivated Land:</span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedFarmer.landArea}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Lifetime Deliveries:</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {selectedFarmer.totalDeliveries} Completed Cycles
                    </span>
                  </div>
                </div>

                {/* Today's Procurement Record */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Today&apos;s Active Booking
                  </h4>
                  <div className="p-3.5 rounded-xl border border-border bg-white space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token Number:</span>
                      <span className="font-mono font-bold text-foreground">
                        {selectedFarmer.queueNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking ID:</span>
                      <span className="font-mono text-foreground">{selectedFarmer.currentBookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commodity:</span>
                      <span className="font-semibold text-foreground">{selectedFarmer.commodity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Declared Volume:</span>
                      <span className="font-semibold text-foreground">{selectedFarmer.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-semibold capitalize text-primary">
                        {selectedFarmer.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Communications Notice */}
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Icon name="mail" size={14} /> SMS Dispatch Service
                  </p>
                  <p className="text-xs leading-relaxed text-blue-800">
                    Staff can dispatch automated arrival tokens and moisture alerts directly to the farmer&apos;s registered mobile without exposing unmasked personal numbers.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => handleSendSmsNotice(selectedFarmer)}
                  icon={<Icon name="bell" size={14} />}
                >
                  Send Status SMS to Farmer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => setSelectedFarmer(null)}
                >
                  Close Record
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
