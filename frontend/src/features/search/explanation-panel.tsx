"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { SearchCitation, SearchResponse } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import type { ExplanationStatus } from "./search-store";

/** Replace a trusted numeric marker with its server-issued clickable post title. */
function citationPart(part: string, index: number, citations: SearchCitation[]): ReactNode {
  const match = /^\[(\d+)\]$/.exec(part);
  const citation = match ? citations.find(
    /** Match only a server-issued citation number; model prose cannot provide link destinations. */
    function findCitation(item) { return item.number === Number(match[1]); },
  ) : undefined;
  if (!citation) return <span key={index}>{part}</span>;
  return <Link className="answer-citation" href={citation.url} key={`${citation.number}-${index}`}>{citation.title}</Link>;
}

/** Render streamed prose while constraining links to permission-checked citation metadata. */
function ExplanationText({ text, citations }: { text: string; citations: SearchCitation[] }) {
  return <p>{text.split(/(\[\d+\])/g).map(
    /** Convert each prose or citation token into a safe React node. */
    function renderPart(part, index) { return citationPart(part, index, citations); },
  )}</p>;
}

/** Translate a stable fallback code without exposing provider or server details. */
function fallbackMessage(response: SearchResponse, t: (english: string, spanish: string) => string): string {
  if (response.fallback_reason === "ai_not_configured") return t("AI explanations will be available after the local API key is configured. Keyword results are ready below.", "Las explicaciones de IA estarán disponibles cuando se configure la clave API local. Los resultados por palabras están listos abajo.");
  if (response.fallback_reason === "enhanced_hourly_limit") return t("Your enhanced-search allowance will reset soon. Keyword results remain available.", "Tu límite de búsqueda mejorada se restablecerá pronto. Los resultados por palabras siguen disponibles.");
  if (response.fallback_reason === "enhanced_daily_limit") return t("Today's shared AI allowance has been reached. Keyword results remain available.", "Se alcanzó el límite compartido de IA de hoy. Los resultados por palabras siguen disponibles.");
  if (response.fallback_reason === "ai_unavailable") return t("The AI service is temporarily unavailable. Your ranked keyword results are preserved.", "El servicio de IA no está disponible temporalmente. Tus resultados por palabras se conservan.");
  return t("The retrieved posts do not contain enough cloud-enabled evidence for an explanation.", "Las publicaciones recuperadas no contienen suficiente evidencia habilitada para la nube para una explicación.");
}

/** Show the streamed match explanation above ranked results with a resilient status message. */
export function ExplanationPanel({ response, status, text, citations }: { response: SearchResponse; status: ExplanationStatus; text: string; citations: SearchCitation[] }) {
  const { t } = useLanguage();
  return (
    <section className={`explanation-panel ${status}`} aria-live="polite">
      <h2 className="explanation-heading">
        <Sparkles size={17} aria-hidden="true" />
        <span>{t("Why these stories match", "Por qué coinciden estas historias")}</span>
        {status === "streaming" && <span className="streaming-dot" aria-label={t("Writing explanation", "Escribiendo explicación")} />}
      </h2>
      {status === "unavailable" ? <p>{fallbackMessage(response, t)}</p> : null}
      {status === "failed" ? <p>{t("The explanation could not be completed, but your ranked results are still available.", "La explicación no pudo completarse, pero tus resultados ordenados siguen disponibles.")}</p> : null}
      {(status === "streaming" || status === "done") && text ? <ExplanationText text={text} citations={citations} /> : null}
      {status === "streaming" && !text ? <p className="answer-placeholder">{t("Reading the matched passages…", "Leyendo los fragmentos coincidentes…")}</p> : null}
      <small>{response.mode === "hybrid" ? t("Semantic and keyword ranking", "Clasificación semántica y por palabras") : t("Keyword ranking", "Clasificación por palabras")}</small>
    </section>
  );
}
