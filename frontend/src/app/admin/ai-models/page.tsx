import type { Metadata } from "next";
import { ModelReviewPage } from "@/features/model-review/model-review-page";

export const metadata: Metadata = { title: "AI model review" };

/** Render the administrator-only review page for the AI model files. */
export default function AiModelReviewRoute() {
  return <ModelReviewPage />;
}
