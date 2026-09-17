"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, ShieldCheck } from "lucide-react";
import { Post } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useCarouselAutoplay } from "./use-carousel-autoplay";

/** Rotate five featured posts with center emphasis, pause controls, and reduced-motion support. */
export function Carousel({ posts }: { posts: Post[] }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false);
  const touch = useRef(0);
  const reduced = useReducedMotion();
  useCarouselAutoplay({ count: posts.length, paused, hovered, focused, reduced, setActive });
  /** Move by one card and keep the index valid when fewer than five posts exist. */
  function move(direction: number) {
    setActive((active + direction + posts.length) % posts.length);
  }
  if (!posts.length)
    return (
      <div className="empty" style={{ marginTop: 35 }}>
        <h2>{t("Your next world is waiting", "Tu próximo mundo te espera")}</h2>
        <p>
          {t(
            "Publish a story with a cover to begin the collection.",
            "Publica una historia con portada para empezar la colección.",
          )}
        </p>
      </div>
    );
  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label={t(
        "Most loved stories in 14 days",
        "Historias más valoradas en 14 días",
      )}
      onMouseEnter={
        /** Pause autoplay while the pointer is over the carousel. */ function enter() {
          setHovered(true);
        }
      }
      onMouseLeave={
        /** Permit autoplay after the pointer leaves the carousel. */ function leave() {
          setHovered(false);
        }
      }
      onFocusCapture={
        /** Pause autoplay while keyboard focus is inside the carousel. */ function focus() {
          setFocused(true);
        }
      }
      onBlurCapture={
        /** Resume focus-controlled autoplay only after focus leaves the whole carousel. */ function blur(
          event,
        ) {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }
      }
      onKeyDown={
        /** Map arrow keys to previous and next carousel navigation. */ function keyboard(
          event,
        ) {
          if (event.key === "ArrowLeft") move(-1);
          if (event.key === "ArrowRight") move(1);
        }
      }
      onTouchStart={
        /** Remember the initial horizontal swipe position. */ function touchStart(
          event,
        ) {
          touch.current = event.touches[0].clientX;
        }
      }
      onTouchEnd={
        /** Navigate when a horizontal swipe exceeds the gesture threshold. */ function touchEnd(
          event,
        ) {
          const distance = event.changedTouches[0].clientX - touch.current;
          if (Math.abs(distance) > 40) move(distance < 0 ? 1 : -1);
        }
      }
    >
      {/* Signed circular distance centers the active card and places up to two neighbors on each side. */}
      {posts.map(
        /** Place a featured card relative to the emphasized center card. */ function renderFeatured(
          post,
          index,
        ) {
          let distance = (index - active + posts.length) % posts.length;
          if (distance > posts.length / 2) distance -= posts.length;
          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="carousel-card"
              aria-label={post.title}
              aria-current={distance === 0 ? "true" : undefined}
              style={{
                transform: `translateX(calc(-50% + ${distance * 66}%)) scale(${distance === 0 ? 1 : 0.83})`,
                opacity: distance === 0 ? 1 : 0.35,
                zIndex: 10 - Math.abs(distance),
              }}
            >
              <img src={post.cover} alt="" />
              <div className="carousel-caption">
                {post.kind === "ai_news" ? <small className="carousel-ai-label"><ShieldCheck aria-hidden="true" size={12} />{t("AI-GENERATED · VERIFIED", "GENERADO POR IA · VERIFICADO")}</small> : null}
                <small>
                  {t("MOST LOVED · 14 DAYS", "MÁS VALORADAS · 14 DÍAS")}
                </small>
                <h2>{post.title}</h2>
                <small>
                  {post.author.display_name} · ♡ {post.likes}
                </small>
              </div>
            </Link>
          );
        },
      )}
      <div className="carousel-controls">
        <button
          className="icon-button"
          aria-label={t("Previous story", "Historia anterior")}
          onClick={
            /** Select the previous carousel card with wraparound. */ function previous() {
              move(-1);
            }
          }
        >
          <ChevronLeft size={15} />
        </button>
        {posts.map(
          /** Render an accessible direct card-selection indicator. */ function indicator(
            post,
            index,
          ) {
            return (
              <button
                key={post.id}
                className={`dot ${index === active ? "active" : ""}`}
                aria-label={`${t("Show story", "Mostrar historia")} ${index + 1}`}
                onClick={
                  /** Make the chosen card the carousel center. */ function select() {
                    setActive(index);
                  }
                }
              />
            );
          },
        )}
        <button
          className="icon-button"
          aria-label={t("Next story", "Historia siguiente")}
          onClick={
            /** Select the next carousel card with wraparound. */ function next() {
              move(1);
            }
          }
        >
          <ChevronRight size={15} />
        </button>
        <button
          className="icon-button"
          aria-label={
            paused
              ? t("Resume carousel", "Reanudar carrusel")
              : t("Pause carousel", "Pausar carrusel")
          }
          onClick={
            /** Toggle the explicit autoplay pause state. */ function pause() {
              setPaused(!paused);
            }
          }
        >
          {paused || reduced ? <Play size={12} /> : <Pause size={12} />}
        </button>
      </div>
    </section>
  );
}
