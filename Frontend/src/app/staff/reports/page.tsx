"use client";

import StaffReports from "@/views/StaffReports";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffReportsPage() {
  const navigate = useAppNavigation();
  return <StaffReports navigate={navigate} />;
}
