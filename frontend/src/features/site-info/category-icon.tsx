import { Braces, Image as ImageIcon, Music2, Video } from "lucide-react";
import type { RankingCategory } from "./ai-model-rankings";

/** Decorative Lucide mark for a ranking category; hidden from assistive technology. */
export function CategoryIcon({ category }: { category: RankingCategory }) {
  if (category === "coding") return <Braces aria-hidden="true" />;
  if (category === "image") return <ImageIcon aria-hidden="true" />;
  if (category === "video") return <Video aria-hidden="true" />;
  return <Music2 aria-hidden="true" />;
}
