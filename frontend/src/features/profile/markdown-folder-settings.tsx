"use client";
import { FileDown, FolderCheck, FolderOpen, FolderX, ShieldAlert } from "lucide-react";
import { AI_NEWS_INSTRUCTIONS_FILENAME } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useMarkdownDirectory } from "./use-markdown-directory";

/**
 * Profile panel for choosing the local folder where MAblog may save Markdown (.md) files.
 *
 * The choice stays in this browser for this account and is never uploaded. It sits outside the
 * profile form so its buttons do not submit profile changes.
 */
export function MarkdownFolderSettings({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const {
    status,
    folderName,
    error,
    savedAt,
    saving,
    choose,
    reauthorize,
    forget,
    saveInstructions,
  } = useMarkdownDirectory(userId);

  return (
    <section className="markdown-folder-panel" aria-labelledby="markdown-folder-title">
      <h2 id="markdown-folder-title">{t("Markdown folder", "Carpeta Markdown")}</h2>
      <p>
        {t(
          "Choose a folder on this computer where MAblog can save Markdown (.md) files. The folder stays on your device; MAblog can only write inside it and never sees its full path.",
          "Elige una carpeta de este ordenador donde MAblog pueda guardar archivos Markdown (.md). La carpeta permanece en tu dispositivo; MAblog solo puede escribir dentro de ella y nunca ve su ruta completa.",
        )}
      </p>

      {status === "unsupported" ? (
        <p className="markdown-folder-status is-warning" role="status">
          <ShieldAlert aria-hidden="true" />
          {t(
            "This browser cannot choose folders. Use Chrome or Edge on a desktop computer.",
            "Este navegador no puede elegir carpetas. Usa Chrome o Edge en un ordenador.",
          )}
        </p>
      ) : null}

      {status === "loading" ? (
        <p className="markdown-folder-status" role="status">
          {t("Checking the saved folder…", "Comprobando la carpeta guardada…")}
        </p>
      ) : null}

      {status === "none" ? (
        <p className="markdown-folder-status" role="status">
          <FolderX aria-hidden="true" />
          {t("No folder selected.", "Ninguna carpeta seleccionada.")}
        </p>
      ) : null}

      {status === "ready" || status === "needs-permission" ? (
        <p
          className={`markdown-folder-status${status === "ready" ? " is-ready" : " is-warning"}`}
          role="status"
        >
          {status === "ready" ? (
            <FolderCheck aria-hidden="true" />
          ) : (
            <ShieldAlert aria-hidden="true" />
          )}
          <span>
            <strong className="markdown-folder-name">{folderName}</strong>
            {status === "ready"
              ? t(" · ready to save files", " · lista para guardar archivos")
              : t(
                  " · the browser needs your permission again",
                  " · el navegador necesita tu permiso de nuevo",
                )}
          </span>
        </p>
      ) : null}

      {status === "ready" ? (
        <div className="markdown-folder-instructions">
          <div>
            <strong>{t("AI-news instructions", "Instrucciones de noticias IA")}</strong>
            <p>
              {t(
                `Save the current research and model-file rules as ${AI_NEWS_INSTRUCTIONS_FILENAME}. Saving again replaces the older copy.`,
                `Guarda las reglas actuales de investigación y fichas de modelo como ${AI_NEWS_INSTRUCTIONS_FILENAME}. Guardar de nuevo sustituye la copia anterior.`,
              )}
            </p>
          </div>
          <Button
            type="button"
            disabled={saving}
            onClick={
              /** Download the instructions and write them into the chosen folder. */ function save() {
                void saveInstructions();
              }
            }
          >
            <FileDown aria-hidden="true" />
            {saving
              ? t("Saving…", "Guardando…")
              : t("Save AI-news instructions", "Guardar instrucciones de noticias IA")}
          </Button>
          {savedAt ? (
            <p className="markdown-folder-saved" role="status">
              {t(
                `Saved ${AI_NEWS_INSTRUCTIONS_FILENAME} at ${savedAt}.`,
                `${AI_NEWS_INSTRUCTIONS_FILENAME} guardado a las ${savedAt}.`,
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="notice error" role="alert">
          {error}
        </p>
      ) : null}

      {status !== "unsupported" && status !== "loading" ? (
        <div className="markdown-folder-actions">
          {status === "needs-permission" ? (
            <Button
              type="button"
              onClick={
                /** Ask the browser to restore write access to the saved folder. */ function allow() {
                  void reauthorize();
                }
              }
            >
              {t("Allow access", "Permitir acceso")}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={status === "none" ? "default" : "outline"}
            onClick={
              /** Open the browser folder picker. */ function select() {
                void choose();
              }
            }
          >
            <FolderOpen aria-hidden="true" />
            {status === "none"
              ? t("Choose folder", "Elegir carpeta")
              : t("Change folder", "Cambiar carpeta")}
          </Button>
          {status === "ready" || status === "needs-permission" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={
                /** Forget the saved folder in this browser. */ function clear() {
                  void forget();
                }
              }
            >
              {t("Forget folder", "Olvidar carpeta")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
