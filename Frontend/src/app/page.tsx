"use client";

import Landing from "@/views/Landing";
import { useAppNavigation } from "@/lib/navigation";

export default function HomePage() {
  const navigate = useAppNavigation();
  return <Landing navigate={navigate} />;
}
