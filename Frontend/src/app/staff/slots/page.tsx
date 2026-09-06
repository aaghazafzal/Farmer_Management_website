"use client";

import StaffSlots from "@/views/StaffSlots";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffSlotsPage() {
  const navigate = useAppNavigation();
  return <StaffSlots navigate={navigate} />;
}
