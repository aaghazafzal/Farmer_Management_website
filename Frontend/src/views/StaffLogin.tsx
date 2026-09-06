"use client";

import { useState } from "react";
import { Button, Logo, Input, Icon } from "../components/ui";
import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
}

export default function StaffLogin({ navigate }: Props) {
  const { language, currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a2319] flex flex-col justify-between">
      {/* Top Header Bar */}
      <div className="w-full max-w-sm mx-auto px-4 pt-6 flex items-center justify-between">
        <button
          onClick={() => navigate("landing")}
          className="text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Icon name="arrow_left" size={14} />
          {t("btn_home", "Back to Home")}
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
          >
            <Icon name="language" size={13} className="text-green-300" />
            <span>{currentLanguage.native}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg p-1.5 z-50 w-40">
              {supportedLanguages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    language === l.code ? "bg-primary text-white" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {l.native} ({l.name})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2.5 justify-center mb-6">
            <Logo size={36} white />
            <span className="text-2xl font-bold text-white font-display">KisanSetu</span>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-bold mb-4 border border-green-200">
              <Icon name="warehouse" size={13} />
              {t("procurement_centre_staff_badge", "Procurement Centre Staff")}
            </div>
            <h1 className="text-2xl font-bold text-foreground font-display mb-1">
              {t("staff_portal", "Staff Portal")}
            </h1>
            <p className="text-sm text-muted-foreground mb-5">
              {t("staff_portal_sub", "Sign in to manage your centre's operations.")}
            </p>

            <div className="space-y-4">
              <Input label={t("form_procurement_centre", "Centre ID")} placeholder="e.g. CTR-AMR-001" icon={<Icon name="warehouse" size={16} />} />
              <Input label={t("staff_id_username", "Staff ID / Username")} placeholder="Your username" icon={<Icon name="profile" size={16} />} />
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">
                  {t("password_label", "Password")}
                </label>
                <input type="password" placeholder="••••••••"
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all min-h-[52px]" />
              </div>
              <Button fullWidth size="lg" onClick={() => navigate("staff-dashboard")}>
                {t("sign_in_staff_btn", "Sign In to Staff Portal")}
              </Button>
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex gap-2">
                <Icon name="shield" size={15} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t("staff_portal_desc", "Access is restricted to authorised staff only. All actions are logged and audited.")}
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-white/50 mt-5">
            {t("looking_for_farmer", "Looking for the farmer portal?")}{" "}
            <button onClick={() => navigate("farmer-login")} className="text-white/80 hover:text-white font-semibold hover:underline cursor-pointer">
              {t("farmer_login_link", "Farmer login")}
            </button>
          </p>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-white/30">
        Smart India Hackathon 2026 · Problem Statement SIH26032 · KisanSetu
      </div>
    </div>
  );
}
