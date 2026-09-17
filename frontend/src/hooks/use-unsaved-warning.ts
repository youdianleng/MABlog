"use client";
import { useEffect } from "react";

/** Ask the browser to confirm navigation while an in-memory draft has unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(
    /** Register the browser navigation guard for the current dirty state. */ function preserveUnsaved() {
      /** Mark navigation as requiring browser confirmation when edits are pending. */
      function warn(event: BeforeUnloadEvent) {
        if (dirty) {
          event.preventDefault();
          event.returnValue = "";
        }
      }
      window.addEventListener("beforeunload", warn);
      return /** Remove the navigation guard when its consumer unmounts or state changes. */ function cleanup() { window.removeEventListener("beforeunload", warn); };
    },
    [dirty],
  );
}
