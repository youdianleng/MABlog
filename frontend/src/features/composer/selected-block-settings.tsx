import { Copy, Trash2 } from "lucide-react";
import type { Block, Composition } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Translator } from "./composer-settings-types";

const DUPLICATE_OFFSET = 30;

interface SelectedBlockSettingsProps {
  t: Translator;
  current: Composition;
  block: Block;
  patchBlock: (patch: Partial<Block>) => void;
  change: (document: Composition) => void;
  select: (identifier: string) => void;
  remove: (identifier: string) => void;
}

/** Render geometry, ordering, layering, duplication, and removal for one block. */
export function SelectedBlockSettings({
  t,
  current,
  block,
  patchBlock,
  change,
  select,
  remove,
}: SelectedBlockSettingsProps) {
  return (
    <>
      <h3>{t("Selected block", "Bloque seleccionado")}</h3>
      <div className="field-grid">
        {(["x", "y", "width", "height", "rotation", "order"] as const).map(
          /** Render one numeric geometry or reading-order control. */
          function geometryField(key) {
            const labels = {
              x: "X",
              y: "Y",
              width: t("Width", "Ancho"),
              height: t("Height", "Alto"),
              rotation: t("Rotation °", "Rotación °"),
              order: t("Reading order", "Orden de lectura"),
            };
            return (
              <label key={key}>
                {labels[key]}
                <Input
                  type="number"
                  value={block[key]}
                  onChange={/** Update one numeric block property. */ function geometry(event) {
                    patchBlock({ [key]: Number(event.target.value) });
                  }}
                />
              </label>
            );
          },
        )}
      </div>
      <div className="toolbar mt-3">
        <Button size="sm" variant="outline" onClick={/** Raise the selected block one layer. */ function forward() { patchBlock({ z: block.z + 1 }); }}>
          {t("Bring forward", "Traer adelante")}
        </Button>
        <Button size="sm" variant="outline" onClick={/** Lower the selected block one layer. */ function backward() { patchBlock({ z: block.z - 1 }); }}>
          {t("Send backward", "Enviar atrás")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label={t("Duplicate block", "Duplicar bloque")}
          onClick={/** Copy the block with a fresh identity and visible offset. */ function duplicate() {
            const identifier = crypto.randomUUID();
            change({
              ...current,
              blocks: [
                ...current.blocks,
                {
                  ...block,
                  id: identifier,
                  x: block.x + DUPLICATE_OFFSET,
                  y: block.y + DUPLICATE_OFFSET,
                  order: current.blocks.length,
                },
              ],
            });
            select(identifier);
          }}
        >
          <Copy size={13} />
        </Button>
        <Button variant="outline" size="sm" aria-label={t("Remove block", "Eliminar bloque")} onClick={/** Remove the selected block. */ function removeSelected() { remove(block.id); }}>
          <Trash2 size={13} />
        </Button>
      </div>
    </>
  );
}
