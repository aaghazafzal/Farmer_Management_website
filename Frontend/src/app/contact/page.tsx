import type { Metadata } from "next";
import ContactView from "@/views/ContactView";

export const metadata: Metadata = {
  title: "Contact Support · KisanSetu",
  description: "Get assistance with your KisanSetu bookings, queue tracking, account issues, or application questions.",
};

export default function ContactPage() {
  return <ContactView />;
}
