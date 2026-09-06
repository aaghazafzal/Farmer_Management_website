"use client";

import QueueTracking from "@/views/QueueTracking";
import { useAppNavigation } from "@/lib/navigation";

export default function QueueTrackingPage() {
  const navigate = useAppNavigation();
  return <QueueTracking navigate={navigate} />;
}
