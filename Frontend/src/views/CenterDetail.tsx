"use client";

import { Button, Icon, Card, StatusBadge } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
}

type SlotStatus = "available" | "limited" | "full";

const slots: { time: string; status: SlotStatus; booked: number; total: number }[] = [
  { time: "08:00–09:00", status: "available", booked: 12, total: 20 },
  { time: "09:00–10:00", status: "limited",   booked: 17, total: 20 },
  { time: "10:00–11:00", status: "full",       booked: 20, total: 20 },
  { time: "11:00–12:00", status: "available",  booked: 8,  total: 20 },
  { time: "12:00–13:00", status: "available",  booked: 5,  total: 20 },
  { time: "14:00–15:00", status: "limited",    booked: 16, total: 20 },
  { time: "15:00–16:00", status: "available",  booked: 10, total: 20 },
];

const slotColors: Record<SlotStatus, { bg: string; text: string; bar: string }> = {
  available: { bg: "bg-green-50 border-green-200", text: "text-green-700", bar: "bg-green-500" },
  limited:   { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", bar: "bg-amber-400" },
  full:      { bg: "bg-red-50 border-red-200",     text: "text-red-600",   bar: "bg-red-400" },
};

export default function CenterDetail({ navigate }: Props) {
  const { t } = useLanguage();

  const checklist = [
    t("checklist_item_1", "Bring required documents (land revenue records, Aadhaar card, bank passbook)"),
    t("checklist_item_2", "Bring your harvested produce in standard jute bags or approved containers"),
    t("checklist_item_3", "Arrive within 15 minutes of your booked time slot to avoid forfeiture"),
    t("checklist_item_4", "Keep your booking SMS / Reference number available at the entry gate"),
  ];

  return (
    <FarmerShell navigate={navigate} current="find-center" title={t("center_detail_title", "Centre Details")} back="find-center">

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP CENTRE DETAIL LAYOUT (md:grid grid-cols-12 gap-6)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        
        {/* Top Hero Banner */}
        <div className="bg-primary rounded-2xl p-6 mb-6 text-white shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-green-200 bg-white/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {t("procurement_centre_badge", "Procurement Centre")}
                </span>
                <span className="text-xs text-green-200">{t("centre_code", "Centre Code")}: <strong>CTR-AMR-001</strong></span>
              </div>
              <h1 className="text-3xl font-bold font-display">ABC Procurement Centre</h1>
              <div className="flex items-center gap-3 mt-1 text-green-100 text-sm">
                <p className="flex items-center gap-1.5">
                  <Icon name="pin" size={15} /> Main Road, Kotla Kalan, Amritsar · 4.2 km
                </p>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=31.6340,74.8723"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Icon name="arrow_right" size={13} />
                  {t("get_directions", "Get Directions")}
                </a>
              </div>
            </div>
            <StatusBadge status="open" label={t("open_for_procurement", "Open for Procurement")} />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/20 text-center">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-green-200">{t("operating_hours", "Operating Hours")}</p>
              <p className="text-base font-bold font-display mt-0.5">08:00 – 17:00</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-green-200">{t("current_queue", "Current Queue")}</p>
              <p className="text-base font-bold font-display mt-0.5">27 {t("farmers_waiting", "Farmers Waiting")}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-green-200">{t("average_wait_time", "Average Wait Time")}</p>
              <p className="text-base font-bold font-display mt-0.5">~35 Minutes</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-green-200">{t("daily_capacity_filled", "Daily Capacity Filled")}</p>
              <p className="text-base font-bold font-display mt-0.5">140 / 200 Slots</p>
            </div>
          </div>
        </div>

        {/* 12-Col Content Grid: 8 cols slots + 4 cols sticky sidebar */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Slot Matrix & Smart Recommendation (8 Cols) */}
          <div className="col-span-8 space-y-6">
            
            {/* Smart Recommendation Banner */}
            <div className="bg-secondary rounded-2xl p-5 border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                  <Icon name="star" size={20} className="text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t("recommended_slot_banner", "Recommended Slot for Fastest Processing")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("recommended_slot_sub", "Tomorrow 10:30–11:00 AM has 40% shorter queue wait time.")}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate("slot-recommendation")}>
                {t("btn_view_recommendation", "View Recommendation →")}
              </Button>
            </div>

            {/* Time Slot Availability Grid */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold font-display text-foreground">
                    {t("todays_schedule_title", "Today's Procurement Slot Schedule")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("todays_schedule_sub", "Click an open slot to begin immediate booking")}
                  </p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {t("weighbridge_bays", "Weighbridge Bay 1 & 2")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {slots.map(s => {
                  const c = slotColors[s.status];
                  const pct = Math.round((s.booked / s.total) * 100);
                  const isFull = s.status === "full";

                  return (
                    <div
                      key={s.time}
                      onClick={() => !isFull && navigate("slot-booking")}
                      className={`p-4 rounded-xl border transition-all ${c.bg} ${
                        !isFull
                          ? "hover:shadow-sm cursor-pointer hover:border-primary/60"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-base font-bold font-display text-foreground">{s.time}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 ${c.text}`}>
                          {isFull ? t("fully_booked", "Fully Booked") : s.status === "limited" ? t("limited_spots", "Limited Spots") : t("open_available", "Open Available")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{s.booked} / {s.total}</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="h-2 bg-white/80 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>

          {/* RIGHT: Checklist & Centre Contact Sidebar (4 Cols) */}
          <div className="col-span-4 sticky top-24 space-y-6">
            
            {/* Quick Action Card */}
            <Card className="p-5 border-2 border-primary/30 shadow-xs bg-white text-center">
              <h3 className="font-bold text-foreground font-display text-base mb-1">
                {t("ready_to_reserve", "Ready to Reserve Your Slot?")}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {t("saves_waiting_note", "Advance slot booking helps reduce waiting and makes your visit predictable.")}
              </p>
              <Button fullWidth size="lg" onClick={() => navigate("slot-booking")} icon={<Icon name="calendar" size={18} />}>
                {t("proceed_to_booking", "Proceed to Slot Booking")}
              </Button>
            </Card>

            {/* What to Bring Checklist */}
            <Card className="p-5">
              <h3 className="font-bold text-foreground font-display text-sm mb-3 flex items-center gap-2">
                <Icon name="shield" size={16} className="text-primary" />
                {t("previsit_checklist", "Pre-Visit Centre Checklist")}
              </h3>
              <div className="space-y-2.5">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                    <Icon name="check_circle" size={15} className="text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Centre Contact info */}
            <div className="bg-[#fcfaf7] border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-bold text-foreground">{t("centre_staff_contact", "Centre Staff Contact")}</p>
              <p>{t("staff_on_duty", "Centre Staff")} · <strong>+91 98765-11001</strong></p>
              <p>Centre Address: GT Road, Near Grain Yard, Kotla Kalan, Amritsar</p>
            </div>

          </div>

        </div>

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE CENTRE DETAIL (md:hidden compact flow)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-4">
        
        {/* Mobile Hero */}
        <div className="bg-primary rounded-xl p-4 text-white">
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-lg font-bold font-display">ABC Procurement Centre</h1>
            <StatusBadge status="open" label={t("status_open", "Open")} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-green-200 text-xs">Main Road, Kotla Kalan · 4.2 km</p>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=31.6340,74.8723"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-white bg-white/20 px-2 py-0.5 rounded"
            >
              {t("get_directions", "Get Directions")} ↗
            </a>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-[10px] text-green-200">{t("operating_hours", "Hours")}</p>
              <p className="font-bold font-display">08:00–17:00</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-[10px] text-green-200">{t("current_queue", "Queue")}</p>
              <p className="font-bold font-display">27</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-[10px] text-green-200">{t("average_wait_time", "Wait")}</p>
              <p className="font-bold font-display">~35 min</p>
            </div>
          </div>
        </div>

        {/* Mobile Slots List */}
        <Card className="p-4">
          <h2 className="font-bold text-foreground text-sm font-display mb-3">
            {t("todays_slots", "Today's Slots")}
          </h2>
          <div className="space-y-2">
            {slots.map(s => {
              const c = slotColors[s.status];
              return (
                <button
                  key={s.time}
                  onClick={() => s.status !== "full" && navigate("slot-booking")}
                  disabled={s.status === "full"}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold ${c.bg} ${c.text}`}
                >
                  <span>{s.time}</span>
                  <span>{s.status === "full" ? t("status_full", "Full") : `${s.booked}/${s.total} booked`}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Mobile Action CTA */}
        <Button fullWidth size="lg" onClick={() => navigate("slot-booking")}>
          {t("btn_book_procurement_slot", "Book a Procurement Slot")}
        </Button>

      </div>

    </FarmerShell>
  );
}