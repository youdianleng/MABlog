"use client";
import Link from "next/link";
import { useState } from "react";
import { Post } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useData } from "@/hooks/use-data";
import { Loading } from "@/components/feedback/loading";
import { PostGrid } from "@/features/posts";

/** Separate owned posts, explicitly shared posts, and creator review requests. */
export function Workspace() {
  const { t } = useLanguage(),
    { data, error } = useData<{
      owned: Post[];
      shared: Post[];
      reviews: { id: string; title: string; count: number }[];
    }>("/workspace");
  const [tab, setTab] = useState("owned");
  return (
    <>
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            {t("YOUR CREATIVE SPACE", "TU ESPACIO CREATIVO")}
          </div>
          <h1 style={{ fontSize: 42 }}>{t("My atelier", "Mi taller")}</h1>
        </div>
      </div>
      <div className="tabs">
        {[
          ["owned", t("My posts", "Mis publicaciones")],
          ["shared", t("Shared with me", "Compartidas conmigo")],
          ["reviews", t("Review requests", "Solicitudes de revisión")],
        ].map(
          /** Render a workspace category selector. */ function renderTab([
            id,
            title,
          ]) {
            return (
              <button
                key={id}
                className={tab === id ? "active" : ""}
                onClick={
                  /** Switch the visible workspace category. */ function chooseTab() {
                    setTab(id);
                  }
                }
              >
                {title}
              </button>
            );
          },
        )}
      </div>
      {!data ? (
        <Loading error={error} />
      ) : tab === "reviews" ? (
        <div className="stack">
          {data.reviews
            .filter(
              /** Select posts with outstanding creator reviews. */ function pending(
                item,
              ) {
                return item.count > 0;
              },
            )
            .map(
              /** Render a link to the post awaiting review. */ function request(
                item,
              ) {
                return (
                  <Link
                    className="notice"
                    key={item.id}
                    href={`/review/${item.id}`}
                  >
                    {item.title || t("Untitled", "Sin título")} · {item.count}{" "}
                    {t("pending changes", "cambios pendientes")} ↗
                  </Link>
                );
              },
            )}
          {!data.reviews.some(
            /** Determine whether the creator has any pending changes to review. */ function hasPending(
              item,
            ) {
              return item.count > 0;
            },
          ) && (
            <div className="empty">
              {t(
                "All caught up. No pending reviews.",
                "Todo al día. No hay revisiones pendientes.",
              )}
            </div>
          )}
        </div>
      ) : (
        <PostGrid posts={tab === "owned" ? data.owned : data.shared} />
      )}
    </>
  );
}
