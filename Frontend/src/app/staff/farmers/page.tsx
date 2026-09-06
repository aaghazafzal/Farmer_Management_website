"use client";

import StaffFarmers from "@/views/StaffFarmers";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffFarmersPage() {
  const navigate = useAppNavigation();
  return <StaffFarmers navigate={navigate} />;
}
