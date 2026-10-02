"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { FILE_CATEGORIES } from "./ai-model-file-labels";
import type { OtherModelsGroup } from "./ai-models-data";
import { FileCategoryIcon, OtherModelCard } from "./other-model-card";

/**
 * The "Other models" page: reviewed models that are not in any Top 5, grouped by category.
 *
 * @param groups non-empty category sections from `otherModels()`, in page order
 */
export function OtherModelsPageContent({ groups }: { groups: OtherModelsGroup[] }) {
  const { t } = useLanguage();
  const total = groups.reduce(
    /** Count models across sections. */ (sum, group) => sum + group.models.length,
    0,
  );
  const newest = groups
    .flatMap(
      /** Every release date. */ (group) =>
        group.models.map(/** One release date. */ (model) => model.file?.releaseDate ?? ""),
    )
    .sort()
    .at(-1);
  /** Bilingual section name for a category. */
  const categoryName = (id: OtherModelsGroup["category"]) => {
    const entry = FILE_CATEGORIES.find(/** Match the id. */ (item) => item.id === id);
    return entry ? t(entry.name.en, entry.name.es) : id;
  };
  return (
    <article className="other-models-page bench-page">
      <div className="model-profile-back">
        <Link href="/ai-models">
          <ArrowLeft aria-hidden="true" />
          {t("All AI rankings", "Todas las clasificaciones")}
        </Link>
      </div>
      <header className="other-models-hero">
        <p className="eyebrow">
          {t(
            "MABLOG AI BENCHMARK · BEYOND THE TOP 5",
            "BENCHMARK IA DE MABLOG · MÁS ALLÁ DEL TOP 5",
          )}
        </p>
        <h1>{t("Other models worth knowing.", "Otros modelos que conviene conocer.")}</h1>
        <p>
          {t(
            "New releases and specialist models that are not in a ranked Top 5 yet, often because no independent benchmark score exists. Every card comes from a reviewed model file with official sources.",
            "Lanzamientos recientes y modelos especializados que aún no están en un Top 5, a menudo porque todavía no hay una puntuación independiente. Cada tarjeta procede de una ficha revisada con fuentes oficiales.",
          )}
        </p>
        <dl className="bench-hero-stats">
          <div>
            <dt>{t("Models", "Modelos")}</dt>
            <dd>{total}</dd>
          </div>
          <div>
            <dt>{t("Categories", "Categorías")}</dt>
            <dd>{groups.length}</dd>
          </div>
          <div>
            <dt>{t("Newest release", "Último lanzamiento")}</dt>
            <dd>{newest || "—"}</dd>
          </div>
        </dl>
      </header>

      {groups.length === 0 ? (
        <p className="other-models-empty">
          {t(
            "No other reviewed models yet. New releases appear here once their files are reviewed.",
            "Aún no hay otros modelos revisados. Los lanzamientos aparecerán aquí cuando se revisen sus fichas.",
          )}
        </p>
      ) : (
        <>
          <nav className="models-anchor-nav bench-nav" aria-label={t("Categories", "Categorías")}>
            {groups.map(
              /** Link one category section. */ (group) => (
                <a key={group.category} href={`#${group.category}`}>
                  <FileCategoryIcon category={group.category} />
                  {categoryName(group.category)} ({group.models.length})
                </a>
              ),
            )}
          </nav>
          {groups.map(
            /** Render one category section of cards. */ (group) => (
              <section
                key={group.category}
                id={group.category}
                className="other-models-section"
                aria-labelledby={`${group.category}-title`}
              >
                <h2 id={`${group.category}-title`}>{categoryName(group.category)}</h2>
                <ul className="other-models-grid">
                  {group.models.map(
                    /** Render one model card. */ (model) => (
                      <OtherModelCard key={model.slug} model={model} />
                    ),
                  )}
                </ul>
              </section>
            ),
          )}
        </>
      )}

      <p className="other-models-note">
        {t(
          "Not being ranked is not a verdict on quality. Rankings use independent benchmark scores; a model joins a Top 5 when a person reviews the evidence and updates the rankings.",
          "No estar clasificado no es un juicio sobre la calidad. Las clasificaciones usan puntuaciones independientes; un modelo entra en un Top 5 cuando una persona revisa la evidencia y actualiza la clasificación.",
        )}
      </p>
    </article>
  );
}
