"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { BenchmarkCard, BenchmarkRow, EvidenceLevel } from "./ai-model-profile-data";
import type { LeaderboardEntry } from "./ai-models-data";
import { categoryName } from "./model-profile-labels";

// The bar is drawn as ten segments so partial scores read as "about 6 of 10" at a glance.
const SEGMENTS = 10;

const EVIDENCE_TEXT: Record<EvidenceLevel, { dots: number; en: string; es: string }> = {
  independent: { dots: 3, en: "Independent results only", es: "Solo resultados independientes" },
  mixed: { dots: 2, en: "Independent + self-reported", es: "Independientes + autodeclarados" },
  "self-reported": {
    dots: 1,
    en: "Self-reported by the provider",
    es: "Autodeclarados por el proveedor",
  },
  none: { dots: 0, en: "No benchmark results yet", es: "Aún sin resultados de benchmarks" },
};

/** Ten-segment bar for one row; empty segments when there is no result or no shared scale. */
function SegmentBar({ share }: { share: number | null }) {
  const filled = share === null ? 0 : Math.max(1, Math.round(share * SEGMENTS));
  return (
    <span className={`mp-segments${share === null ? " is-empty" : ""}`} aria-hidden="true">
      {Array.from(
        { length: SEGMENTS },
        /** One segment, filled up to the score. */ (_, index) => (
          <span key={index} className={index < filled ? "is-on" : undefined} />
        ),
      )}
    </span>
  );
}

/** One area row: label, bar, native score, and who measured it. */
function Row({ row }: { row: BenchmarkRow }) {
  const { t } = useLanguage();
  const { result } = row;
  return (
    <li className="mp-bench-row">
      <span className="mp-bench-area">{t(row.label.en, row.label.es)}</span>
      <SegmentBar share={result?.share ?? null} />
      {result ? (
        <>
          <span className="mp-bench-score">{result.score}</span>
          <span className="mp-bench-source">
            <span
              className={`mp-kind mp-kind-${result.kind}`}
              title={
                result.kind === "independent"
                  ? t("Independent", "Independiente")
                  : t("Self-reported", "Autodeclarado")
              }
            />
            {result.benchmark}
            {result.metric !== result.benchmark ? ` · ${result.metric}` : ""} ·{" "}
            <a href={result.sourceUrl} target="_blank" rel="noreferrer">
              {result.sourceLabel}
            </a>
            {result.kind === "self-reported" ? ` (${t("self-reported", "autodeclarado")})` : ""}
            {row.moreResults > 0 ? ` · +${row.moreResults} ${t("more", "más")}` : ""}
          </span>
        </>
      ) : (
        <span className="mp-bench-missing">
          {t("No public result yet", "Sin resultado público")}
        </span>
      )}
    </li>
  );
}

/**
 * The benchmark card: evidence strength, the best leaderboard placement, and one row per
 * capability area with the strongest recorded result. There is deliberately no combined overall
 * score: results come from different tests, units, and sources.
 *
 * @param card rows and evidence built by `benchmarkCard()`
 * @param placements the profile's leaderboard entries (for the rank reason and tie note)
 */
export function ModelBenchmarkCard({
  card,
  placements,
  checkedAt,
}: {
  card: BenchmarkCard;
  placements: LeaderboardEntry[];
  checkedAt: string;
}) {
  const { locale, t } = useLanguage();
  const evidence = EVIDENCE_TEXT[card.evidence];
  const entry = card.headline
    ? placements.find(
        /** The headline's leaderboard entry. */ (item) =>
          item.placement.rank === card.headline!.placement.rank &&
          item.placement.category === card.headline!.placement.category,
      )
    : undefined;
  return (
    <section className="mp-bench" aria-labelledby="mp-bench-title">
      <header className="mp-bench-head">
        <p className="eyebrow">{t("BENCHMARK CARD", "TARJETA DE BENCHMARKS")}</p>
        <h2 id="mp-bench-title">{t("What the tests say", "Qué dicen las pruebas")}</h2>
        <p className="mp-evidence">
          <span className="mp-dots" aria-hidden="true">
            {[0, 1, 2].map(
              /** One evidence dot. */ (index) => (
                <span key={index} className={index < evidence.dots ? "is-on" : undefined} />
              ),
            )}
          </span>
          {t("Evidence", "Evidencia")}: {t(evidence.en, evidence.es)}
        </p>
        {card.headline && entry ? (
          <div className="mp-bench-headline">
            <p>
              <strong>
                #{card.headline.placement.rank} {categoryName(entry.category, locale === "es")}
              </strong>{" "}
              · {card.headline.placement.score} {card.headline.placement.metric}
              {card.headline.tie ? ` · ${t("statistical tie", "empate estadístico")}` : ""}
            </p>
            <p>{t(entry.rankReason.en, entry.rankReason.es)}</p>
          </div>
        ) : null}
      </header>
      <ul className="mp-bench-rows">
        {card.rows.map(
          /** Render one capability area. */ (row) => (
            <Row key={row.area} row={row} />
          ),
        )}
      </ul>
      <footer className="mp-bench-foot">
        <p>
          {card.resultCount}{" "}
          {card.resultCount === 1 ? t("result", "resultado") : t("results", "resultados")} ·{" "}
          {card.independentCount} {t("independent", "independientes")} ·{" "}
          {t("checked", "comprobado")} {checkedAt}
        </p>
        <details>
          <summary>{t("How these bars work", "Cómo funcionan las barras")}</summary>
          <p>
            {t(
              "Each bar keeps the score's own meaning. Percentages fill the bar by their value. Leaderboard indexes are shown against the leaderboard's #1, and arena ratings as the chance of winning a vote against #1. Scores without a shared scale show only the number. Results are never averaged into one grade.",
              "Cada barra conserva el significado de su puntuación. Los porcentajes llenan la barra según su valor. Los índices se comparan con el n.º 1 de la clasificación, y las puntuaciones de arena con la probabilidad de ganar una votación frente al n.º 1. Las puntuaciones sin escala común solo muestran el número. Nunca se promedian en una nota global.",
            )}
          </p>
          <Link href="/ai-models" className="mp-bench-link">
            {t("Rankings methodology", "Metodología de las clasificaciones")}{" "}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </details>
      </footer>
    </section>
  );
}
