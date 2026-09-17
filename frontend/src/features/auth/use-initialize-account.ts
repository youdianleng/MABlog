"use client";
import { useEffect } from "react";

/** Load account state once while allowing anonymous public reading on failure. */
export function useInitializeAccount(refresh: () => Promise<void>) {
  useEffect(
    /** Fetch the current session when the application shell mounts. */ function initializeAccount() {
      refresh().catch(
        /** Keep public pages usable when the account endpoint is unavailable. */ function unavailable() { /* Feature views expose their own availability errors. */ },
      );
    },
    [refresh],
  );
}
