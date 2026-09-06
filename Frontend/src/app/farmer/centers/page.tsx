"use client";

import FindCenter from "@/views/FindCenter";
import { useAppNavigation } from "@/lib/navigation";

export default function FindCenterPage() {
  const navigate = useAppNavigation();
  return <FindCenter navigate={navigate} />;
}
