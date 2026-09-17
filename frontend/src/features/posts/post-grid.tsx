"use client";
import { Post } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { PostCard } from "./post-card";
import { RevealPostCard } from "./reveal-post-card";

interface PostGridProps {
  posts: Post[];
  reveal?: boolean;
}

/** Display a responsive set of approved or explicitly shared post summaries. */
export function PostGrid({ posts, reveal = false }: PostGridProps) {
  const { t } = useLanguage();
  if (!posts.length)
    return (
      <div className="empty">
        <h2>{t("A story begins with you", "Una historia comienza contigo")}</h2>
        <p>
          {t(
            "There are no stories here yet.",
            "Todavía no hay historias aquí.",
          )}
        </p>
      </div>
    );
  return (
    <div className="post-grid">
      {/* Each stable post ID keeps its card identity when lists change. */}
      {posts.map(
        /** Render an approved post summary using its stable identifier. */ function renderCard(
          post,
        ) {
          return reveal ? (
            <RevealPostCard key={post.id} post={post} />
          ) : (
            <PostCard key={post.id} post={post} />
          );
        },
      )}
    </div>
  );
}
