import type { Metadata } from "next";
import { HelpPageContent } from "@/features/site-info/help-page";

export const metadata: Metadata = {
  title: "Help center",
  description: "A concise guide to writing, sharing, reviewing, and discovering stories on MAblog.",
};

/** Render the dedicated bilingual MAblog help experience. */
export default function HelpPage() {
  return <HelpPageContent />;
}
