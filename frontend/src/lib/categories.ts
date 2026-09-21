// Stable stored keys are shared by the collection and composer; labels follow the interface locale.
export const categories = [
  { value: "technology", en: "Technology", es: "Tecnología", symbol: "⌘" },
  { value: "travel", en: "Travel", es: "Viajes", symbol: "↗" },
  { value: "general", en: "General", es: "General", symbol: "◇" },
  { value: "anime", en: "Anime", es: "Anime", symbol: "✦" },
] as const;
export type PostCategory = (typeof categories)[number]["value"];

/** Accept only category keys represented by the shared collection taxonomy. */
export function parsePostCategory(value: string | string[] | undefined): PostCategory | "" {
  const candidate = Array.isArray(value) ? value[0] : value;
  return categories.some(
    /** Match the untrusted URL value against one stable category key. */
    function isKnownCategory(category) {
      return category.value === candidate;
    },
  ) ? candidate as PostCategory : "";
}
