import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  isPublishedPrice,
  PRICE_CHECKED_DATE,
  type PublishedPrice,
} from "./ai-model-benchmark-context";
import { computeBars } from "./ai-model-benchmark-metrics";
import type { LocalizedText } from "./ai-model-rankings";
import type { LeaderboardEntry } from "./ai-models-data";
import { BenchmarkRow } from "./benchmark-row";
import { CategoryIcon } from "./category-icon";

/** Price unit wording for the section footnote. */
const unitLabels: Record<PublishedPrice["unit"], LocalizedText> = {
  "usd-per-1m-tokens-blended": {
    en: "USD per 1M tokens, blended 3 input : 1 output",
    es: "USD por 1M de tokens, mezcla 3 de entrada : 1 de salida",
  },
  "usd-per-1k-images": { en: "USD per 1,000 images", es: "USD por 1.000 imágenes" },
  "usd-per-minute": { en: "USD per generated minute", es: "USD por minuto generado" },
  "usd-per-song": { en: "USD per song", es: "USD por canción" },
  "usd-per-1k-characters": { en: "USD per 1,000 characters", es: "USD por 1.000 caracteres" },
};

/**
 * One category leaderboard: heading, ranked rows, and a footnote naming the benchmark and price
 * sources. Rows arrive in the order fixed by `rankings.yaml`; there is no client-side re-sorting.
 */
export function BenchmarkSection({
  id,
  entries,
  index,
  title,
  description,
  scoresEvaluated,
}: {
  id: string;
  entries: LeaderboardEntry[];
  index: string;
  title: LocalizedText;
  description: LocalizedText;
  scoresEvaluated: string;
}) {
  const { t } = useLanguage();
  const bars = computeBars(entries);
  const firstPlacement = entries[0].placement;
  const prices = entries
    .map(/** Read each entry's price for the source footnote. */ (entry) => entry.price)
    .filter(
      /** Keep published prices only. */ (price): price is PublishedPrice =>
        isPublishedPrice(price),
    );
  const priceSources = Array.from(
    new Map(
      prices.map(
        /** Deduplicate sources shared by several models. */ (price) => [price.sourceUrl, price],
      ),
    ).values(),
  );
  const units = Array.from(
    new Set(prices.map(/** Collect distinct units. */ (price) => price.unit)),
  );
  const checkedDates = Array.from(
    new Set(
      prices.map(/** Each price's read date. */ (price) => price.checkedAt ?? PRICE_CHECKED_DATE),
    ),
  ).sort();
  const noPrices = prices.length === 0;

  return (
    <section id={id} className="bench-section" aria-labelledby={`${id}-title`}>
      <header className="bench-section-heading">
        <div className="bench-section-index">
          <span>{index}</span>
          <CategoryIcon category={entries[0].category} />
        </div>
        <div className="bench-section-title">
          <h2 id={`${id}-title`}>{t(title.en, title.es)}</h2>
          <p>{t(description.en, description.es)}</p>
        </div>
        <dl className="bench-section-facts">
          <div>
            <dt>{t("Benchmark", "Benchmark")}</dt>
            <dd>
              <a href={firstPlacement.sourceUrl} target="_blank" rel="noreferrer">
                {firstPlacement.sourceLabel} · {firstPlacement.metric}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </dd>
          </div>
          <div>
            <dt>{t("Evaluated", "Evaluado")}</dt>
            <dd>{scoresEvaluated}</dd>
          </div>
        </dl>
      </header>

      <ol className="bench-board">
        {entries.map(
          /** Render each ranked family in its reviewed order. */ (entry, position) => (
            <BenchmarkRow
              key={`${entry.category}-${entry.model.slug}`}
              entry={entry}
              bars={bars[position]}
              showMissingPriceReason={!noPrices}
            />
          ),
        )}
      </ol>

      <footer className="bench-section-notes">
        <p>
          {t(
            "One accessible family per provider, filtered from the cited leaderboard. Overlapping source ranges mean neighbouring positions may not differ significantly.",
            "Una familia accesible por proveedor, filtrada de la clasificación citada. Si los rangos de la fuente se solapan, puestos vecinos pueden no diferir de forma significativa.",
          )}
        </p>
        {noPrices ? (
          <p>
            <strong>{t("Price", "Precio")}:</strong>{" "}
            {t(
              "no comparable API prices are published for this category, so no price bar is drawn. Several leaders are subscription-only products.",
              "no hay precios de API comparables publicados para esta categoría, así que no se dibuja barra de precio. Varios líderes solo ofrecen suscripción.",
            )}
          </p>
        ) : (
          <p>
            <strong>{t("Price", "Precio")}:</strong>{" "}
            {units
              .map(
                /** Name each unit compared in this leaderboard. */ (unit) =>
                  t(unitLabels[unit].en, unitLabels[unit].es),
              )
              .join("; ")}
            ; {t("checked", "consultado")} {checkedDates.join(", ")}. {t("Sources", "Fuentes")}:{" "}
            {priceSources.map(
              /** Link each distinct price source once. */ (price, sourceIndex) => (
                <span key={price.sourceUrl}>
                  {sourceIndex > 0 ? ", " : ""}
                  <a href={price.sourceUrl} target="_blank" rel="noreferrer">
                    {price.sourceLabel}
                  </a>
                </span>
              ),
            )}
            .
          </p>
        )}
      </footer>
    </section>
  );
}
