"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const VIEW_ROUTES: Record<string, string> = {
  "landing": "/",
  "farmer-login": "/farmer/login",
  "farmer-dashboard": "/farmer/dashboard",
  "find-center": "/farmer/centers",
  "center-detail": "/farmer/centers/1",
  "slot-recommendation": "/farmer/slots/recommendation",
  "slot-booking": "/farmer/slots/book",
  "booking-confirmed": "/farmer/booking/confirmed",
  "queue-tracking": "/farmer/queue",
  "procurement-status": "/farmer/procurement",
  "my-bookings": "/farmer/bookings",
  "farmer-profile": "/farmer/profile",
  "notifications": "/farmer/notifications",
  "about": "/about",
  "help": "/help",
  "privacy": "/privacy",
  "terms": "/terms",
  "contact": "/contact",
  "staff-login": "/staff/login",
  "staff-dashboard": "/staff/dashboard",
  "staff-queue": "/staff/queue",
  "staff-slots": "/staff/slots",
  "staff-farmers": "/staff/farmers",
  "staff-reports": "/staff/reports",
  "staff-notifications": "/staff/notifications",
  "staff-settings": "/staff/settings",
};

export function viewToPath(view: string): string {
  if (view.startsWith("/")) return view;
  return VIEW_ROUTES[view] || `/${view}`;
}

export function useAppNavigation() {
  const router = useRouter();

  return useCallback(
    (view: string) => {
      const path = viewToPath(view);
      router.push(path);
    },
    [router]
  );
}
