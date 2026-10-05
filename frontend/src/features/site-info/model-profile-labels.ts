import type { RankingCategory } from "./ai-model-rankings";

/** Return the readable bilingual name for a ranking leaderboard. */
export function categoryName(category: RankingCategory, spanish: boolean): string {
  const names: Record<RankingCategory, [string, string]> = {
    coding: ["Production coding", "Código de producción"],
    image: ["Image creation", "Creación de imágenes"],
    video: ["Video with audio", "Vídeo con audio"],
    "music-vocal": ["Music · Vocal", "Música · Vocal"],
    "music-instrumental": ["Music · Instrumental", "Música · Instrumental"],
  };
  return names[category][spanish ? 1 : 0];
}
