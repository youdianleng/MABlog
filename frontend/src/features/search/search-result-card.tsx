"use client";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import type { SearchPost } from "@/lib/api";
import { categories } from "@/lib/categories";
import { useLanguage } from "@/lib/i18n";
import { Avatar } from "@/features/posts";

/** Present one ranked match with a deep link to its most relevant approved block. */
export function SearchResultCard({ post, rank }: { post: SearchPost; rank: number }) {
  const { t, locale } = useLanguage();
  const url = `/posts/${post.id}` + (post.matched_block_id ? `?block=${encodeURIComponent(post.matched_block_id)}&highlight=search` : "");
  const category = categories.find(
    /** Locate the localized label for the server-validated category key. */
    function matchingCategory(item) { return item.value === post.category; },
  );
  return (
    <article className="search-result-card">
      <div className="search-rank" aria-label={`${t("Rank", "Posición")} ${rank}`}>{String(rank).padStart(2, "0")}</div>
      <Link className="search-result-cover" href={url}>
        {post.cover ? <img src={post.cover} alt="" /> : <span>✦</span>}
      </Link>
      <div className="search-result-copy">
        <div className="search-result-meta">
          <span>{category ? (locale === "es" ? category.es : category.en) : post.category}</span>
          <span><Heart size={12} aria-hidden="true" /> {post.likes}</span>
        </div>
        <Link href={url}><h3>{post.title || t("Untitled story", "Historia sin título")}</h3></Link>
        <p>{post.snippet || post.summary}</p>
        <div className="search-result-footer">
          <Link href={`/profiles/${post.author.username}`}><Avatar user={post.author} /> {post.author.display_name || post.author.username}</Link>
          <Link href={url}>{t("Read matched story", "Leer historia coincidente")} <ArrowUpRight size={13} /></Link>
        </div>
      </div>
    </article>
  );
}
