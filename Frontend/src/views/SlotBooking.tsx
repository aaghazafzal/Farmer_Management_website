"use client";

import { useState } from "react";
import { Button, Icon, Card, StatusBadge } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
}

export default function SlotBooking({ navigate }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [selDate, setSelDate] = useState(1);
  const [selSlot, setSelSlot] = useState(1);

  const steps = [
    { n: 1, title: t("select_center", "Select Centre"), sub: "Procurement Centre" },
    { n: 2, title: t("choose_date", "Choose Date"),   sub: t("today", "Upcoming days") },
    { n: 3, title: t("pick_slot", "Pick Slot"),     sub: t("time_slot", "Arrival time") },
    { n: 4, title: t("review_confirm", "Confirm"),       sub: t("booking_token_label", "Review pass") },
  ];

  const dates = [
    { d: "12 Sep", day: t("today", "Today"),     slots: 4 },
    { d: "13 Sep", day: t("tomorrow", "Tomorrow"),  slots: 14 },
    { d: "14 Sep", day: "Saturday",  slots: 20 },
    { d: "15 Sep", day: "Sunday",    slots: 0 },
    { d: "16 Sep", day: "Monday",    slots: 18 },
  ];

  const slotTimes = ["09:30–10:00", "10:30–11:00", "11:00–11:30", "12:00–12:30", "14:30–15:00", "15:30–16:00"];

  const next = () => {
    if (step === 3) navigate("booking-confirmed");
    else setStep(s => s + 1);
  };
  const back = () => {
    if (step === 0) navigate("slot-recommendation");
    else setStep(s => s - 1);
  };

  const canNext = step === 0 || step === 1 || (step === 2 && selSlot >= 0) || step === 3;

  return (
    <FarmerShell navigate={navigate} current="find-center" title={t("btn_book_slot", "Book a Slot")} back="">

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP BOOKING WIZARD (md:block 12-col layout)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-6">
        
        {/* Step Progress Tracker */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs">
          <div className="grid grid-cols-4 gap-4">
            {steps.map((s, i) => {
              const isDone = i < step;
              const isCurr = i === step;
              return (
                <div key={s.n} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border-2 transition-all ${
                    isDone
                      ? "bg-primary border-primary text-white"
                      : isCurr
                      ? "border-primary text-primary bg-secondary/80 shadow-xs"
                      : "border-border text-muted-foreground bg-muted"
                  }`}>
                    {isDone ? <Icon name="check" size={18} /> : s.n}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isCurr ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 12-Col Split: 4 cols sticky summary + 8 cols interactive step */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Live Booking Summary Rail (4 Cols) */}
          <div className="col-span-4 sticky top-24 space-y-4">
            <Card className="p-5 border-2 border-primary/20 bg-[#fcfaf7]">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {t("review_confirm", "Booking Summary")}
              </span>
              <h3 className="font-bold text-foreground font-display text-lg mt-1 mb-4">
                ABC Procurement Centre
              </h3>

              <div className="space-y-3 text-xs border-y border-border py-3.5 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("center_id", "Centre Code")}</span>
                  <span className="font-mono font-bold text-foreground">CTR-AMR-001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("choose_date", "Chosen Date")}</span>
                  <span className="font-bold text-foreground">{dates[selDate].day}, {dates[selDate].d}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("time_slot", "Time Slot")}</span>
                  <span className="font-bold text-primary">{selSlot >= 0 ? slotTimes[selSlot] : "Not Selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("stat_est_wait", "Expected Queue")}</span>
                  <span className="font-bold text-foreground">~8 Ahead (Low Wait)</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Icon name="shield" size={14} className="text-primary shrink-0" />
                {t("booking_advice", "Guaranteed bay access within scheduled arrival window.")}
              </p>
            </Card>

            <div className="bg-secondary rounded-2xl p-4 border border-green-200 text-xs text-secondary-foreground">
              <p className="font-bold mb-1">{t("gate_directions", "Documents for Gate Verification")}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("verified_farmer", "Aadhaar Card of registered farmer")}</li>
                <li>{t("step_1_crop", "Land revenue / registration slip")}</li>
                <li>{t("dbt_transfer", "Bank passbook for MSP credit")}</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Active Step Content (8 Cols) */}
          <div className="col-span-8 space-y-6">
            
            {/* Step 0: Centre Selection */}
            {step === 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold font-display text-foreground mb-1">
                  {t("select_center", "Step 1: Choose Procurement Centre")}
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  {t("find_center_sub", "Select where you want to deliver your harvest.")}
                </p>

                <div className="space-y-3">
                  {[
                    { name: "ABC Procurement Centre", dist: "4.2 km away", slots: 8, address: "Main Road, Kotla Kalan, Amritsar", selected: true },
                    { name: "Sector 12 Centre", dist: "6.8 km away", slots: 3, address: "Industrial Focal Point, Amritsar", selected: false },
                    { name: "Ropar Grain Depot", dist: "11.1 km away", slots: 14, address: "Bypass Road, Ropar", selected: false },
                  ].map(c => (
                    <div
                      key={c.name}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        c.selected ? "border-2 border-primary bg-secondary/30 shadow-xs" : "border-border hover:border-primary/40 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-base text-foreground font-display">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.address} · {c.dist}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status="available" label={`${c.slots} ${t("slots_left", "slots")}`} />
                          {c.selected && <Icon name="check_circle" size={22} className="text-primary" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 1: Date Selection */}
            {step === 1 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold font-display text-foreground mb-1">
                  {t("choose_date", "Step 2: Choose Delivery Date")}
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  {t("available_slots", "Select an upcoming date with open weighbridge slots.")}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {dates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => d.slots > 0 && setSelDate(i)}
                      disabled={d.slots === 0}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selDate === i
                          ? "border-primary bg-secondary/50 shadow-xs"
                          : d.slots === 0
                          ? "border-border bg-muted opacity-50 cursor-not-allowed"
                          : "border-border bg-white hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-foreground">{d.day}</span>
                        {d.slots === 0 ? (
                          <StatusBadge status="full" label={t("full_capacity", "Full")} />
                        ) : (
                          <StatusBadge status={d.slots < 5 ? "limited" : "available"} label={`${d.slots} ${t("slots_left", "Free")}`} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{d.d}, September 2026</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 2: Slot Selection */}
            {step === 2 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold font-display text-foreground">
                    {t("pick_slot", "Step 3: Choose Arrival Time Slot")}
                  </h2>
                  <span className="text-xs font-bold text-primary bg-secondary px-3 py-1 rounded-full border border-green-200">
                    {dates[selDate].day}, {dates[selDate].d}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  {t("time_slot", "Select a 30-minute arrival window that works best with your tractor travel time.")}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {slotTimes.map((tTime, i) => (
                    <button
                      key={tTime}
                      onClick={() => setSelSlot(i)}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selSlot === i
                          ? "border-primary bg-secondary shadow-xs"
                          : "border-border bg-white hover:border-primary/40"
                      }`}
                    >
                      <p className="font-bold text-foreground text-sm">{tTime}</p>
                      <p className="text-xs text-muted-foreground mt-1">~{15 + i * 5} min wait</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Step 3: Confirmation Review */}
            {step === 3 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold font-display text-foreground mb-1">
                  {t("review_confirm", "Step 4: Review and Confirm Booking")}
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  {t("booking_advice", "Verify your delivery details before generating your digital booking pass.")}
                </p>

                <div className="p-5 bg-[#fcfaf7] rounded-xl border border-border space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("centre", "Centre")}</span>
                    <span className="font-bold text-foreground">ABC Procurement Centre</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("date", "Delivery Date")}</span>
                    <span className="font-bold text-foreground">{dates[selDate].day}, {dates[selDate].d} 2026</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("time_slot", "Time Slot")}</span>
                    <span className="font-bold text-primary">{slotTimes[selSlot]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("form_full_name", "Farmer Name")}</span>
                    <span className="font-bold text-foreground">Ramesh Kumar (ID: KS-240912)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("stat_est_wait", "Estimated Queue Wait")}</span>
                    <span className="font-bold text-amber-700">~25 to 30 Minutes</span>
                  </div>
                </div>

                <div className="p-3.5 bg-secondary rounded-xl border border-green-200 text-xs text-secondary-foreground flex items-center gap-2.5">
                  <Icon name="check_circle" size={18} className="text-primary shrink-0" />
                  <span>{t("booking_advice", "An SMS confirmation with entry gate reference will be sent to your registered mobile number.")}</span>
                </div>
              </Card>
            )}

            {/* Desktop Action Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="lg" onClick={back} icon={<Icon name="arrow_left" size={18} />}>
                {step === 0 ? t("btn_cancel", "Cancel & Return") : t("btn_back", "Previous Step")}
              </Button>
              <Button size="lg" onClick={next} disabled={!canNext} icon={step < 3 ? <Icon name="arrow_right" size={18} /> : undefined}>
                {step === 3 ? t("btn_confirm_booking", "Confirm Booking") : t("continue_btn", "Proceed to Next Step")}
              </Button>
            </div>

          </div>

        </div>

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE STEP WIZARD (md:hidden single-column compact)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden pb-20 space-y-4">
        
        {/* Mobile Step Bar */}
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-border text-xs">
          <span className="font-bold text-primary">Step {step + 1} of 4</span>
          <span className="text-muted-foreground font-semibold">{steps[step].title}</span>
        </div>

        {/* Mobile Step Contents */}
        {step === 0 && (
          <Card className="p-4">
            <h2 className="font-bold text-foreground text-sm font-display mb-3">{t("select_center", "Select Centre")}</h2>
            <div className="space-y-2">
              {[
                { name: "ABC Procurement Centre", dist: "4.2 km", slots: 8, selected: true },
                { name: "Sector 12 Mandi Centre", dist: "6.8 km", slots: 3, selected: false },
                { name: "Ropar Grain Depot", dist: "11.1 km", slots: 14, selected: false },
              ].map(c => (
                <div
                  key={c.name}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    c.selected ? "border-primary bg-secondary/30 font-bold" : "border-border bg-white"
                  }`}
                >
                  <div>
                    <p className="text-foreground">{c.name}</p>
                    <p className="text-muted-foreground">{c.dist}</p>
                  </div>
                  <span className="text-primary font-semibold">{c.slots} {t("slots_left", "slots")}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-4">
            <h2 className="font-bold text-foreground text-sm font-display mb-3">{t("choose_date", "Choose Delivery Date")}</h2>
            <div className="space-y-2">
              {dates.map((d, i) => (
                <button
                  key={i}
                  onClick={() => d.slots > 0 && setSelDate(i)}
                  className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between ${
                    selDate === i ? "border-primary bg-secondary/50 font-bold" : "border-border bg-white"
                  }`}
                >
                  <span>{d.day} ({d.d})</span>
                  <span>{d.slots} {t("slots_left", "slots")}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-4">
            <h2 className="font-bold text-foreground text-sm font-display mb-3">{t("pick_slot", "Choose Arrival Time")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {slotTimes.map((tTime, i) => (
                <button
                  key={tTime}
                  onClick={() => setSelSlot(i)}
                  className={`p-3 rounded-xl border text-center text-xs ${
                    selSlot === i ? "border-primary bg-secondary font-bold text-primary" : "border-border bg-white text-foreground"
                  }`}
                >
                  {tTime}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-4 space-y-3">
            <h2 className="font-bold text-foreground text-sm font-display">{t("review_confirm", "Review Booking")}</h2>
            <div className="text-xs space-y-1.5 p-3 rounded-lg bg-[#fcfaf7] border border-border">
              <p><span className="text-muted-foreground">{t("centre", "Centre")}:</span> <strong>ABC Procurement Centre</strong></p>
              <p><span className="text-muted-foreground">{t("date", "Date")}:</span> <strong>{dates[selDate].day}, {dates[selDate].d}</strong></p>
              <p><span className="text-muted-foreground">{t("time_slot", "Slot")}:</span> <strong className="text-primary">{slotTimes[selSlot]}</strong></p>
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          <Button size="md" variant="outline" fullWidth onClick={back}>
            {step === 0 ? t("btn_cancel", "Cancel") : t("btn_back", "Back")}
          </Button>
          <Button size="md" fullWidth onClick={next} disabled={!canNext}>
            {step === 3 ? t("btn_confirm", "Confirm") : t("continue_btn", "Next")}
          </Button>
        </div>
      </div>

    </FarmerShell>
  );
}
