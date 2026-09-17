import { RotateCcw, RotateCw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Composition } from "@/lib/api";

interface ComposerToolbarProps {
  canvas: Composition["canvas"];
  drawing: boolean;
  cropping: boolean;
  dirty: boolean;
  saved: string;
  zoom: number;
  t: (english: string, spanish: string) => string;
  addBlock: (x?: number, y?: number) => void;
  setDrawing: (value: boolean) => void;
  setCropping: (value: boolean) => void;
  undo: () => void;
  redo: () => void;
}

/** Render block creation, canvas modes, history controls, and zoom feedback. */
export function ComposerToolbar({
  canvas,
  drawing,
  cropping,
  dirty,
  saved,
  zoom,
  t,
  addBlock,
  setDrawing,
  setCropping,
  undo,
  redo,
}: ComposerToolbarProps) {
  return (
    <>
      <div className="toolbar">
        <Button size="sm" variant="outline" onClick={/** Add a block inside the current visible canvas. */ function createBlock() { addBlock(canvas.x + 40, canvas.y + 40); }}>
          <span aria-hidden="true">+</span>
          {t("Add block", "Añadir bloque")}
        </Button>
        <Button size="sm" variant={drawing ? "default" : "outline"} onClick={/** Toggle drawing and leave crop-movement mode. */ function drawMode() { setDrawing(!drawing); setCropping(false); }}>
          <Square size={14} />
          {t("Draw block", "Dibujar bloque")}
        </Button>
        <Button size="sm" variant={cropping ? "default" : "outline"} onClick={/** Toggle crop movement and leave block-drawing mode. */ function cropMode() { setCropping(!cropping); setDrawing(false); }}>
          {t("Adjust canvas bounds", "Ajustar límites del lienzo")}
        </Button>
        <Button size="sm" variant="ghost" aria-label={t("Undo", "Deshacer")} onClick={undo}><RotateCcw size={15} /></Button>
        <Button size="sm" variant="ghost" aria-label={t("Redo", "Rehacer")} onClick={redo}><RotateCw size={15} /></Button>
        <small>{dirty ? t("Unsaved changes", "Cambios sin guardar") : saved}</small>
      </div>
      {cropping ? (
        <p className="notice mt-3">
          {t(
            "Drag the canvas border handles to crop or expand. Drag its top bar to move the crop area. Content outside the bounds is retained.",
            "Arrastra los controles del borde para recortar o ampliar. Arrastra la barra superior para mover el área. El contenido fuera del área se conserva.",
          )}
        </p>
      ) : (
        <p className="canvas-resize-help">
          {t(
            "Drag any canvas edge or corner to change its width and height. Turn on Adjust canvas bounds only when you want to move the crop area.",
            "Arrastra cualquier borde o esquina del lienzo para cambiar su ancho y alto. Activa Ajustar límites del lienzo solo cuando quieras mover el área de recorte.",
          )}
        </p>
      )}
      <small className="canvas-zoom-status" aria-live="polite">
        {t("Canvas zoom", "Zoom del lienzo")} · {Math.round(zoom * 100)}% · {t("Ctrl + wheel", "Ctrl + rueda")}
      </small>
    </>
  );
}
