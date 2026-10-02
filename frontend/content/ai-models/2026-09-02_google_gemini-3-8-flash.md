---
schema: mablog-ai-model/1
review_status: reviewed
slug: gemini-3-8-flash
title_en: "Gemini 3.8 Flash: Google's most intelligent Flash model"
title_es: "Gemini 3.8 Flash: el modelo Flash más inteligente de Google"
provider: Google
provider_key: google
model: Gemini 3.8 Flash
version: "3.8"
family: gemini-flash
superseded_by: null
category: llm-agents
release_date: 2026-09-02
status: generally_available
access:
  - Free access
  - API
regions: null
accent: blue
context_window: null
official_sources:
  - url: "https://ai.google.dev/gemini-api/docs/changelog"
    label: Gemini API changelog
    published: 2026-09-02
  - url: "https://ai.google.dev/gemini-api/docs/pricing"
    label: Gemini Developer API pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 0.75
    output: 3.75
    amount: null
    currency: USD
    variant: introductory price through 2026-12-31
    source_url: "https://ai.google.dev/gemini-api/docs/pricing"
    quote: "Input price Free of charge $0.75 through December 31, 2026. $1.50 starting January 1, 2027."
  - unit: per-1m-tokens
    input: 1.5
    output: 7.5
    amount: null
    currency: USD
    variant: from 2027-01-01
    source_url: "https://ai.google.dev/gemini-api/docs/pricing"
    quote: "Output price (including thinking tokens) Free of charge $3.75 through December 31, 2026. $7.50 starting January 1, 2027."
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

Gemini 3.8 Flash is Google's newest Flash model, made generally available in the Gemini API on September 2, 2026, three weeks after Gemini 3.7 Flash. Google calls it its most intelligent Flash model, engineered for long-horizon software engineering, autonomous agents and complex enterprise workflows. Developers can try it free of charge in Google AI Studio within free-tier limits. On the paid tier it costs $0.75 per million input tokens and $3.75 per million output tokens, including thinking tokens, through December 31, 2026; from January 1, 2027 the price doubles to $1.50 and $7.50. Context caching and grounding with Google Search or Google Maps are billed separately. Google now recommends 3.8 Flash or 3.5 Flash-Lite for new projects instead of the 2.5 models. Availability in the Gemini app and in Google AI subscription plans was not stated in the sources read for this file.

## Description

Flash is Google's fast, lower-cost Gemini line, used for agents, coding assistants and high-volume production work. Version 3.8 continues the rapid cadence of 2026 Flash releases and targets longer autonomous tasks. Its introductory price runs until the end of 2026, so budgets should plan for the higher standard rate from January 2027.

## What's new compared with the previous version

- Previous version: Gemini 3.7 Flash (August 13, 2026).
- Google describes 3.8 as its most intelligent Flash model, aimed at long-horizon software engineering and autonomous agents.
- Introductory paid-tier price of $0.75 and $3.75 per million tokens until December 31, 2026.

## Key capabilities

- Text model for coding, agents and enterprise workflows, with thinking.
- Free tier in Google AI Studio and the Gemini API.
- Context caching and grounding with Google Search and Google Maps.
- Context window: not published in the sources read.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | Not published | — | — | — |
| Terminal-Bench | Not published | — | — | — |
| Artificial Analysis Intelligence Index | Not published | — | — | — |
| Artificial Analysis Coding Agent Index | Not published | — | — | — |

## Pricing and availability

- **API (until 2026-12-31):** $0.75 per 1M input tokens and $3.75 per 1M output tokens, including thinking tokens.
- **API (from 2027-01-01):** $1.50 per 1M input tokens and $7.50 per 1M output tokens.
- **Free tier:** free of charge within limits.
- Google AI subscription plans: not published for this model in the sources read.
- Access: Free access, API.
- Status: Generally available.

## Limitations and caveats

- The introductory price ends on December 31, 2026, after which prices double.
- Grounding with Google Search is free only up to 5,000 requests per month, shared across Gemini 3 models.

## Best for users / best for developers

- **Users:** Most people meet Flash models inside Google's apps; this file covers the developer release, so app availability still needs checking.
- **Developers:** A low introductory price, a free tier and a focus on long agentic tasks make it worth testing against Sol and Luna for coding agents.

## Sources

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-02)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

Gemini 3.8 Flash es el modelo Flash más reciente de Google, disponible de forma general en la API de Gemini desde el 2 de septiembre de 2026, tres semanas después de Gemini 3.7 Flash. Google lo presenta como su modelo Flash más inteligente, diseñado para ingeniería de software de largo recorrido, agentes autónomos y flujos empresariales complejos. Los desarrolladores pueden probarlo gratis en Google AI Studio dentro de los límites del nivel gratuito. En el nivel de pago cuesta 0,75 $ por millón de tokens de entrada y 3,75 $ por millón de salida, incluidos los tokens de razonamiento, hasta el 31 de diciembre de 2026; desde el 1 de enero de 2027 el precio se duplica a 1,50 $ y 7,50 $. La caché de contexto y el grounding con Google Search o Google Maps se cobran aparte. Google recomienda ahora 3.8 Flash o 3.5 Flash-Lite para proyectos nuevos en lugar de los modelos 2.5. Las fuentes leídas no indicaban su disponibilidad en la app de Gemini ni en los planes de suscripción de Google AI.

## Descripción

Flash es la línea rápida y más económica de Gemini, usada para agentes, asistentes de programación y trabajo de producción de gran volumen. La versión 3.8 sigue el rápido ritmo de lanzamientos Flash de 2026 y se orienta a tareas autónomas más largas. Su precio de lanzamiento dura hasta finales de 2026, así que conviene prever la tarifa estándar más alta a partir de enero de 2027.

## Novedades respecto a la versión anterior

- Versión anterior: Gemini 3.7 Flash (13 de agosto de 2026).
- Google describe 3.8 como su modelo Flash más inteligente, orientado a ingeniería de software de largo recorrido y agentes autónomos.
- Precio de lanzamiento en el nivel de pago de 0,75 $ y 3,75 $ por millón de tokens hasta el 31 de diciembre de 2026.

## Capacidades clave

- Modelo de texto para código, agentes y flujos empresariales, con razonamiento.
- Nivel gratuito en Google AI Studio y la API de Gemini.
- Caché de contexto y grounding con Google Search y Google Maps.
- Ventana de contexto: no publicada en las fuentes leídas.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | No publicado | — | — | — |
| Terminal-Bench | No publicado | — | — | — |
| Artificial Analysis Intelligence Index | No publicado | — | — | — |
| Artificial Analysis Coding Agent Index | No publicado | — | — | — |

## Precios y disponibilidad

- **API (hasta el 2026-12-31):** 0,75 $ por 1M de tokens de entrada y 3,75 $ por 1M de salida, incluidos los tokens de razonamiento.
- **API (desde el 2027-01-01):** 1,50 $ por 1M de tokens de entrada y 7,50 $ por 1M de salida.
- **Nivel gratuito:** gratis dentro de los límites.
- Planes de suscripción de Google AI: no publicados para este modelo en las fuentes leídas.
- Acceso: Acceso gratuito, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- El precio de lanzamiento termina el 31 de diciembre de 2026; después, los precios se duplican.
- El grounding con Google Search solo es gratis hasta 5.000 peticiones al mes, compartidas entre los modelos Gemini 3.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La mayoría usa los modelos Flash dentro de las apps de Google; esta ficha cubre la versión para desarrolladores, así que falta comprobar su disponibilidad en las apps.
- **Desarrolladores:** Un precio de lanzamiento bajo, un nivel gratuito y el foco en tareas agénticas largas hacen que merezca la pena compararlo con Sol y Luna para agentes de programación.

## Fuentes

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-02)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
