import type { Metadata } from "next";
import AboutView from "@/views/AboutView";

export const metadata: Metadata = {
  title: "About KisanSetu · Making procurement visits more predictable",
  description: "KisanSetu is a digital platform designed to help farmers plan procurement-center visits, book available slots, track queues, and stay informed about procurement status.",
};

export default function AboutPage() {
  return <AboutView />;
}
