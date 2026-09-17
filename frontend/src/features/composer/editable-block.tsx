import { Grip, Trash2 } from "lucide-react";
import { Rnd } from "react-rnd";
import type { Block, Composition } from "@/lib/api";
import { RichEditor } from "./rich-editor";

interface EditableBlockProps {
  postId: string;
  item: Block;
  current: Composition;
  canvas: Composition["canvas"];
  zoom: number;
  selected: string;
  drawing: boolean;
  cropping: boolean;
  t: (english: string, spanish: string) => string;
  change: (document: Composition) => void;
  select: (identifier: string) => void;
  remove: (identifier: string) => void;
  writeHtml: (identifier: string, html: string) => void;
}

/** Render one movable, resizable, rich-content canvas block. */
export function EditableBlock({
  postId,
  item,
  current,
  canvas,
  zoom,
  selected,
  drawing,
  cropping,
  t,
  change,
  select,
  remove,
  writeHtml,
}: EditableBlockProps) {
  const active = selected === item.id;
  return (
    <Rnd
      scale={zoom}
      size={{ width: item.width, height: item.height }}
      position={{ x: item.x - canvas.x, y: item.y - canvas.y }}
      minWidth={80}
      minHeight={80}
      enableResizing={!drawing && !cropping && active}
      disableDragging={drawing || cropping}
      dragHandleClassName="drag-handle"
      style={{ zIndex: item.z, pointerEvents: drawing ? "none" : "auto" }}
      onDragStart={/** Select the block being dragged. */ function selectMoving() { select(item.id); }}
      onDragStop={/** Convert the dragged position to document coordinates. */ function moveBlock(event, position) {
        change({
          ...current,
          blocks: current.blocks.map(
            /** Update only the moved block. */
            function place(candidate) {
              return candidate.id === item.id
                ? { ...candidate, x: position.x + canvas.x, y: position.y + canvas.y }
                : candidate;
            },
          ),
        });
      }}
      onResizeStop={/** Store resized geometry in document coordinates. */ function resizeBlock(event, direction, ref, delta, position) {
        change({
          ...current,
          blocks: current.blocks.map(
            /** Replace only the resized block geometry. */
            function resize(candidate) {
              return candidate.id === item.id
                ? {
                    ...candidate,
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    x: position.x + canvas.x,
                    y: position.y + canvas.y,
                  }
                : candidate;
            },
          ),
        });
      }}
    >
      <div
        className={"editor-block " + (active ? "selected" : "")}
        style={{ transform: "rotate(" + item.rotation + "deg)" }}
        onClick={/** Select this block for content and geometry editing. */ function selectBlock() { select(item.id); }}
      >
        <div className="drag-handle">
          <span className="block-drag-label"><Grip size={12} />{t("Block", "Bloque")} {item.order + 1}</span>
          <button
            type="button"
            className="block-delete-button"
            aria-label={t("Remove block", "Eliminar bloque") + " " + (item.order + 1)}
            title={t("Remove block", "Eliminar bloque")}
            onPointerDown={/** Keep delete from initiating a parent drag. */ function stopDeletePointer(event) { event.stopPropagation(); }}
            onMouseDown={/** Stop the mouse event React Rnd uses for dragging. */ function stopDeleteMouse(event) { event.stopPropagation(); }}
            onClick={/** Delete this block while leaving Undo available. */ function quickDelete(event) { event.stopPropagation(); remove(item.id); }}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
        <div className="block-body">
          {active ? (
            <RichEditor
              block={item}
              postId={postId}
              onChange={/** Store HTML for this stable block identity. */ function write(html) { writeHtml(item.id, html); }}
            />
          ) : (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: item.html }} />
          )}
        </div>
      </div>
    </Rnd>
  );
}
