import type { Dispatch, PointerEvent, RefObject, SetStateAction } from "react";
import { Rnd } from "react-rnd";
import type { Composition } from "@/lib/api";
import { EditableBlock } from "./editable-block";

export const CANVAS_FRAME_INSET = 40;
const MIN_CANVAS_WIDTH = 200;
const MIN_CANVAS_HEIGHT = 200;
const MAX_CANVAS_SIZE = 20000;
const MIN_ZOOM_SPACE_WIDTH = 1400;
const MIN_ZOOM_SPACE_HEIGHT = 1000;
const CANVAS_LABEL_HEIGHT = 25;

interface ComposerCanvasProps {
  postId: string;
  current: Composition;
  canvasFrame: { x: number; y: number };
  setCanvasFrame: Dispatch<SetStateAction<{ x: number; y: number }>>;
  zoom: number;
  drawing: boolean;
  cropping: boolean;
  selected: string;
  viewportRef: RefObject<HTMLDivElement | null>;
  zoomContentRef: RefObject<HTMLDivElement | null>;
  t: (english: string, spanish: string) => string;
  change: (document: Composition) => void;
  setSelected: Dispatch<SetStateAction<string>>;
  removeBlock: (identifier: string) => void;
  writeBlockHtml: (identifier: string, html: string) => void;
  startDraw: (event: PointerEvent<HTMLDivElement>) => void;
  finishDraw: (event: PointerEvent<HTMLDivElement>) => void;
}

/** Render the zoomable canvas frame and delegate each content rectangle. */
export function ComposerCanvas({
  postId,
  current,
  canvasFrame,
  setCanvasFrame,
  zoom,
  drawing,
  cropping,
  selected,
  viewportRef,
  zoomContentRef,
  t,
  change,
  setSelected,
  removeBlock,
  writeBlockHtml,
  startDraw,
  finishDraw,
}: ComposerCanvasProps) {
  const canvas = current.canvas;
  const surfaceWidth = Math.max(
    MIN_ZOOM_SPACE_WIDTH,
    canvasFrame.x + canvas.width + CANVAS_FRAME_INSET,
  );
  const surfaceHeight = Math.max(
    MIN_ZOOM_SPACE_HEIGHT,
    canvasFrame.y + canvas.height + CANVAS_FRAME_INSET,
  );

  return (
    <div className="editor-viewport" ref={viewportRef}>
      <div className="editor-zoom-space" ref={zoomContentRef} style={{ width: surfaceWidth * zoom, height: surfaceHeight * zoom }}>
        <div className="editor-zoom-surface" style={{ width: surfaceWidth, height: surfaceHeight, transform: "scale(" + zoom + ")" }}>
          <Rnd
            scale={zoom}
            size={{ width: canvas.width, height: canvas.height }}
            position={canvasFrame}
            minWidth={MIN_CANVAS_WIDTH}
            minHeight={MIN_CANVAS_HEIGHT}
            maxWidth={MAX_CANVAS_SIZE}
            maxHeight={MAX_CANVAS_SIZE}
            enableResizing={!drawing}
            disableDragging={!cropping}
            dragHandleClassName="crop-handle"
            // Named handles make every canvas edge and corner visible and testable.
            resizeHandleClasses={{
              top: "canvas-resize-handle canvas-resize-n",
              right: "canvas-resize-handle canvas-resize-e",
              bottom: "canvas-resize-handle canvas-resize-s",
              left: "canvas-resize-handle canvas-resize-w",
              topRight: "canvas-resize-handle canvas-resize-ne",
              bottomRight: "canvas-resize-handle canvas-resize-se",
              bottomLeft: "canvas-resize-handle canvas-resize-sw",
              topLeft: "canvas-resize-handle canvas-resize-nw",
            }}
            onDragStop={/** Shift crop bounds without moving stored blocks. */ function moveCrop(event, position) {
              const deltaX = position.x - canvasFrame.x;
              const deltaY = position.y - canvasFrame.y;
              if (deltaX === 0 && deltaY === 0) return;
              setCanvasFrame({ x: position.x, y: position.y });
              change({ ...current, canvas: { ...canvas, x: canvas.x + deltaX, y: canvas.y + deltaY } });
            }}
            onResizeStop={/** Store crop dimensions and compensate for left or top movement. */ function resizeCanvas(event, direction, ref, delta, position) {
              const deltaX = position.x - canvasFrame.x;
              const deltaY = position.y - canvasFrame.y;
              setCanvasFrame({ x: position.x, y: position.y });
              change({
                ...current,
                canvas: {
                  x: canvas.x + deltaX,
                  y: canvas.y + deltaY,
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                },
              });
            }}
          >
            <div
              className="crop-handle"
              style={{
                position: "absolute",
                top: -CANVAS_LABEL_HEIGHT,
                height: CANVAS_LABEL_HEIGHT,
                background: "#bd9d70",
                padding: "4px 12px",
                fontSize: 11,
                cursor: cropping ? "move" : "default",
              }}
            >
              {t("Canvas", "Lienzo")} · {Math.round(canvas.width)} × {Math.round(canvas.height)}
            </div>
            <div
              className="editor-canvas"
              style={{ width: "100%", height: "100%", overflow: "hidden", cursor: drawing ? "crosshair" : "default" }}
              onPointerDown={startDraw}
              onPointerUp={finishDraw}
            >
              {current.blocks.map(
                /** Render one stable block at its authored geometry. */
                function renderBlock(item) {
                  return (
                    <EditableBlock
                      key={item.id}
                      postId={postId}
                      item={item}
                      current={current}
                      canvas={canvas}
                      zoom={zoom}
                      selected={selected}
                      drawing={drawing}
                      cropping={cropping}
                      t={t}
                      change={change}
                      select={setSelected}
                      remove={removeBlock}
                      writeHtml={writeBlockHtml}
                    />
                  );
                },
              )}
            </div>
          </Rnd>
        </div>
      </div>
    </div>
  );
}
