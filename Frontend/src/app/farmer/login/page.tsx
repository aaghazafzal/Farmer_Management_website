"use client";

import FarmerLogin from "@/views/FarmerLogin";
import { useAppNavigation } from "@/lib/navigation";

export default function FarmerLoginPage() {
  const navigate = useAppNavigation();
  return <FarmerLogin navigate={navigate} />;
}
