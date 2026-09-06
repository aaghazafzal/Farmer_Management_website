"use client";

import CenterDetail from "@/views/CenterDetail";
import { useAppNavigation } from "@/lib/navigation";

export default function CenterDetailPage() {
  const navigate = useAppNavigation();
  return <CenterDetail navigate={navigate} />;
}
