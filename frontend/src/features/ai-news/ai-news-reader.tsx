"use client";
import { ExternalLink, ShieldCheck, TriangleAlert } from "lucide-react";
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
export function AiNewsReader({ document, sourceCount, verifiedAt, correctionNote, factCheckPassed, manualUnverifiedPreview, sourceChangedOnPublish }: { document: AiNewsDocument; sourceCount: number; verifiedAt: number; correctionNote: string; factCheckPassed: boolean; manualUnverifiedPreview: boolean; sourceChangedOnPublish: boolean }) {
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
      <div className={`ai-verification ${factCheckPassed ? "" : "manual-override"}`} role="status">
        {factCheckPassed ? <ShieldCheck aria-hidden="true" size={18} /> : <TriangleAlert aria-hidden="true" size={18} />}
        <div><strong>{factCheckPassed ? t("AI-generated · source-reviewed by MAblog", "Generado por IA · fuentes revisadas por MAblog") : manualUnverifiedPreview ? t("AI-generated · administrator-published without fact-check", "Generado por IA · publicado sin verificación por un administrador") : t("AI-generated · published by administrator exception", "Generado por IA · publicado por excepción administrativa")}</strong><span>{factCheckPassed ? <>{t(`${sourceCount} official sources`, `${sourceCount} fuentes oficiales`)} · {new Date(verifiedAt * 1000).toLocaleString()}</> : <>{manualUnverifiedPreview ? t("Claims were not checked against the provider's original material. Review the official sources below before relying on this report.", "Las afirmaciones no se contrastaron con el material original del proveedor. Consulta las fuentes oficiales antes de confiar en este artículo.") : t("The evidence fact-check did not pass. Some claims or citations may be unsupported; review the official sources below.", "La verificación de evidencias no fue aprobada. Algunas afirmaciones o citas podrían carecer de respaldo; consulta las fuentes oficiales más abajo.")}{sourceChangedOnPublish ? <> {t("At least one official page changed after this draft was captured, so its current contents may differ from the retained evidence.", "Al menos una página oficial cambió después de guardar este borrador; su contenido actual puede diferir de la evidencia conservada.")}</> : null}</>}</span></div>
      </div>
      {correctionNote ? <aside className="ai-correction"><strong>{t("Correction", "Corrección")}</strong><p>{correctionNote}</p></aside> : null}
      <div className="ai-tags" aria-label={t("Article tags", "Etiquetas del artículo")}>{document.tags.map(/** Render one language-neutral discovery tag. */ function renderTag(tag) { return <span key={tag}>{tag}</span>; })}</div>
      {document.blocks.map(/** Render overview, release, and source blocks in their retained order. */ function renderBlock(block) {
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
            {block.type === "release" && (document.editorial_version ?? 1) >= 2 ? <aside className="ai-benchmark-panel" aria-label={t("Provider-published benchmarks", "Pruebas publicadas por el proveedor")}><h3>{t("Provider-published benchmarks", "Pruebas publicadas por el proveedor")}</h3><p className="ai-benchmark-note">{t("These are the provider's reported results, not independent MAblog tests. Scores from different setups are not directly comparable.", "Son resultados comunicados por el proveedor, no pruebas independientes de MAblog. Las cifras de configuraciones distintas no son directamente comparables.")}</p>{block.benchmarks?.length ? <ul>{block.benchmarks.map(/** Show each provider-reported result with its retained source links. */ function renderBenchmark(benchmark, index) { return <li key={`${block.id}-benchmark-${index}`}>{paragraphText(benchmark.text)}{" "}{benchmark.citations.map(/** Keep a source beside each provider-reported result. */ function renderCitation(number) { return citations[number] ? <CitationLink key={number} citation={citations[number]} /> : null; })}</li>; })}</ul> : <p className="ai-benchmark-empty">{manualUnverifiedPreview ? t("No provider benchmark was included in this edition.", "Esta edición no incluye pruebas publicadas por el proveedor.") : t("No benchmark result was confirmed in the official sources reviewed for this edition.", "No se confirmó ningún resultado de pruebas en las fuentes oficiales revisadas para esta edición.")}</p>}</aside> : null}
          </section>
        );
      })}
    </article>
  );
}
