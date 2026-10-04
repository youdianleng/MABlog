"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpenCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { RankingCategory } from "./ai-model-rankings";
import { isPublishedPrice } from "./ai-model-benchmark-context";
import { filePriceText } from "./ai-model-file-labels";
import type { FileFacts, LeaderboardEntry, ProfileView } from "./ai-models-data";
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

/** Explain one placement and show its comparable price, or why no price is shown. */
function PlacementContextDetails({ entry }: { entry: LeaderboardEntry }) {
  const { t } = useLanguage();
  const { rankReason, price } = entry;
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
            : ""}
          {price.checkedAt ? ` · ${t("checked", "consultado")} ${price.checkedAt}` : ""}
        </p>
      ) : (
        <p>
          <strong>{t("Price", "Precio")}:</strong> {t(price.missing.en, price.missing.es)}
        </p>
      )}
    </div>
  );
}

/** Reviewed-file facts: what changed, capabilities, plans, prices, and caveats. */
function ReviewedFacts({ facts }: { facts: FileFacts }) {
  const { locale, t } = useLanguage();
  const language = locale === "es" ? "es" : "en";
  /** Render a titled bullet list, or nothing when empty. */
  const list = (title: string, items: string[]) =>
    items.length ? (
      <article>
        <h3>{title}</h3>
        <ul>
          {items.map(
            /** One bullet. */ (item) => (
              <li key={item}>{item}</li>
            ),
          )}
        </ul>
      </article>
    ) : null;
  return (
    <section className="model-reviewed-facts" aria-labelledby="model-facts-title">
      <div className="model-profile-section-title">
        <p className="eyebrow">
          {t("REVIEWED MODEL FILE", "FICHA REVISADA")} · {t("checked", "consultado")}{" "}
          {facts.checkedAt}
        </p>
        <h2 id="model-facts-title">{t("What to know", "Lo que debes saber")}</h2>
      </div>
      <div className="model-facts-grid">
        {list(t("What's new", "Novedades"), facts.whatsNew[language])}
        {list(t("Key capabilities", "Capacidades clave"), facts.capabilities[language])}
        <article>
          <h3>{t("Plans and pricing", "Planes y precios")}</h3>
          <ul>
            {facts.plans.map(
              /** One subscription plan. */ (plan) => (
                <li key={plan.name}>
                  <strong>{plan.name}</strong>:{" "}
                  {plan.price_monthly === null
                    ? t("price not published", "precio no publicado")
                    : t(`$${plan.price_monthly} per month`, `${plan.price_monthly} $ al mes`)}{" "}
                  · {plan.includes.join(", ")}
                </li>
              ),
            )}
            {facts.pricing.map(
              /** One API price. */ (price, index) => (
                <li key={`${price.unit}-${index}`}>
                  <strong>API</strong>: {filePriceText(price, language === "es")}
                </li>
              ),
            )}
            {facts.plans.length === 0 && facts.pricing.length === 0 ? (
              <li>{t("Not published.", "No publicado.")}</li>
            ) : null}
          </ul>
        </article>
        {list(
          t("Limitations and caveats", "Limitaciones y advertencias"),
          facts.limitations[language],
        )}
      </div>
      <p className="model-facts-sources">
        {t("Official sources", "Fuentes oficiales")}:{" "}
        {facts.officialSources.map(
          /** Link one official source. */ (source, index) => (
            <span key={source.url}>
              {index > 0 ? ", " : ""}
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </span>
          ),
        )}
      </p>
    </section>
  );
}

// Icon for profiles that are not on any leaderboard, by the file's category.
const FALLBACK_ICON: Record<string, RankingCategory> = {
  "llm-agents": "coding",
  image: "image",
  video: "video",
  music: "music-vocal",
  "voice-sound": "music-vocal",
};

/**
 * Render a permanent model profile: identity, every leaderboard placement with its reason and
 * price, verdicts, and, when a reviewed model file exists, its reviewed facts.
 *
 * @param scoresEvaluated date the shown benchmark scores were reviewed (from `rankings.yaml`)
 */
export function AiModelProfile({
  profile,
  scoresEvaluated,
}: {
  profile: ProfileView;
  scoresEvaluated: string;
}) {
  const { locale, t } = useLanguage();
  const { model, placements } = profile;
  const iconCategory =
    placements[0]?.category ?? (model.file ? FALLBACK_ICON[model.file.category] : "coding");
  const intro = model.file ? model.file.summary : model.description;
  return (
    <article className="model-profile-page">
      <div className="model-profile-back">
        {/* Unranked reviewed models are listed on the "Other models" page; go back there. */}
        {placements.length === 0 && model.file ? (
          <Link href="/ai-models/other-models">
            <ArrowLeft aria-hidden="true" />
            {t("Other models", "Otros modelos")}
          </Link>
        ) : (
          <Link href="/ai-models">
            <ArrowLeft aria-hidden="true" />
            {t("All AI rankings", "Todas las clasificaciones")}
          </Link>
        )}
      </div>
      <header className={`model-profile-hero models-accent-${model.accent}`}>
        <div className="models-cover model-profile-cover" aria-hidden="true">
          <div className="models-cover-orbit" />
          <CategoryIcon category={iconCategory} />
          <span>{model.provider}</span>
          <strong>{model.name}</strong>
        </div>
        <div className="model-profile-intro">
          <p className="eyebrow">{t("MODEL FAMILY PROFILE", "FICHA DE FAMILIA")}</p>
          <h1>{model.name}</h1>
          <p className="model-profile-provider">{model.provider}</p>
          {model.file?.supersededBy ? (
            <p className="model-superseded" role="note">
              {t(
                "A newer release of this model is available:",
                "Hay una versión más reciente de este modelo:",
              )}{" "}
              <Link href={`/ai-models/${model.file.supersededBy}`}>{model.file.supersededBy}</Link>
            </p>
          ) : null}
          <p>{t(intro.en, intro.es)}</p>
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
        {placements.length === 0 ? (
          <p className="model-not-ranked">
            {t("Not ranked in this edition.", "No clasificado en esta edición.")}
          </p>
        ) : (
          <div className="model-score-grid">
            {placements.map(
              /** Present every leaderboard placement recorded for this model. */ (entry) => {
                const { placement } = entry;
                return (
                  <article key={entry.category}>
                    <div>
                      <span>#{placement.rank}</span>
                      <strong>{categoryName(entry.category, locale === "es")}</strong>
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
                        <dd>{scoresEvaluated}</dd>
                      </div>
                    </dl>
                    {placement.tieNote ? (
                      <p className="models-tie">{t(placement.tieNote.en, placement.tieNote.es)}</p>
                    ) : null}
                    <PlacementContextDetails entry={entry} />
                    <a href={placement.sourceUrl} target="_blank" rel="noreferrer">
                      {placement.sourceLabel} <ArrowUpRight aria-hidden="true" />
                    </a>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {model.file ? <ReviewedFacts facts={model.file} /> : null}

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

      {model.file ? null : (
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
      )}
    </article>
  );
}
