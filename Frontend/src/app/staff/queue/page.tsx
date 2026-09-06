"use client";

import StaffQueue from "@/views/StaffQueue";
import { useAppNavigation } from "@/lib/navigation";

export default function StaffQueuePage() {
  const navigate = useAppNavigation();
  return <StaffQueue navigate={navigate} />;
}
