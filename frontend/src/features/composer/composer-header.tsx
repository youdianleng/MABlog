import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { WorkingCopy } from "@/lib/api";

interface ComposerHeaderProps {
  postId: string;
  title: string;
  busy: boolean;
  role: WorkingCopy["role"];
  t: (english: string, spanish: string) => string;
  run: (action: () => Promise<unknown>) => Promise<void>;
  save: (submit?: boolean) => Promise<void>;
}

/** Render composer identity and explicit private-save or submission actions. */
export function ComposerHeader({
  postId,
  title,
  busy,
  role,
  t,
  run,
  save,
}: ComposerHeaderProps) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{t("THE COMPOSER", "EL COMPOSITOR")}</div>
        <h1 className="text-3xl">{title || t("An unwritten world", "Un mundo por escribir")}</h1>
      </div>
      <div className="toolbar">
        <Link href={"/posts/" + postId}>{t("Read approved version", "Leer versión aprobada")} ↗</Link>
        <Button
          variant="outline"
          disabled={busy}
          onClick={/** Save work privately without publishing or submitting it. */ function draft() {
            void run(/** Persist the current composition as a private draft. */ async function persistDraft() { await save(); });
          }}
        >
          {t("Save draft", "Guardar borrador")}
        </Button>
        <Button
          disabled={busy}
          onClick={/** Run the explicit apply or submit action. */ function submit() {
            void run(/** Save the draft and submit its changed targets. */ async function submitChanges() { await save(true); });
          }}
        >
          {role === "author" ? t("Apply my changes", "Aplicar mis cambios") : t("Submit for approval", "Enviar para aprobación")}
        </Button>
      </div>
    </div>
  );
}
