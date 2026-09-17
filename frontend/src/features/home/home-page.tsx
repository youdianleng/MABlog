"use client";
import Link from "next/link";
import { useState } from "react";
import { type Post } from "@/lib/api";
import { categories, type PostCategory } from "@/lib/categories";
import { useLanguage } from "@/lib/i18n";
import { useData } from "@/hooks/use-data";
import { Loading } from "@/components/feedback/loading";
import { Carousel, PostGrid, useInfinitePosts } from "@/features/posts";
import { CelestialBackground } from "./celestial-background";
import { CharacterCycle } from "./character-cycle";

interface HomeProps {
  publicOnly: boolean;
  initialPosts?: Post[];
  initialFeatured?: Post[];
}

/** Render the featured carousel and editorial public-post collection. */
export function Home({ publicOnly, initialPosts, initialFeatured }: HomeProps) {
  const [category, setCategory] = useState<PostCategory | "">("");
  const { t, locale } = useLanguage();
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    sentinelRef,
    loadMore,
  } = useInfinitePosts({
    locale,
    category: publicOnly ? category : "",
    initialPosts: category ? undefined : initialPosts,
  });
  const featured = useData<Post[]>(
    "/carousel?language=" + locale,
    0,
    initialFeatured,
  );

  return (
    <>
      {!publicOnly ? (
        <>
          <div className="character-showcase">
            <CelestialBackground />
            <CharacterCycle />
            <div className="hero-intro">
              <div className="eyebrow">
                {t("A gathering of stories & kindred spirits", "Un encuentro de historias y almas afines")}
              </div>
              <h1>{t("Every story opens", "Cada historia abre")}<br />{t("another world.", "otro mundo.")}</h1>
              <p>{t("Wander through imagination. Leave a little of your own.", "Explora la imaginación. Deja un poco de la tuya.")}</p>
            </div>
            {featured.data ? <Carousel posts={featured.data} /> : <Loading error={featured.error} />}
          </div>
          <div className="divider">✦</div>
        </>
      ) : null}
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t("FROM THE COMMUNITY", "DE LA COMUNIDAD")}</div>
          <h2>{t("Stories worth wandering into", "Historias en las que perderse")}</h2>
          <p>{t("A new perspective, a familiar feeling, an unexpected journey.", "Una nueva perspectiva, una sensación familiar, un viaje inesperado.")}</p>
        </div>
        <Link href="/public">{t("Explore the collection", "Explorar la colección")} ↗</Link>
      </div>
      <div className={publicOnly ? "collection-layout" : undefined}>
        {publicOnly ? (
          <nav className="category-menu" aria-label={t("Post categories", "Categorías de publicaciones")}>
            <div className="eyebrow">{t("BROWSE BY CATEGORY", "EXPLORAR POR CATEGORÍA")}</div>
            <button type="button" aria-pressed={!category} onClick={/** Show every approved category. */ function showAll() { setCategory(""); }}>
              <span aria-hidden="true">☷</span>{t("All posts", "Todas las publicaciones")}
            </button>
            {categories.map(
              /** Render a keyboard-accessible category filter. */
              function categoryOption(item) {
                return (
                  <button type="button" key={item.value} aria-pressed={category === item.value} onClick={/** Fetch the selected category. */ function selectCategory() { setCategory(item.value); }}>
                    <span aria-hidden="true">{item.symbol}</span>{t(item.en, item.es)}
                  </button>
                );
              },
            )}
          </nav>
        ) : null}
        <div className="collection-results" aria-live="polite" aria-busy={postsLoading}>
          {publicOnly && category && !postsLoading && !postsError && posts.length === 0 ? (
            <div className="empty"><h2>{t("No stories in this category yet", "Todavía no hay historias en esta categoría")}</h2><p>{t("Choose another category or explore all posts.", "Elige otra categoría o explora todas las publicaciones.")}</p></div>
          ) : posts.length ? (
            <>
              <PostGrid posts={posts} reveal={!publicOnly} />
              <div ref={sentinelRef} className="post-feed-sentinel">
                {postsLoading ? <p role="status">{t("Loading more posts…", "Cargando más publicaciones…")}</p> : null}
                {postsError ? <button type="button" onClick={loadMore}>{t("Try loading more posts", "Intentar cargar más publicaciones")}</button> : null}
              </div>
            </>
          ) : postsLoading || postsError ? <Loading error={postsError} /> : <PostGrid posts={[]} />}
        </div>
      </div>
    </>
  );
}
