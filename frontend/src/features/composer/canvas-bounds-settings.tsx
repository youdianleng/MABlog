import type { Composition } from "@/lib/api";
import { Input } from "@/components/ui/input";
import type { Translator } from "./composer-settings-types";

const MINIMUM_CANVAS_SIZE = 200;

interface CanvasBoundsSettingsProps {
  t: Translator;
  current: Composition;
  change: (document: Composition) => void;
}

/** Render numeric crop position and canvas dimension controls. */
export function CanvasBoundsSettings({
  t,
  current,
  change,
}: CanvasBoundsSettingsProps) {
  const canvas = current.canvas;
  return (
    <>
      <h3>{t("Canvas bounds", "Límites del lienzo")}</h3>
      <div className="field-grid">
        {(["x", "y", "width", "height"] as const).map(
          /** Render one numeric crop-bound control. */
          function canvasField(key) {
            const label =
              key === "width"
                ? t("Width", "Ancho")
                : key === "height"
                  ? t("Height", "Alto")
                  : key;
            return (
              <label key={key}>
                {label}
                <Input
                  type="number"
                  value={canvas[key]}
                  onChange={/** Update one bound while enforcing minimum dimensions. */ function dimensions(event) {
                    const value = Number(event.target.value);
                    if ((key === "width" || key === "height") && value < MINIMUM_CANVAS_SIZE) return;
                    change({ ...current, canvas: { ...canvas, [key]: value } });
                  }}
                />
              </label>
            );
          },
        )}
      </div>
    </>
  );
}
