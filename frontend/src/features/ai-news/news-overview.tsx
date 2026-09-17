"use client";
import { CalendarClock, CheckCircle2, CircleAlert, Play, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { runAndPublishNews, setNewsSchedule, startNewsPreview } from "./ai-news-api";
import { useNewsWorkspace } from "./ai-news-store";
import type { NewsStatus } from "./ai-news-types";

/** Present readiness, economy limits, schedule state, and retained run history. */
export function NewsOverview({ status, onChanged }: { status: NewsStatus; onChanged: () => Promise<void> }) {
  const { t } = useLanguage();
  const selectRun = useNewsWorkspace(/** Select the run-opening action without subscribing to unrelated state. */ function select(state) { return state.selectRun; });
  /** Perform a dashboard mutation and refresh current durable state. */
  async function change(action: () => Promise<unknown>) { await action(); await onChanged(); }
  const nextRun = status.schedule.next_run ? new Date(status.schedule.next_run * 1000).toLocaleString() : t("Not scheduled", "Sin programación");
  return <div className="news-overview">
    <section className="news-metric-grid">
      <article><Radar aria-hidden="true" /><span>{t("Readiness", "Preparación")}</span><strong>{status.readiness.ready ? t("Ready", "Lista") : t("Action needed", "Requiere acción")}</strong><small>{status.readiness.warnings.join(" · ") || t("All required services are configured", "Todos los servicios necesarios están configurados")}</small></article>
      <article><CalendarClock aria-hidden="true" /><span>{t("Next Monday scan", "Próximo análisis del lunes")}</span><strong>{nextRun}</strong><small>09:00 · Europe/Madrid</small></article>
      <article><span className="news-cost-mark">€</span><span>{t("Economy allowance", "Límite económico")}</span><strong>${status.budget.month_spend.toFixed(2)} / ${status.budget.month_limit.toFixed(2)}</strong><small>${status.budget.run_limit.toFixed(2)} {t("per run", "por ejecución")} · {status.budget.brave_limit} Brave queries</small></article>
    </section>
    <section className="news-command-bar">
      <div><span className={`news-live-light ${status.schedule.enabled ? "on" : ""}`} /><div><strong>{status.schedule.enabled ? t("Weekly publishing enabled", "Publicación semanal activada") : t("Weekly publishing is off", "La publicación semanal está desactivada")}</strong><small>{status.schedule.activation_preview_run_id ? t("A complete preview has passed", "Una vista previa completa ha sido aprobada") : t("Run a complete preview before activation", "Ejecuta una vista previa completa antes de activar")}</small></div></div>
      <div className="news-actions"><Button variant="outline" disabled={Boolean(status.active_run)} onClick={/** Start the required real no-side-effect preview. */ function preview() { void change(/** Request a current-window preview. */ function request() { return startNewsPreview(); }); }}><Play aria-hidden="true" />{t("Generate preview", "Generar vista previa")}</Button><Button variant="outline" disabled={Boolean(status.active_run)} onClick={/** Start the explicit immediate-publication workflow. */ function publishNow() { void change(runAndPublishNews); }}>{t("Run and publish", "Ejecutar y publicar")}</Button><Button disabled={!status.schedule.activation_preview_run_id} onClick={/** Toggle future scheduled starts after protected authorization. */ function schedule() { void change(/** Persist the opposite schedule state. */ function request() { return setNewsSchedule(!status.schedule.enabled); }); }}>{status.schedule.enabled ? t("Disable schedule", "Desactivar programación") : t("Enable schedule", "Activar programación")}</Button></div>
    </section>
    {status.active_run ? <button className="news-active-run" onClick={/** Open the currently running record. */ function openActive() { selectRun(status.active_run!.id); }}><span><span className="news-running-pulse" />{t("Pipeline active", "Proceso activo")}</span><strong>{status.active_run.stage}</strong><span>{status.active_run.progress}%</span><span className="news-progress"><i style={{ width: `${status.active_run.progress}%` }} /></span></button> : null}
    <section className="news-history"><header><div><span className="eyebrow">{t("OPERATIONS", "OPERACIONES")}</span><h2>{t("Recent executions", "Ejecuciones recientes")}</h2></div></header><div className="news-table" role="table"><div className="news-table-row heading" role="row"><span>{t("Result", "Resultado")}</span><span>{t("Window", "Periodo")}</span><span>{t("Pipeline", "Proceso")}</span><span>{t("Usage", "Uso")}</span></div>{status.recent_runs.map(/** Render one keyboard-accessible retained execution row. */ function renderRun(run) { const successful = ["published", "preview", "quiet"].includes(run.status); return <button className="news-table-row" role="row" key={run.id} onClick={/** Open this retained run in the detail drawer. */ function open() { selectRun(run.id); }}><span><i className={`news-result-icon ${successful ? "ok" : run.status === "failed" ? "error" : "working"}`}>{successful ? <CheckCircle2 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}</i><b>{run.status}</b><small>{run.kind}</small></span><span>{new Date(run.window_start * 1000).toLocaleDateString()} → {new Date(run.window_end * 1000).toLocaleDateString()}</span><span>{run.stage} · {run.progress}%</span><span>${run.openai_cost.toFixed(3)} · {run.brave_queries} q</span></button>; })}</div></section>
  </div>;
}
