"use client";
import { useRef, useState } from "react";
import type { Block, Composition, WorkingCopy } from "@/lib/api";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useAccount } from "@/features/auth/account-context";
import { useUnsavedWarning } from "@/hooks/use-unsaved-warning";
import { ComposerCanvas, CANVAS_FRAME_INSET } from "./composer-canvas";
import { ComposerHeader } from "./composer-header";
import { ComposerSettings } from "./composer-settings";
import { ComposerToolbar } from "./composer-toolbar";
import { useCanvasZoom } from "./use-canvas-zoom";
import { useWorkingCopy } from "./use-working-copy";

const HISTORY_LIMIT = 50;
const DEFAULT_BLOCK_POSITION = 40;
const DEFAULT_BLOCK_WIDTH = 500;
const DEFAULT_BLOCK_HEIGHT = 320;
const MINIMUM_BLOCK_SIZE = 80;

/** Coordinate a private working copy, editor modes, history, and persistence. */
export function Composer({ id }: { id: string }) {
  const { t } = useLanguage();
  const { run } = useAccount();
  const { working, setWorking, workingRef, error } = useWorkingCopy(id);
  const [selected, setSelected] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canvasFrame, setCanvasFrame] = useState({
    x: CANVAS_FRAME_INSET,
    y: CANVAS_FRAME_INSET,
  });
  const history = useRef<Composition[]>([]);
  const future = useRef<Composition[]>([]);
  const drawStart = useRef<{ x: number; y: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const zoomContentRef = useRef<HTMLDivElement>(null);
  const current = working?.document;
  const block = current?.blocks.find(
    /** Find the block selected by stable identity. */
    function selectedBlock(item) {
      return item.id === selected;
    },
  );
  const zoom = useCanvasZoom(viewportRef, zoomContentRef, Boolean(current));

  useUnsavedWarning(dirty);

  /** Replace the composition while retaining a bounded undo history. */
  function change(document: Composition): void {
    if (!working) return;
    history.current = [
      ...history.current.slice(-(HISTORY_LIMIT - 1)),
      structuredClone(working.document),
    ];
    future.current = [];
    setWorking({ ...working, document });
    setDirty(true);
    setSaved("");
  }

  /** Update only selected block fields without replacing unrelated blocks. */
  function patchBlock(patch: Partial<Block>): void {
    if (!current) return;
    change({
      ...current,
      blocks: current.blocks.map(
        /** Patch the selected block and preserve every other block. */
        function update(item) {
          return item.id === selected ? { ...item, ...patch } : item;
        },
      ),
    });
  }

  /** Write rich content to the block that emitted the editor change. */
  function writeBlockHtml(identifier: string, html: string): void {
    if (!current) return;
    change({
      ...current,
      blocks: current.blocks.map(
        /** Update content only for the stable source block. */
        function write(item) {
          return item.id === identifier ? { ...item, html } : item;
        },
      ),
    });
  }

  /** Remove one block through the shared history-aware document update. */
  function removeBlock(identifier: string): void {
    if (!current) return;
    change({
      ...current,
      blocks: current.blocks.filter(
        /** Retain every block except the explicit removal target. */
        function keep(item) {
          return item.id !== identifier;
        },
      ),
    });
    if (selected === identifier) setSelected("");
  }

  /** Restore one snapshot while retaining redo state. */
  function undo(): void {
    if (!working || !history.current.length) return;
    future.current.push(working.document);
    setWorking({ ...working, document: history.current.pop()! });
    setDirty(true);
  }

  /** Reapply the latest undone composition change. */
  function redo(): void {
    if (!working || !future.current.length) return;
    history.current.push(working.document);
    setWorking({ ...working, document: future.current.pop()! });
    setDirty(true);
  }

  /** Create a stable mixed-content block at a world-space rectangle. */
  function addBlock(
    x = DEFAULT_BLOCK_POSITION,
    y = DEFAULT_BLOCK_POSITION,
    width = DEFAULT_BLOCK_WIDTH,
    height = DEFAULT_BLOCK_HEIGHT,
  ): void {
    if (!current) return;
    const identifier = crypto.randomUUID();
    const created: Block = {
      id: identifier,
      x,
      y,
      width: Math.max(MINIMUM_BLOCK_SIZE, width),
      height: Math.max(MINIMUM_BLOCK_SIZE, height),
      rotation: 0,
      z: current.blocks.length,
      order: current.blocks.length,
      html: "<p></p>",
    };
    change({ ...current, blocks: [...current.blocks, created] });
    setSelected(identifier);
    setDrawing(false);
  }

  /** Save private work, optionally submit it, and reload the resulting baseline. */
  async function save(submit = false): Promise<void> {
    if (!working) return;
    setBusy(true);
    try {
      await api("/posts/" + id + "/draft", "PUT", {
        document: working.document,
        baseline: working.baseline,
        versions: working.versions,
      });
      setDirty(false);
      if (submit) {
        await api("/posts/" + id + "/submit", "POST");
        const value = await api<WorkingCopy>("/posts/" + id + "/draft");
        setWorking(value);
        history.current = [];
        future.current = [];
      }
      setSaved(
        submit
          ? t("Changes submitted successfully.", "Cambios enviados correctamente.")
          : t("Private draft saved.", "Borrador privado guardado."),
      );
    } finally {
      setBusy(false);
    }
  }

  /** Capture a drawn rectangle start in canvas coordinates. */
  function startDraw(event: React.PointerEvent<HTMLDivElement>): void {
    if (!drawing || !current) return;
    const rectangle = event.currentTarget.getBoundingClientRect();
    drawStart.current = {
      x: (event.clientX - rectangle.left) / zoom + current.canvas.x,
      y: (event.clientY - rectangle.top) / zoom + current.canvas.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  /** Finish drawing in either direction and enforce a usable minimum size. */
  function finishDraw(event: React.PointerEvent<HTMLDivElement>): void {
    if (!drawStart.current || !current) return;
    const rectangle = event.currentTarget.getBoundingClientRect();
    const end = {
      x: (event.clientX - rectangle.left) / zoom + current.canvas.x,
      y: (event.clientY - rectangle.top) / zoom + current.canvas.y,
    };
    const start = drawStart.current;
    drawStart.current = null;
    addBlock(
      Math.min(start.x, end.x),
      Math.min(start.y, end.y),
      Math.abs(end.x - start.x),
      Math.abs(end.y - start.y),
    );
  }

  if (!working || !current) {
    return (
      <div className={error ? "notice error" : "notice"}>
        {error || t("Opening your draft…", "Abriendo tu borrador…")}
      </div>
    );
  }

  return (
    <>
      <ComposerHeader
        postId={id}
        title={current.details.title}
        busy={busy}
        role={working.role}
        t={t}
        run={run}
        save={save}
      />
      <ComposerToolbar
        canvas={current.canvas}
        drawing={drawing}
        cropping={cropping}
        dirty={dirty}
        saved={saved}
        zoom={zoom}
        t={t}
        addBlock={addBlock}
        setDrawing={setDrawing}
        setCropping={setCropping}
        undo={undo}
        redo={redo}
      />
      <div className="editor-layout">
        <ComposerCanvas
          postId={id}
          current={current}
          canvasFrame={canvasFrame}
          setCanvasFrame={setCanvasFrame}
          zoom={zoom}
          drawing={drawing}
          cropping={cropping}
          selected={selected}
          viewportRef={viewportRef}
          zoomContentRef={zoomContentRef}
          t={t}
          change={change}
          setSelected={setSelected}
          removeBlock={removeBlock}
          writeBlockHtml={writeBlockHtml}
          startDraw={startDraw}
          finishDraw={finishDraw}
        />
        <ComposerSettings
          postId={id}
          t={t}
          current={current}
          canvas={current.canvas}
          block={block}
          selected={selected}
          change={change}
          patchBlock={patchBlock}
          removeBlock={removeBlock}
          setSelected={setSelected}
          run={run}
          workingRef={workingRef}
          setWorking={setWorking}
          setDirty={setDirty}
          historyRef={history}
          futureRef={future}
        />
      </div>
    </>
  );
}


