"use client";

import ProcurementStatus from "@/views/ProcurementStatus";
import { useAppNavigation } from "@/lib/navigation";

export default function ProcurementStatusPage() {
  const navigate = useAppNavigation();
  return <ProcurementStatus navigate={navigate} />;
}
