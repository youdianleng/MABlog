"use client";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { ExplanationPanel } from "./explanation-panel";
import { SearchForm } from "./search-form";
import { SearchResults } from "./search-results";
import { useSearchController } from "./use-search-controller";
import { useSearchStore } from "./search-store";

/** Assemble the independent-question search page with explanation-first grouped results. */
export function SearchPage() {
  const { t } = useLanguage();
  const handledRequest = useRef(0);
  const { runSearch, loadMore } = useSearchController();
  const state = useSearchStore();
  useEffect(
    /** Run a transient question arriving from the global header once per queued request. */
    function searchFromHeader() {
      if (!state.queuedQuery || handledRequest.current === state.requestSequence) return;
      handledRequest.current = state.requestSequence;
      void runSearch({ query: state.queuedQuery, category: null, scope: "all" });
    },
    [runSearch, state.queuedQuery, state.requestSequence],
  );
  return (
    <div className="search-page">
      <header className="search-hero">
        <div className="eyebrow">{t("PERMISSION-AWARE DISCOVERY", "DESCUBRIMIENTO CON PERMISOS")}</div>
        <h1>{t("Find the story that stays with you", "Encuentra la historia que permanece contigo")}</h1>
        <p>{t("Describe a feeling, subject, place, or idea. MAblog searches only stories you may currently read.", "Describe una emoción, tema, lugar o idea. MAblog busca solo historias que puedes leer ahora.")}</p>
      </header>
      <SearchForm onSearch={runSearch} />
      {state.error ? <div className="notice error" role="alert">{state.error}</div> : null}
      {state.pending ? <div className="search-loading" aria-live="polite"><span />{t("Ranking accessible stories…", "Clasificando historias accesibles…")}</div> : null}
      {state.response ? (
        <>
          <ExplanationPanel response={state.response} status={state.explanationStatus} text={state.explanation} citations={state.citations} />
          <SearchResults kind="personal" group={state.response.personal} loading={state.loadingGroup === "personal"} onLoadMore={
            /** Load another Personal page without changing Public results. */
            async function loadPersonal() { await loadMore("personal"); }
          } />
          <SearchResults kind="public" group={state.response.public} loading={state.loadingGroup === "public"} onLoadMore={
            /** Load another Public page without changing Personal results. */
            async function loadPublic() { await loadMore("public"); }
          } />
        </>
      ) : null}
    </div>
  );
}
