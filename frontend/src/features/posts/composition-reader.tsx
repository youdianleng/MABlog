"use client";
import { useEffect, useRef, useState } from "react";
import { Composition } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useElementWidth } from "@/hooks/use-element-width";

/** Preserve the authored arrangement while fitting the initial reader view and offering zoom. */
export function CompositionReader({ document, highlightedBlockId = null }: { document: Composition; highlightedBlockId?: string | null }) {
  const { t } = useLanguage();
  const wrapper = useRef<HTMLDivElement>(null);
  const measuredWidth = useElementWidth(wrapper, 932);
  // Reader padding consumes 32 pixels; remove it before calculating the fit scale.
  const width = measuredWidth - 32;
  const [zoom, setZoom] = useState(1);
  const canvas = document.canvas,
    scale = Math.min(1, width / canvas.width) * zoom;
  useEffect(
    /** Bring a permission-checked search citation target into view after the reader renders. */
    function revealSearchTarget() {
      if (!highlightedBlockId) return;
      const target = window.document.getElementById(`post-block-${highlightedBlockId}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    },
    [highlightedBlockId],
  );
  return (
    <>
      <div
        className="toolbar"
        style={{ justifyContent: "flex-end", marginBottom: 12 }}
      >
        <label>
          {t("Reading zoom", "Zoom de lectura")}
          <input
            aria-label={t("Reading zoom", "Zoom de lectura")}
            type="range"
            min="1"
            max="4"
            step=".1"
            value={zoom}
            onChange={
              /** Change reader zoom without changing saved geometry. */ function changeZoom(
                event,
              ) {
                setZoom(Number(event.target.value));
              }
            }
          />
        </label>
      </div>
      <div ref={wrapper} className="reader-wrap">
        <div
          style={{ width: canvas.width * scale, height: canvas.height * scale }}
        >
          <div
            className="composition"
            style={{
              width: canvas.width,
              height: canvas.height,
              transform: `scale(${scale})`,
            }}
          >
            {[...document.blocks]
              .sort(
                /** Sort blocks by logical reading order for the document view. */ function readingOrder(
                  a,
                  b,
                ) {
                  return a.order - b.order;
                },
              )
              .map(
                /** Render one stable content block at its authored geometry. */ function renderBlock(
                  block,
                ) {
                  return (
                    <div
                      key={block.id}
                      id={`post-block-${block.id}`}
                      className={`content-block rich-content${highlightedBlockId === block.id ? " search-highlight" : ""}`}
                      style={{
                        left: block.x - canvas.x,
                        top: block.y - canvas.y,
                        width: block.width,
                        height: block.height,
                        transform: `rotate(${block.rotation}deg)`,
                        zIndex: block.z,
                      }}
                      dangerouslySetInnerHTML={{ __html: block.html }}
                    />
                  );
                },
              )}
          </div>
        </div>
      </div>
    </>
  );
}
