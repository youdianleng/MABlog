// Stable stored keys are shared by the collection and composer; labels follow the interface locale.
export const categories = [
  { value: "technology", en: "Technology", es: "Tecnología", symbol: "⌘" },
  { value: "travel", en: "Travel", es: "Viajes", symbol: "↗" },
  { value: "general", en: "General", es: "General", symbol: "◇" },
  { value: "anime", en: "Anime", es: "Anime", symbol: "✦" },
] as const;
export type PostCategory = (typeof categories)[number]["value"];
