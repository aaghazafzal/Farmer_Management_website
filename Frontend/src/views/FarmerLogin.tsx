"use client";

import { useState } from "react";
import { Button, Logo, Input, Icon, Card } from "../components/ui";
import { useLanguage } from "../lib/languageContext";

interface Props {
  navigate: (view: string) => void;
}

type AuthState = "idle" | "in_progress" | "success" | "failed";
type AuthErrorType = "invalid_credentials" | "network" | "server" | "timeout" | "unknown";

export default function FarmerLogin({ navigate }: Props) {
  const { language, currentLanguage, setLanguage, supportedLanguages, t, isRTL } = useLanguage();
  const [method, setMethod] = useState<"phone" | "id">("phone");
  const [phone, setPhone] = useState("98765 43210");
  const [farmerId, setFarmerId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["1", "2", "3", "4"]);
  const [langOpen, setLangOpen] = useState(false);

  // Auth State Machine
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [errorType, setErrorType] = useState<AuthErrorType>("invalid_credentials");
  const [showTestScenarios, setShowTestScenarios] = useState(false);

  const getErrorMessage = (type: AuthErrorType): string => {
    switch (type) {
      case "invalid_credentials":
        return t("auth_invalid_credentials", "Your login details could not be verified.");
      case "network":
        return t("auth_network_failure", "We couldn't connect to the server. Check your internet connection and try again.");
      case "server":
        return t("auth_server_failure", "We're having trouble signing you in right now. Please try again.");
      case "timeout":
        return t("auth_timeout", "Sign-in is taking longer than expected. Please try again.");
      default:
        return t("auth_unknown_error", "Something went wrong while signing you in.");
    }
  };

  const executeLogin = (scenario?: AuthErrorType | "success") => {
    setAuthState("in_progress");

    const code = otp.join("");
    let outcome: "success" | AuthErrorType = "success";

    if (scenario) {
      outcome = scenario;
    } else if (code === "0000") {
      outcome = "invalid_credentials";
    } else if (code === "9999") {
      outcome = "network";
    } else if (code === "8888") {
      outcome = "server";
    } else if (code === "7777") {
      outcome = "timeout";
    }

    setTimeout(() => {
      if (outcome === "success") {
        setAuthState("success");
        setTimeout(() => {
          navigate("farmer-dashboard");
        }, 500);
      } else {
        setErrorType(outcome);
        setAuthState("failed");
      }
    }, 900);
  };

  const handleSendOtp = () => {
    if (phone.trim()) {
      setOtpSent(true);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f7f4ef] flex flex-col justify-between text-foreground ${isRTL ? "text-right" : "text-left"}`}>
      {/* ── Top Bar ── */}
      <div className="w-full max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("landing")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Icon name="arrow_left" size={16} className={isRTL ? "rtl-flip" : ""} />
          {t("btn_home", "Back to Home")}
        </button>

        {/* Language dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-border hover:bg-muted transition-colors shadow-xs cursor-pointer"
          >
            <Icon name="language" size={14} className="text-primary" />
            <span>{currentLanguage.native}</span>
          </button>
          {langOpen && (
            <div className={`absolute top-full mt-1 bg-white border border-border rounded-xl shadow-lg p-1.5 z-50 w-44 ${isRTL ? "left-0" : "right-0"}`}>
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t("select_language", "Select Language")}
              </div>
              {supportedLanguages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-muted transition-colors flex items-center justify-between cursor-pointer ${
                    language === l.code ? "text-primary font-bold bg-primary/5" : "text-foreground"
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-[10px] text-muted-foreground">({l.name})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Form Container ── */}
      <div className="w-full max-w-md mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-border shadow-xs mb-3">
            <Logo size={42} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">
            {t("brand_name", "KisanSetu")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("hero_desc", "Book procurement slots & track your queue in real time")}
          </p>
        </div>

        <Card className="p-6 shadow-sm border border-border bg-white min-h-[380px] flex flex-col justify-center">

          {/* ══════════════════════════════════════════════════════════════════
              STATE 1: LOGIN IN PROGRESS (Accessible Dedicated View)
              ══════════════════════════════════════════════════════════════════ */}
          {authState === "in_progress" && (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-200" role="status" aria-live="polite">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/80 flex items-center justify-center border border-green-200">
                <span className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-foreground">
                  {t("auth_logging_in", "Logging you in...")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {t("auth_verifying_account", "Verifying your account credentials...")}
                </p>
              </div>
              <div className="w-48 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STATE 2: LOGIN SUCCESS
              ══════════════════════════════════════════════════════════════════ */}
          {authState === "success" && (
            <div className="text-center py-8 space-y-3 animate-in fade-in zoom-in-95 duration-200" role="status">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-100 text-green-700 flex items-center justify-center border border-green-300">
                <Icon name="check" size={28} />
              </div>
              <h2 className="text-lg font-bold font-display text-foreground">
                {t("login_success_title", "Login Successful")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("redirecting_dashboard", "Entering your procurement dashboard...")}
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STATE 3: LOGIN FAILED (Differentiated Errors + Retry)
              ══════════════════════════════════════════════════════════════════ */}
          {authState === "failed" && (
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-200" role="alert">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-2xs">
                <Icon name="warning" size={26} />
              </div>

              <div>
                <h2 className="text-lg font-bold font-display text-foreground">
                  {t("auth_login_failed_title", "Login Failed")}
                </h2>
                <p className="text-xs text-red-700 font-medium mt-1.5 p-2.5 bg-red-50/70 rounded-xl border border-red-200 max-w-sm mx-auto leading-relaxed">
                  {getErrorMessage(errorType)}
                </p>
              </div>

              <div className="space-y-2 pt-2 max-w-xs mx-auto">
                <Button fullWidth size="md" onClick={() => executeLogin("success")}>
                  {t("auth_try_again", "Try Again")}
                </Button>
                <Button
                  fullWidth
                  size="md"
                  variant="outline"
                  onClick={() => setAuthState("idle")}
                >
                  {t("auth_back_to_login", "Back to Login")}
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STATE 4: IDLE (Standard Login Form)
              ══════════════════════════════════════════════════════════════════ */}
          {authState === "idle" && (
            <>
              {/* Method Selector Tabs */}
              <div className="flex bg-muted rounded-xl p-1 mb-5">
                <button
                  onClick={() => { setMethod("phone"); setOtpSent(false); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    method === "phone" ? "bg-white text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("mobile_label", "Mobile Number (OTP)")}
                </button>
                <button
                  onClick={() => { setMethod("id"); setOtpSent(false); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    method === "id" ? "bg-white text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("step_farmer_title", "Farmer ID / Aadhaar")}
                </button>
              </div>

              {method === "phone" ? (
                !otpSent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        {t("mobile_label", "Phone Number")}
                      </label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3.5 bg-muted border border-border rounded-xl text-sm font-bold text-foreground">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder={t("enter_otp", "Enter 10-digit mobile number")}
                          className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-base text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all min-h-[50px]"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {t("farmer_login_sub", "A 4-digit verification code will be sent via SMS.")}
                      </p>
                    </div>

                    <Button fullWidth size="lg" onClick={handleSendOtp} icon={<Icon name="arrow_right" size={18} className={isRTL ? "rtl-flip" : ""} />}>
                      {t("send_otp", "Send Verification Code")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center pb-1">
                      <span className="text-xs font-semibold text-primary bg-secondary px-2.5 py-1 rounded-full border border-green-200">
                        OTP sent to +91 {phone}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 text-center">
                        {t("enter_otp", "Enter 4-Digit Code")}
                      </label>
                      <div className="flex justify-center gap-3">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={e => {
                              const nextOtp = [...otp];
                              nextOtp[i] = e.target.value;
                              setOtp(nextOtp);
                            }}
                            className="w-12 h-14 text-center text-2xl font-bold bg-white border-2 border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                          />
                        ))}
                      </div>
                    </div>

                    <Button fullWidth size="lg" onClick={() => executeLogin()} icon={<Icon name="check" size={18} />}>
                      {t("verify_and_continue", "Verify & Enter Portal")}
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => setOtpSent(false)}
                        className="text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                      >
                        {t("change_number", "Change Number")}
                      </button>
                      <button
                        onClick={handleSendOtp}
                        className="text-primary hover:underline font-semibold cursor-pointer"
                      >
                        {t("resend_otp", "Resend OTP (30s)")}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <Input
                    label={t("farmer_reg_id_label", "Farmer Registration ID or Aadhaar")}
                    placeholder="e.g. PB-AMR-2026-8841"
                    icon={<Icon name="profile" size={18} />}
                    value={farmerId}
                    onChange={e => setFarmerId(e.target.value)}
                    hint={t("farmer_id_hint", "Your state agricultural department registration number")}
                  />
                  <Input
                    label={t("reg_pin_label", "Registered Mobile Pin / Password")}
                    type="password"
                    placeholder="••••"
                    icon={<Icon name="shield" size={18} />}
                  />
                  <Button fullWidth size="lg" onClick={() => executeLogin()}>
                    {t("sign_in_farmer_id", "Sign In with Farmer ID")}
                  </Button>
                </div>
              )}

              {/* Quick Demo Shortcut */}
              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <button
                  onClick={() => executeLogin("success")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-secondary/80 hover:bg-secondary text-secondary-foreground text-xs font-bold transition-all border border-green-200 shadow-2xs cursor-pointer"
                >
                  <Icon name="star" size={15} className="text-yellow-600" />
                  {t("demo_shortcut", "Quick Demo: Continue as Ramesh Kumar")}
                </button>

                {/* Simulation / Test Scenarios Collapsible */}
                <div className="text-center pt-1">
                  <button
                    onClick={() => setShowTestScenarios(v => !v)}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    {t("auth_test_scenarios", "Simulate Error Scenarios (QA)")}
                  </button>

                  {showTestScenarios && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2 p-2 bg-[#fcfaf7] border border-border rounded-xl text-[11px]">
                      <button
                        onClick={() => executeLogin("invalid_credentials")}
                        className="p-1.5 rounded-lg bg-white border border-border hover:bg-muted text-foreground font-semibold cursor-pointer"
                      >
                        {t("auth_test_invalid_otp", "Invalid OTP")}
                      </button>
                      <button
                        onClick={() => executeLogin("network")}
                        className="p-1.5 rounded-lg bg-white border border-border hover:bg-muted text-foreground font-semibold cursor-pointer"
                      >
                        {t("auth_test_network_error", "Network Error")}
                      </button>
                      <button
                        onClick={() => executeLogin("server")}
                        className="p-1.5 rounded-lg bg-white border border-border hover:bg-muted text-foreground font-semibold cursor-pointer"
                      >
                        {t("auth_test_server_error", "Server Error")}
                      </button>
                      <button
                        onClick={() => executeLogin("timeout")}
                        className="p-1.5 rounded-lg bg-white border border-border hover:bg-muted text-foreground font-semibold cursor-pointer"
                      >
                        {t("auth_test_timeout", "Timeout Error")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </Card>

        {/* Link to Staff Portal */}
        <div className="text-center mt-5 text-sm text-muted-foreground">
          {t("procurement_officer_prompt", "Are you a procurement centre officer?")}{" "}
          <button
            onClick={() => navigate("staff-login")}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            {t("staff_login_portal_link", "Staff Login Portal →")}
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        {t("sih_footer_tag", "Smart India Hackathon 2026 · Problem Statement SIH26032 · KisanSetu")}
      </footer>
    </div>
  );
}
