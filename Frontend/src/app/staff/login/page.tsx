"use client";

import StaffLogin from "@/views/StaffLogin";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffLoginPage() {
  const navigate = useAppNavigation();
  return <StaffLogin navigate={navigate} />;
}
