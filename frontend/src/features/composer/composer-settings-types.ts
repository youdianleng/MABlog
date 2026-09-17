import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Block, Composition, WorkingCopy } from "@/lib/api";

export type Translator = (english: string, spanish: string) => string;

export interface ComposerSettingsProps {
  postId: string;
  t: Translator;
  current: Composition;
  canvas: Composition["canvas"];
  block?: Block;
  selected: string;
  change: (document: Composition) => void;
  patchBlock: (patch: Partial<Block>) => void;
  removeBlock: (identifier: string) => void;
  setSelected: Dispatch<SetStateAction<string>>;
  run: (action: () => Promise<unknown>) => Promise<void>;
  workingRef: MutableRefObject<WorkingCopy | null>;
  setWorking: Dispatch<SetStateAction<WorkingCopy | null>>;
  setDirty: Dispatch<SetStateAction<boolean>>;
  historyRef: MutableRefObject<Composition[]>;
  futureRef: MutableRefObject<Composition[]>;
}

