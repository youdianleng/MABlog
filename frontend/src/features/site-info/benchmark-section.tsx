import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  getPlacementContext,
  isPublishedPrice,
  PRICE_CHECKED_DATE,
  type PublishedPrice,
} from "./ai-model-benchmark-context";
import { getBenchmarkEntries } from "./ai-model-benchmark-metrics";
import {
  getModelsForCategory,
  getPlacement,
  type LocalizedText,
  RANKING_SNAPSHOT_DATE,
  type RankingCategory,
} from "./ai-model-rankings";
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
};

/**
 * One category leaderboard: heading, ranked rows, and a footnote naming the benchmark and price
 * sources. Rows stay server-rendered in editorial order; there is no client-side re-sorting.
 */
export function BenchmarkSection({
  id,
  category,
  index,
  title,
  description,
}: {
  id: string;
  category: RankingCategory;
  index: string;
  title: LocalizedText;
  description: LocalizedText;
}) {
  const { t } = useLanguage();
  const models = getModelsForCategory(category);
  const entries = getBenchmarkEntries(category);
  const firstPlacement = getPlacement(models[0], category);
  const prices = models
    .map(
      /** Pair each model with its price for the source footnote. */ (model) => ({
        model,
        price: getPlacementContext(category, model.slug).price,
      }),
    )
    .filter(
      /** Keep published prices only. */ (
        item,
      ): item is {
        model: (typeof models)[number];
        price: PublishedPrice;
      } => isPublishedPrice(item.price),
    );
  const priceSources = Array.from(
    new Map(
      prices.map(
        /** Deduplicate sources shared by several models. */ ({ price }) => [
          price.sourceUrl,
          price,
        ],
      ),
    ).values(),
  );
  const noPrices = prices.length === 0;

  return (
    <section id={id} className="bench-section" aria-labelledby={`${id}-title`}>
      <header className="bench-section-heading">
        <div className="bench-section-index">
          <span>{index}</span>
          <CategoryIcon category={category} />
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
            <dd>{RANKING_SNAPSHOT_DATE}</dd>
          </div>
        </dl>
      </header>

      <ol className="bench-board">
        {models.map(
          /** Render each reviewed family in its fixed editorial order. */ (model, position) => (
            <BenchmarkRow
              key={`${category}-${model.slug}`}
              model={model}
              category={category}
              entry={entries[position]}
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
            {t(unitLabels[prices[0].price.unit].en, unitLabels[prices[0].price.unit].es)};{" "}
            {t("checked", "consultado")} {PRICE_CHECKED_DATE}. {t("Sources", "Fuentes")}:{" "}
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
