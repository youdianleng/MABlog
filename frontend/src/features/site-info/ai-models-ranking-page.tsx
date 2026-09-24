"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Braces, Image as ImageIcon, Medal, Music2, ShieldCheck, Sparkles, Video } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { getModelsForCategory, getPlacement, type LocalizedText, type RankedModel, type RankingCategory, RANKING_REVIEW_AFTER_DAYS, RANKING_SNAPSHOT_DATE } from "./ai-model-rankings";

const accessTranslations: Record<string, string> = { "Free access": "Acceso gratuito", Subscription: "Suscripción", API: "API", "Open weights": "Pesos abiertos", "Regional access": "Acceso regional" };

/** Select the decorative category mark used on editorial covers and section headings. */
function CategoryIcon({ category }: { category: RankingCategory }) {
  if (category === "coding") return <Braces aria-hidden="true" />;
  if (category === "image") return <ImageIcon aria-hidden="true" />;
  if (category === "video") return <Video aria-hidden="true" />;
  return <Music2 aria-hidden="true" />;
}

/** Render one model-family card with a preserved source-native measurement. */
function RankingCard({ model, category }: { model: RankedModel; category: RankingCategory }) {
  const { t } = useLanguage();
  const placement = getPlacement(model, category);
  return (
    <Link className={`models-rank-card models-accent-${model.accent}`} href={`/ai-models/${model.slug}`}>
      <div className="models-cover" aria-hidden="true"><div className="models-cover-orbit" /><CategoryIcon category={category} /><span>{model.provider}</span><strong>{model.name}</strong></div>
      <div className="models-rank-card-body">
        <div className="models-rank-line"><span className="models-rank-number">#{placement.rank}</span><span>{placement.sourceRank === String(placement.rank) ? t("Source rank", "Rango fuente") : t("Source range", "Intervalo fuente")} {placement.sourceRank}</span></div>
        <h3>{model.name}</h3><p className="models-provider">{model.provider}</p>
        <div className="models-score"><strong>{placement.score}</strong><span>{placement.metric}{placement.confidenceInterval ? ` · ${placement.confidenceInterval}` : ""}</span></div>
        <p className="models-card-description">{t(model.description.en, model.description.es)}</p>
        <div className="models-evidence-line"><span>{placement.samples ?? t("Sample not published", "Muestra no publicada")}</span>{placement.tieNote ? <span className="models-tie">{t(placement.tieNote.en, placement.tieNote.es)}</span> : null}</div>
        <div className="models-access-list">{model.access.map(/** Translate each documented access route without changing the record. */ (access) => <span key={access}>{t(access, accessTranslations[access])}</span>)}</div>
        <span className="models-card-link">{t("Open profile", "Abrir ficha")} <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

/** Present one five-family ranking with its scope, source, and diversity disclosure. */
function RankingSection({ id, category, index, title, description, sourceLabel }: { id: string; category: RankingCategory; index: string; title: LocalizedText; description: LocalizedText; sourceLabel: string }) {
  const { t } = useLanguage();
  const models = getModelsForCategory(category);
  return (
    <section id={id} className="models-ranking-section" aria-labelledby={`${id}-title`}>
      <div className="models-ranking-heading">
        <div className="models-heading-index"><span>{index}</span><CategoryIcon category={category} /></div>
        <div><p className="eyebrow">{t("MABLOG TOP 5", "TOP 5 DE MABLOG")}</p><h2 id={`${id}-title`}>{t(title.en, title.es)}</h2></div>
        <div className="models-ranking-context"><p>{t(description.en, description.es)}</p><p><strong>{t("Primary source", "Fuente principal")}:</strong> {sourceLabel}</p></div>
      </div>
      <p className="models-filter-note">{t("Filtered from the cited leaderboard: one accessible model family per provider. Source rank ranges are preserved, so visible order does not imply a statistically significant difference.", "Filtrado desde la clasificación citada: una familia accesible por proveedor. Se conservan los intervalos de rango, por lo que el orden visible no implica una diferencia estadísticamente significativa.")}</p>
      <div className="models-card-grid">{models.map(/** Render each reviewed family in its fixed editorial order. */ (model) => <RankingCard key={`${category}-${model.slug}`} model={model} category={category} />)}</div>
    </section>
  );
}

/** Render the confirmed bilingual rankings, methodology disclosure, and editorial awards. */
export function AiModelsRankingPageContent() {
  const { t } = useLanguage();
  const awards = [
    ["Best for production coding", "Mejor para código de producción", "Claude Fable 5.1", "claude-fable-5-1"],
    ["Best image creator", "Mejor creador visual", "GPT Image 2.5 Sunburst", "gpt-image-2-5-sunburst"],
    ["Best video creator", "Mejor creador de vídeo", "Gemini Omni Flash", "gemini-omni-flash"],
    ["Best music creator", "Mejor creador musical", "Mureka V9", "mureka-v9"],
    ["Best open option", "Mejor opción abierta", "Wan 3.0", "wan-3"],
    ["Best value", "Mejor valor", "Muse Image", "muse-image"],
    ["Best for beginners", "Mejor para principiantes", "Nano Banana 2", "nano-banana-2"],
  ];
  return (
    <article className="models-page">
      <header className="models-hero models-ranking-hero">
        <div className="models-hero-copy">
          <p className="eyebrow">{t("AI MODEL RANKINGS · SEPTEMBER 2026", "CLASIFICACIÓN DE MODELOS IA · SEPTIEMBRE 2026")}</p>
          <h1>{t("Five models. Four crafts. No invented score.", "Cinco modelos. Cuatro disciplinas. Ninguna nota inventada.")}</h1>
          <p>{t("Independent Top 5 lists for production coding, image, video, and music. Every card keeps the benchmark's native score and links to the evidence behind it.", "Listas Top 5 independientes para código de producción, imagen, vídeo y música. Cada ficha conserva la puntuación original del benchmark y enlaza su evidencia.")}</p>
          <a className="models-scroll-cue" href="#coding">{t("See the rankings", "Ver clasificaciones")} <ArrowDown aria-hidden="true" /></a>
        </div>
        <aside className="models-method-card" aria-labelledby="models-method-title">
          <div><ShieldCheck aria-hidden="true" /><p className="eyebrow">{t("HOW TO READ THIS", "CÓMO LEER ESTO")}</p></div>
          <h2 id="models-method-title">{t("Evidence first. Access verified. Categories stay separate.", "Primero la evidencia. Acceso verificado. Categorías separadas.")}</h2>
          <dl><div><dt>{t("Evaluated", "Evaluado")}</dt><dd>{RANKING_SNAPSHOT_DATE}</dd></div><div><dt>{t("Review target", "Próxima revisión")}</dt><dd>{RANKING_REVIEW_AFTER_DAYS} {t("days", "días")}</dd></div><div><dt>{t("Rule", "Regla")}</dt><dd>{t("One family per provider", "Una familia por proveedor")}</dd></div></dl>
          <p>{t("Editorial order follows the cited primary leaderboard after access and provider-diversity filters. Price is context, not a hidden universal score.", "El orden editorial sigue la fuente principal tras filtrar por acceso y diversidad de proveedores. El precio aporta contexto, no una nota universal oculta.")}</p>
        </aside>
      </header>

      <nav className="models-anchor-nav" aria-label={t("Ranking categories", "Categorías de clasificación")}><span>{t("Jump to", "Ir a")}</span><a href="#coding"><Braces aria-hidden="true" />{t("Coding", "Código")}</a><a href="#image"><ImageIcon aria-hidden="true" />{t("Image", "Imagen")}</a><a href="#video"><Video aria-hidden="true" />{t("Video", "Vídeo")}</a><a href="#music"><Music2 aria-hidden="true" />{t("Music", "Música")}</a></nav>

      <section className="models-awards" aria-labelledby="models-awards-title">
        <div className="models-awards-heading"><Medal aria-hidden="true" /><div><p className="eyebrow">{t("EDITOR'S DESK", "MESA EDITORIAL")}</p><h2 id="models-awards-title">{t("Seven useful starting points.", "Siete puntos de partida útiles.")}</h2></div></div>
        <p className="models-awards-disclaimer">{t("MAblog editorial picks informed by the rankings below—not additional benchmark awards.", "Selecciones editoriales de MAblog basadas en las clasificaciones siguientes; no son premios adicionales del benchmark.")}</p>
        <div className="models-awards-grid">{awards.map(/** Link each award to the evidence-bearing family profile. */ ([labelEn, labelEs, model, slug], awardIndex) => <Link href={`/ai-models/${slug}`} key={slug}><span>0{awardIndex + 1}</span><small>{t(labelEn, labelEs)}</small><strong>{model}</strong><ArrowUpRight aria-hidden="true" /></Link>)}</div>
      </section>

      <RankingSection id="coding" category="coding" index="01" title={{ en: "Production coding", es: "Código de producción" }} description={{ en: "Repository work, tool use, terminal tasks, implementation, and validated completion—not autocomplete alone.", es: "Trabajo en repositorios, uso de herramientas y terminal, implementación y finalización validada; no solo autocompletado." }} sourceLabel="Artificial Analysis Coding Agent Index v1.5" />
      <RankingSection id="image" category="image" index="02" title={{ en: "Image creation", es: "Creación de imágenes" }} description={{ en: "Text-to-image quality from blind pairwise preference. Editing is not mixed into this list.", es: "Calidad de texto a imagen mediante preferencias ciegas por parejas. La edición no se mezcla en esta lista." }} sourceLabel="Artificial Analysis Text-to-Image Arena" />
      <RankingSection id="video" category="video" index="03" title={{ en: "Video with native audio", es: "Vídeo con audio nativo" }} description={{ en: "Text-to-video models evaluated with their generated audio. Silent-video rankings can differ.", es: "Modelos de texto a vídeo evaluados con su audio generado. La clasificación de vídeo sin sonido puede ser distinta." }} sourceLabel="Artificial Analysis Text-to-Video Arena" />

      <section id="music" className="models-music-group" aria-labelledby="music-title">
        <div className="models-music-intro"><div><p className="eyebrow">04 · {t("MUSIC", "MÚSICA")}</p><h2 id="music-title">{t("One craft, two listening tests.", "Una disciplina, dos pruebas de escucha.")}</h2></div><p>{t("Vocal and instrumental outputs are evaluated independently. Speech, voice cloning, sound effects, and audio editing are outside this edition.", "Las salidas vocales e instrumentales se evalúan por separado. Voz hablada, clonación, efectos y edición de audio quedan fuera de esta edición.")}</p></div>
        <RankingSection id="music-vocal" category="music-vocal" index="04A" title={{ en: "Music · Vocal", es: "Música · Vocal" }} description={{ en: "Full songs where vocal quality and the complete listening experience are judged together.", es: "Canciones completas donde se valoran juntas la calidad vocal y la experiencia de escucha." }} sourceLabel="Artificial Analysis Music Arena · Vocals" />
        <RankingSection id="music-instrumental" category="music-instrumental" index="04B" title={{ en: "Music · Instrumental", es: "Música · Instrumental" }} description={{ en: "Instrumental generations judged separately from vocal songs to preserve a meaningful comparison.", es: "Generaciones instrumentales evaluadas por separado para conservar una comparación útil." }} sourceLabel="Artificial Analysis Music Arena · Instrumental" />
      </section>

      <aside className="models-disclosure" aria-labelledby="models-disclosure-title"><Sparkles aria-hidden="true" /><div><p className="eyebrow">{t("METHODOLOGY NOTE", "NOTA METODOLÓGICA")}</p><h2 id="models-disclosure-title">{t("A ranking is a dated decision aid—not a permanent verdict.", "Una clasificación es una ayuda fechada, no un veredicto permanente.")}</h2><p>{t("Scores are copied in their source-native units. Confidence intervals, vote or task counts, access limits, and family filters stay visible. Licensing notes are informational and are not legal advice. Re-check the linked provider documentation before adopting a model.", "Las puntuaciones se copian en las unidades originales. Se muestran intervalos de confianza, votos o tareas, límites de acceso y filtros por familia. Las notas de licencia son informativas y no constituyen asesoramiento legal. Revisa la documentación enlazada antes de adoptar un modelo.")}</p></div></aside>
    </article>
  );
}
