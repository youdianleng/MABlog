"use client";
import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { FilePrice, ModelFile } from "@/features/site-info/ai-model-files";

/** Describe one price entry's numbers in its own unit, without converting anything. */
function priceText(price: FilePrice): string {
  const unit = price.unit.replaceAll("-", " ");
  const value =
    price.unit === "per-1m-tokens"
      ? `${price.input ?? "—"} / ${price.output ?? "—"} ${price.currency} (input / output)`
      : `${price.amount ?? "—"} ${price.currency}`;
  return `${value} · ${unit}${price.variant ? ` · ${price.variant}` : ""}`;
}

/** The evidence for one value: the exact quote to search for, or the migration label. */
function Evidence({
  quote,
  evidence,
  url,
}: {
  quote: string | null;
  evidence?: string | null;
  url: string;
}) {
  const { t } = useLanguage();
  return (
    <p className="model-review-evidence">
      {quote ? (
        <q>{quote}</q>
      ) : (
        <span>
          {t("Migrated value", "Valor migrado")}: {evidence}
        </span>
      )}
      <a href={url} target="_blank" rel="noreferrer">
        {t("Open source", "Abrir fuente")}
        <ExternalLink aria-hidden="true" />
      </a>
    </p>
  );
}

/**
 * The facts a reviewer must check against the official pages: prices, plans, benchmarks, and
 * sources, each with its exact quote and a link to search for it.
 */
export function ModelReviewFacts({ file }: { file: ModelFile }) {
  const { t } = useLanguage();
  return (
    <div className="model-review-facts">
      <section>
        <h3>{t("Prices", "Precios")}</h3>
        {file.pricing.length === 0 ? (
          <p className="model-review-muted">{t("No price recorded.", "Sin precio registrado.")}</p>
        ) : (
          file.pricing.map(
            /** Render one price with its evidence. */ (price, index) => (
              <div className="model-review-fact" key={index}>
                <strong>{priceText(price)}</strong>
                <Evidence quote={price.quote} evidence={price.evidence} url={price.source_url} />
              </div>
            ),
          )
        )}
      </section>
      <section>
        <h3>{t("Plans", "Planes")}</h3>
        {file.plans.length === 0 ? (
          <p className="model-review-muted">{t("No plan recorded.", "Sin planes registrados.")}</p>
        ) : (
          file.plans.map(
            /** Render one plan with its evidence. */ (plan) => (
              <div className="model-review-fact" key={plan.name}>
                <strong>
                  {plan.name}
                  {plan.price_monthly !== null
                    ? ` · ${plan.price_monthly} ${plan.currency}/month`
                    : ""}
                </strong>
                <small>{plan.includes.join(", ")}</small>
                <Evidence quote={plan.quote} url={plan.source_url} />
              </div>
            ),
          )
        )}
      </section>
      <section>
        <h3>{t("Benchmarks", "Benchmarks")}</h3>
        {file.benchmarks.length === 0 ? (
          <p className="model-review-muted">
            {t("No benchmark recorded.", "Sin benchmarks registrados.")}
          </p>
        ) : (
          file.benchmarks.map(
            /** Render one benchmark with its kind and evidence. */ (benchmark, index) => (
              <div className="model-review-fact" key={index}>
                <strong>
                  {benchmark.name} · {benchmark.metric}: {benchmark.score}
                </strong>
                <small>
                  {benchmark.kind} · {benchmark.source_label} · {benchmark.measured_at}
                  {benchmark.ranking ? ` · ranking: ${benchmark.ranking}` : ""}
                </small>
                <Evidence
                  quote={benchmark.quote}
                  evidence={benchmark.evidence}
                  url={benchmark.source_url}
                />
              </div>
            ),
          )
        )}
      </section>
      <section>
        <h3>{t("Official sources", "Fuentes oficiales")}</h3>
        <ul>
          {file.officialSources.map(
            /** Link one official source with its publication date. */ (source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
                {source.published ? ` (${source.published})` : ""}
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  );
}
