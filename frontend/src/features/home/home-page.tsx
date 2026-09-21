"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { type Post, type PublicPostPage } from "@/lib/api";
import { categories, type PostCategory } from "@/lib/categories";
import { useLanguage } from "@/lib/i18n";
import { useData } from "@/hooks/use-data";
import { Loading } from "@/components/feedback/loading";
import { Carousel, PostGrid, PostPagination } from "@/features/posts";
import { CelestialBackground } from "./celestial-background";
import { CharacterCycle } from "./character-cycle";

interface HomeProps {
  publicOnly: boolean;
  initialPage?: PublicPostPage;
  initialFeatured?: Post[];
  category?: PostCategory | "";
}

/** Render the featured carousel and editorial public-post collection. */
export function Home({ publicOnly, initialPage, initialFeatured, category = "" }: HomeProps) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const collectionHeading = useRef<HTMLHeadingElement>(null);
  const previousCollectionView = useRef(category + "|" + (initialPage?.page ?? 1));
  const [postsPending, startPostsTransition] = useTransition();
  const posts = initialPage?.items ?? [];
  const currentPage = initialPage?.page ?? 1;
  const pageCount = initialPage?.pages ?? 1;
  const featured = useData<Post[]>(
    "/carousel?language=" + locale,
    0,
    initialFeatured,
  );

  useEffect(
    /** Move keyboard focus to the updated result heading after page or filter navigation. */
    function focusUpdatedCollection() {
      const currentView = category + "|" + currentPage;
      if (previousCollectionView.current === currentView) return;
      previousCollectionView.current = currentView;
      collectionHeading.current?.focus({ preventScroll: true });
      // Scroll only after the replacement page is mounted so stale cards never flash at the top.
      collectionHeading.current?.scrollIntoView({ block: "start" });
    },
    [category, currentPage],
  );

  /** Navigate to a shareable filtered page while the existing cards remain visible. */
  function navigatePosts(nextPage: number, nextCategory: PostCategory | "" = category) {
    const parameters = new URLSearchParams();
    if (publicOnly && nextCategory) parameters.set("category", nextCategory);
    if (nextPage > 1) parameters.set("page", String(nextPage));
    const destination = pathname + (parameters.size ? "?" + parameters.toString() : "");
    startPostsTransition(
      /** Start the server-rendered collection navigation without blanking the current grid. */
      function updateCollectionRoute() {
        router.push(destination, { scroll: false });
      },
    );
  }

  /** Return to the first page of all approved public posts. */
  function showAllCategories() {
    navigatePosts(1, "");
  }

  /** Open the requested numbered page under the active collection filter. */
  function showPage(nextPage: number) {
    navigatePosts(nextPage);
  }

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
          <h2 ref={collectionHeading} tabIndex={-1}>{t("Stories worth wandering into", "Historias en las que perderse")}</h2>
          <p>{t("A new perspective, a familiar feeling, an unexpected journey.", "Una nueva perspectiva, una sensación familiar, un viaje inesperado.")}</p>
        </div>
        <Link href="/public">{t("Explore the collection", "Explorar la colección")} ↗</Link>
      </div>
      <div className={publicOnly ? "collection-layout" : undefined}>
        {publicOnly ? (
          <nav className="category-menu" aria-label={t("Post categories", "Categorías de publicaciones")}>
            <div className="eyebrow">{t("BROWSE BY CATEGORY", "EXPLORAR POR CATEGORÍA")}</div>
            <button type="button" aria-pressed={!category} disabled={postsPending} onClick={showAllCategories}>
              <span aria-hidden="true">☷</span>{t("All posts", "Todas las publicaciones")}
            </button>
            {categories.map(
              /** Render a keyboard-accessible category filter. */
              function categoryOption(item) {
                return (
                  <button type="button" key={item.value} aria-pressed={category === item.value} disabled={postsPending} onClick={/** Open the category at its first page. */ function selectCategory() { navigatePosts(1, item.value); }}>
                    <span aria-hidden="true">{item.symbol}</span>{t(item.en, item.es)}
                  </button>
                );
              },
            )}
          </nav>
        ) : null}
        <div className="collection-results" aria-live="polite" aria-busy={postsPending}>
          {publicOnly && category && initialPage && posts.length === 0 ? (
            <div className="empty"><h2>{t("No stories in this category yet", "Todavía no hay historias en esta categoría")}</h2><p>{t("Choose another category or explore all posts.", "Elige otra categoría o explora todas las publicaciones.")}</p></div>
          ) : initialPage && posts.length ? (
            <>
              <PostGrid posts={posts} reveal={!publicOnly} />
              {postsPending ? <p className="post-pagination-loading" role="status">{t("Loading posts…", "Cargando publicaciones…")}</p> : null}
              <PostPagination page={currentPage} pages={pageCount} pending={postsPending} onPageChange={showPage} />
            </>
          ) : initialPage ? (
            <>
              <PostGrid posts={[]} />
              <PostPagination page={currentPage} pages={pageCount} pending={postsPending} onPageChange={showPage} />
            </>
          ) : <Loading error={t("Unable to load posts", "No se pueden cargar las publicaciones")} />}
        </div>
      </div>
    </>
  );
}
