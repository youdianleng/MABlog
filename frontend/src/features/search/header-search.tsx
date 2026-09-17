"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { queueHeaderSearch } from "./search-store";

/** Offer global search navigation while keeping the actual question transient. */
export function HeaderSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  return (
    <form
      className="header-search"
      role="search"
      onSubmit={
        /** Open the dedicated search page with the typed independent question. */
        function openSearch(event) {
          event.preventDefault();
          const value = query.trim();
          if (value) queueHeaderSearch(value);
          setQuery("");
          router.push("/search");
        }
      }
    >
      <Search size={14} aria-hidden="true" />
      <input
        value={query}
        maxLength={500}
        aria-label={t("Search posts", "Buscar publicaciones")}
        placeholder={t("Find a story…", "Buscar una historia…")}
        onChange={
          /** Keep the compact header field within the confirmed 500-character boundary. */
          function changeQuery(event) {
            setQuery(event.target.value);
          }
        }
      />
    </form>
  );
}
