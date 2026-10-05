"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { providerInitials, type Relation, type RelatedModels } from "./ai-model-profile-data";
import type { ModelView } from "./ai-models-data";

const RELATION_TEXT: Record<Relation, [string, string]> = {
  newer: ["Newer version", "Versión más reciente"],
  previous: ["Previous version", "Versión anterior"],
  "same-family": ["Same model line", "Misma línea"],
  "other-line": ["Other model line", "Otra línea"],
};

/** A compact linked card for one related model. */
function RelatedCard({ model, tag }: { model: ModelView; tag?: string }) {
  return (
    <li>
      <Link
        className="mp-related-card"
        href={`/ai-models/${model.slug}`}
        data-accent={model.accent}
      >
        <span className="mp-badge mp-badge-small" aria-hidden="true">
          {providerInitials(model.provider)}
        </span>
        <span>
          {tag ? <small>{tag}</small> : null}
          <strong>{model.name}</strong>
          <small>
            {model.provider}
            {model.file?.releaseDate ? ` · ${model.file.releaseDate}` : ""}
          </small>
        </span>
      </Link>
    </li>
  );
}

/**
 * Related models: other models from the same provider (labelled by relation), the model line's
 * version history, and alternatives from other providers. Empty lists are left out.
 */
export function ModelRelated({ related, current }: { related: RelatedModels; current: string }) {
  const { t } = useLanguage();
  if (!related.sameProvider.length && !related.history.length && !related.alternatives.length)
    return null;
  return (
    <section className="mp-related" aria-labelledby="mp-related-title">
      <p className="eyebrow">{t("CONNECTIONS", "CONEXIONES")}</p>
      <h2 id="mp-related-title">{t("Related models", "Modelos relacionados")}</h2>
      {related.history.length ? (
        <div className="mp-related-group">
          <h3>{t("Version history", "Historial de versiones")}</h3>
          <ol className="mp-timeline">
            {related.history.map(
              /** One release of the line. */ (model) => (
                <li key={model.slug} aria-current={model.slug === current ? "true" : undefined}>
                  {model.slug === current ? (
                    <strong>{model.name}</strong>
                  ) : (
                    <Link href={`/ai-models/${model.slug}`}>{model.name}</Link>
                  )}
                  <small>{model.file?.releaseDate ?? t("undated", "sin fecha")}</small>
                </li>
              ),
            )}
          </ol>
        </div>
      ) : null}
      {related.sameProvider.length ? (
        <div className="mp-related-group">
          <h3>{t("From the same provider", "Del mismo proveedor")}</h3>
          <ul className="mp-related-grid">
            {related.sameProvider.map(
              /** One same-provider model with its relation. */ (item) => (
                <RelatedCard
                  key={item.model.slug}
                  model={item.model}
                  tag={t(...RELATION_TEXT[item.relation])}
                />
              ),
            )}
          </ul>
        </div>
      ) : null}
      {related.alternatives.length ? (
        <div className="mp-related-group">
          <h3>{t("Alternatives from other providers", "Alternativas de otros proveedores")}</h3>
          <ul className="mp-related-grid">
            {related.alternatives.map(
              /** One alternative model. */ (model) => (
                <RelatedCard key={model.slug} model={model} />
              ),
            )}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
