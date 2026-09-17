"use client";
import { ChevronDown, Settings2 } from "lucide-react";
import { CanvasBoundsSettings } from "./canvas-bounds-settings";
import type { ComposerSettingsProps } from "./composer-settings-types";
import { DiscardDraftAction } from "./discard-draft-action";
import { LayerSettings } from "./layer-settings";
import { PostDetailsSettings } from "./post-details-settings";
import { SelectedBlockSettings } from "./selected-block-settings";

/** Compose focused post, canvas, block, layer, and draft settings sections. */
export function ComposerSettings(props: ComposerSettingsProps) {
  const {
    postId,
    t,
    current,
    block,
    change,
    patchBlock,
    removeBlock,
    setSelected,
    run,
    workingRef,
    setWorking,
    setDirty,
    historyRef,
    futureRef,
  } = props;

  return (
    <details className="editor-settings-menu">
      <summary>
        <Settings2 size={16} aria-hidden="true" />
        <span>{t("Post & canvas settings", "Ajustes de publicación y lienzo")}</span>
        <ChevronDown className="editor-settings-chevron" size={15} aria-hidden="true" />
      </summary>
      <aside className="editor-sidebar">
        <PostDetailsSettings
          postId={postId}
          t={t}
          current={current}
          change={change}
          run={run}
          workingRef={workingRef}
        />
        <CanvasBoundsSettings t={t} current={current} change={change} />
        {block ? (
          <SelectedBlockSettings
            t={t}
            current={current}
            block={block}
            patchBlock={patchBlock}
            change={change}
            select={setSelected}
            remove={removeBlock}
          />
        ) : null}
        <LayerSettings t={t} current={current} select={setSelected} />
        <DiscardDraftAction
          postId={postId}
          t={t}
          run={run}
          setWorking={setWorking}
          setDirty={setDirty}
          historyRef={historyRef}
          futureRef={futureRef}
        />
      </aside>
    </details>
  );
}


