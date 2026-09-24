"use client";
import Link from "next/link";
import { Heart, ShieldCheck, TriangleAlert } from "lucide-react";
import { Post } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Avatar } from "./avatar";

/** Present approved post metadata with a link to the author's public profile. */
export function PostCard({ post }: { post: Post }) {
  const { t } = useLanguage();
  return (
    <article className="post-card">
      <Link className="cover" href={`/posts/${post.id}`}>
        {post.cover ? (
          <img src={post.cover} alt={post.title} loading="lazy" decoding="async" />
        ) : (
          <div className="empty">✦</div>
        )}
        {post.kind === "ai_news" ? (
          <span className={`ai-card-label${post.ai_news?.fact_check_passed === false ? " manual-override" : ""}`}>
            {post.ai_news?.fact_check_passed === false ? <TriangleAlert aria-hidden="true" size={13} /> : <ShieldCheck aria-hidden="true" size={13} />}
            {post.ai_news?.fact_check_passed === false
              ? post.ai_news?.manual_unverified_preview ? t("AI-generated · not fact-checked", "Generado por IA · sin verificación") : t("AI-generated · evidence exception", "Generado por IA · excepción de evidencia")
              : t("AI-generated · source-reviewed", "Generado por IA · fuentes revisadas")}
          </span>
        ) : null}
      </Link>
      <div className="post-meta">
        <span>
          {post.public
            ? t("PUBLIC STORY", "HISTORIA PÚBLICA")
            : t("PERSONAL STORY", "HISTORIA PERSONAL")}
        </span>
        <span className="toolbar">
          <Heart size={12} /> {post.likes}
        </span>
      </div>
      {post.role === "author" && post.search_status ? (
        <span className={`search-status ${post.search_status}`}>
          {post.search_status === "ready"
            ? t("Search ready", "Búsqueda lista")
            : post.search_status === "failed"
              ? t("Indexing failed", "Indexación fallida")
              : t("Indexing", "Indexando")}
        </span>
      ) : null}
      <Link href={`/posts/${post.id}`}>
        <h3 className="post-title">
          {post.title || t("Untitled story", "Historia sin título")}
        </h3>
      </Link>
      <p className="post-summary">{post.summary}</p>
      <div className="post-meta post-footer">
        <Link className="post-author" href={`/profiles/${post.author.username}`}>
          <Avatar user={post.author} />
          <span className="post-author-name">
            {post.author.display_name || post.author.username}
          </span>
        </Link>
        <span className="post-read-link">
          {t("Read story", "Leer historia")} ↗
        </span>
      </div>
    </article>
  );
}
