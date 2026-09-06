"use client";

import { Button, Icon, Card } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";
import { ACTIVE_BOOKING } from "../lib/mockData";

interface Props {
  navigate: (view: string) => void;
}

export default function BookingConfirmed({ navigate }: Props) {
  const { t } = useLanguage();

  return (
    <FarmerShell navigate={navigate} current="my-bookings" title={t("booking_confirmed_title", "Booking Confirmed")}>
      <div className="max-w-2xl mx-auto p-4 pb-8 space-y-5">

        {/* Success Header */}
        <div className="flex flex-col items-center py-6 text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <Icon name="check" size={28} className="text-white" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              ✓
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
            {t("booking_confirmed_title", "Booking Confirmed!")}
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">
            {t("booking_confirmed_sub", "Your procurement slot has been reserved at")} {ACTIVE_BOOKING.centre}.
          </p>
        </div>

        {/* Booking Reference Card */}
        <Card className="p-5 text-center border-2 border-primary/30 bg-secondary/80">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">
            {t("booking_reference", "BOOKING REFERENCE")}
          </p>
          <p className="text-3xl font-bold text-foreground font-mono tracking-wider">
            {ACTIVE_BOOKING.id}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t("save_reference_note", "Keep this booking reference ready when arriving at the centre.")}
          </p>
        </Card>

        {/* Booking Details */}
        <Card className="p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            {t("reservation_details", "RESERVATION DETAILS")}
          </h2>
          {[
            { icon: "warehouse", label: t("label_centre", "Centre"), value: ACTIVE_BOOKING.centre },
            { icon: "calendar",  label: t("label_date", "Date"), value: ACTIVE_BOOKING.fullDate },
            { icon: "clock",     label: t("label_time", "Slot Window"), value: ACTIVE_BOOKING.slot },
            { icon: "queue",     label: t("queue_position_label", "Queue Position"), value: `${ACTIVE_BOOKING.queuePosition} (3 tokens ahead)` },
            { icon: "clock",     label: t("estimated_waiting_label", "Estimated Wait"), value: `~${ACTIVE_BOOKING.estimatedWait}` },
            { icon: "pin",       label: t("gate_entry_label", "Gate Entry"), value: ACTIVE_BOOKING.gateEntry },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between text-xs py-1.5 border-b border-border/60 last:border-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name={icon} size={15} className="text-primary" />
                <span>{label}</span>
              </div>
              <span className="font-bold text-foreground">{value}</span>
            </div>
          ))}
        </Card>

        {/* Before You Arrive Checklist */}
        <Card className="p-5 bg-[#fcfaf7] border border-border">
          <h2 className="font-bold text-foreground font-display mb-3 text-xs uppercase tracking-wider">
            {t("before_you_arrive_title", "BEFORE YOU ARRIVE")}
          </h2>
          <div className="space-y-2 text-xs">
            {ACTIVE_BOOKING.arrivalInstructions.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Icon name="check_circle" size={15} className="text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Action CTAs */}
        <div className="space-y-2.5 pt-2">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate("queue-tracking")}
            icon={<Icon name="queue" size={18} />}
          >
            {t("btn_track_live_queue", "Track Live Queue")}
          </Button>

          <div className="flex gap-3">
            <Button
              fullWidth
              size="md"
              variant="outline"
              onClick={() => navigate("my-bookings")}
              icon={<Icon name="booking" size={16} />}
            >
              {t("btn_view_all_bookings", "View My Bookings")}
            </Button>
            <Button
              fullWidth
              size="md"
              variant="outline"
              onClick={() => navigate("farmer-dashboard")}
              icon={<Icon name="home" size={16} />}
            >
              {t("btn_dashboard", "Return to Dashboard")}
            </Button>
          </div>
        </div>

      </div>
    </FarmerShell>
  );
}
