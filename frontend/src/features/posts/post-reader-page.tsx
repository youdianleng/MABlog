"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { api, Post } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useData } from "@/hooks/use-data";
import { useAccount } from "@/features/auth/account-context";
import { Loading } from "@/components/feedback/loading";
import { Button } from "@/components/ui/button";
import { CompositionReader } from "./composition-reader";
import { AiNewsReader } from "@/features/ai-news/ai-news-reader";
import { PendingReviewLink } from "@/features/review/pending-review-link";

interface LikeState {
  postId: string;
  likes: number;
  liked: boolean;
}

/** Read approved content and expose only the operations appropriate to the caller's role. */
export function Reader({ id, initialPost }: { id: string; initialPost?: Post }) {
  const { t, locale } = useLanguage(),
    { run } = useAccount(),
    router = useRouter(),
    searchParams = useSearchParams();
  const [revision, setRevision] = useState(0),
    [likeState, setLikeState] = useState<LikeState | null>(null),
    [liking, setLiking] = useState(false),
    { data: post, error } = useData<Post>("/posts/" + id + "?language=" + locale, revision, initialPost);
  /** Refresh the current reader after a like or publication change. */
  function reload() {
    setRevision(revision + 1);
  }
  if (!post) return <Loading error={error} />;
  const displayedLikeState = likeState?.postId === id
    ? likeState
    : { postId: id, likes: post.likes, liked: post.liked };
  return (
    <>
      <div className="toolbar">
        <Link href="/public">← {t("The collection", "La colección")}</Link>
        <span style={{ flex: 1 }} />
        {["author", "editor"].includes(post.role) && (
          <>
            <Link href={`/compose/${id}`}>
              <Button variant="outline">
                {t("Edit story", "Editar historia")}
              </Button>
            </Link>
            <PendingReviewLink
              postId={id}
              pendingCount={
                post.role === "author" ? post.pending_reviews || 0 : 0
              }
            />
          </>
        )}
        {post.role === "author" && (
          <>
            <Link href={`/sharing/${id}`}>
              <Button variant="outline">{t("Sharing", "Compartir")}</Button>
            </Link>
            <Button
              onClick={
                /** Request a creator-controlled publication change. */ function publish() {
                  void run(
                    /** Change publication state and refresh approved reader data. */ async function changeVisibility() {
                      await api(`/posts/${id}/publication`, "POST", {
                        public: !post.public,
                      });
                      reload();
                    },
                  );
                }
              }
            >
              {post.public
                ? t("Make personal", "Hacer personal")
                : t("Publish", "Publicar")}
            </Button>
            <Button
              variant="ghost"
              onClick={
                /** Confirm deletion before requesting a creator-only delete. */ function remove() {
                  if (
                    confirm(
                      t(
                        "Delete this post permanently?",
                        "¿Eliminar esta publicación definitivamente?",
                      ),
                    )
                  )
                    void run(
                      /** Delete the owned post and return to the workspace. */ async function deleteStory() {
                        await api(`/posts/${id}`, "DELETE");
                        router.push("/workspace");
                      },
                    );
                }
              }
            >
              {t("Delete", "Eliminar")}
            </Button>
          </>
        )}
      </div>
      <div className="reader-heading">
        <div className="eyebrow">
          {post.public
            ? t("A PUBLIC STORY", "UNA HISTORIA PÚBLICA")
            : t("A PERSONAL STORY", "UNA HISTORIA PERSONAL")}
        </div>
        <h1>{post.title || t("Untitled story", "Historia sin título")}</h1>
        <p>{post.summary}</p>
        <Link href={`/profiles/${post.author.username}`}>
          {post.author.display_name}
        </Link>
        {post.public && !post.ai_news_document && (
          <Button
            className="reader-like-button ml-4"
            variant="outline"
            disabled={liking}
            aria-pressed={displayedLikeState.liked}
            aria-label={displayedLikeState.liked
              ? t("Remove like from story", "Quitar Me gusta de la historia")
              : t("Like story", "Me gusta esta historia")}
            onClick={
              /** Run the authenticated like action. */ function like() {
                if (liking) return;
                const previous = displayedLikeState;
                setLikeState({
                  postId: id,
                  likes: Math.max(0, previous.likes + (previous.liked ? -1 : 1)),
                  liked: !previous.liked,
                });
                setLiking(true);
                void run(
                  /** Toggle the like without unmounting the reader, then reconcile its optimistic count. */ async function toggleLike() {
                    try {
                      const updated = await api<Pick<Post, "likes" | "liked">>(`/posts/${id}/like`, "POST");
                      setLikeState({ postId: id, likes: updated.likes, liked: updated.liked });
                    } catch (requestError) {
                      setLikeState(previous);
                      throw requestError;
                    } finally {
                      setLiking(false);
                    }
                  },
                );
              }
            }
          >
            <Heart size={15} fill={displayedLikeState.liked ? "currentColor" : "none"} aria-hidden="true" />{" "}
            {displayedLikeState.likes}
          </Button>
        )}
      </div>
      {post.ai_news_document && post.ai_news ? (
        <AiNewsReader document={post.ai_news_document} sourceCount={post.ai_news.source_count} verifiedAt={post.ai_news.verified_at} correctionNote={post.ai_news.correction_note} />
      ) : (
        <CompositionReader document={post.document} highlightedBlockId={searchParams.get("highlight") === "search" ? searchParams.get("block") : null} />
      )}
    </>
  );
}

