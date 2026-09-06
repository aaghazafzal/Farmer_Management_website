"use client";

import BookingConfirmed from "@/views/BookingConfirmed";
import { useAppNavigation } from "@/lib/navigation";

export default function BookingConfirmedPage() {
  const navigate = useAppNavigation();
  return <BookingConfirmed navigate={navigate} />;
}
