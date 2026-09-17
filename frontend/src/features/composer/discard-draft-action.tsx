import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Composition, WorkingCopy } from "@/lib/api";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { Translator } from "./composer-settings-types";

interface DiscardDraftActionProps {
  postId: string;
  t: Translator;
  run: (action: () => Promise<unknown>) => Promise<void>;
  setWorking: Dispatch<SetStateAction<WorkingCopy | null>>;
  setDirty: Dispatch<SetStateAction<boolean>>;
  historyRef: MutableRefObject<Composition[]>;
  futureRef: MutableRefObject<Composition[]>;
}

/** Confirm and discard only the current account's saved working copy. */
export function DiscardDraftAction({
  postId,
  t,
  run,
  setWorking,
  setDirty,
  historyRef,
  futureRef,
}: DiscardDraftActionProps) {
  /** Delete the saved draft and reload current approved content. */
  async function reloadApproved(): Promise<void> {
    await api("/posts/" + postId + "/draft", "DELETE");
    setWorking(await api<WorkingCopy>("/posts/" + postId + "/draft"));
    setDirty(false);
    historyRef.current = [];
    futureRef.current = [];
  }

  return (
    <Button
      variant="ghost"
      className="mt-6"
      onClick={/** Ask before permanently discarding this account's draft. */ function discard() {
        if (confirm(t("Discard your draft and reload approved content?", "¿Descartar el borrador y cargar la versión aprobada?"))) {
          void run(reloadApproved);
        }
      }}
    >
      {t("Discard draft", "Descartar borrador")}
    </Button>
  );
}


