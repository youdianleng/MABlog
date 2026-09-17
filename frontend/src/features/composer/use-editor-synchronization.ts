"use client";
import { useEffect } from "react";
import type { Editor } from "@tiptap/core";

/** Synchronize externally restored HTML without recursively reporting another edit. */
export function useEditorSynchronization(editor: Editor | null, html: string) {
  useEffect(
    /** Replace Tiptap content only when undo, redo, or draft loading changed it externally. */ function synchronize() {
      if (editor && editor.getHTML() !== html)
        editor.commands.setContent(html, { emitUpdate: false });
    },
    [editor, html],
  );
}
