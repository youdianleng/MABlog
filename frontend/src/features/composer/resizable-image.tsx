"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import ImageExtension from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { MoveDiagonal2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const MIN_IMAGE_WIDTH = 80;
const MAX_SAVED_IMAGE_WIDTH = 4000;
const KEYBOARD_RESIZE_STEP = 10;
const LARGE_KEYBOARD_RESIZE_STEP = 25;

interface ResizeSession {
  pointerId: number;
  startX: number;
  startWidth: number;
  scale: number;
  maxWidth: number;
}

/** Normalize an optional persisted width into the supported pixel range. */
function normalizedWidth(value: unknown): number | null {
  const width = Number(value);
  return Number.isFinite(width) && width >= MIN_IMAGE_WIDTH && width <= MAX_SAVED_IMAGE_WIDTH
    ? Math.round(width)
    : null;
}

/** Keep a proposed image width inside the editor block and persistence limits. */
function clampWidth(width: number, availableWidth: number): number {
  return Math.round(Math.min(Math.max(MIN_IMAGE_WIDTH, width), availableWidth, MAX_SAVED_IMAGE_WIDTH));
}

/** Render an uploaded image with pointer and keyboard resizing controls inside TipTap. */
function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { t } = useLanguage();
  const image = useRef<HTMLImageElement>(null);
  const resize = useRef<ResizeSession | null>(null);
  const savedWidth = normalizedWidth(node.attrs.width);
  const [width, setWidth] = useState<number | null>(savedWidth);

  useEffect(
    /** Synchronize the preview when undo, redo, or external document replacement changes width. */
    function synchronizeWidth() {
      setWidth(savedWidth);
    },
    [savedWidth],
  );

  /** Read the rendered image and block geometry at the start of a resize operation. */
  function resizeMetrics() {
    const element = image.current;
    if (!element) return null;
    const renderedWidth = element.getBoundingClientRect().width;
    const layoutWidth = element.offsetWidth || renderedWidth;
    const scale = renderedWidth > 0 && layoutWidth > 0 ? renderedWidth / layoutWidth : 1;
    const editorWidth = element.closest(".ProseMirror")?.clientWidth || layoutWidth;
    return { startWidth: width || layoutWidth, scale, maxWidth: Math.max(MIN_IMAGE_WIDTH, editorWidth) };
  }

  /** Begin resizing from the visible corner while retaining events outside the handle. */
  function startResize(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const metrics = resizeMetrics();
    if (!metrics) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resize.current = { pointerId: event.pointerId, startX: event.clientX, ...metrics };
    setWidth(metrics.startWidth);
  }

  /** Preview a pointer-driven width without issuing editor transactions on every frame. */
  function previewResize(event: PointerEvent<HTMLButtonElement>) {
    const session = resize.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const documentDelta = (event.clientX - session.startX) / session.scale;
    setWidth(clampWidth(session.startWidth + documentDelta, session.maxWidth));
  }

  /** Commit the final pointer width once so undo and autosave receive one stable value. */
  function finishResize(event: PointerEvent<HTMLButtonElement>) {
    const session = resize.current;
    if (!session || session.pointerId !== event.pointerId) return;
    resize.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const documentDelta = (event.clientX - session.startX) / session.scale;
    const nextWidth = event.type === "pointercancel"
      ? width || session.startWidth
      : session.startWidth + documentDelta;
    const committedWidth = clampWidth(nextWidth, session.maxWidth);
    setWidth(committedWidth);
    updateAttributes({ width: committedWidth });
  }

  /** Resize in deterministic increments for keyboard and switch-control users. */
  function resizeWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const metrics = resizeMetrics();
    if (!metrics) return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? LARGE_KEYBOARD_RESIZE_STEP : KEYBOARD_RESIZE_STEP;
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextWidth = clampWidth((width || metrics.startWidth) + direction * step, metrics.maxWidth);
    setWidth(nextWidth);
    updateAttributes({ width: nextWidth });
  }

  const announcedWidth = width || savedWidth;
  return (
    <NodeViewWrapper
      as="figure"
      className="resizable-image-node"
      data-selected={selected ? "true" : undefined}
      style={{ width: width ? `${width}px` : undefined }}
    >
      <img ref={image} src={node.attrs.src} alt={node.attrs.alt || ""} width={width || undefined} draggable={false} />
      <button
        className="image-resize-handle"
        type="button"
        contentEditable={false}
        aria-label={t(
          `Resize image${announcedWidth ? `, ${announcedWidth} pixels wide` : ""}. Drag or use Left and Right Arrow keys.`,
          `Cambiar tamaño de imagen${announcedWidth ? `, ${announcedWidth} píxeles de ancho` : ""}. Arrastra o usa las flechas izquierda y derecha.`,
        )}
        onPointerDown={startResize}
        onPointerMove={previewResize}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
        onKeyDown={resizeWithKeyboard}
      >
        <MoveDiagonal2 size={14} aria-hidden="true" />
      </button>
    </NodeViewWrapper>
  );
}

/** Extend TipTap images with a sanitized width attribute and the resizable React node view. */
export const ResizableImageExtension = ImageExtension.extend({
  /** Parse and serialize the optional persisted pixel width. */
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: /** Accept only bounded integer widths from stored HTML. */ function parseWidth(element) {
          return normalizedWidth(element.getAttribute("width"));
        },
        renderHTML: /** Omit default sizing and serialize only a validated width. */ function renderWidth(attributes) {
          const width = normalizedWidth(attributes.width);
          return width ? { width: String(width) } : {};
        },
      },
    };
  },
  /** Use the interactive node only in the composer; published HTML remains a plain image. */
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
