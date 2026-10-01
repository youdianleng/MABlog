"use client";
import { useEffect, useState } from "react";
import { AI_NEWS_INSTRUCTIONS_FILENAME, fetchAiNewsInstructions } from "@/lib/api";
import {
  forgetMarkdownDirectory,
  isDirectoryPickerSupported,
  loadMarkdownDirectory,
  markdownDirectoryPermission,
  pickMarkdownDirectory,
  saveMarkdownDirectory,
  writeMarkdownFile,
} from "@/lib/markdown-directory";

/**
 * - `unsupported`: the browser has no folder picker (Firefox, Safari, mobile).
 * - `loading`: reading the saved folder from this browser.
 * - `none`: no folder chosen for this account in this browser.
 * - `ready`: a folder is saved and writable now.
 * - `needs-permission`: a folder is saved but the browser wants the user to re-approve access.
 */
export type MarkdownDirectoryStatus =
  "unsupported" | "loading" | "none" | "ready" | "needs-permission";

/**
 * Load and manage the signed-in account's Markdown folder for this browser.
 *
 * `choose` and `reauthorize` open browser dialogs, so call them only from click handlers.
 * Errors are returned as an English message for the panel to show; cancelling the picker is not
 * an error.
 */
export function useMarkdownDirectory(userId: string) {
  const [status, setStatus] = useState<MarkdownDirectoryStatus>("loading");
  const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [error, setError] = useState("");
  // Local time of the last successful instruction save in this page view; empty when not saved.
  const [savedAt, setSavedAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(
    /** Read the saved folder and its current permission whenever the account changes. */
    function loadSavedDirectory() {
      if (!isDirectoryPickerSupported()) {
        setStatus("unsupported");
        return;
      }
      let live = true;
      setStatus("loading");
      // Read the handle, then its permission, and publish both only if this effect is still current.
      void (async function restore() {
        const saved = await loadMarkdownDirectory(userId);
        const permission = saved ? await markdownDirectoryPermission(saved) : null;
        if (!live) return;
        setHandle(saved);
        setStatus(!saved ? "none" : permission === "granted" ? "ready" : "needs-permission");
      })();
      return /** Ignore a load that finishes after the account changed. */ function cleanup() {
        live = false;
      };
    },
    [userId],
  );

  /** Pick a folder with read-write access and remember it for this account. */
  async function choose(): Promise<void> {
    setError("");
    try {
      const picked = await pickMarkdownDirectory();
      if (!picked) return;
      await saveMarkdownDirectory(userId, picked);
      setHandle(picked);
      setStatus("ready");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The folder could not be selected");
    }
  }

  /** Ask the browser to restore write access to the saved folder. */
  async function reauthorize(): Promise<void> {
    if (!handle) return;
    setError("");
    try {
      const permission = await markdownDirectoryPermission(handle, true);
      setStatus(permission === "granted" ? "ready" : "needs-permission");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Access could not be restored");
    }
  }

  /** Forget the saved folder in this browser; files already in the folder are kept. */
  async function forget(): Promise<void> {
    setError("");
    try {
      await forgetMarkdownDirectory(userId);
      setHandle(null);
      setStatus("none");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The folder could not be forgotten");
    }
  }

  /**
   * Download the master AI-news instructions and write them into the folder, replacing an older copy.
   *
   * Permission is confirmed first, while the click's user activation is still fresh: Chrome only
   * shows its permission prompt from a recent gesture, and the download could outlast it.
   */
  async function saveInstructions(): Promise<void> {
    if (!handle) return;
    setError("");
    setSaving(true);
    try {
      const permission = await markdownDirectoryPermission(handle, true);
      if (permission !== "granted") {
        setStatus("needs-permission");
        return;
      }
      setStatus("ready");
      const markdown = await fetchAiNewsInstructions();
      await writeMarkdownFile(handle, AI_NEWS_INSTRUCTIONS_FILENAME, markdown);
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The instructions could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return {
    status,
    folderName: handle?.name ?? "",
    error,
    savedAt,
    saving,
    choose,
    reauthorize,
    forget,
    saveInstructions,
  };
}
