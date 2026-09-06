import type { Metadata } from "next";
import TermsView from "@/views/TermsView";

export const metadata: Metadata = {
  title: "Terms of Use · KisanSetu",
  description: "Terms and conditions governing the intended use of the KisanSetu procurement scheduling and queue management platform.",
};

export default function TermsPage() {
  return <TermsView />;
}
