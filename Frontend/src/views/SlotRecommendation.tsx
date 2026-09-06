"use client";

import { Button, Icon, Card } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
}

export default function SlotRecommendation({ navigate }: Props) {
  const { t } = useLanguage();

  return (
    <FarmerShell navigate={navigate} current="find-center" title={t("recommendation_title", "Recommended Slots")} back="center-detail">
      <div className="p-4 space-y-5 pb-6">

        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("recommendation_sub", "Based on current availability and expected queue conditions at ABC Procurement Centre.")}
          </p>
        </div>

        {/* Best slot */}
        <Card className="border-2 border-primary overflow-hidden">
          <div className="bg-primary px-4 py-2.5 flex items-center gap-2">
            <Icon name="star" size={16} className="text-yellow-300" />
            <span className="text-sm font-bold text-white">
              {t("best_choice", "Best Choice")}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-lg font-bold text-foreground font-display">Tomorrow</p>
                <p className="text-2xl font-bold text-primary font-display">10:30 – 11:00 AM</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("label_est_wait", "Est. wait")}</p>
                <p className="text-xl font-bold text-foreground font-display">20–25 min</p>
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-3 mb-4 border border-green-200">
              <p className="text-xs font-bold text-secondary-foreground mb-2 uppercase tracking-wide">
                {t("why_recommend", "Why we recommend this")}
              </p>
              <div className="space-y-1.5">
                {[
                  t("why_reason_1", "Lower current queue at this time"),
                  t("why_reason_2", "Good centre capacity — 14 of 20 slots free"),
                  t("why_reason_3", "Shorter expected wait than other options"),
                ].map((r, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Icon name="check" size={14} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => navigate("slot-booking")} icon={<Icon name="calendar" size={18} />}>
              {t("btn_choose_slot", "Choose this slot")}
            </Button>
          </div>
        </Card>

        {/* Alternative */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {t("alternative", "Alternative")}
          </p>
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">{t("label_today", "Today")}</p>
                <p className="text-lg font-bold text-foreground font-display">4:00 – 4:30 PM</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("label_est_wait", "Est. wait")}</p>
                <p className="text-lg font-bold text-amber-600 font-display">~45 min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 mb-3 border border-amber-100">
              <Icon name="warning" size={15} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">
                {t("longer_wait_warning", "Longer wait due to higher queue volume")}
              </p>
            </div>
            <Button fullWidth size="sm" variant="outline" onClick={() => navigate("slot-booking")}>
              {t("btn_choose_alternative", "Choose this instead")}
            </Button>
          </Card>
        </div>

        {/* Show all */}
        <button onClick={() => navigate("center-detail")} className="w-full text-center text-sm font-semibold text-primary hover:underline py-2 cursor-pointer">
          {t("btn_show_all_slots", "Show all available slots")}
        </button>

      </div>
    </FarmerShell>
  );
}
