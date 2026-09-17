"use client";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, type PostCategory } from "@/lib/categories";
import type { SearchInput, SearchScope } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useSearchStore } from "./search-store";

/** Collect a bounded natural-language question with optional category and scope filters. */
export function SearchForm({ onSearch }: { onSearch: (input: SearchInput) => Promise<void> }) {
  const { t, locale } = useLanguage();
  const query = useSearchStore(
    /** Subscribe only to the transient question field. */
    function selectQuery(state) { return state.query; },
  );
  const category = useSearchStore(
    /** Subscribe only to the chosen category filter. */
    function selectCategory(state) { return state.category; },
  );
  const scope = useSearchStore(
    /** Subscribe only to the Personal/Public scope filter. */
    function selectScope(state) { return state.scope; },
  );
  const pending = useSearchStore(
    /** Subscribe only to retrieval progress for button state. */
    function selectPending(state) { return state.pending; },
  );
  return (
    <form
      className="search-form"
      role="search"
      onSubmit={
        /** Start a fresh independent retrieval using the currently selected filters. */
        function submitSearch(event) {
          event.preventDefault();
          const value = query.trim();
          if (value) void onSearch({ query: value, category, scope });
        }
      }
    >
      <div className="search-question-row">
        <Search size={20} aria-hidden="true" />
        <textarea
          value={query}
          maxLength={500}
          rows={1}
          aria-label={t("Search question", "Pregunta de búsqueda")}
          placeholder={t(
            "What kind of story would you like to discover?",
            "¿Qué tipo de historia te gustaría descubrir?",
          )}
          onChange={
            /** Keep the transient Zustand query synchronized with the text area. */
            function changeQuestion(event) {
              useSearchStore.setState({ query: event.target.value });
            }
          }
        />
        <Button type="submit" disabled={pending || !query.trim()}>
          <Sparkles size={15} />
          {pending ? t("Searching…", "Buscando…") : t("Discover", "Descubrir")}
        </Button>
      </div>
      <div className="search-filters">
        <label>
          {t("Category", "Categoría")}
          <select
            value={category ?? ""}
            onChange={
              /** Apply an optional approved category to both result groups. */
              function changeCategory(event) {
                useSearchStore.setState({ category: (event.target.value || null) as PostCategory | null });
              }
            }
          >
            <option value="">{t("All categories", "Todas las categorías")}</option>
            {categories.map(
              /** Render stable stored category keys with localized labels. */
              function renderCategory(item) {
                return <option key={item.value} value={item.value}>{locale === "es" ? item.es : item.en}</option>;
              },
            )}
          </select>
        </label>
        <label>
          {t("Search scope", "Ámbito de búsqueda")}
          <select
            value={scope}
            onChange={
              /** Limit retrieval to Personal, Public, or both approved scopes. */
              function changeScope(event) {
                useSearchStore.setState({ scope: event.target.value as SearchScope });
              }
            }
          >
            <option value="all">{t("Personal and public", "Personal y público")}</option>
            <option value="personal">{t("Personal only", "Solo personal")}</option>
            <option value="public">{t("Public only", "Solo público")}</option>
          </select>
        </label>
        <span className="search-character-count">{query.length}/500</span>
      </div>
    </form>
  );
}
