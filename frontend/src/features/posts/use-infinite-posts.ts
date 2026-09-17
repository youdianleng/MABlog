"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Post } from "@/lib/api";
import type { PostCategory } from "@/lib/categories";
import type { Locale } from "@/lib/i18n";
import { PUBLIC_POST_BATCH_SIZE } from "./pagination";

type InfinitePostsOptions = {
  locale: Locale;
  category: PostCategory | "";
  initialPosts?: Post[];
};

/** Build one stable public-post page path for the active locale and category. */
function postsPagePath(locale: Locale, category: PostCategory | "", offset: number): string {
  const parameters = new URLSearchParams({
    language: locale,
    offset: String(offset),
    limit: String(PUBLIC_POST_BATCH_SIZE),
  });
  if (category) parameters.set("category", category);
  return "/posts?" + parameters.toString();
}

/** Incrementally retrieve public post batches as the reader approaches the feed boundary. */
export function useInfinitePosts({ locale, category, initialPosts }: InfinitePostsOptions) {
  const feedKey = locale + "|" + category;
  const initialKey = useRef(feedKey);
  const initialPage = initialPosts ?? [];
  const initialHasMore = initialPage.length === PUBLIC_POST_BATCH_SIZE;
  const [posts, setPosts] = useState<Post[]>(initialPage);
  const [loading, setLoading] = useState(initialPosts === undefined);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const generation = useRef(0);
  const loadingRef = useRef(initialPosts === undefined);
  const offsetRef = useRef(initialPage.length);
  const hasMoreRef = useRef(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(
    /** Reset pagination when locale or category changes and preserve only the matching server page. */
    function resetFeed() {
      const requestGeneration = generation.current + 1;
      generation.current = requestGeneration;
      const canUseServerPage = initialKey.current === feedKey && initialPosts !== undefined;
      const seededPosts = canUseServerPage ? initialPosts : [];
      const seededHasMore = canUseServerPage && seededPosts.length === PUBLIC_POST_BATCH_SIZE;
      setPosts(seededPosts);
      setError("");
      setHasMore(canUseServerPage ? seededHasMore : true);
      offsetRef.current = seededPosts.length;
      hasMoreRef.current = canUseServerPage ? seededHasMore : true;
      loadingRef.current = !canUseServerPage;
      setLoading(!canUseServerPage);
      if (canUseServerPage) return;

      api<Post[]>(postsPagePath(locale, category, 0))
        .then(
          /** Install the first page only if the reader has not changed the feed meanwhile. */
          function receiveFirstPage(page) {
            if (generation.current !== requestGeneration) return;
            const moreAvailable = page.length === PUBLIC_POST_BATCH_SIZE;
            setPosts(page);
            setHasMore(moreAvailable);
            offsetRef.current = page.length;
            hasMoreRef.current = moreAvailable;
          },
        )
        .catch(
          /** Preserve a recoverable localized feed error for the current filter. */
          function rejectFirstPage(requestError) {
            if (generation.current === requestGeneration) setError(requestError.message);
          },
        )
        .finally(
          /** End the current first-page request without changing a newer feed. */
          function finishFirstPage() {
            if (generation.current !== requestGeneration) return;
            loadingRef.current = false;
            setLoading(false);
          },
        );

      return /** Invalidate responses that finish after this feed has been replaced. */ function invalidateFeed() {
        if (generation.current === requestGeneration) generation.current += 1;
      };
    },
    [category, feedKey, initialPosts, locale],
  );

  const loadMore = useCallback(
    /** Append one non-overlapping post page while preventing duplicate observer requests. */
    async function loadMorePosts() {
      if (loadingRef.current || !hasMoreRef.current) return;
      const requestGeneration = generation.current;
      const offset = offsetRef.current;
      loadingRef.current = true;
      setLoading(true);
      setError("");
      try {
        const page = await api<Post[]>(postsPagePath(locale, category, offset));
        if (generation.current !== requestGeneration) return;
        const moreAvailable = page.length === PUBLIC_POST_BATCH_SIZE;
        setPosts(
          /** Append the ordered API page without replacing cards already read. */
          function appendPage(currentPosts) {
            return [...currentPosts, ...page];
          },
        );
        offsetRef.current = offset + page.length;
        hasMoreRef.current = moreAvailable;
        setHasMore(moreAvailable);
      } catch (requestError) {
        if (generation.current === requestGeneration) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load more posts");
        }
      } finally {
        if (generation.current === requestGeneration) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    },
    [category, locale],
  );

  useEffect(
    /** Prefetch the next page only when the end marker approaches the viewport. */
    function observeFeedBoundary() {
      const sentinel = sentinelRef.current;
      if (!sentinel || !hasMore || error) return;
      const observer = new IntersectionObserver(
        /** Request one page when the stable boundary enters the preload margin. */
        function handleIntersection(entries) {
          if (entries.some(
            /** Accept any observer entry that currently intersects the preload region. */
            function isVisible(entry) {
              return entry.isIntersecting;
            },
          )) void loadMore();
        },
        { rootMargin: "160px 0px" },
      );
      observer.observe(sentinel);
      return /** Disconnect the observer before the feed state or route changes. */ function stopObserving() {
        observer.disconnect();
      };
    },
    [error, hasMore, loadMore],
  );

  return { posts, loading, error, hasMore, sentinelRef, loadMore };
}
