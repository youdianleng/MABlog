"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Braces,
  Image as ImageIcon,
  Medal,
  Music2,
  Sparkles,
  Video,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { PRICE_CHECKED_DATE } from "./ai-model-benchmark-context";
import { RANKING_REVIEW_AFTER_DAYS, RANKING_SNAPSHOT_DATE } from "./ai-model-rankings";
import { BenchmarkSection } from "./benchmark-section";

/** MAblog editorial picks: [English label, Spanish label, model name, profile slug]. */
const EDITOR_PICKS: [string, string, string, string][] = [
  [
    "Best for production coding",
    "Mejor para código de producción",
    "Claude Fable 5.1",
    "claude-fable-5-1",
  ],
  [
    "Best image creator",
    "Mejor creador visual",
    "GPT Image 2.5 Sunburst",
    "gpt-image-2-5-sunburst",
  ],
  ["Best video creator", "Mejor creador de vídeo", "Gemini Omni Flash", "gemini-omni-flash"],
  ["Best music creator", "Mejor creador musical", "Mureka V9", "mureka-v9"],
  ["Best open option", "Mejor opción abierta", "Wan 3.0", "wan-3"],
  ["Best value", "Mejor valor", "Muse Image", "muse-image"],
  ["Best for beginners", "Mejor para principiantes", "Nano Banana 2", "nano-banana-2"],
];

/** Five ranked categories (music counts twice: vocal and instrumental) of five families each. */
const RANKED_CATEGORY_COUNT = 5;
const MODELS_PER_CATEGORY = 5;

/** Render the bilingual AI model benchmark: ranked leaderboards with reasons and relative bars. */
export function AiModelsRankingPageContent() {
  const { t } = useLanguage();
  return (
    <article className="models-page bench-page">
      <header className="bench-hero">
        <div className="bench-hero-copy">
          <p className="eyebrow">
            {t("MABLOG AI BENCHMARK · SEPTEMBER 2026", "BENCHMARK IA DE MABLOG · SEPTIEMBRE 2026")}
          </p>
          <h1>{t("The best AI model for each job.", "El mejor modelo de IA para cada tarea.")}</h1>
          <p>
            {t(
              "Ranked Top 5 lists for production coding, images, video, and music. Every model shows its benchmark score, why it holds its place, how strongly we recommend it against the category leader, and what it costs next to its rivals.",
              "Top 5 clasificados para código de producción, imagen, vídeo y música. Cada modelo muestra su puntuación, por qué ocupa su puesto, cuánto lo recomendamos frente al líder de la categoría y cuánto cuesta frente a sus rivales.",
            )}
          </p>
          <dl className="bench-hero-stats">
            <div>
              <dt>{t("Models ranked", "Modelos clasificados")}</dt>
              <dd>{RANKED_CATEGORY_COUNT * MODELS_PER_CATEGORY}</dd>
            </div>
            <div>
              <dt>{t("Scores evaluated", "Puntuaciones evaluadas")}</dt>
              <dd>{RANKING_SNAPSHOT_DATE}</dd>
            </div>
            <div>
              <dt>{t("Prices checked", "Precios consultados")}</dt>
              <dd>{PRICE_CHECKED_DATE}</dd>
            </div>
            <div>
              <dt>{t("Review cycle", "Revisión")}</dt>
              <dd>
                {RANKING_REVIEW_AFTER_DAYS} {t("days", "días")}
              </dd>
            </div>
          </dl>
        </div>

        <aside className="bench-legend" aria-labelledby="bench-legend-title">
          <p className="eyebrow" id="bench-legend-title">
            {t("HOW TO READ A ROW", "CÓMO LEER UNA FILA")}
          </p>
          <div className="bench-legend-item bench-meter-recommendation">
            <span className="bench-legend-bar" aria-hidden="true">
              <span />
            </span>
            <div>
              <strong>{t("Recommendation", "Recomendación")}</strong>
              <p>
                {t(
                  "Strength against the category's #1, from the benchmark itself. Arena ratings become the share of head-to-head votes a model would win against #1.",
                  "Fuerza frente al n.º 1 de la categoría, según el propio benchmark. En las arenas se usa la proporción de votos que ganaría frente al n.º 1.",
                )}
              </p>
            </div>
          </div>
          <div className="bench-legend-item bench-meter-price">
            <span className="bench-legend-bar" aria-hidden="true">
              <span />
            </span>
            <div>
              <strong>{t("Price", "Precio")}</strong>
              <p>
                {t(
                  "Published list price relative to the most expensive model in the same category. Shorter is cheaper; a hatched bar means no price is published.",
                  "Precio publicado respecto al modelo más caro de la misma categoría. Más corta es más barata; una barra rayada indica que no hay precio publicado.",
                )}
              </p>
            </div>
          </div>
          <p className="bench-legend-note">
            {t(
              "Bars compare models only within one category. Scores stay in each benchmark's own units.",
              "Las barras solo comparan modelos dentro de una categoría. Las puntuaciones se mantienen en las unidades de cada benchmark.",
            )}
          </p>
        </aside>
      </header>

      <nav
        className="models-anchor-nav bench-nav"
        aria-label={t("Ranking categories", "Categorías de clasificación")}
      >
        <a href="#coding">
          <Braces aria-hidden="true" />
          {t("Coding", "Código")}
        </a>
        <a href="#image">
          <ImageIcon aria-hidden="true" />
          {t("Image", "Imagen")}
        </a>
        <a href="#video">
          <Video aria-hidden="true" />
          {t("Video", "Vídeo")}
        </a>
        <a href="#music">
          <Music2 aria-hidden="true" />
          {t("Music", "Música")}
        </a>
        <a href="#picks">
          <Medal aria-hidden="true" />
          {t("Editor's picks", "Selección editorial")}
        </a>
      </nav>

      <BenchmarkSection
        id="coding"
        category="coding"
        index="01"
        title={{ en: "Production coding", es: "Código de producción" }}
        description={{
          en: "Repository work, tool use, terminal tasks, implementation, and validated completion—not autocomplete alone.",
          es: "Trabajo en repositorios, uso de herramientas y terminal, implementación y finalización validada; no solo autocompletado.",
        }}
      />
      <BenchmarkSection
        id="image"
        category="image"
        index="02"
        title={{ en: "Image creation", es: "Creación de imágenes" }}
        description={{
          en: "Text-to-image quality from blind pairwise preference. Editing is not mixed into this list.",
          es: "Calidad de texto a imagen mediante preferencias ciegas por parejas. La edición no se mezcla en esta lista.",
        }}
      />
      <BenchmarkSection
        id="video"
        category="video"
        index="03"
        title={{ en: "Video with native audio", es: "Vídeo con audio nativo" }}
        description={{
          en: "Text-to-video models evaluated with their generated audio. Silent-video rankings can differ.",
          es: "Modelos de texto a vídeo evaluados con su audio generado. La clasificación de vídeo sin sonido puede ser distinta.",
        }}
      />

      <section id="music" className="bench-music" aria-labelledby="music-title">
        <div className="bench-music-intro">
          <p className="eyebrow">04 · {t("MUSIC", "MÚSICA")}</p>
          <h2 id="music-title">
            {t("One craft, two listening tests.", "Una disciplina, dos pruebas de escucha.")}
          </h2>
          <p>
            {t(
              "Vocal and instrumental outputs are evaluated independently. Speech, voice cloning, sound effects, and audio editing are outside this edition.",
              "Las salidas vocales e instrumentales se evalúan por separado. Voz hablada, clonación, efectos y edición de audio quedan fuera de esta edición.",
            )}
          </p>
        </div>
        <BenchmarkSection
          id="music-vocal"
          category="music-vocal"
          index="04A"
          title={{ en: "Music · Vocal", es: "Música · Vocal" }}
          description={{
            en: "Full songs where vocal quality and the complete listening experience are judged together.",
            es: "Canciones completas donde se valoran juntas la calidad vocal y la experiencia de escucha.",
          }}
        />
        <BenchmarkSection
          id="music-instrumental"
          category="music-instrumental"
          index="04B"
          title={{ en: "Music · Instrumental", es: "Música · Instrumental" }}
          description={{
            en: "Instrumental generations judged separately from vocal songs to preserve a meaningful comparison.",
            es: "Generaciones instrumentales evaluadas por separado para conservar una comparación útil.",
          }}
        />
      </section>

      <section
        id="picks"
        className="models-awards bench-picks"
        aria-labelledby="models-awards-title"
      >
        <div className="bench-picks-heading">
          <Medal aria-hidden="true" />
          <div>
            <p className="eyebrow">{t("EDITOR'S PICKS", "SELECCIÓN EDITORIAL")}</p>
            <h2 id="models-awards-title">
              {t("Seven useful starting points.", "Siete puntos de partida útiles.")}
            </h2>
          </div>
          <p>
            {t(
              "MAblog editorial picks informed by the rankings above—not additional benchmark awards.",
              "Selecciones editoriales de MAblog basadas en las clasificaciones anteriores; no son premios adicionales del benchmark.",
            )}
          </p>
        </div>
        <div className="models-awards-grid">
          {EDITOR_PICKS.map(
            /** Link each pick to the evidence-bearing family profile. */ ([
              labelEn,
              labelEs,
              model,
              slug,
            ]) => (
              <Link href={`/ai-models/${slug}`} key={slug}>
                <small>{t(labelEn, labelEs)}</small>
                <strong>{model}</strong>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ),
          )}
        </div>
      </section>

      <aside
        className="models-disclosure bench-disclosure"
        aria-labelledby="models-disclosure-title"
      >
        <Sparkles aria-hidden="true" />
        <div>
          <p className="eyebrow">{t("METHODOLOGY NOTE", "NOTA METODOLÓGICA")}</p>
          <h2 id="models-disclosure-title">
            {t(
              "A ranking is a dated decision aid—not a permanent verdict.",
              "Una clasificación es una ayuda fechada, no un veredicto permanente.",
            )}
          </h2>
          <p>
            {t(
              "Order follows each category's primary leaderboard after access and one-family-per-provider filters. Scores are copied in their source-native units with confidence intervals and source rank ranges. The recommendation bar is derived only from those scores: Elo ratings use the standard expected-score formula against #1, and index scores use their ratio to #1. Prices are list prices from the linked official pages or leaderboards, except where a row is marked as coming from an independent tracker; token prices are blended 3 input : 1 output. Licensing notes are informational and not legal advice. Re-check the linked documentation before adopting a model.",
              "El orden sigue la clasificación principal de cada categoría tras filtrar por acceso y una familia por proveedor. Las puntuaciones se copian en sus unidades originales con intervalos de confianza y rangos de la fuente. La barra de recomendación se deriva solo de esas puntuaciones: los Elo usan la fórmula estándar de puntuación esperada frente al n.º 1 y los índices su proporción respecto al n.º 1. Los precios son tarifas publicadas en las páginas oficiales o clasificaciones enlazadas, salvo cuando una fila indica que proceden de un rastreador independiente; los precios por token mezclan 3 de entrada : 1 de salida. Las notas de licencia son informativas y no constituyen asesoramiento legal. Revisa la documentación enlazada antes de adoptar un modelo.",
            )}
          </p>
        </div>
      </aside>
    </article>
  );
}
