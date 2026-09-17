"use client";
import { useEffect, useState } from "react";
import { BellRing, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { fetchNewsAlerts, readNewsAlert, setNewsEmail } from "./ai-news-api";
import type { NewsAlert } from "./ai-news-types";

/** Present mandatory in-app failures and the administrator's optional email setting. */
export function NewsAlerts() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<NewsAlert[]>([]), [email, setEmail] = useState(true), [error, setError] = useState("");
  /** Reload this administrator's alert receipts and email preference. */
  async function reload() { try { const value = await fetchNewsAlerts(); setAlerts(value.items); setEmail(value.email_enabled); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Alerts unavailable"); } }
  useEffect(/** Load alerts when their workspace tab opens. */ function initialize() { void reload(); }, []);
  /** Persist the optional email preference while retaining in-app receipts. */
  async function toggleEmail() { try { const value = await setNewsEmail(!email); setEmail(value.enabled); } catch (reason) { setError(reason instanceof Error ? reason.message : "Preference update failed"); } }
  /** Mark one alert receipt read and refresh its visual state. */
  async function read(id: string) { await readNewsAlert(id); await reload(); }
  return <section className="news-panel news-alert-panel"><header><div><span className="eyebrow">{t("ACTION REQUIRED", "ACCIÓN NECESARIA")}</span><h2>{t("Administrator notifications", "Notificaciones del administrador")}</h2></div><Button variant="outline" onClick={/** Toggle action-required email for this administrator. */ function toggle() { void toggleEmail(); }}><Mail aria-hidden="true" />{email ? t("Email on", "Correo activado") : t("Email off", "Correo desactivado")}</Button></header>{error ? <div className="notice error">{error}</div> : null}<div className="news-alert-list">{alerts.map(/** Render one administrator-specific read receipt. */ function renderAlert(alert) { return <article className={alert.read_at ? "read" : ""} key={alert.id}><BellRing aria-hidden="true" /><div><strong>{alert.title}</strong><p>{alert.message}</p><small>{new Date(alert.created * 1000).toLocaleString()} · {alert.email_status}</small></div>{!alert.read_at ? <Button variant="ghost" onClick={/** Mark this alert as read. */ function markRead() { void read(alert.id); }}><Check aria-hidden="true" />{t("Mark read", "Marcar leída")}</Button> : null}</article>; })}{!alerts.length ? <p className="news-empty"><Check aria-hidden="true" />{t("No action-required failures.", "No hay fallos que requieran acción.")}</p> : null}</div></section>;
}
