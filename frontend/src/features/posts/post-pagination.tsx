"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface PostPaginationProps {
  page: number;
  pages: number;
  pending: boolean;
  onPageChange: (page: number) => void;
}

type PageItem = number | "start-ellipsis" | "end-ellipsis";

/** Build a compact page-number window while always retaining both endpoints. */
function visiblePages(currentPage: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from(
      { length: pageCount },
      /** Convert each zero-based array slot into a one-based page number. */
      function pageNumber(_value, index) {
        return index + 1;
      },
    );
  }
  const middleStart = Math.max(2, currentPage - 1);
  const middleEnd = Math.min(pageCount - 1, currentPage + 1);
  const items: PageItem[] = [1];
  if (middleStart > 2) items.push("start-ellipsis");
  for (let page = middleStart; page <= middleEnd; page += 1) items.push(page);
  if (middleEnd < pageCount - 1) items.push("end-ellipsis");
  items.push(pageCount);
  return items;
}

/** Render keyboard-accessible previous, numbered, and next post-page controls. */
export function PostPagination({ page, pages, pending, onPageChange }: PostPaginationProps) {
  const { t } = useLanguage();
  const pageItems = visiblePages(page, pages);

  /** Move to the preceding result page when one exists. */
  function showPreviousPage() {
    if (page > 1) onPageChange(page - 1);
  }

  /** Move to the following result page when one exists. */
  function showNextPage() {
    if (page < pages) onPageChange(page + 1);
  }

  return (
    <nav className="post-pagination" aria-label={t("Post pages", "Páginas de publicaciones")}>
      <button type="button" onClick={showPreviousPage} disabled={pending || page <= 1}>
        <ChevronLeft aria-hidden="true" size={17} />
        <span>{t("Previous", "Anterior")}</span>
      </button>
      <div className="post-pagination-pages">
        {pageItems.map(
          /** Render page destinations and non-interactive gaps in their visual order. */
          function renderPageItem(item) {
            if (typeof item !== "number") {
              return <span className="post-pagination-ellipsis" aria-hidden="true" key={item}>…</span>;
            }
            const pageNumber = item;
            /** Request the numbered page represented by this control. */
            function showPage() {
              if (pageNumber !== page) onPageChange(pageNumber);
            }
            return (
              <button
                type="button"
                className="post-pagination-number"
                aria-current={pageNumber === page ? "page" : undefined}
                aria-label={t(`Page ${pageNumber}`, `Página ${pageNumber}`)}
                disabled={pending}
                key={pageNumber}
                onClick={showPage}
              >
                {pageNumber}
              </button>
            );
          },
        )}
      </div>
      <button type="button" onClick={showNextPage} disabled={pending || page >= pages}>
        <span>{t("Next", "Siguiente")}</span>
        <ChevronRight aria-hidden="true" size={17} />
      </button>
      <span className="post-pagination-summary">
        {t(`Page ${page} of ${pages}`, `Página ${page} de ${pages}`)}
      </span>
    </nav>
  );
}
