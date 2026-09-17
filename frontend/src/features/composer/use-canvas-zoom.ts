"use client";
import { type RefObject, useEffect, useRef, useState } from "react";

// Editor zoom stays broad enough for overview and detail work without allowing
// a wheel gesture to make the canvas effectively disappear or become unusable.
const MIN_CANVAS_ZOOM = 0.25;
const MAX_CANVAS_ZOOM = 3;
const CANVAS_ZOOM_STEP = 0.1;

/** Clamp one wheel step to the supported canvas zoom range. */
function nextCanvasZoom(current: number, deltaY: number): number {
  const direction = deltaY < 0 ? 1 : -1;
  const stepped = Math.round((current + direction * CANVAS_ZOOM_STEP) * 100) / 100;
  return Math.min(MAX_CANVAS_ZOOM, Math.max(MIN_CANVAS_ZOOM, stepped));
}

/** Zoom a scrollable editor with Ctrl + wheel while preserving the point beneath the cursor. */
export function useCanvasZoom(
  viewportRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): number {
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);

  useEffect(
    /** Attach a non-passive listener so Ctrl + wheel scales the canvas instead of the browser page. */
    function manageCanvasWheel() {
      const viewport = viewportRef.current;
      if (!enabled || !viewport) return;
      const editorViewport: HTMLDivElement = viewport;
      let pendingFrame = 0;

      /** Apply one bounded zoom step and retain the cursor's document-space location. */
      function zoomCanvas(event: WheelEvent) {
        if (!event.ctrlKey || event.deltaY === 0) return;
        event.preventDefault();
        event.stopPropagation();
        const current = zoomRef.current;
        const next = nextCanvasZoom(current, event.deltaY);
        if (next === current) return;
        const rectangle = editorViewport.getBoundingClientRect();
        const pointerX = event.clientX - rectangle.left;
        const pointerY = event.clientY - rectangle.top;
        const contentLeft = contentRef.current?.offsetLeft ?? 0;
        const contentTop = contentRef.current?.offsetTop ?? 0;
        const documentX = (editorViewport.scrollLeft + pointerX - contentLeft) / current;
        const documentY = (editorViewport.scrollTop + pointerY - contentTop) / current;
        zoomRef.current = next;
        setZoom(next);
        window.cancelAnimationFrame(pendingFrame);
        pendingFrame = window.requestAnimationFrame(
          /** Restore scroll offsets after React exposes the newly scaled scroll area. */
          function preservePointerPosition() {
            editorViewport.scrollLeft = contentLeft + documentX * next - pointerX;
            editorViewport.scrollTop = contentTop + documentY * next - pointerY;
          },
        );
      }

      editorViewport.addEventListener("wheel", zoomCanvas, { passive: false });
      return /** Remove the listener and deferred scroll update on unmount. */ function cleanupCanvasWheel() {
        editorViewport.removeEventListener("wheel", zoomCanvas);
        window.cancelAnimationFrame(pendingFrame);
      };
    },
    [contentRef, enabled, viewportRef],
  );

  return zoom;
}
