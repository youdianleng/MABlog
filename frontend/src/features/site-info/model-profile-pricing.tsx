"use client";

import { useLanguage } from "@/lib/i18n";
import { isPublishedPrice } from "./ai-model-benchmark-context";
import { filePriceText } from "./ai-model-file-labels";
import type { ProfileView } from "./ai-models-data";

/**
 * Plans and pricing: API prices in their own units and subscription plans from the reviewed file,
 * each linked to its source. Snapshot-only models show the comparable price of their placement.
 */
export function ModelProfilePricing({ profile }: { profile: ProfileView }) {
  const { locale, t } = useLanguage();
  const spanish = locale === "es";
  const file = profile.model.file;
  const placementPrices = profile.placements
    .map(/** Each placement's price. */ (entry) => entry.price)
    .filter(isPublishedPrice);
  const rows: { label: string; value: string; url: string }[] = file
    ? [
        ...file.pricing.map(
          /** One API price. */ (price) => ({
            label: "API",
            value: filePriceText(price, spanish),
            url: price.source_url,
          }),
        ),
        ...file.plans.map(
          /** One plan. */ (plan) => ({
            label: plan.name,
            value:
              (plan.price_monthly !== null
                ? `${plan.price_monthly} ${plan.currency}/${t("month", "mes")}`
                : t("Price not published", "Precio no publicado")) +
              (plan.includes.length ? ` · ${plan.includes.join(", ")}` : ""),
            url: plan.source_url,
          }),
        ),
      ]
    : placementPrices.slice(0, 1).map(
        /** The comparable price. */ (price) => ({
          label: "API",
          value: price.display,
          url: price.sourceUrl,
        }),
      );
  return (
    <section className="mp-panel mp-pricing" aria-labelledby="mp-pricing-title">
      <p className="eyebrow">{t("COST", "COSTE")}</p>
      <h2 id="mp-pricing-title">{t("Plans and pricing", "Planes y precios")}</h2>
      {rows.length ? (
        <dl className="mp-price-list">
          {rows.map(
            /** One price line with its source. */ (row, index) => (
              <div key={`${row.label}-${index}`}>
                <dt>{row.label}</dt>
                <dd>
                  {row.value}{" "}
                  <a href={row.url} target="_blank" rel="noreferrer">
                    {t("source", "fuente")}
                  </a>
                </dd>
              </div>
            ),
          )}
        </dl>
      ) : (
        <p className="mp-muted">{t("No price is published.", "No hay precio publicado.")}</p>
      )}
    </section>
  );
}
