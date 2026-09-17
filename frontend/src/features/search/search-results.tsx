"use client";
import { Button } from "@/components/ui/button";
import type { SearchGroup } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { SearchResultCard } from "./search-result-card";

/** Render one independently paginated Personal or Public ranked section. */
export function SearchResults({ kind, group, loading, onLoadMore }: { kind: "personal" | "public"; group: SearchGroup; loading: boolean; onLoadMore: () => Promise<void> }) {
  const { t } = useLanguage();
  const title = kind === "personal" ? t("Personal", "Personal") : t("Public", "Público");
  const description = kind === "personal"
    ? t("Approved stories you own or can currently access", "Historias aprobadas que posees o puedes consultar")
    : t("Approved stories from the MAblog community", "Historias aprobadas de la comunidad MAblog");
  return (
    <section className="search-group">
      <div className="search-group-heading">
        <div><div className="eyebrow">{kind === "personal" ? t("YOUR LIBRARY", "TU BIBLIOTECA") : t("THE COMMUNITY", "LA COMUNIDAD")}</div><h2>{title}</h2><p>{description}</p></div>
        <span>{group.total} {t("matches", "coincidencias")}</span>
      </div>
      {group.items.length ? <div className="search-result-list">{group.items.map(
        /** Preserve the server ranking while assigning a readable one-based position. */
        function renderResult(post, index) { return <SearchResultCard key={post.id} post={post} rank={index + 1} />; },
      )}</div> : <div className="empty search-empty">{t("No matching posts in this section.", "No hay publicaciones coincidentes en esta sección.")}</div>}
      {group.cursor ? <Button variant="outline" disabled={loading} onClick={
        /** Request the next signed page for this group only. */
        function loadNextPage() { void onLoadMore(); }
      }>{loading ? t("Loading…", "Cargando…") : t("Load more", "Cargar más")}</Button> : null}
    </section>
  );
}
