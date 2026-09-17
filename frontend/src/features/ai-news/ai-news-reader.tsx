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
            {(block.paragraphs ?? []).map(/** Pair one verified paragraph with its inline numbered citations. */ function renderParagraph(paragraph, index) { return <p key={`${block.id}-${index}`}>{paragraphText(paragraph.text)}{" "}{paragraph.citations.map(/** Link the citation number only when it exists in the immutable catalog. */ function renderCitation(number) { return citations[number] ? <CitationLink key={number} citation={citations[number]} /> : null; })}</p>; })}
          </section>
        );
      })}
    </article>
  );
}
