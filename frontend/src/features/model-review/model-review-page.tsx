"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/feedback/loading";
import { useAccount } from "@/features/auth/account-context";
import { StepUpPanel } from "@/features/ai-news/step-up-panel";
import { useLanguage } from "@/lib/i18n";
import { ModelReviewDetail } from "./model-review-detail";
import { matchesFilter, ModelReviewList, type ReviewFilter } from "./model-review-list";
import { useModelReviewFolder } from "./use-model-review-folder";

const FILTERS: Array<{ id: ReviewFilter; en: string; es: string }> = [
  { id: "draft", en: "Drafts", es: "Borradores" },
  { id: "reviewed", en: "Reviewed", es: "Revisados" },
  { id: "all", en: "All", es: "Todos" },
];

/**
 * Administrator page for reviewing the AI model files behind `/ai-models`.
 *
 * Only administrators see it: the page shows an access notice to everyone else, and the API also
 * refuses non-administrators (drafts are unpublished). Approving or returning a file additionally
 * needs recent administrator verification through the step-up panel.
 */
export function ModelReviewPage() {
  const { user } = useAccount();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<ReviewFilter>("draft");
  const [selected, setSelected] = useState("");
  const isAdmin = Boolean(user?.is_admin);

  if (!isAdmin)
    return (
      <div className="form-panel">
        <h1>{t("Administrator access required", "Se requiere acceso de administrador")}</h1>
        <p>
          {t(
            "Only administrators can review AI model files.",
            "Solo los administradores pueden revisar los archivos de modelos de IA.",
          )}
        </p>
      </div>
    );
  return (
    <ReviewWorkspace
      filter={filter}
      setFilter={setFilter}
      selected={selected}
      setSelected={setSelected}
    />
  );
}

/** The review workspace, loaded only after the administrator check passed. */
function ReviewWorkspace({
  filter,
  setFilter,
  selected,
  setSelected,
}: {
  filter: ReviewFilter;
  setFilter: (value: ReviewFilter) => void;
  selected: string;
  setSelected: (value: string) => void;
}) {
  const { t } = useLanguage();
  const { entries, error, reload, replace } = useModelReviewFolder();
  if (!entries) return <Loading error={error} />;

  const visible = entries.filter(
    /** Apply the status filter. */ (entry) => matchesFilter(entry, filter),
  );
  // Keep showing the chosen file even if approving it moved it out of the current filter.
  const current =
    entries.find(/** The chosen file. */ (entry) => entry.record.name === selected) ?? visible[0];
  const drafts = entries.filter(
    /** Count drafts. */ (entry) => matchesFilter(entry, "draft"),
  ).length;

  return (
    <div className="model-review-page">
      <header className="model-review-hero">
        <div>
          <p className="eyebrow">{t("ADMINISTRATION", "ADMINISTRACIÓN")}</p>
          <h1>{t("AI model review", "Revisión de modelos de IA")}</h1>
          <p>
            {t(
              `${drafts} draft files wait for review. Check each fact against its source, read both languages, then approve to publish the profile on /ai-models.`,
              `${drafts} borradores esperan revisión. Comprueba cada dato con su fuente, lee ambos idiomas y aprueba para publicar el perfil en /ai-models.`,
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={
            /** Reload the folder from the server. */ function refresh() {
              reload();
            }
          }
        >
          <RefreshCw aria-hidden="true" />
          {t("Reload", "Recargar")}
        </Button>
      </header>
      <StepUpPanel />
      <div className="model-review-filters" role="group" aria-label={t("Filter", "Filtro")}>
        {FILTERS.map(
          /** Render one status filter. */ (item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={
                /** Apply this filter. */ function choose() {
                  setFilter(item.id);
                }
              }
            >
              {t(item.en, item.es)}
            </button>
          ),
        )}
      </div>
      {error ? <p className="notice error">{error}</p> : null}
      <div className="model-review-layout">
        <ModelReviewList
          entries={visible}
          selected={current?.record.name ?? ""}
          onSelect={setSelected}
        />
        {current ? <ModelReviewDetail entry={current} onChanged={replace} /> : null}
      </div>
    </div>
  );
}
