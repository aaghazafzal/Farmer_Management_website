"use client";

import SlotRecommendation from "@/views/SlotRecommendation";
import { useAppNavigation } from "@/lib/navigation";

export default function SlotRecommendationPage() {
  const navigate = useAppNavigation();
  return <SlotRecommendation navigate={navigate} />;
}
