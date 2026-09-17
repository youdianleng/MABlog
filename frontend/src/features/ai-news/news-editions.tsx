"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, FilePenLine, Globe2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { fetchNewsEditions, publishNewsEdition, unpublishNewsEdition } from "./ai-news-api";
import type { NewsEdition } from "./ai-news-types";
import { EditionEditor } from "./edition-editor";

/** List only MABlog_IA editions and expose retained correction/publication controls. */
export function NewsEditions() {
  const { t, locale } = useLanguage();
  const [editions, setEditions] = useState<NewsEdition[]>([]), [selected, setSelected] = useState<NewsEdition | null>(null), [reason, setReason] = useState("Quality review by administrator"), [error, setError] = useState("");
  /** Reload retained automated editions after a curator action. */
  async function reload() { try { setEditions(await fetchNewsEditions()); setError(""); } catch (reasonValue) { setError(reasonValue instanceof Error ? reasonValue.message : "Editions unavailable"); } }
  useEffect(/** Load the automated-edition register when its tab opens. */ function initialize() { void reload(); }, []);
  /** Remove one public edition immediately while keeping all history. */
  async function unpublish(edition: NewsEdition) { try { await unpublishNewsEdition(edition.id, reason); await reload(); } catch (reasonValue) { setError(reasonValue instanceof Error ? reasonValue.message : "Unpublish failed"); } }
  /** Publish an eligible verified retained edition after administrator review. */
  async function publish(edition: NewsEdition) { try { await publishNewsEdition(edition.id, reason); await reload(); } catch (reasonValue) { setError(reasonValue instanceof Error ? reasonValue.message : "Publish failed"); } }
  return <><section className="news-panel news-edition-panel"><header><div><span className="eyebrow">MABLOG_IA</span><h2>{t("Automated editions", "Ediciones automatizadas")}</h2></div><ShieldCheck aria-hidden="true" /></header><label className="news-action-reason">{t("Reason for the next publication action", "Motivo de la próxima acción de publicación")}<Input value={reason} maxLength={1000} onChange={/** Retain an auditable explanation for the next protected action. */ function updateReason(event) { setReason(event.target.value); }} /></label>{error ? <div className="notice error">{error}</div> : null}<div className="news-edition-list">{editions.map(/** Render one canonical bilingual edition and its valid actions. */ function renderEdition(edition) { const document = edition.documents?.[locale] ?? edition.documents?.en; return <article key={edition.id}><div className="news-edition-cover">{document?.details.cover ? <img src={document.details.cover} alt={document.cover_alt} /> : <Globe2 aria-hidden="true" />}</div><div><span className={`news-status ${edition.status}`}>{edition.status}</span><h3>{document?.details.title ?? t("Uncomposed edition", "Edición sin redactar")}</h3><p>{document?.details.summary}</p><small>{edition.source_count} {t("official sources", "fuentes oficiales")} · {new Date(edition.created * 1000).toLocaleDateString()}</small>{edition.correction_note ? <p className="news-correction-note"><strong>{t("Correction", "Corrección")}:</strong> {edition.correction_note}</p> : null}</div><div className="news-edition-actions">{edition.post_id && edition.status === "published" ? <Button asChild variant="outline"><Link href={`/posts/${edition.post_id}`}>{t("Open", "Abrir")}<ExternalLink aria-hidden="true" /></Link></Button> : null}{["published", "unpublished", "unpublished_contradicted", "corrected_verified"].includes(edition.status) ? <Button variant="outline" onClick={/** Open a private synchronized correction for this edition. */ function edit() { setSelected(edition); }}><FilePenLine aria-hidden="true" />{t("Correct", "Corregir")}</Button> : null}{edition.status === "published" ? <Button variant="destructive" disabled={reason.trim().length < 3} onClick={/** Immediately unpublish this automated edition. */ function remove() { void unpublish(edition); }}>{t("Unpublish", "Retirar")}</Button> : null}{["verified_preview", "corrected_verified", "unpublished"].includes(edition.status) ? <Button disabled={reason.trim().length < 3} onClick={/** Publish this eligible verified edition. */ function makePublic() { void publish(edition); }}>{t("Publish", "Publicar")}</Button> : null}</div></article>; })}</div></section>{selected ? <EditionEditor edition={selected} onClose={/** Close the private correction drawer. */ function close() { setSelected(null); }} onSaved={reload} /> : null}</>;
}
