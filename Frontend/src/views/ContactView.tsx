"use client";

import { useState, FormEvent } from "react";
import FooterShell from "./FooterShell";
import { Card, Button, Input, Icon } from "../components/ui";
import { useLanguage } from "../lib/languageContext";

export default function ContactView() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    issueType: "Booking",
    bookingRef: "",
    message: "",
    consent: false,
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [referenceId, setReferenceId] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  const issueTypes = [
    { id: "Booking", label: t("contact_opt_booking", "Booking") },
    { id: "Queue", label: t("tab_queue", "Queue") },
    { id: "Procurement Status", label: t("tab_status", "Procurement Status") },
    { id: "Account", label: t("step_farmer_title", "Account") },
    { id: "Technical Issue", label: t("contact_opt_tech", "Technical Issue") },
    { id: "Other", label: t("faq_cat_general", "Other") },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate inputs
    if (!formData.name.trim()) {
      setValidationError("Please enter your name.");
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setValidationError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.message.trim()) {
      setValidationError("Please enter your message or question.");
      return;
    }

    if (!formData.consent) {
      setValidationError("Please acknowledge the consent checkbox to proceed.");
      return;
    }

    setStatus("submitting");

    // Simulate async submission with reference ID generation
    setTimeout(() => {
      const generatedId = `KS-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
      setReferenceId(generatedId);
      setStatus("success");
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      mobile: "",
      email: "",
      issueType: "Booking",
      bookingRef: "",
      message: "",
      consent: false,
    });
    setStatus("idle");
    setReferenceId("");
    setValidationError("");
  };

  return (
    <FooterShell currentPage="contact" breadcrumb={[{ label: t("nav_contact", "Contact") }]}>
      <div className="space-y-12 sm:space-y-16">
        
        {/* ── 1. Hero ────────────────────────────────────────────────────── */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-green-200">
            <Icon name="mail" size={14} className="text-primary" />
            <span>{t("contact_badge", "Support & Assistance")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
            {t("contact_hero_title", "Contact KisanSetu")}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("contact_hero_sub", "Need help with your booking, account, queue or procurement status? Send us a message.")}
          </p>
        </section>

        {/* ── 2. Contact Options Cards ─────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-foreground">
              {t("contact_badge", "Contact Channels")}
            </h2>
            <span className="text-xs text-muted-foreground">{t("toll_free_hours", "Mon-Sat · 6:00 AM – 10:00 PM")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 flex flex-col justify-between border-t-4 border-t-primary">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <Icon name="phone" size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">{t("toll_free_title", "Toll-Free Kisan Helpline")}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("qa_call_helpline", "Call our helpline for immediate queue assistance and booking updates.")}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-lg text-primary">1800-180-1551</p>
                <p className="text-muted-foreground">{t("toll_free_hours", "Mon-Sat · 6:00 AM – 10:00 PM")}</p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-t-4 border-t-primary">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <Icon name="calendar" size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">{t("contact_opt_booking", "Booking Help")}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("problem_1_desc", "Assistance with slot selection, rescheduling, and center availability.")}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1 font-mono">
                <p>Email: <span className="text-foreground">support@kisansetu.in</span></p>
                <p>SMS / WhatsApp: <span className="text-foreground">+91 98765-11001</span></p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-t-4 border-t-primary">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <Icon name="settings" size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">{t("contact_opt_tech", "Technical Support")}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("feat_1_desc", "Help with mobile OTP verification, token display or connection issues.")}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground space-y-1 font-mono">
                <p>Email: <span className="text-foreground">tech@kisansetu.in</span></p>
                <p>Portal: <span className="text-foreground">SIH2026 Simulation</span></p>
              </div>
            </Card>
          </div>
        </section>

        {/* ── 3. Contact Form ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form (lg:col-span-8) */}
          <div className="lg:col-span-8">
            <Card className="p-6 sm:p-8 bg-white border border-border">
              <h2 className="text-2xl font-bold font-display text-foreground mb-1">
                {t("send_message_title", "Send a Support Message")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                {t("still_have_questions_sub", "Reach out to our support team for assistance with bookings, account issues, or Mandi information.")}
              </p>

              {status === "success" ? (
                <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto">
                    <Icon name="check" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-green-900">
                      {t("msg_sent_success", "Message Sent Successfully!")}
                    </h3>
                    <p className="text-sm text-green-800 mt-1">
                      {t("form_success_msg", "Your support request has been submitted successfully.")}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-green-200 max-w-sm mx-auto text-left text-xs space-y-1">
                    <p className="text-muted-foreground">{t("msg_ref_id", "Support Reference ID:")}</p>
                    <p className="text-base font-bold font-mono text-primary">
                      {referenceId}
                    </p>
                    <p className="text-muted-foreground pt-1">
                      {t("form_issue_category", "Issue Category")}: <span className="font-semibold text-foreground">{formData.issueType}</span>
                    </p>
                    <p className="text-muted-foreground">
                      {t("mobile_label", "Mobile Number")}: <span className="font-semibold text-foreground">{formData.mobile}</span>
                    </p>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleReset}>
                    {t("send_another_msg", "Send another message")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {validationError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                      <Icon name="warning" size={16} className="shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                        {t("form_full_name", "Full Name")} *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                        {t("form_mobile_number", "10-Digit Mobile Number")} *
                      </label>
                      <Input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                        {t("form_issue_category", "Issue Category")} *
                      </label>
                      <select
                        value={formData.issueType}
                        onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                        className="w-full bg-white border border-border focus:border-primary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none transition-all"
                      >
                        {issueTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                        {t("form_booking_ref", "Booking / Token Reference (Optional)")}
                      </label>
                      <Input
                        type="text"
                        value={formData.bookingRef}
                        onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                        placeholder="e.g. KS-240912-0842"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      {t("form_message_label", "Your Message")} *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t("help_search_placeholder", "Describe what you need assistance with...")}
                      className="w-full bg-white border border-border focus:border-primary rounded-xl p-3 text-sm text-foreground outline-none transition-all resize-y placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                      {t("form_consent", "I agree that the details provided may be used to contact me regarding this support request.")}
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" size="lg" disabled={status === "submitting"} fullWidth>
                      {status === "submitting" ? "Sending..." : t("form_submit_btn", "Send Support Request")}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Sidebar Info (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 bg-secondary/50 border border-green-200">
              <h3 className="font-bold text-foreground text-sm mb-2 flex items-center gap-2">
                <Icon name="shield" size={16} className="text-primary" />
                <span>{t("features_title", "Farmer First Platform")}</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("footer_tagline", "KisanSetu is built to ensure fair, transparent Mandi queuing without middlemen or manual favoritism.")}
              </p>
            </Card>
          </div>
        </section>
      </div>
    </FooterShell>
  );
}
