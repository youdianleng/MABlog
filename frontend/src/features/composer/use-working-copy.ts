"use client";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { api, WorkingCopy } from "@/lib/api";

export type WorkingCopyState = {
  working: WorkingCopy | null;
  setWorking: Dispatch<SetStateAction<WorkingCopy | null>>;
  workingRef: MutableRefObject<WorkingCopy | null>;
  error: string;
};

/** Load and retain the signed-in editor's private working copy for one post. */
export function useWorkingCopy(postId: string): WorkingCopyState {
  const [working, setWorking] = useState<WorkingCopy | null>(null);
  const [error, setError] = useState("");
  const workingRef = useRef(working);

  useEffect(
    /** Keep upload callbacks synchronized with the latest working copy. */
    function synchronizeWorkingRef() {
      workingRef.current = working;
    },
    [working],
  );

  useEffect(
    /** Fetch the post-specific draft whenever the composer identity changes. */
    function openDraft() {
      setError("");
      api<WorkingCopy>("/posts/" + postId + "/draft")
        .then(
          /** Store the successfully loaded private working copy. */
          function loaded(value) {
            setWorking(value);
          },
        )
        .catch(
          /** Expose a failure without replacing an already retained draft. */
          function failed(requestError) {
            setError(requestError.message);
          },
        );
    },
    [postId],
  );

  return { working, setWorking, workingRef, error };
}
