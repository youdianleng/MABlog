import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiModelProfile } from "@/features/site-info/ai-model-profile";
import { getRankedModel, rankedModels } from "@/features/site-info/ai-model-rankings";

interface AiModelProfileRouteProps { params: Promise<{ slug: string }>; }

/** Prebuild every reviewed model-family profile from the versioned local snapshot. */
export function generateStaticParams() {
  return rankedModels.map(/** Convert one stable model record into a dynamic-route parameter. */ (model) => ({ slug: model.slug }));
}

/** Build model-specific title and description metadata when the family exists. */
export async function generateMetadata({ params }: AiModelProfileRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getRankedModel(slug);
  return model ? { title: `${model.name} AI Model Profile`, description: model.description.en } : { title: "AI model not found" };
}

/** Render one permanent family profile or the shared not-found route for an unknown slug. */
export default async function AiModelProfilePage({ params }: AiModelProfileRouteProps) {
  const { slug } = await params;
  const model = getRankedModel(slug);
  if (!model) notFound();
  return <AiModelProfile model={model} />;
}
