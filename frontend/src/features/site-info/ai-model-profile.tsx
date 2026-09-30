"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpenCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { RankedModel, RankingCategory } from "./ai-model-rankings";
import { RANKING_SNAPSHOT_DATE } from "./ai-model-rankings";
import {
  getPlacementContext,
  isPublishedPrice,
  PRICE_CHECKED_DATE,
} from "./ai-model-benchmark-context";
import { CategoryIcon } from "./category-icon";
import { accessTranslations } from "./ranking-labels";

/** Return the readable bilingual name for a stored ranking category. */
function categoryName(category: RankingCategory, spanish: boolean): string {
  const names: Record<RankingCategory, [string, string]> = {
    coding: ["Production coding", "Código de producción"],
    image: ["Image creation", "Creación de imágenes"],
    video: ["Video with audio", "Vídeo con audio"],
    "music-vocal": ["Music · Vocal", "Música · Vocal"],
    "music-instrumental": ["Music · Instrumental", "Música · Instrumental"],
  };
  return names[category][spanish ? 1 : 0];
}

/** Explain one placement and show its published price, or why no price is shown. */
function PlacementContextDetails({ category, slug }: { category: RankingCategory; slug: string }) {
  const { t } = useLanguage();
  const { rankReason, price } = getPlacementContext(category, slug);
  return (
    <div className="model-score-context">
      <p>
        <strong>{t("Why this rank", "Por qué este puesto")}:</strong>{" "}
        {t(rankReason.en, rankReason.es)}
      </p>
      {isPublishedPrice(price) ? (
        <p>
          <strong>{t("Price", "Precio")}:</strong> {price.display}
          {price.variant ? ` (${price.variant})` : ""} ·{" "}
          <a href={price.sourceUrl} target="_blank" rel="noreferrer">
            {price.sourceLabel}
          </a>
          {price.secondarySource
            ? ` · ${t("independent tracker, not a first-party page", "rastreador independiente, no página oficial")}`
            : ""}{" "}
          · {t("checked", "consultado")} {PRICE_CHECKED_DATE}
        </p>
      ) : (
        <p>
          <strong>{t("Price", "Precio")}:</strong> {t(price.missing.en, price.missing.es)}
        </p>
      )}
    </div>
  );
}

/** Render the minimal permanent family profile approved for the first ranking edition. */
export function AiModelProfile({ model }: { model: RankedModel }) {
  const { locale, t } = useLanguage();
  const firstPlacement = model.placements[0];
  return (
    <article className="model-profile-page">
      <div className="model-profile-back">
        <Link href="/ai-models">
          <ArrowLeft aria-hidden="true" />
          {t("All AI rankings", "Todas las clasificaciones")}
        </Link>
      </div>
      <header className={`model-profile-hero models-accent-${model.accent}`}>
        <div className="models-cover model-profile-cover" aria-hidden="true">
          <div className="models-cover-orbit" />
          <CategoryIcon category={firstPlacement.category} />
          <span>{model.provider}</span>
          <strong>{model.name}</strong>
        </div>
        <div className="model-profile-intro">
          <p className="eyebrow">{t("MODEL FAMILY PROFILE", "FICHA DE FAMILIA")}</p>
          <h1>{model.name}</h1>
          <p className="model-profile-provider">{model.provider}</p>
          <p>{t(model.description.en, model.description.es)}</p>
          <div className="models-access-list">
            {model.access.map(
              /** Translate every documented access mode for the current interface language. */ (
                access,
              ) => (
                <span key={access}>{t(access, accessTranslations[access])}</span>
              ),
            )}
          </div>
          <a
            className="model-official-link"
            href={model.officialUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t("Official access", "Acceso oficial")} <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </header>

      <section className="model-profile-scores" aria-labelledby="model-scores-title">
        <div className="model-profile-section-title">
          <p className="eyebrow">{t("EVIDENCE SNAPSHOT", "RESUMEN DE EVIDENCIA")}</p>
          <h2 id="model-scores-title">{t("Category scores", "Puntuaciones por categoría")}</h2>
        </div>
        <div className="model-score-grid">
          {model.placements.map(
            /** Present every category placement recorded under this permanent family profile. */ (
              placement,
            ) => (
              <article key={placement.category}>
                <div>
                  <span>#{placement.rank}</span>
                  <strong>{categoryName(placement.category, locale === "es")}</strong>
                </div>
                <p className="model-score-value">
                  {placement.score} <small>{placement.confidenceInterval ?? ""}</small>
                </p>
                <p>{placement.metric}</p>
                <dl>
                  <div>
                    <dt>{t("Source rank", "Rango fuente")}</dt>
                    <dd>{placement.sourceRank}</dd>
                  </div>
                  <div>
                    <dt>{t("Evidence", "Evidencia")}</dt>
                    <dd>{placement.samples ?? t("Not published", "No publicada")}</dd>
                  </div>
                  <div>
                    <dt>{t("Evaluated", "Evaluado")}</dt>
                    <dd>{RANKING_SNAPSHOT_DATE}</dd>
                  </div>
                </dl>
                {placement.tieNote ? (
                  <p className="models-tie">{t(placement.tieNote.en, placement.tieNote.es)}</p>
                ) : null}
                <PlacementContextDetails category={placement.category} slug={model.slug} />
                <a href={placement.sourceUrl} target="_blank" rel="noreferrer">
                  {placement.sourceLabel} <ArrowUpRight aria-hidden="true" />
                </a>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="model-verdicts" aria-labelledby="model-verdicts-title">
        <div className="model-profile-section-title">
          <p className="eyebrow">{t("CHOOSING CONTEXT", "CONTEXTO DE ELECCIÓN")}</p>
          <h2 id="model-verdicts-title">{t("Who is it best for?", "¿Para quién es mejor?")}</h2>
        </div>
        <div>
          <article>
            <span>01</span>
            <h3>{t("Best for users", "Mejor para usuarios")}</h3>
            <p>{t(model.userVerdict.en, model.userVerdict.es)}</p>
          </article>
          <article>
            <span>02</span>
            <h3>{t("Best for developers", "Mejor para desarrolladores")}</h3>
            <p>{t(model.developerVerdict.en, model.developerVerdict.es)}</p>
          </article>
        </div>
      </section>

      <aside className="model-coming-next">
        <BookOpenCheck aria-hidden="true" />
        <div>
          <p className="eyebrow">{t("NEXT EDITION", "PRÓXIMA EDICIÓN")}</p>
          <h2>{t("Full analysis coming next.", "Análisis completo próximamente.")}</h2>
          <p>
            {t(
              "This first profile preserves the ranking evidence, access routes, and decision context. Examples, deeper comparisons, workflow tests, and limitations will follow in the planned profile design.",
              "Esta primera ficha conserva evidencia, acceso y contexto de decisión. Los ejemplos, comparaciones, pruebas de flujo y limitaciones llegarán con el diseño completo de perfiles.",
            )}
          </p>
        </div>
      </aside>
    </article>
  );
}
