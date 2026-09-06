"use client";

import FarmerDashboard from "@/views/FarmerDashboard";
import { useAppNavigation } from "@/lib/navigation";

export default function FarmerDashboardPage() {
  const navigate = useAppNavigation();
  return <FarmerDashboard navigate={navigate} />;
}
