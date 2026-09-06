"use client";

import { useState } from "react";

import Landing from "./views/Landing";
import FarmerLogin from "./views/FarmerLogin";
import FarmerDashboard from "./views/FarmerDashboard";
import FindCenter from "./views/FindCenter";
import CenterDetail from "./views/CenterDetail";
import SlotRecommendation from "./views/SlotRecommendation";
import SlotBooking from "./views/SlotBooking";
import BookingConfirmed from "./views/BookingConfirmed";
import QueueTracking from "./views/QueueTracking";
import ProcurementStatus from "./views/ProcurementStatus";
import MyBookings from "./views/MyBookings";
import StaffLogin from "./views/StaffLogin";
import StaffDashboard from "./views/StaffDashboard";
import StaffQueue from "./views/StaffQueue";
import StaffPlaceholder from "./views/StaffPlaceholder";

type View =
  | "landing"
  | "farmer-login"
  | "farmer-dashboard"
  | "find-center"
  | "center-detail"
  | "slot-recommendation"
  | "slot-booking"
  | "booking-confirmed"
  | "queue-tracking"
  | "procurement-status"
  | "my-bookings"
  | "farmer-profile"
  | "notifications"
  | "help"
  | "staff-login"
  | "staff-dashboard"
  | "staff-queue"
  | "staff-slots"
  | "staff-farmers"
  | "staff-reports"
  | "staff-notifications"
  | "staff-settings";

import { LanguageProvider } from "./lib/languageContext";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const navigate = (v: string) => setView(v as View);

  const renderView = () => {
    switch (view) {
      case "landing":             return <Landing navigate={navigate} />;
      case "farmer-login":        return <FarmerLogin navigate={navigate} />;
      case "farmer-dashboard":    return <FarmerDashboard navigate={navigate} />;
      case "find-center":         return <FindCenter navigate={navigate} />;
      case "center-detail":       return <CenterDetail navigate={navigate} />;
      case "slot-recommendation": return <SlotRecommendation navigate={navigate} />;
      case "slot-booking":        return <SlotBooking navigate={navigate} />;
      case "booking-confirmed":   return <BookingConfirmed navigate={navigate} />;
      case "queue-tracking":      return <QueueTracking navigate={navigate} />;
      case "procurement-status":  return <ProcurementStatus navigate={navigate} />;
      case "my-bookings":         return <MyBookings navigate={navigate} />;
      case "staff-login":         return <StaffLogin navigate={navigate} />;
      case "staff-dashboard":     return <StaffDashboard navigate={navigate} />;
      case "staff-queue":         return <StaffQueue navigate={navigate} />;
      case "staff-slots":
        return <StaffPlaceholder navigate={navigate} current="staff-slots" title="Slot Management" sub="Create, edit, and close procurement slots. Control daily capacity by time block." />;
      case "staff-farmers":
        return <StaffPlaceholder navigate={navigate} current="staff-farmers" title="Farmer Records" sub="Search farmers by name, phone, booking ID, or farmer reference." />;
      case "staff-reports":
        return <StaffPlaceholder navigate={navigate} current="staff-reports" title="Reports & Analytics" sub="Daily throughput, average wait time, slot utilization, and peak hours." />;
      case "staff-notifications":
        return <StaffPlaceholder navigate={navigate} current="staff-notifications" title="Notifications" sub="Centre alerts, schedule changes, and system updates." />;
      case "staff-settings":
        return <StaffPlaceholder navigate={navigate} current="staff-settings" title="Settings" sub="Centre configuration, staff roles, and access control." />;
      default:
        return <Landing navigate={navigate} />;
    }
  };

  return <LanguageProvider>{renderView()}</LanguageProvider>;
}
