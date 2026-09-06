"use client";

import SlotBooking from "@/views/SlotBooking";
import { useAppNavigation } from "@/lib/navigation";

export default function SlotBookingPage() {
  const navigate = useAppNavigation();
  return <SlotBooking navigate={navigate} />;
}
