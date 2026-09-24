"use client";
import { ExternalLink, ShieldCheck } from "lucide-react";
import type { AiNewsCitation, AiNewsDocument } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

/** Render a safe citation link from the retained official-source catalog. */
function CitationLink({ citation }: { citation: AiNewsCitation }) {
  return <a className="ai-citation" href={citation.url} target="_blank" rel="noopener noreferrer" aria-label={`Source ${citation.number}: ${citation.title}`}>[{citation.number}]</a>;
}

/** Hide legacy trailing citation markers when the structured links already supply them. */
function paragraphText(value: string) {
  return value.replace(/(?:\s*\[\s*\d+(?:\s*,\s*\d+)*\s*\])+\s*$/, "").trimEnd();
}

/** Present one generated bilingual edition through responsive typed content blocks. */
export function AiNewsReader({ document, sourceCount, verifiedAt, correctionNote }: { document: AiNewsDocument; sourceCount: number; verifiedAt: number; correctionNote: string }) {
  const { t } = useLanguage();
  const focusLabels = {
    change: t("What changed", "Qué ha cambiado"),
    developer: t("For developers", "Para desarrolladores"),
    reader: t("For everyday users", "Para usuarios"),
    limitations: t("Limits and uncertainty", "Límites e incertidumbre"),
  };
  const citations = Object.fromEntries(document.blocks.flatMap(/** Collect only typed source citations for paragraph lookup. */ function collect(block) { return block.type === "sources" ? (block.citations ?? []).map(/** Pair a citation number with its record. */ function pair(citation) { return [citation.number, citation] as const; }) : []; }));
  return (
    <article className="ai-article">
      <div className="ai-verification" role="status">
        <ShieldCheck aria-hidden="true" size={18} />
        <div><strong>{t("AI-generated · verified by MAblog", "Generado por IA · verificado por MAblog")}</strong><span>{t(`${sourceCount} official sources`, `${sourceCount} fuentes oficiales`)} · {new Date(verifiedAt * 1000).toLocaleString()}</span></div>
      </div>
      {correctionNote ? <aside className="ai-correction"><strong>{t("Correction", "Corrección")}</strong><p>{correctionNote}</p></aside> : null}
      <div className="ai-tags" aria-label={t("Article tags", "Etiquetas del artículo")}>{document.tags.map(/** Render one language-neutral discovery tag. */ function renderTag(tag) { return <span key={tag}>{tag}</span>; })}</div>
      {document.blocks.map(/** Render overview, release, and source blocks in their verified order. */ function renderBlock(block) {
        if (block.type === "sources") return (
          <section className="ai-source-list" key={block.id} aria-labelledby="ai-sources-title">
            <h2 id="ai-sources-title">{t("Official sources", "Fuentes oficiales")}</h2>
            <ol>{(block.citations ?? []).map(/** Render one official source with visible destination context. */ function renderSource(citation) { return <li key={citation.number}><a href={citation.url} target="_blank" rel="noopener noreferrer"><span>[{citation.number}] {citation.title}</span><ExternalLink aria-hidden="true" size={15} /></a></li>; })}</ol>
          </section>
        );
        return (
          <section className={`ai-story-block ${block.type}`} key={block.id}>
            {block.title ? <h2>{block.title}</h2> : null}
            {(block.paragraphs ?? []).map(/** Pair one focused, verified paragraph with its inline numbered citations. */ function renderParagraph(paragraph, index) { return <div className="ai-story-part" key={`${block.id}-${index}`}>{paragraph.focus ? <h3>{focusLabels[paragraph.focus]}</h3> : null}<p>{paragraphText(paragraph.text)}{" "}{paragraph.citations.map(/** Link the citation number only when it exists in the immutable catalog. */ function renderCitation(number) { return citations[number] ? <CitationLink key={number} citation={citations[number]} /> : null; })}</p></div>; })}
            {block.type === "release" && (document.editorial_version ?? 1) >= 2 ? <aside className="ai-benchmark-panel" aria-label={t("Provider-published benchmarks", "Pruebas publicadas por el proveedor")}><h3>{t("Provider-published benchmarks", "Pruebas publicadas por el proveedor")}</h3><p className="ai-benchmark-note">{t("These are the provider's reported results, not independent MAblog tests. Scores from different setups are not directly comparable.", "Son resultados comunicados por el proveedor, no pruebas independientes de MAblog. Las cifras de configuraciones distintas no son directamente comparables.")}</p>{block.benchmarks?.length ? <ul>{block.benchmarks.map(/** Show each exact-evidence result with its own source links. */ function renderBenchmark(benchmark, index) { return <li key={`${block.id}-benchmark-${index}`}>{paragraphText(benchmark.text)}{" "}{benchmark.citations.map(/** Keep a source beside each provider-reported result. */ function renderCitation(number) { return citations[number] ? <CitationLink key={number} citation={citations[number]} /> : null; })}</li>; })}</ul> : <p className="ai-benchmark-empty">{t("No benchmark result was verified in the official sources reviewed for this edition.", "No se verificó ningún resultado de pruebas en las fuentes oficiales revisadas para esta edición.")}</p>}</aside> : null}
          </section>
        );
      })}
    </article>
  );
}
