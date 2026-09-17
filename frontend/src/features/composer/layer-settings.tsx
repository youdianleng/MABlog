import type { Composition } from "@/lib/api";
import type { Translator } from "./composer-settings-types";

interface LayerSettingsProps {
  t: Translator;
  current: Composition;
  select: (identifier: string) => void;
}

/** Render a front-to-back selector for overlapping content blocks. */
export function LayerSettings({ t, current, select }: LayerSettingsProps) {
  return (
    <>
      <h3>{t("Layers", "Capas")}</h3>
      {[...current.blocks]
        .sort(
          /** Order layer choices from front to back. */
          function stacking(first, second) {
            return second.z - first.z;
          },
        )
        .map(
          /** Render one block selector even when another block covers it. */
          function layer(item) {
            return (
              <button className="layer-item" key={item.id} onClick={/** Select this layer's stable block. */ function selectLayer() { select(item.id); }}>
                {t("Block", "Bloque")} {item.order + 1}
                <span>z {item.z}</span>
              </button>
            );
          },
        )}
    </>
  );
}
