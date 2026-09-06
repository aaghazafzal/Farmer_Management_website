"use client";

import MyBookings from "@/views/MyBookings";
import { useAppNavigation } from "@/lib/navigation";

export default function MyBookingsPage() {
  const navigate = useAppNavigation();
  return <MyBookings navigate={navigate} />;
}
