"use client";

import { useState } from "react";
import { Button, Icon, Card, StatusBadge } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";
import { ACTIVE_BOOKING, COMPLETED_BOOKINGS, CANCELLED_BOOKINGS } from "../lib/mockData";
import { useStaffContext } from "../lib/staffStore";

interface Props {
  navigate: (view: string) => void;
}

export default function MyBookings({ navigate }: Props) {
  const { t, isRTL } = useLanguage();
  const { farmerBooking } = useStaffContext();
  const booking = farmerBooking || ACTIVE_BOOKING;

  const [activeTab, setActiveTab] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const tabs = [
    { label: t("tab_upcoming", "Upcoming"), count: isCancelled ? 0 : 1 },
    { label: t("tab_completed", "Completed"), count: COMPLETED_BOOKINGS.length },
    { label: t("tab_cancelled", "Cancelled"), count: isCancelled ? CANCELLED_BOOKINGS.length + 1 : CANCELLED_BOOKINGS.length },
  ];

  return (
    <FarmerShell navigate={navigate} current="my-bookings" title={t("my_bookings_page_title", "My Bookings")}>

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP BOOKINGS VIEW (Tight Spacing & Restrained Aesthetics)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-3.5 max-w-7xl mx-auto px-6 pt-3 pb-8">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display text-foreground tracking-tight">
              {t("my_bookings_page_title", "My Bookings")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("my_bookings_page_sub", "View upcoming visits, completed procurement records, and booking history.")}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("slot-booking")} icon={<Icon name="calendar" size={15} />}>
            {t("btn_book_procurement_slot", "Book Procurement Slot")}
          </Button>
        </div>

        {/* Tab Selector with item counts */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === idx
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white border border-border text-foreground hover:bg-muted"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === idx ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* TAB 0: UPCOMING BOOKINGS */}
        {activeTab === 0 && (
          <div>
            {isCancelled ? (
              <Card className="p-8 text-center text-muted-foreground bg-white">
                <Icon name="booking" size={32} className="mx-auto mb-2 opacity-25" />
                <h2 className="font-bold text-foreground text-sm font-display">
                  {t("no_active_bookings", "No upcoming bookings")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {t("no_active_bookings_sub", "You currently do not have any active procurement appointments scheduled.")}
                </p>
                <Button size="sm" className="mt-3" onClick={() => navigate("slot-booking")} icon={<Icon name="calendar" size={14} />}>
                  {t("btn_book_slot", "Book a Slot")}
                </Button>
              </Card>
            ) : (
              <Card className="p-4 border border-border hover:border-primary/40 shadow-2xs bg-white space-y-3">
                {/* Header Row: Status, Centre, Commodity & ID */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status="confirmed" label={t("status_confirmed", "● Confirmed")} />
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-[#f7f4ef] px-2 py-0.5 rounded border border-border">
                        {booking.id}
                      </span>
                    </div>
                    <h2 className="text-base font-bold font-display text-foreground">
                      {booking.centre}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {booking.centreAddress}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-foreground bg-[#f7f4ef] px-2.5 py-1 rounded-full border border-border">
                      {booking.commodity} · {booking.quantity}
                    </span>
                  </div>
                </div>

                {/* 4-Col Key Booking Specifications */}
                <div className="grid grid-cols-4 gap-2.5 p-2.5 rounded-xl bg-[#fcfaf7] border border-border text-xs">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("label_date", "Date")}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{booking.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("label_slot", "Slot")}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{booking.slot}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("queue_position_label", "Queue Position")}</p>
                    <p className="text-base font-bold text-primary font-display mt-0.5">{booking.queuePosition}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{t("assigned_bay_label", "Assigned Bay")}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{booking.weighbridgeBay}</p>
                  </div>
                </div>

                {/* "Plan your visit" Section (Clean, Restrained) */}
                <div className="p-2.5 rounded-xl bg-[#fcfaf7] border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Icon name="clock" size={13} className="text-primary" />
                      {t("plan_your_visit", "Plan your visit:")}
                    </span>
                    <span className="text-muted-foreground">
                      {t("gate_entry_time", "Gate entry:")} <strong className="text-foreground">{booking.gateEntry}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      {t("estimated_wait_label", "Estimated wait:")} <strong className="text-foreground">{booking.estimatedWait}</strong>
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">
                    {t("arrival_notice", "Arriving on time keeps the queue predictable")}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate("queue-tracking")}
                      icon={<Icon name="queue" size={14} />}
                    >
                      {t("btn_track_live_queue", "Track Live Queue")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDetailsModal(true)}
                    >
                      {t("btn_view_booking_details", "Booking Details")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("slot-booking")}
                    >
                      {t("btn_reschedule", "Reschedule")}
                    </Button>
                  </div>

                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer"
                  >
                    {t("btn_cancel_booking", "Cancel Booking")}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 1: COMPLETED BOOKINGS */}
        {activeTab === 1 && (
          <div className="space-y-2.5">
            {COMPLETED_BOOKINGS.map(item => (
              <Card key={item.id} className="p-3.5 border border-border bg-white hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status="completed" label={t("status_completed", "✓ Completed")} />
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-[#f7f4ef] px-2 py-0.5 rounded border border-border">
                        {item.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">{item.centre}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.commodity} · {item.quantity} · Reference: {item.reference}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <p className="text-foreground font-semibold">{item.date}</p>
                    <p className="text-muted-foreground">{item.slot}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/70 text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    Procurement verified and weighment completed.
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("procurement-status")}
                    icon={<Icon name="reports" size={13} />}
                  >
                    {t("btn_view_procurement_summary", "Procurement Summary")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 2: CANCELLED BOOKINGS */}
        {activeTab === 2 && (
          <div className="space-y-2.5">
            {isCancelled && (
              <Card className="p-3.5 border border-red-200 bg-red-50/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status="cancelled" label={t("status_cancelled", "× Cancelled")} />
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-white px-2 py-0.5 rounded border border-border">
                        {booking.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">{booking.centre}</h3>
                    <p className="text-xs text-red-700 mt-0.5">
                      Cancelled by farmer. Slot released for other farmers.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate("slot-booking")}>
                    {t("btn_book_slot", "Book Again")}
                  </Button>
                </div>
              </Card>
            )}

            {CANCELLED_BOOKINGS.map(item => (
              <Card key={item.id} className="p-3.5 border border-border bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status="cancelled" label={t("status_cancelled", "× Cancelled")} />
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-[#f7f4ef] px-2 py-0.5 rounded border border-border">
                        {item.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold font-display text-foreground">{item.centre}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.commodity} · {item.quantity} · {item.reason}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-muted-foreground font-semibold">{item.date}</p>
                    <Button size="sm" variant="outline" className="mt-1.5" onClick={() => navigate("slot-booking")}>
                      {t("btn_rebook", "Rebook Slot")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE BOOKINGS VIEW (md:hidden, Tight, Polished)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3 px-4 pt-3 pb-24">
        
        <div>
          <h1 className="text-lg font-bold font-display text-foreground">
            {t("my_bookings_page_title", "My Bookings")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("my_bookings_page_sub", "View upcoming visits, completed records, and history.")}
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="flex rounded-xl bg-white border border-border p-1">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === idx ? "bg-primary text-white" : "text-muted-foreground"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab 0 Mobile */}
        {activeTab === 0 && (
          <div>
            {isCancelled ? (
              <Card className="p-6 text-center text-muted-foreground">
                <p className="text-sm font-bold text-foreground">{t("no_active_bookings", "No upcoming bookings")}</p>
                <Button size="sm" className="mt-3" onClick={() => navigate("slot-booking")}>
                  {t("btn_book_slot", "Book a Slot")}
                </Button>
              </Card>
            ) : (
              <Card className="p-3.5 space-y-2.5 border border-border shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <StatusBadge status="confirmed" label={t("status_confirmed", "Confirmed")} />
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">{booking.id}</span>
                    </div>
                    <h2 className="font-bold text-sm text-foreground font-display">{booking.centre}</h2>
                    <p className="text-xs text-muted-foreground">{booking.commodity} · {booking.quantity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#fcfaf7] border border-border text-xs">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Slot & Date</p>
                    <p className="font-bold text-foreground">{booking.date}</p>
                    <p className="text-primary font-bold">{booking.slot}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Queue & Bay</p>
                    <p className="text-base font-bold text-primary">{booking.queuePosition}</p>
                    <p className="text-muted-foreground text-[11px]">{booking.weighbridgeBay}</p>
                  </div>
                </div>

                <div className="p-2 bg-[#fcfaf7] border border-border rounded-xl text-xs">
                  <p className="text-foreground">Gate: <strong>{booking.gateEntry}</strong> · Est. Wait: <strong>{booking.estimatedWait}</strong></p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button fullWidth size="sm" variant="outline" onClick={() => navigate("slot-booking")}>
                    {t("btn_reschedule", "Reschedule")}
                  </Button>
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full text-xs font-semibold text-red-600 hover:bg-red-50 py-1.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
                  >
                    {t("btn_cancel", "Cancel")}
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-2">
            {COMPLETED_BOOKINGS.map(item => (
              <Card key={item.id} className="p-3 space-y-1.5 border border-border">
                <div className="flex items-center justify-between">
                  <StatusBadge status="completed" label={t("status_completed", "Completed")} />
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <h3 className="font-bold text-xs text-foreground font-display">{item.centre}</h3>
                <p className="text-xs text-muted-foreground">{item.commodity} · {item.quantity}</p>
                <div className="pt-1">
                  <Button fullWidth size="sm" variant="outline" onClick={() => navigate("procurement-status")}>
                    {t("btn_view_procurement_summary", "Procurement Summary")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-2">
            {CANCELLED_BOOKINGS.map(item => (
              <Card key={item.id} className="p-3 space-y-1 border border-border">
                <div className="flex items-center justify-between">
                  <StatusBadge status="cancelled" label={t("status_cancelled", "Cancelled")} />
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <h3 className="font-bold text-xs text-foreground font-display">{item.centre}</h3>
                <p className="text-xs text-muted-foreground">{item.commodity} · {item.quantity}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Mobile Sticky CTA for Active Booking */}
        {activeTab === 0 && !isCancelled && (
          <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-border z-30">
            <div className="max-w-md mx-auto">
              <Button fullWidth size="md" onClick={() => navigate("queue-tracking")} icon={<Icon name="queue" size={16} />}>
                {t("btn_track_live_queue", `Track Live Queue (${booking.queuePosition})`)}
              </Button>
            </div>
          </div>
        )}

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          CANCEL BOOKING CONFIRMATION MODAL
          ═════════════════════════════════════════════════════════════════════ */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Icon name="warning" size={20} />
            </div>

            <h3 className="text-base font-bold text-foreground font-display text-center">
              {t("cancel_dialog_title", "Cancel this booking?")}
            </h3>

            <p className="text-xs text-muted-foreground text-center mt-1.5 leading-relaxed">
              {t("cancel_dialog_body", `You may lose this reserved slot at ${booking.centre}. This action cannot be undone and your queue position ${booking.queuePosition} will be released.`)}
            </p>

            <div className="flex items-center gap-2.5 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowCancelDialog(false)}
              >
                {t("keep_booking", "Keep Booking")}
              </Button>
              <button
                onClick={() => {
                  setIsCancelled(true);
                  setShowCancelDialog(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
              >
                {t("cancel_booking_confirm", "Cancel Booking")}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ═════════════════════════════════════════════════════════════════════
          BOOKING DETAILS MODAL
          ═════════════════════════════════════════════════════════════════════ */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h3 className="font-bold text-foreground font-display text-sm">
                  {t("booking_details_title", "Booking Record & Gate Pass")}
                </h3>
                <p className="text-xs font-mono text-muted-foreground">{booking.id}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("centre", "Centre")}:</span>
                <span className="font-bold text-foreground">{booking.centre}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("label_date", "Date")}:</span>
                <span className="font-bold text-foreground">{booking.fullDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("label_slot", "Slot Window")}:</span>
                <span className="font-bold text-foreground">{booking.slot}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("queue_position_label", "Queue Token")}:</span>
                <span className="font-bold text-primary font-display text-sm">{booking.queuePosition}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("commodity_and_qty", "Commodity & Quantity")}:</span>
                <span className="font-bold text-foreground">{booking.commodity} · {booking.quantity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("assigned_bay_label", "Assigned Weighbridge")}:</span>
                <span className="font-bold text-foreground">{booking.weighbridgeBay}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t("gate_entry_label", "Recommended Gate Entry")}:</span>
                <span className="font-bold text-foreground">{booking.gateEntry}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button size="sm" onClick={() => setShowDetailsModal(false)}>
                {t("close", "Close")}
              </Button>
            </div>
          </div>
        </div>
      )}

    </FarmerShell>
  );
}
