import type { Metadata } from "next";
import { loadAiModelsData } from "@/features/site-info/ai-models-content.server";
import { otherModels } from "@/features/site-info/ai-models-data";
import { OtherModelsPageContent } from "@/features/site-info/other-models-page";

export const metadata: Metadata = {
  title: "Other AI models",
  description:
    "Reviewed AI model releases outside the ranked Top 5: language, image, video, music, and voice models with official sources.",
};

// Files can be approved while the server runs, so read them on every request.
export const dynamic = "force-dynamic";

/** Render reviewed models that are not on any leaderboard, grouped by category. */
export default function OtherModelsPage() {
  return <OtherModelsPageContent groups={otherModels(loadAiModelsData())} />;
}
