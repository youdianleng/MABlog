"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Pin, PinOff, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/feedback/loading";
import { useLanguage } from "@/lib/i18n";
import { fetchNewsRun, pinNewsRun, publishNewsPreview, retryNewsRun } from "./ai-news-api";
import { useNewsWorkspace } from "./ai-news-store";
import type { NewsRunDetail } from "./ai-news-types";

/** Show checkpoints, evidence, preview languages, and recovery actions for one run. */
export function NewsRunPanel({ onChanged }: { onChanged: () => Promise<void> }) {
  const { t } = useLanguage();
  const runId = useNewsWorkspace(/** Select only the open run identifier from transient state. */ function select(state) { return state.selectedRunId; });
  const close = useNewsWorkspace(/** Select the run-close action from transient state. */ function select(state) { return state.selectRun; });
  const [run, setRun] = useState<NewsRunDetail | null>(null), [error, setError] = useState("");
  useEffect(/** Load the selected retained run and refresh while its worker stage is active. */ function synchronize() {
    if (!runId) { setRun(null); return; }
    let active = true;
    const load = /** Read the selected run without clearing the previous result on failure. */ async function load() { try { const value = await fetchNewsRun(runId); if (active) { setRun(value); setError(""); } } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "Run unavailable"); } };
    void load();
    const timer = window.setInterval(load, 3000);
    return /** Stop the selected-run poll when closing or navigating away. */ function cleanup() { active = false; window.clearInterval(timer); };
  }, [runId]);
  /** Run a retained-record action and refresh both the detail and dashboard. */
  async function change(action: () => Promise<unknown>) { await action(); if (runId) setRun(await fetchNewsRun(runId)); await onChanged(); }
  if (!runId) return null;
  return (
    <aside className="news-run-drawer" aria-label={t("Run details", "Detalles de ejecución")}>
      <header><div><span className="eyebrow">{run?.kind ?? "RUN"}</span><h2>{t("Execution record", "Registro de ejecución")}</h2></div><button className="icon-button" aria-label={t("Close run details", "Cerrar detalles")} onClick={/** Close the selected run drawer. */ function dismiss() { close(null); }}><X size={18} /></button></header>
      {!run ? <Loading error={error} /> : <>
        <div className="news-run-summary"><span className={`news-status ${run.status}`}>{run.status}</span><strong>{run.progress}% · {run.stage}</strong><span>{new Date(run.created * 1000).toLocaleString()}</span></div>
        <div className="news-actions">
          {run.status === "failed" ? <Button variant="outline" onClick={/** Retry only the failed checkpoint. */ function retry() { void change(/** Invoke the failed-stage retry endpoint. */ function request() { return retryNewsRun(run.id); }); }}><RotateCcw aria-hidden="true" />{t("Retry stage", "Reintentar etapa")}</Button> : null}
          <Button variant="ghost" onClick={/** Toggle retention protection for this private record. */ function pin() { void change(/** Persist the inverse retention pin. */ function request() { return pinNewsRun(run.id, !run.pinned); }); }}>{run.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}{run.pinned ? t("Unpin", "Desfijar") : t("Pin", "Fijar")}</Button>
          {run.status === "preview" && run.edition?.status === "verified_preview" ? <Button onClick={/** Publish only the fully verified preview. */ function publish() { void change(/** Request the final source recheck and publication. */ function request() { return publishNewsPreview(run.id); }); }}>{t("Publish preview", "Publicar vista previa")}</Button> : null}
          {typeof run.result.post_id === "string" ? <Button asChild variant="outline"><Link href={`/posts/${run.result.post_id}`}>{t("Open post", "Abrir publicación")}<ExternalLink aria-hidden="true" /></Link></Button> : null}
        </div>
        {run.last_error ? <div className="notice error">{run.last_error}</div> : null}
        <section><h3>{t("Pipeline", "Proceso")}</h3><ol className="news-stage-list">{run.jobs.map(/** Render each durable checkpoint in execution order. */ function renderJob(job) { return <li key={job.id}><span className={`news-stage-dot ${job.status}`} /><div><strong>{job.stage}</strong><small>{job.status} · {job.attempts} {t("attempts", "intentos")}</small></div></li>; })}</ol></section>
        {run.edition ? <section><h3>{t("Generated preview", "Vista previa generada")}</h3><div className="news-preview-pair">{(["en", "es"] as const).map(/** Render a compact language preview without executable markup. */ function renderLanguage(language) { const document = run.edition?.documents?.[language]; return document ? <article key={language}><span>{language.toUpperCase()}</span><h4>{document.details.title}</h4><p>{document.details.summary}</p>{document.blocks.filter(/** Include readable article sections and omit the source catalog here. */ function articleBlock(block) { return block.type !== "sources"; }).map(/** Render the generated section text for administrator review. */ function renderBlock(block) { return <div key={block.id}><strong>{block.title}</strong>{block.paragraphs?.map(/** Render one preview paragraph. */ function renderParagraph(paragraph, index) { return <p key={index}>{paragraph.text} <small>{paragraph.citations.map(/** Render one noninteractive citation marker. */ function cite(number) { return `[${number}]`; }).join(" ")}</small></p>; })}</div>; })}</article> : null; })}</div></section> : null}
        <section><h3>{t("Qualified model updates", "Actualizaciones clasificadas")}</h3>{run.candidates.length ? <ul className="news-evidence-list">{run.candidates.map(/** Link each classified release to its official source. */ function renderCandidate(candidate) { return <li key={candidate.id}><div><strong>{candidate.provider} · {candidate.model_name}</strong><span>{candidate.update_type} · {candidate.status}</span></div><a href={candidate.official_url} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" size={15} /><span className="sr-only">{candidate.title}</span></a></li>; })}</ul> : <p>{t("No qualifying lifecycle update was found.", "No se encontró una actualización de ciclo de vida válida.")}</p>}</section>
      </>}
    </aside>
  );
}
