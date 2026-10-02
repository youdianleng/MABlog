import type { Metadata } from "next";
import { AiModelsRankingPageContent } from "@/features/site-info/ai-models-ranking-page";
import { loadAiModelsData } from "@/features/site-info/ai-models-content.server";

export const metadata: Metadata = {
  title: "AI Models",
  description:
    "Evidence-based Top 5 AI model rankings for production coding, image, video, and music.",
};

// Model files are approved on the admin review page while the server runs, so render per request
// instead of freezing the build-time copy.
export const dynamic = "force-dynamic";

/** Render the bilingual benchmark from `rankings.yaml`, reviewed model files, and the snapshot. */
export default function AiModelsPage() {
  return <AiModelsRankingPageContent data={loadAiModelsData()} />;
}
