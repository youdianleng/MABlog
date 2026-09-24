/** Bilingual editorial copy stored alongside the ranking snapshot. */
export type LocalizedText = { en: string; es: string };

/** Public ways a reader can use a ranked model family. */
export type AccessMode = "Free access" | "Subscription" | "API" | "Open weights" | "Regional access";

/** Stable category identifiers used by anchors, cards, and profile aggregation. */
export type RankingCategory = "coding" | "image" | "video" | "music-vocal" | "music-instrumental";

/** One preserved source-native measurement for a model in a ranking category. */
export type RankingPlacement = {
  category: RankingCategory;
  rank: number;
  metric: string;
  score: string;
  confidenceInterval?: string;
  samples?: string;
  sourceRank: string;
  sourceLabel: string;
  sourceUrl: string;
  tieNote?: LocalizedText;
};

/** Versioned editorial record shared by ranking cards and the permanent family profile. */
export type RankedModel = {
  slug: string;
  name: string;
  provider: string;
  accent: "crimson" | "gold" | "blue" | "sage" | "violet";
  access: AccessMode[];
  officialUrl: string;
  description: LocalizedText;
  userVerdict: LocalizedText;
  developerVerdict: LocalizedText;
  placements: RankingPlacement[];
};

export const RANKING_SNAPSHOT_DATE = "2026-09-22";
export const RANKING_REVIEW_AFTER_DAYS = 45;

const CODING_SOURCE = "https://artificialanalysis.ai/agents/coding-agents";
const IMAGE_SOURCE = "https://artificialanalysis.ai/image/leaderboard/text-to-image";
const VIDEO_SOURCE = "https://artificialanalysis.ai/video/leaderboard/text-to-video";
const VOCAL_SOURCE = "https://artificialanalysis.ai/music/leaderboard/vocals";
const INSTRUMENTAL_SOURCE = "https://artificialanalysis.ai/music/leaderboard/instrumental";

export const rankedModels: RankedModel[] = [
  {
    slug: "claude-fable-5-1", name: "Claude Fable 5.1", provider: "Anthropic", accent: "crimson",
    access: ["Subscription", "API"], officialUrl: "https://www.anthropic.com/claude/fable",
    description: { en: "A frontier agentic family for long-running repository work and difficult engineering decisions.", es: "Una familia agéntica de frontera para trabajo prolongado en repositorios y decisiones de ingeniería difíciles." },
    userVerdict: { en: "Best when a substantial coding project needs sustained attention and reviewable progress.", es: "Ideal cuando un proyecto de código importante necesita atención sostenida y progreso revisable." },
    developerVerdict: { en: "The leading production-coding choice in this snapshot, with API and Claude Code access.", es: "La opción líder para código de producción en esta edición, con acceso por API y Claude Code." },
    placements: [{ category: "coding", rank: 1, metric: "Coding Agent Index v1.5", score: "62", samples: "303 tasks · 3 attempts/task", sourceRank: "1–2", sourceLabel: "Artificial Analysis", sourceUrl: CODING_SOURCE, tieNote: { en: "Statistical tie at the published score.", es: "Empate estadístico en la puntuación publicada." } }],
  },
  {
    slug: "gpt-6-astra", name: "GPT-6 Astra", provider: "OpenAI", accent: "sage",
    access: ["Subscription", "API"], officialUrl: "https://developers.openai.com/api/docs/models/gpt-6-astra",
    description: { en: "An end-to-end reasoning and coding family with first-party tool, shell, and computer-use support.", es: "Una familia de razonamiento y código integral con soporte propio para herramientas, terminal y uso del ordenador." },
    userVerdict: { en: "A strong fit for users who want coding work connected to broader research and document workflows.", es: "Una opción sólida para quienes quieren conectar el código con investigación y documentos." },
    developerVerdict: { en: "Broad tool support and a large context window make it practical for complex software workflows.", es: "Su amplio soporte de herramientas y gran contexto resulta práctico para flujos de software complejos." },
    placements: [{ category: "coding", rank: 2, metric: "Coding Agent Index v1.5", score: "62", samples: "303 tasks · 3 attempts/task", sourceRank: "1–2", sourceLabel: "Artificial Analysis", sourceUrl: CODING_SOURCE, tieNote: { en: "Statistical tie at the published score.", es: "Empate estadístico en la puntuación publicada." } }],
  },
  {
    slug: "grok-4-7", name: "Grok 4.7", provider: "SpaceXAI", accent: "blue",
    access: ["Subscription", "API"], officialUrl: "https://docs.x.ai/developers/grok-4-7",
    description: { en: "A coding-focused frontier family available through Grok Build, partner tools, and the xAI API.", es: "Una familia de frontera centrada en código, disponible en Grok Build, herramientas asociadas y la API de xAI." },
    userVerdict: { en: "Useful for developers already working in Grok Build or supported coding environments.", es: "Útil para desarrolladores que ya trabajan en Grok Build o entornos compatibles." },
    developerVerdict: { en: "A competitive agentic option with structured output, code execution, and long-context support.", es: "Una opción agéntica competitiva con salida estructurada, ejecución de código y contexto amplio." },
    placements: [{ category: "coding", rank: 3, metric: "Coding Agent Index v1.5", score: "56", samples: "303 tasks · 3 attempts/task", sourceRank: "3", sourceLabel: "Artificial Analysis", sourceUrl: CODING_SOURCE }],
  },
  {
    slug: "muse-spark-1-3", name: "Muse Spark 1.3", provider: "Meta", accent: "violet",
    access: ["Free access", "API"], officialUrl: "https://ai.meta.com/llama",
    description: { en: "A multimodal agent family tuned for long-horizon coding and available through Muse Code and Meta Model API.", es: "Una familia agéntica multimodal ajustada para programación prolongada, disponible en Muse Code y Meta Model API." },
    userVerdict: { en: "An approachable route into agentic coding through Muse Code and Meta AI products.", es: "Una vía accesible a la programación agéntica mediante Muse Code y los productos de Meta AI." },
    developerVerdict: { en: "Worth evaluating when multimodal inputs and an OpenAI-compatible API matter.", es: "Merece evaluación cuando importan las entradas multimodales y una API compatible con OpenAI." },
    placements: [{ category: "coding", rank: 4, metric: "Coding Agent Index v1.5", score: "54", samples: "303 tasks · 3 attempts/task", sourceRank: "4–5", sourceLabel: "Artificial Analysis", sourceUrl: CODING_SOURCE, tieNote: { en: "Shares the published score with GLM-5.3.", es: "Comparte la puntuación publicada con GLM-5.3." } }],
  },
  {
    slug: "glm-5-3", name: "GLM-5.3", provider: "Z.ai", accent: "gold",
    access: ["Free access", "API"], officialUrl: "https://z.ai/model-api",
    description: { en: "A capable coding family represented here through the OpenCode agent result.", es: "Una familia de programación capaz, representada aquí por el resultado del agente OpenCode." },
    userVerdict: { en: "A practical alternative for users who want another accessible coding workflow.", es: "Una alternativa práctica para quienes buscan otro flujo de programación accesible." },
    developerVerdict: { en: "Consider it when API flexibility and a competitive agent score matter more than ecosystem depth.", es: "Considéralo cuando la flexibilidad de API y una puntuación competitiva importan más que la amplitud del ecosistema." },
    placements: [{ category: "coding", rank: 5, metric: "Coding Agent Index v1.5", score: "54", samples: "303 tasks · 3 attempts/task", sourceRank: "4–5", sourceLabel: "Artificial Analysis", sourceUrl: CODING_SOURCE, tieNote: { en: "Shares the published score with Muse Spark 1.3.", es: "Comparte la puntuación publicada con Muse Spark 1.3." } }],
  },
  {
    slug: "gpt-image-2-5-sunburst", name: "GPT Image 2.5 Sunburst", provider: "OpenAI", accent: "gold",
    access: ["API"], officialUrl: "https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst",
    description: { en: "A precision-led image family for detailed generation and controlled creative work.", es: "Una familia visual orientada a la precisión para generación detallada y trabajo creativo controlado." },
    userVerdict: { en: "Best for polished, high-detail visual work when generation time is secondary.", es: "Ideal para trabajo visual pulido y detallado cuando el tiempo de generación es secundario." },
    developerVerdict: { en: "The snapshot leader for teams that can integrate the paid image API.", es: "El líder de esta edición para equipos capaces de integrar la API de imagen de pago." },
    placements: [{ category: "image", rank: 1, metric: "Arena Elo", score: "1197", confidenceInterval: "±9", samples: "13,401 votes", sourceRank: "1–2", sourceLabel: "Artificial Analysis Image Arena", sourceUrl: IMAGE_SOURCE, tieNote: { en: "Its published rank range overlaps the next family.", es: "Su intervalo de rango publicado se solapa con la siguiente familia." } }],
  },
  {
    slug: "grok-imagine-image-2", name: "Grok Imagine Image 2.0", provider: "SpaceXAI", accent: "blue",
    access: ["Subscription", "API"], officialUrl: "https://x.ai/news/grok-imagine-image-2",
    description: { en: "A high-ranked image family available in Grok and through the Imagine API.", es: "Una familia visual de alta posición disponible en Grok y mediante la API Imagine." },
    userVerdict: { en: "A direct creative option for people already using the Grok product.", es: "Una opción creativa directa para quienes ya utilizan Grok." },
    developerVerdict: { en: "Strong quality at a lower published generation price than the category leader.", es: "Calidad sólida con un precio de generación publicado inferior al líder de la categoría." },
    placements: [{ category: "image", rank: 2, metric: "Arena Elo", score: "1154", confidenceInterval: "±12", samples: "6,006 votes", sourceRank: "4–5", sourceLabel: "Artificial Analysis Image Arena", sourceUrl: IMAGE_SOURCE }],
  },
  {
    slug: "mai-image-2-6", name: "MAI-Image-2.6", provider: "Microsoft AI", accent: "crimson",
    access: ["Free access", "API"], officialUrl: "https://microsoft.ai/models/mai-image-2-6/",
    description: { en: "Microsoft's current image family, accessible through its model page and product ecosystem.", es: "La familia visual actual de Microsoft, accesible desde su página de modelos y ecosistema de productos." },
    userVerdict: { en: "A convenient choice for readers already creating inside Microsoft products.", es: "Una opción cómoda para quienes ya crean dentro de productos de Microsoft." },
    developerVerdict: { en: "A competitive third-place family with documented model and pricing access.", es: "Una familia competitiva en tercera posición con acceso y precios documentados." },
    placements: [{ category: "image", rank: 3, metric: "Arena Elo", score: "1147", confidenceInterval: "±10", samples: "8,215 votes", sourceRank: "4–5", sourceLabel: "Artificial Analysis Image Arena", sourceUrl: IMAGE_SOURCE }],
  },
  {
    slug: "nano-banana-2", name: "Nano Banana 2", provider: "Google", accent: "sage",
    access: ["Free access", "Subscription", "API"], officialUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image",
    description: { en: "Gemini 3.1 Flash Image balances quality, speed, editing, and broad product access.", es: "Gemini 3.1 Flash Image equilibra calidad, velocidad, edición y amplio acceso de producto." },
    userVerdict: { en: "The easiest high-ranking image family to try across Google's consumer surfaces.", es: "La familia visual de alta posición más fácil de probar en los productos de Google." },
    developerVerdict: { en: "A practical high-volume option with Gemini API access and multiple resolutions.", es: "Una opción práctica para alto volumen con API de Gemini y varias resoluciones." },
    placements: [{ category: "image", rank: 4, metric: "Arena Elo", score: "1122", confidenceInterval: "±8", samples: "17,440 votes", sourceRank: "6", sourceLabel: "Artificial Analysis Image Arena", sourceUrl: IMAGE_SOURCE }],
  },
  {
    slug: "muse-image", name: "Muse Image", provider: "Meta", accent: "violet",
    access: ["Free access", "API", "Regional access"], officialUrl: "https://ai.meta.com/blog/introducing-muse-image-muse-video-msl/",
    description: { en: "An agentic image family with tool use, editing, and integration across selected Meta products.", es: "Una familia visual agéntica con herramientas, edición e integración en productos seleccionados de Meta." },
    userVerdict: { en: "Strong value for eligible users who want capable generation inside familiar social products.", es: "Gran valor para usuarios elegibles que quieren generación capaz en productos sociales conocidos." },
    developerVerdict: { en: "The lowest published image price in this Top 5, with Meta Model API access.", es: "El menor precio de imagen publicado de este Top 5, con acceso mediante Meta Model API." },
    placements: [{ category: "image", rank: 5, metric: "Arena Elo", score: "1112", confidenceInterval: "±10", samples: "7,344 votes", sourceRank: "6–9", sourceLabel: "Artificial Analysis Image Arena", sourceUrl: IMAGE_SOURCE }],
  },
  {
    slug: "gemini-omni-flash", name: "Gemini Omni Flash", provider: "Google", accent: "blue",
    access: ["Subscription", "API"], officialUrl: "https://ai.google.dev/gemini-api/docs/omni",
    description: { en: "A native-audio video family for generation, conversational editing, and multimodal control.", es: "Una familia de vídeo con audio nativo para generación, edición conversacional y control multimodal." },
    userVerdict: { en: "The strongest current all-round entry for guided video creation in Google's tools.", es: "La entrada integral más sólida para creación guiada de vídeo en las herramientas de Google." },
    developerVerdict: { en: "The snapshot leader with documented API access and native audio output.", es: "El líder de esta edición con API documentada y salida de audio nativo." },
    placements: [{ category: "video", rank: 1, metric: "Arena Elo · with audio", score: "1233", confidenceInterval: "±7", samples: "15,172 votes", sourceRank: "1–3", sourceLabel: "Artificial Analysis Video Arena", sourceUrl: VIDEO_SOURCE, tieNote: { en: "The top three published rank ranges overlap.", es: "Los intervalos de rango publicados de los tres primeros se solapan." } }],
  },
  {
    slug: "wan-3", name: "Wan 3.0", provider: "Alibaba", accent: "gold",
    access: ["API", "Open weights"], officialUrl: "https://github.com/AlibabaCloud-Official/Wan3.0",
    description: { en: "An open video family with native audio, long clips, and multimodal creation tools.", es: "Una familia de vídeo abierta con audio nativo, clips largos y herramientas de creación multimodal." },
    userVerdict: { en: "A strong choice for creators who want long-form flexibility and provider choice.", es: "Una opción sólida para creadores que buscan flexibilidad de duración y de proveedor." },
    developerVerdict: { en: "The best open option in this edition because code and weights support deployment control.", es: "La mejor opción abierta de esta edición porque su código y pesos permiten controlar el despliegue." },
    placements: [{ category: "video", rank: 2, metric: "Arena Elo · with audio", score: "1229", confidenceInterval: "±9", samples: "6,011 votes", sourceRank: "1–3", sourceLabel: "Artificial Analysis Video Arena", sourceUrl: VIDEO_SOURCE, tieNote: { en: "The top three published rank ranges overlap.", es: "Los intervalos de rango publicados de los tres primeros se solapan." } }],
  },
  {
    slug: "minimax-h3", name: "MiniMax H3", provider: "MiniMax", accent: "crimson",
    access: ["Free access", "API", "Open weights"], officialUrl: "https://www.minimax.io/news/minimax-h3-open-source",
    description: { en: "An accessible native-audio video family with product, API, and documented open-weight routes.", es: "Una familia de vídeo con audio nativo accesible mediante producto, API y pesos abiertos documentados." },
    userVerdict: { en: "Easy to trial in Hailuo before deciding whether the workflow fits.", es: "Fácil de probar en Hailuo antes de decidir si el flujo encaja." },
    developerVerdict: { en: "A flexible open family; the ranking excludes the separately post-trained Fal variant.", es: "Una familia abierta flexible; la clasificación excluye la variante reentrenada por Fal." },
    placements: [{ category: "video", rank: 3, metric: "Arena Elo · with audio", score: "1220", confidenceInterval: "±8", samples: "8,602 votes", sourceRank: "3–4", sourceLabel: "Artificial Analysis Video Arena", sourceUrl: VIDEO_SOURCE }],
  },
  {
    slug: "seedance-2", name: "Seedance 2.0", provider: "ByteDance", accent: "violet",
    access: ["Subscription", "API", "Regional access"], officialUrl: "https://seed.bytedance.com/en/blog/seedance-2-0-official-launch",
    description: { en: "A multimodal audio-video family designed for complex motion, references, and editing.", es: "Una familia audiovisual multimodal diseñada para movimiento complejo, referencias y edición." },
    userVerdict: { en: "Strong creative control, but product availability still depends on region and platform.", es: "Gran control creativo, aunque la disponibilidad todavía depende de la región y la plataforma." },
    developerVerdict: { en: "A capable API-backed option when regional access and rights review are acceptable.", es: "Una opción capaz mediante API cuando el acceso regional y la revisión de derechos son aceptables." },
    placements: [{ category: "video", rank: 4, metric: "Arena Elo · with audio", score: "1210", confidenceInterval: "±6", samples: "20,345 votes", sourceRank: "5", sourceLabel: "Artificial Analysis Video Arena", sourceUrl: VIDEO_SOURCE }],
  },
  {
    slug: "kling-3", name: "Kling 3.0", provider: "Kuaishou", accent: "sage",
    access: ["Subscription", "API"], officialUrl: "https://kling.ai/document-api/3-0/model-access/ai-video-generation",
    description: { en: "A creator-oriented video family with native audio, storyboarding, and multimodal controls.", es: "Una familia de vídeo para creadores con audio nativo, guion gráfico y controles multimodales." },
    userVerdict: { en: "A mature creator product for controlled shots and multilingual native audio.", es: "Un producto maduro para planos controlados y audio nativo multilingüe." },
    developerVerdict: { en: "Chosen over a tied family because its published interval is narrower and sample count larger.", es: "Elegido frente a una familia empatada por su intervalo más estrecho y mayor muestra." },
    placements: [{ category: "video", rank: 5, metric: "Arena Elo · with audio", score: "1095", confidenceInterval: "±6", samples: "18,305 votes", sourceRank: "10–13", sourceLabel: "Artificial Analysis Video Arena", sourceUrl: VIDEO_SOURCE, tieNote: { en: "Tied on Elo with SkyReels V4; reliability evidence breaks the editorial tie.", es: "Empata en Elo con SkyReels V4; la evidencia de fiabilidad deshace el empate editorial." } }],
  },
  {
    slug: "suno-v5-5", name: "Suno V5.5", provider: "Suno", accent: "crimson",
    access: ["Free access", "Subscription"], officialUrl: "https://about.suno.com/blog/v5-5",
    description: { en: "A consumer-first full-song family with especially strong vocal results in the evaluated snapshot.", es: "Una familia orientada al consumidor para canciones completas, con resultados vocales especialmente sólidos." },
    userVerdict: { en: "The simplest high-ranking route for turning lyrics and a prompt into a complete song.", es: "La vía más sencilla y mejor clasificada para convertir letra y prompt en una canción completa." },
    developerVerdict: { en: "Best treated as a product workflow here; no first-party public API is recorded in this edition.", es: "Conviene tratarlo aquí como producto; esta edición no registra una API pública propia." },
    placements: [
      { category: "music-vocal", rank: 1, metric: "Arena Elo · vocals", score: "1160", confidenceInterval: "±14", samples: "2,305 votes", sourceRank: "1", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: VOCAL_SOURCE },
      { category: "music-instrumental", rank: 2, metric: "Arena Elo · instrumental", score: "1171", confidenceInterval: "±15", samples: "2,222 votes", sourceRank: "1–2", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: INSTRUMENTAL_SOURCE, tieNote: { en: "Its rank range overlaps Mureka V9.", es: "Su intervalo de rango se solapa con Mureka V9." } },
    ],
  },
  {
    slug: "mureka-v9", name: "Mureka V9", provider: "Mureka", accent: "gold",
    access: ["Free access", "Subscription", "API"], officialUrl: "https://www.mureka.ai/",
    description: { en: "A full-song family with leading instrumental results and strong vocal placement.", es: "Una familia para canciones completas con liderazgo instrumental y posición vocal sólida." },
    userVerdict: { en: "Best for creators who want instrumental leadership without giving up vocal capability.", es: "Ideal para creadores que buscan liderazgo instrumental sin renunciar a la voz." },
    developerVerdict: { en: "A useful music API candidate when both vocal and instrumental workflows matter.", es: "Una opción útil de API musical cuando importan los flujos vocales e instrumentales." },
    placements: [
      { category: "music-vocal", rank: 2, metric: "Arena Elo · vocals", score: "1136", confidenceInterval: "±16", samples: "2,215 votes", sourceRank: "2–3", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: VOCAL_SOURCE },
      { category: "music-instrumental", rank: 1, metric: "Arena Elo · instrumental", score: "1177", confidenceInterval: "±17", samples: "2,237 votes", sourceRank: "1–2", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: INSTRUMENTAL_SOURCE, tieNote: { en: "Its rank range overlaps Suno V5.5.", es: "Su intervalo de rango se solapa con Suno V5.5." } },
    ],
  },
  {
    slug: "stepaudio-3-music", name: "StepAudio 3 Music", provider: "StepFun", accent: "blue",
    access: ["Free access", "API"], officialUrl: "https://static.stepfun.com/blog/stepaudio3/music/assets/video/promo.html",
    description: { en: "A controllable song family with vocal and instrumental modes plus a public platform API.", es: "Una familia musical controlable con modos vocal e instrumental y API pública." },
    userVerdict: { en: "A promising browser-based option for creators who want lyrics and arrangement controls.", es: "Una opción web prometedora para creadores que quieren controlar letra y arreglo." },
    developerVerdict: { en: "Consistent third-place evidence in both music views makes it a balanced integration candidate.", es: "Su tercera posición consistente en ambas vistas la convierte en una integración equilibrada." },
    placements: [
      { category: "music-vocal", rank: 3, metric: "Arena Elo · vocals", score: "1092", confidenceInterval: "±15", samples: "2,043 votes", sourceRank: "4–6", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: VOCAL_SOURCE },
      { category: "music-instrumental", rank: 3, metric: "Arena Elo · instrumental", score: "1113", confidenceInterval: "±14", samples: "2,212 votes", sourceRank: "5–6", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: INSTRUMENTAL_SOURCE },
    ],
  },
  {
    slug: "minimax-music", name: "MiniMax Music", provider: "MiniMax", accent: "violet",
    access: ["Free access", "Subscription", "API"], officialUrl: "https://www.minimax.io/news/music-26",
    description: { en: "A product-and-API music family with dedicated vocal, instrumental, and cover workflows.", es: "Una familia musical con producto y API para flujos vocales, instrumentales y versiones." },
    userVerdict: { en: "A generous trial route for quickly testing complete songs and instrumental ideas.", es: "Una prueba generosa para experimentar rápidamente con canciones e ideas instrumentales." },
    developerVerdict: { en: "A practical API option; the source evaluated 2.5+ for vocals and 2.6 for instrumentals.", es: "Una API práctica; la fuente evaluó 2.5+ en voz y 2.6 en instrumental." },
    placements: [
      { category: "music-vocal", rank: 4, metric: "Arena Elo · vocals", score: "1084", confidenceInterval: "±13", samples: "2,909 votes", sourceRank: "4–7", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: VOCAL_SOURCE },
      { category: "music-instrumental", rank: 5, metric: "Arena Elo · instrumental", score: "1063", confidenceInterval: "±13", samples: "2,949 votes", sourceRank: "8–9", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: INSTRUMENTAL_SOURCE },
    ],
  },
  {
    slug: "lyria-3-pro", name: "Lyria 3 Pro", provider: "Google", accent: "sage",
    access: ["Subscription", "API"], officialUrl: "https://ai.google.dev/gemini-api/docs/models/lyria-3-pro-preview",
    description: { en: "Google's full-song music family with prompt, lyric, tempo, and image conditioning.", es: "La familia musical de Google para canciones completas con prompt, letra, tempo e imagen." },
    userVerdict: { en: "A good fit for Gemini users who want structured full songs in supported languages.", es: "Una buena opción para usuarios de Gemini que quieren canciones estructuradas en idiomas compatibles." },
    developerVerdict: { en: "Public-preview Gemini API access makes it straightforward to prototype music features.", es: "La vista previa pública de la API de Gemini facilita prototipar funciones musicales." },
    placements: [
      { category: "music-vocal", rank: 5, metric: "Arena Elo · vocals", score: "1074", confidenceInterval: "±13", samples: "2,870 votes", sourceRank: "5–10", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: VOCAL_SOURCE },
      { category: "music-instrumental", rank: 4, metric: "Arena Elo · instrumental", score: "1102", confidenceInterval: "±13", samples: "2,959 votes", sourceRank: "5–6", sourceLabel: "Artificial Analysis Music Arena", sourceUrl: INSTRUMENTAL_SOURCE },
    ],
  },
];

export const rankingOrder: Record<RankingCategory, string[]> = {
  coding: ["claude-fable-5-1", "gpt-6-astra", "grok-4-7", "muse-spark-1-3", "glm-5-3"],
  image: ["gpt-image-2-5-sunburst", "grok-imagine-image-2", "mai-image-2-6", "nano-banana-2", "muse-image"],
  video: ["gemini-omni-flash", "wan-3", "minimax-h3", "seedance-2", "kling-3"],
  "music-vocal": ["suno-v5-5", "mureka-v9", "stepaudio-3-music", "minimax-music", "lyria-3-pro"],
  "music-instrumental": ["mureka-v9", "suno-v5-5", "stepaudio-3-music", "lyria-3-pro", "minimax-music"],
};

/** Resolve a permanent family profile from its URL slug. */
export function getRankedModel(slug: string): RankedModel | undefined {
  return rankedModels.find(/** Match one stable public model slug. */ (model) => model.slug === slug);
}

/** Return category cards in the reviewed editorial order stored by the snapshot. */
export function getModelsForCategory(category: RankingCategory): RankedModel[] {
  return rankingOrder[category].map(/** Resolve every reviewed slug; the snapshot guarantees each one exists. */ (slug) => getRankedModel(slug) as RankedModel);
}

/** Find the single placement that belongs to a card's category. */
export function getPlacement(model: RankedModel, category: RankingCategory): RankingPlacement {
  return model.placements.find(/** Match one category measurement on the family profile. */ (placement) => placement.category === category) as RankingPlacement;
}
