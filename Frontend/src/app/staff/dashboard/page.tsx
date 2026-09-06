"use client";

import StaffDashboard from "@/views/StaffDashboard";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffDashboardPage() {
  const navigate = useAppNavigation();
  return <StaffDashboard navigate={navigate} />;
}
