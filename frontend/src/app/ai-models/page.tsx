import type { Metadata } from "next";
import { AiModelsRankingPageContent } from "@/features/site-info/ai-models-ranking-page";

export const metadata: Metadata = {
  title: "AI Models",
  description: "Evidence-based Top 5 AI model rankings for production coding, image, video, and music.",
};

/** Render the bilingual, evidence-based AI model ranking snapshot. */
export default function AiModelsPage() {
  return <AiModelsRankingPageContent />;
}
