"use client";

import { useEffect, useRef, useState } from "react";
import { type Post } from "@/lib/api";
import { PostCard } from "./post-card";

interface RevealPostCardProps {
  post: Post;
}

type RevealState = "unarmed" | "hidden" | "visible";

/**
 * Reveal one Discover card when it enters the viewport without changing its layout.
 * Reduced-motion visitors and browsers without IntersectionObserver receive the
 * final visible state immediately.
 */
export function RevealPostCard({ post }: RevealPostCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [revealState, setRevealState] = useState<RevealState>("unarmed");

  useEffect(
    /** Arm the reveal after hydration and disconnect once the card has appeared. */
    function observeCard() {
      const wrapper = wrapperRef.current;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!wrapper || reducedMotion || !("IntersectionObserver" in window)) {
        setRevealState("visible");
        return undefined;
      }

      setRevealState("hidden");
      const observer = new IntersectionObserver(
        /** Reveal the card once enough of its surface reaches the reading area. */
        function revealOnEntry(entries) {
          if (!entries.some(
            /** Identify whether an observed card is inside the reveal threshold. */
            function isVisible(entry) {
              return entry.isIntersecting;
            },
          )) return;
          setRevealState("visible");
          observer.disconnect();
        },
        {
          // A small lower inset lets the upward movement finish inside the viewport.
          rootMargin: "0px 0px -6% 0px",
          threshold: 0.12,
        },
      );

      observer.observe(wrapper);
      return /** Stop observing a card that unmounts before it becomes visible. */ function cleanupObserver() {
        observer.disconnect();
      };
    },
    [],
  );

  return (
    <div
      ref={wrapperRef}
      className="post-card-reveal"
      data-reveal-ready={revealState !== "unarmed"}
      data-reveal-visible={revealState === "visible"}
    >
      <PostCard post={post} />
    </div>
  );
}
