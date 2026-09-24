"use client";

import { useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";

// Require a meaningful explanation that the audit log can attribute to the approver.
const MIN_REASON_LENGTH = 12;

/** Expand a deliberate, accessible confirmation for either unverified preview policy. */
export function NewsEvidenceOverride({ onPublish, mode = "failed" }: { onPublish: (reason: string) => Promise<void>; mode?: "failed" | "skipped" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(/** Move keyboard focus to the newly revealed reason field. */ function focusReason() { if (open) reasonRef.current?.focus(); }, [open]);

  /** Send the protected request only after both explicit confirmations are complete. */
  async function publish() {
    if (busy || !acknowledged || reason.trim().length < MIN_REASON_LENGTH) return;
    setBusy(true);
    setError("");
    try { await onPublish(reason.trim()); setOpen(false); }
    catch (failure) { setError(failure instanceof Error ? failure.message : t("Publication failed.", "La publicación falló.")); }
    finally { setBusy(false); }
  }

  return <div className="news-override-action">
    <Button ref={triggerRef} variant="outline" disabled={busy} aria-expanded={open} aria-controls="news-override-confirmation" onClick={/** Toggle the editorial approval without publishing. */ function toggle() { setOpen(!open); setError(""); }}><TriangleAlert aria-hidden="true" />{mode === "skipped" ? t("Review and publish", "Revisar y publicar") : t("Publish with exception", "Publicar con excepción")}</Button>
    {open ? <div id="news-override-confirmation" className="news-override-confirmation">
      <strong>{mode === "skipped" ? t("Publish without a claim fact-check?", "¿Publicar sin verificar las afirmaciones?") : t("Publish despite failed fact-check?", "¿Publicar pese a no superar la verificación?")}</strong>
      <p>{mode === "skipped" ? t("This preview was not fact-checked against the original material. Review both languages and original sources before approving. Sources must still be reachable, safety moderation must pass, and readers will see an unverified label. This will not activate scheduled publishing.", "Esta vista previa no contrastó sus afirmaciones con el material original. Revisa ambos idiomas y las fuentes originales antes de aprobar. Las fuentes deben seguir accesibles, la moderación de seguridad debe aprobarse y los lectores verán una etiqueta de contenido no verificado. Esto no activará la publicación programada.") : t("Some statements or citations may not be supported. An official page may have changed since the draft was captured; publication will use the retained snapshot and readers will see a warning. Sources must still be reachable, and safety moderation must pass. This will not activate scheduled publishing.", "Algunas afirmaciones o citas podrían no estar respaldadas. Una página oficial puede haber cambiado desde que se guardó el borrador; la publicación usará la copia conservada y los lectores verán un aviso. Las fuentes deben seguir accesibles y la moderación de seguridad debe aprobarse. Esto no activará la publicación programada.")}</p>
      <label htmlFor="news-override-reason">{mode === "skipped" ? t("Why are you approving this preview?", "¿Por qué apruebas esta vista previa?") : t("Why are you approving this exception?", "¿Por qué apruebas esta excepción?")}</label>
      <Textarea ref={reasonRef} id="news-override-reason" value={reason} minLength={MIN_REASON_LENGTH} maxLength={1000} aria-describedby="news-override-reason-help" onChange={/** Keep the administrator's audit reason in this form only. */ function update(event) { setReason(event.target.value); }} />
      <small id="news-override-reason-help">{t("Write at least 12 characters. This reason is kept in the administrator audit record, not shown publicly.", "Escribe al menos 12 caracteres. Este motivo se conserva en el registro de auditoría, no se muestra públicamente.")}</small>
      <label className="news-override-check"><input type="checkbox" checked={acknowledged} onChange={/** Record the explicit acknowledgement before enabling publication. */ function change(event) { setAcknowledged(event.target.checked); }} />{mode === "skipped" ? t("I reviewed both languages and understand that claims were not fact-checked and an official page may have changed.", "He revisado ambos idiomas y entiendo que las afirmaciones no se verificaron y una página oficial puede haber cambiado.") : t("I reviewed both languages and accept the failed fact-check and possible source changes.", "He revisado ambos idiomas y acepto la verificación fallida y los posibles cambios en las fuentes.")}</label>
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      <div className="news-actions"><Button variant="destructive" disabled={busy || !acknowledged || reason.trim().length < MIN_REASON_LENGTH} onClick={/** Submit the final protected approval request. */ function confirm() { void publish(); }}>{busy ? t("Checking safeguards…", "Comprobando protecciones…") : mode === "skipped" ? t("Confirm public publication", "Confirmar publicación pública") : t("Confirm public exception", "Confirmar excepción pública")}</Button><Button variant="ghost" disabled={busy} onClick={/** Close the form and restore keyboard focus to its trigger. */ function cancel() { setOpen(false); setError(""); triggerRef.current?.focus(); }}>{t("Cancel", "Cancelar")}</Button></div>
    </div> : null}
  </div>;
}
