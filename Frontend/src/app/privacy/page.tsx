import type { Metadata } from "next";
import PrivacyView from "@/views/PrivacyView";

export const metadata: Metadata = {
  title: "Privacy Notice · KisanSetu",
  description: "Learn how KisanSetu handles account, location, booking, and operational information within the prototype platform.",
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
