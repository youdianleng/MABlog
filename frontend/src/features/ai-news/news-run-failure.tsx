"use client";

import { useLanguage } from "@/lib/i18n";
import type { NewsRunDetail } from "./ai-news-types";

// Bound model-written notes so a malformed report cannot dominate the drawer.
const MAX_VISIBLE_ISSUES = 3;
const MAX_ISSUE_LENGTH = 420;

/** Keep only short plain-text reasons from the saved verifier report. */
function verifierReasons(report: Record<string, unknown> | undefined): string[] {
  const issues = report?.issues;
  if (!Array.isArray(issues)) return [];
  return issues.flatMap(/** Discard malformed or empty model-produced issue entries. */ function reason(value): string[] {
    if (!value || typeof value !== "object" || typeof value.reason !== "string") return [];
    const note = value.reason.trim();
    return note ? [note.slice(0, MAX_ISSUE_LENGTH)] : [];
  }).slice(0, MAX_VISIBLE_ISSUES);
}

/** Explain a retained pipeline failure without exposing raw provider responses. */
export function NewsRunFailure({ run }: { run: NewsRunDetail }) {
  const { t } = useLanguage();
  const verificationFailed = run.last_error === "verification_failed_after_repairs";
  const overridePublished = run.status === "published" && Boolean(run.edition?.verification?.manual_override);
  const reasons = verificationFailed ? verifierReasons(run.edition?.verification) : [];
  return <section className="news-run-failure" role="alert" aria-label={t("Run failure", "Error de ejecución")}>
    <strong>{overridePublished ? t("Published by administrator exception", "Publicado por excepción administrativa") : verificationFailed ? t("Fact-check could not approve this draft", "La verificación no pudo aprobar este borrador") : t("This run stopped before completion", "Esta ejecución se detuvo antes de terminar")}</strong>
    <p>{overridePublished
      ? t("The evidence check still failed. An administrator approved publication after safety and source rechecks; readers see an unverified-evidence warning.", "La verificación de evidencias sigue sin aprobarse. Un administrador autorizó la publicación tras revisar la seguridad y las fuentes; los lectores ven un aviso de evidencias no verificadas.")
      : verificationFailed
      ? t("This historical draft stayed private because a claim or citation did not match the eligible source evidence. Review the verifier note, or start a new ordinary preview without this phase. Retrying this old failed checkpoint rechecks its retained draft.", "Este borrador histórico siguió siendo privado porque una afirmación o cita no coincidía con las fuentes admitidas. Revisa la nota del verificador o inicia una nueva vista previa normal sin esta etapa. Reintentar el antiguo punto fallido vuelve a comprobar el borrador guardado.")
      : t("Open the failed pipeline stage below and check its technical code. You can retry the stage after addressing the cause.", "Consulta abajo la etapa fallida y su código técnico. Puedes reintentar la etapa tras corregir la causa.")}</p>
    {reasons.length ? <div className="news-run-failure-notes"><span>{t("Verifier note", "Nota del verificador")}</span><ul>{reasons.map(/** Render each saved reason as escaped text, never as markup. */ function renderReason(reason, index) { return <li key={index}>{reason}</li>; })}</ul></div> : null}
    <small>{t("Technical code", "Código técnico")}: <code>{run.last_error}</code></small>
  </section>;
}
