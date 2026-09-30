import Link from "next/link";
import { ArrowUpRight, Crown } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  getPlacementContext,
  isPublishedPrice,
  type PublishedPrice,
} from "./ai-model-benchmark-context";
import type { BenchmarkEntry } from "./ai-model-benchmark-metrics";
import type { RankedModel, RankingCategory } from "./ai-model-rankings";
import { BenchmarkMeter } from "./benchmark-meter";
import { CategoryIcon } from "./category-icon";
import { accessTranslations } from "./ranking-labels";

/** Short per-unit price for the bar label; the full source figures go in the caption. */
function shortPrice(price: PublishedPrice): string {
  const amount = `$${price.amount.toFixed(2)}`;
  if (price.unit === "usd-per-1m-tokens-blended") return `${amount} / 1M tok`;
  if (price.unit === "usd-per-1k-images") return `${amount} / 1k img`;
  return `${amount} / min`;
}

/**
 * One ranked model in a category leaderboard: identity, source-native score, recommendation and
 * price bars, and the reason for its position. The whole row links to the family profile, so
 * price source links live in the section footnote instead (links cannot nest).
 */
export function BenchmarkRow({
  model,
  category,
  entry,
  showMissingPriceReason,
}: {
  model: RankedModel;
  category: RankingCategory;
  entry: BenchmarkEntry;
  /** False when the section already explains that no model in the category has a price. */
  showMissingPriceReason: boolean;
}) {
  const { t } = useLanguage();
  const { placement, recommendation, price: priceLevel } = entry;
  const { rankReason, price } = getPlacementContext(category, model.slug);
  const isLeader = placement.rank === 1;

  const recommendationValue = isLeader
    ? t("Leader", "Líder")
    : recommendation.share >= 1
      ? t("Level with #1", "Igual que el n.º 1")
      : `${Math.round(recommendation.share * 100)}%`;
  const recommendationCaption =
    recommendation.kind === "elo"
      ? isLeader
        ? t("Reference for this category", "Referencia de la categoría")
        : t(
            `Wins ~${Math.round((recommendation.winRateVsLeader ?? 0) * 100)}% of votes vs #1`,
            `Gana ~${Math.round((recommendation.winRateVsLeader ?? 0) * 100)}% de votos frente al n.º 1`,
          )
      : isLeader
        ? t("Reference for this category", "Referencia de la categoría")
        : t(
            `${Math.round(recommendation.share * 100)}% of #1's index score`,
            `${Math.round(recommendation.share * 100)}% de la puntuación del n.º 1`,
          );

  let priceValue = t("Not published", "No publicado");
  let priceCaption: string | undefined;
  if (isPublishedPrice(price)) {
    priceValue = shortPrice(price);
    const notes = [
      price.unit === "usd-per-1m-tokens-blended"
        ? t(`3:1 blend of ${price.display}`, `Mezcla 3:1 de ${price.display}`)
        : price.variant,
      priceLevel?.cheapest ? t("cheapest here", "el más barato") : undefined,
      priceLevel?.mostExpensive ? t("most expensive here", "el más caro") : undefined,
      price.secondarySource ? t("independent tracker", "rastreador independiente") : undefined,
    ].filter(Boolean);
    priceCaption = notes.join(" · ");
  } else if (showMissingPriceReason) {
    priceCaption = t(price.missing.en, price.missing.es);
  }

  return (
    <li>
      <Link
        className={`bench-row${isLeader ? " is-leader" : ""}`}
        data-accent={model.accent}
        href={`/ai-models/${model.slug}`}
      >
        <div className="bench-rank">
          <span className="bench-rank-number">
            <small>#</small>
            {placement.rank}
          </span>
          {isLeader ? (
            <span className="bench-leader-badge">
              <Crown aria-hidden="true" />
              {t("Top pick", "Primera opción")}
            </span>
          ) : null}
        </div>

        <div className="bench-identity">
          <span className="bench-swatch" aria-hidden="true">
            <CategoryIcon category={category} />
          </span>
          <div>
            <h3>{model.name}</h3>
            <p className="bench-provider">{model.provider}</p>
            <div className="bench-access">
              {model.access.map(
                /** Translate each documented access route without changing the record. */ (
                  access,
                ) => (
                  <span key={access}>{t(access, accessTranslations[access])}</span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="bench-score">
          <strong>{placement.score}</strong>
          <span>
            {placement.metric}
            {placement.confidenceInterval ? ` · ${placement.confidenceInterval}` : ""}
          </span>
          <small>
            {t("Source rank", "Rango fuente")} {placement.sourceRank}
          </small>
        </div>

        <div className="bench-meters">
          <BenchmarkMeter
            tone="recommendation"
            label={t("Recommendation", "Recomendación")}
            value={recommendationValue}
            caption={recommendationCaption}
            share={recommendation.share}
          />
          <BenchmarkMeter
            tone="price"
            label={t("Price", "Precio")}
            value={priceValue}
            caption={priceCaption}
            share={priceLevel ? priceLevel.share : null}
          />
        </div>

        <div className="bench-reason">
          <p className="bench-reason-label">
            {t(`Why #${placement.rank}`, `Por qué n.º ${placement.rank}`)}
          </p>
          <p>{t(rankReason.en, rankReason.es)}</p>
          {placement.tieNote ? (
            <span className="bench-tie">{t("Statistical tie", "Empate estadístico")}</span>
          ) : null}
        </div>

        <span className="bench-open" aria-hidden="true">
          <ArrowUpRight />
        </span>
      </Link>
    </li>
  );
}
