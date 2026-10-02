import type { FilePrice, ModelFile } from "./ai-model-files";
import type { LocalizedText } from "./ai-model-rankings";

/**
 * Shared bilingual labels for facts that come from reviewed model files, used by model profiles
 * and the "Other models" page.
 */

/** The five file categories (instructions section 1.1), in page order, with bilingual names. */
export const FILE_CATEGORIES: { id: ModelFile["category"]; name: LocalizedText }[] = [
  { id: "llm-agents", name: { en: "LLMs & agents", es: "LLM y agentes" } },
  { id: "image", name: { en: "Image", es: "Imagen" } },
  { id: "video", name: { en: "Video", es: "Vídeo" } },
  { id: "music", name: { en: "Music", es: "Música" } },
  { id: "voice-sound", name: { en: "Voice & sound", es: "Voz y sonido" } },
];

/**
 * Dollars exactly as published: whole amounts without decimals, cents with two decimals, and
 * smaller fractions unrounded (a $0.113 token price must not become $0.11).
 */
function money(value: number): string {
  if (Number.isInteger(value)) return `$${value}`;
  return Number.isInteger(Math.round(value * 1e6) / 1e4) ? `$${value.toFixed(2)}` : `$${value}`;
}

// Non-token price units in both languages ("per-song" → "per song" / "por canción").
const UNIT_NAMES: Record<Exclude<FilePrice["unit"], "per-1m-tokens">, [string, string]> = {
  "per-image": ["per image", "por imagen"],
  "per-1k-images": ["per 1k images", "por 1k imágenes"],
  "per-second": ["per second", "por segundo"],
  "per-minute": ["per minute", "por minuto"],
  "per-song": ["per song", "por canción"],
  "per-1k-characters": ["per 1k characters", "por 1k caracteres"],
  other: ["(other unit)", "(otra unidad)"],
};

/** Describe one API price from a reviewed file in plain words. */
export function filePriceText(price: FilePrice, spanish: boolean): string {
  let text: string;
  if (price.unit === "per-1m-tokens")
    text =
      price.output === null
        ? `${money(price.input ?? 0)} ${spanish ? "por 1M de tokens" : "per 1M tokens"}`
        : `${money(price.input ?? 0)} / ${money(price.output)} ${spanish ? "por 1M de tokens (entrada / salida)" : "per 1M tokens (input / output)"}`;
  else {
    const [english, spanishUnit] = UNIT_NAMES[price.unit];
    text = `${money(price.amount ?? 0)} ${spanish ? spanishUnit : english}`;
  }
  return price.variant ? `${text} (${price.variant})` : text;
}

/**
 * The descriptive half of a file title ("Claude Opus 5.5: Anthropic's cheaper Opus…" → "Anthropic's
 * cheaper Opus…"), capitalized. Titles follow "Model: description"; without a colon the whole title
 * is used.
 */
export function titleTagline(title: string): string {
  const separator = title.indexOf(": ");
  const tagline = separator === -1 ? title : title.slice(separator + 2);
  // Shown as a sentence on its own, so start with a capital ("near-Astra…" → "Near-Astra…").
  return tagline.charAt(0).toUpperCase() + tagline.slice(1);
}
