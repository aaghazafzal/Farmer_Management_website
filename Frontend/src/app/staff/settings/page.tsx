"use client";

import StaffSettings from "@/views/StaffSettings";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffSettingsPage() {
  const navigate = useAppNavigation();
  return <StaffSettings navigate={navigate} />;
}
