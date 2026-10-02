"use client";
import { CircleAlert, CircleCheck, FilePen } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { ReviewEntry } from "./use-model-review-folder";

export type ReviewFilter = "draft" | "reviewed" | "all";

/** Whether an entry belongs to the chosen status filter (invalid files count as drafts). */
export function matchesFilter(entry: ReviewEntry, filter: ReviewFilter): boolean {
  if (filter === "all") return true;
  return filter === "reviewed" ? Boolean(entry.parsed?.reviewed) : !entry.parsed?.reviewed;
}

/**
 * Selectable list of model files with their status, category, and open-note count.
 *
 * @param entries files already filtered for display
 * @param selected file name of the entry shown in the detail panel
 * @param onSelect called with a file name when the reviewer picks an entry
 */
export function ModelReviewList({
  entries,
  selected,
  onSelect,
}: {
  entries: ReviewEntry[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  const { t } = useLanguage();
  if (entries.length === 0)
    return (
      <p className="model-review-empty">
        {t("No files match this filter.", "Ningún archivo coincide con este filtro.")}
      </p>
    );
  return (
    <ul className="model-review-list" aria-label={t("Model files", "Archivos de modelos")}>
      {entries.map(
        /** Render one file as a selectable row. */ function renderEntry(entry) {
          const { parsed, record } = entry;
          const notes = parsed?.reviewNotes.length ?? 0;
          const Icon = !parsed ? CircleAlert : parsed.reviewed ? CircleCheck : FilePen;
          return (
            <li key={record.name}>
              <button
                type="button"
                aria-current={selected === record.name ? "true" : undefined}
                onClick={
                  /** Show this file in the detail panel. */ function select() {
                    onSelect(record.name);
                  }
                }
              >
                <Icon
                  aria-hidden="true"
                  className={!parsed ? "is-invalid" : parsed.reviewed ? "is-reviewed" : "is-draft"}
                />
                <span>
                  <strong>{parsed?.model ?? record.name}</strong>
                  <small>
                    {parsed
                      ? `${parsed.provider} · ${parsed.category} · ${parsed.releaseDate ?? t("undated", "sin fecha")}`
                      : t("Format error", "Error de formato")}
                  </small>
                </span>
                {notes > 0 ? (
                  <em title={t("Open review notes", "Notas de revisión abiertas")}>{notes}</em>
                ) : null}
              </button>
            </li>
          );
        },
      )}
    </ul>
  );
}
