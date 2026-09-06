import type { Metadata } from "next";
import HelpView from "@/views/HelpView";

export const metadata: Metadata = {
  title: "Help & FAQs · KisanSetu",
  description: "Find answers about booking procurement slots, tracking queues, understanding delays, and navigating KisanSetu.",
};

export default function HelpPage() {
  return <HelpView />;
}
