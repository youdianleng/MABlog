"use client";

import { useLanguage } from "@/lib/i18n";
import type { ModelView } from "./ai-models-data";

/** Show `code` spans from the Markdown history line as code; everything else stays plain text. */
function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text
        .split("`")
        .map(
          /** Odd parts were inside backticks. */ (part, index) =>
            index % 2 === 1 ? <code key={index}>{part}</code> : part,
        )}
    </>
  );
}

/**
 * Collapsed "Sources and update history": every official source with its date, and the file's
 * dated change log. Snapshot-only models list their official page only.
 */
export function ModelProfileSources({ model }: { model: ModelView }) {
  const { locale, t } = useLanguage();
  const file = model.file;
  const history = file?.history[locale === "es" ? "es" : "en"] ?? [];
  const sources = file?.officialSources ?? [
    { url: model.officialUrl, label: model.name, published: null },
  ];
  return (
    <details className="mp-sources">
      <summary>{t("Sources and update history", "Fuentes e historial de cambios")}</summary>
      <div>
        <h3>{t("Sources", "Fuentes")}</h3>
        <ol>
          {sources.map(
            /** One official source. */ (source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
                {source.published ? ` (${source.published})` : ""}
              </li>
            ),
          )}
        </ol>
        {history.length ? (
          <>
            <h3>{t("Update history", "Historial de cambios")}</h3>
            <ul>
              {history.map(
                /** One dated change. */ (line) => (
                  <li key={line}>
                    <InlineCode text={line} />
                  </li>
                ),
              )}
            </ul>
          </>
        ) : null}
      </div>
    </details>
  );
}
