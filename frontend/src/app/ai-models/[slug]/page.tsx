import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiModelProfile } from "@/features/site-info/ai-model-profile";
import { loadAiModelsData } from "@/features/site-info/ai-models-content.server";
import { benchmarkCard, relatedModels } from "@/features/site-info/ai-model-profile-data";

interface AiModelProfileRouteProps {
  params: Promise<{ slug: string }>;
}

// Profiles appear and disappear as files are approved or returned to draft, so render per request.
export const dynamic = "force-dynamic";

/** Build model-specific title and description metadata when the profile exists. */
export async function generateMetadata({ params }: AiModelProfileRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = loadAiModelsData().profiles[slug];
  return profile
    ? { title: `${profile.model.name} AI Model Profile`, description: profile.model.description.en }
    : { title: "AI model not found" };
}

/** Render one model profile, or the shared not-found route for an unknown slug. */
export default async function AiModelProfilePage({ params }: AiModelProfileRouteProps) {
  const { slug } = await params;
  const data = loadAiModelsData();
  const profile = data.profiles[slug];
  if (!profile) notFound();
  return (
    <AiModelProfile
      profile={profile}
      card={benchmarkCard(profile, data)}
      related={relatedModels(profile, data)}
      scoresEvaluated={data.scoresEvaluated}
    />
  );
}
