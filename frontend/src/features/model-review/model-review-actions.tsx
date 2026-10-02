"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveModelFile, type ModelReviewFile, returnModelFileToDraft } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import type { ReviewEntry } from "./use-model-review-folder";

// Mirrors the backend limits in app/schemas/ai_models.py.
const NOTE_LIMIT = 500;
const MIN_RETURN_REASON = 10;

/**
 * Approve a draft or return a reviewed file to draft.
 *
 * Approval needs the reviewer's explicit confirmation; returning needs a reason. Both send the
 * file version the reviewer loaded, so a file edited meanwhile is refused (409) instead of being
 * overwritten. The server also requires recent administrator verification (the panel at the top).
 *
 * @param onChanged receives the updated file record from the server
 */
export function ModelReviewActions({
  entry,
  onChanged,
}: {
  entry: ReviewEntry;
  onChanged: (record: ModelReviewFile) => void;
}) {
  const { t } = useLanguage();
  const [confirmed, setConfirmed] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const { parsed, record } = entry;

  /** Send the approval or return request and report the outcome. */
  async function submit(kind: "approve" | "return") {
    setBusy(true);
    setMessage("");
    try {
      const updated =
        kind === "approve"
          ? await approveModelFile(record.name, record.sha256, text.trim())
          : await returnModelFileToDraft(record.name, record.sha256, text.trim());
      setFailed(false);
      setMessage(
        kind === "approve"
          ? t("Approved. It now appears on /ai-models.", "Aprobado. Ya aparece en /ai-models.")
          : t(
              "Returned to draft. It no longer appears on /ai-models.",
              "Devuelto a borrador. Ya no aparece en /ai-models.",
            ),
      );
      setText("");
      setConfirmed(false);
      onChanged(updated);
    } catch (reason) {
      setFailed(true);
      setMessage(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (!parsed)
    return (
      <p className="notice error">
        {t(
          "This file breaks the model-file format, so it cannot be approved. Fix the file first.",
          "Este archivo no cumple el formato, así que no se puede aprobar. Corrígelo primero.",
        )}
      </p>
    );

  return (
    <section
      className="model-review-actions"
      aria-label={t("Review decision", "Decisión de revisión")}
    >
      {parsed.reviewed ? (
        <>
          <h3>{t("Return to draft", "Devolver a borrador")}</h3>
          <p>
            {t(
              "This removes the model's public profile. The reason is saved as a review note and in the update history.",
              "Esto retira el perfil público del modelo. El motivo se guarda como nota de revisión y en el historial.",
            )}
          </p>
          <Textarea
            aria-label={t("Reason", "Motivo")}
            value={text}
            maxLength={NOTE_LIMIT}
            placeholder={t("Why is this file going back to draft?", "¿Por qué vuelve a borrador?")}
            onChange={
              /** Keep the typed reason. */ function change(event) {
                setText(event.target.value);
              }
            }
          />
          <div className="model-review-buttons">
            <Button
              variant="destructive"
              disabled={busy || text.trim().length < MIN_RETURN_REASON}
              onClick={
                /** Return the file to draft. */ function returnToDraft() {
                  void submit("return");
                }
              }
            >
              {t("Return to draft", "Devolver a borrador")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3>{t("Approve", "Aprobar")}</h3>
          <p>
            {t(
              "Approving publishes this model's profile on /ai-models. Open review notes are cleared from the file and kept in its update history.",
              "Aprobar publica el perfil del modelo en /ai-models. Las notas abiertas se quitan del archivo y se conservan en su historial.",
            )}
          </p>
          <Textarea
            aria-label={t("Reviewer note (optional)", "Nota del revisor (opcional)")}
            value={text}
            maxLength={NOTE_LIMIT}
            placeholder={t("Optional note for the history", "Nota opcional para el historial")}
            onChange={
              /** Keep the typed note. */ function change(event) {
                setText(event.target.value);
              }
            }
          />
          <label className="model-review-confirm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={
                /** Record the reviewer's confirmation before enabling Approve. */ function change(
                  event,
                ) {
                  setConfirmed(event.target.checked);
                }
              }
            />
            {t(
              "I checked the prices, plans, and benchmarks against the linked sources and read both languages.",
              "He comprobado precios, planes y benchmarks con las fuentes enlazadas y he leído ambos idiomas.",
            )}
          </label>
          <div className="model-review-buttons">
            <Button
              disabled={busy || !confirmed}
              onClick={
                /** Approve the file. */ function approve() {
                  void submit("approve");
                }
              }
            >
              {t("Approve", "Aprobar")}
            </Button>
          </div>
        </>
      )}
      {message ? (
        <p className={failed ? "notice error" : "notice"} role={failed ? "alert" : "status"}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
