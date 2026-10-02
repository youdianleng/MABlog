"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ModelReviewFile } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { ModelReviewActions } from "./model-review-actions";
import { ModelReviewFacts } from "./model-review-facts";
import { ModelReviewText } from "./model-review-text";
import type { ReviewEntry } from "./use-model-review-folder";

/**
 * Everything needed to review one model file: status, open notes, facts with their quotes, the
 * public text in both languages, and the approve / return-to-draft decision.
 */
export function ModelReviewDetail({
  entry,
  onChanged,
}: {
  entry: ReviewEntry;
  onChanged: (record: ModelReviewFile) => void;
}) {
  const { t } = useLanguage();
  const { parsed, record, error, placements } = entry;
  return (
    <article className="model-review-detail" aria-labelledby="model-review-title">
      <header>
        <p className="eyebrow">{record.name}</p>
        <h2 id="model-review-title">{parsed?.title.en ?? record.name}</h2>
        {parsed ? (
          <p className="model-review-meta">
            <span className={parsed.reviewed ? "is-reviewed" : "is-draft"}>
              {parsed.reviewed ? t("Reviewed", "Revisado") : t("Draft", "Borrador")}
            </span>
            {parsed.provider} · {parsed.category} ·{" "}
            {parsed.releaseDate ?? t("release date not published", "fecha no publicada")} ·{" "}
            {t("checked", "comprobado")} {parsed.checkedAt}
          </p>
        ) : null}
        {parsed?.reviewed ? (
          <Link className="model-review-public" href={`/ai-models/${parsed.slug}`} target="_blank">
            {t("Open public profile", "Abrir perfil público")}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        ) : null}
      </header>

      {error ? <p className="notice error">{error}</p> : null}

      {parsed ? (
        <>
          {parsed.reviewNotes.length ? (
            <section className="model-review-notes">
              <h3>{t("Open review notes", "Notas de revisión abiertas")}</h3>
              <ul>
                {parsed.reviewNotes.map(
                  /** Render one note the reviewer should resolve or accept. */ (note) => (
                    <li key={note}>{note}</li>
                  ),
                )}
              </ul>
            </section>
          ) : null}
          <section className="model-review-context">
            <p>
              {placements.length
                ? t("Ranked: ", "En clasificación: ") +
                  placements
                    .map(
                      /** Describe one leaderboard place. */ (place) =>
                        `${place.leaderboard} #${place.position}`,
                    )
                    .join(", ")
                : t(
                    "Not ranked: approval adds a profile but does not change the leaderboards.",
                    "Sin clasificación: aprobarlo añade un perfil pero no cambia las clasificaciones.",
                  )}
            </p>
            {parsed.supersededBy ? (
              <p>
                {t("Superseded by", "Sustituido por")} <code>{parsed.supersededBy}</code>
              </p>
            ) : null}
          </section>
          <ModelReviewFacts file={parsed} />
          <ModelReviewText sections={parsed.sections} />
        </>
      ) : null}

      <ModelReviewActions key={record.name} entry={entry} onChanged={onChanged} />
    </article>
  );
}
