import type { Metadata } from "next";
import { AboutPageContent } from "@/features/site-info/about-page";

export const metadata: Metadata = {
  title: "About",
  description: "Why MAblog exists and how it keeps creators in control of their stories.",
};

/** Present the product purpose and the principles that shape MAblog. */
export default function AboutPage() {
  return <AboutPageContent />;
}
