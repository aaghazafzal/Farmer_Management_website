"use client";

import StaffAlerts from "@/views/StaffAlerts";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffNotificationsPage() {
  const navigate = useAppNavigation();
  return <StaffAlerts navigate={navigate} />;
}
