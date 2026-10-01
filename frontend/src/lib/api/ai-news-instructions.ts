import { apiText } from "./client";

/** File name used when the instructions are saved into the user's Markdown folder. */
export const AI_NEWS_INSTRUCTIONS_FILENAME = "ai-news-instructions.md";

/** Download the master AI-news research and model-file instructions (signed-in accounts only). */
export function fetchAiNewsInstructions(): Promise<string> {
  return apiText("/ai-news/instructions");
}
