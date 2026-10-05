"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { ModelView } from "./ai-models-data";

/**
 * "What it can do": the fuller description, then the key capabilities from the reviewed file.
 * Snapshot-only models have a description but no capability list yet.
 */
export function ModelProfileOverview({ model }: { model: ModelView }) {
  const { locale, t } = useLanguage();
  const language = locale === "es" ? "es" : "en";
  const capabilities = model.file?.capabilities[language] ?? [];
  const summary = model.file?.summary ?? model.description;
  return (
    <section className="mp-panel mp-overview" aria-labelledby="mp-overview-title">
      <p className="eyebrow">{t("OVERVIEW", "RESUMEN")}</p>
      <h2 id="mp-overview-title">{t("What it can do", "Qué puede hacer")}</h2>
      <p className="mp-lead">{t(summary.en, summary.es)}</p>
      {model.file && model.description.en !== summary.en ? (
        <p>{t(model.description.en, model.description.es)}</p>
      ) : null}
      {capabilities.length ? (
        <ul className="mp-capabilities">
          {capabilities.map(
            /** One capability with a check mark. */ (item) => (
              <li key={item}>
                <Check aria-hidden="true" />
                {item}
              </li>
            ),
          )}
        </ul>
      ) : null}
    </section>
  );
}
