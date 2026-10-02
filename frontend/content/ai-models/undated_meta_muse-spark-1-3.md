---
schema: mablog-ai-model/1
review_status: draft
slug: muse-spark-1-3
title_en: "Muse Spark 1.3: Meta's agent model for long-horizon coding"
title_es: "Muse Spark 1.3: el modelo agéntico de Meta para programación a largo plazo"
provider: Meta
provider_key: meta
model: Muse Spark 1.3
version: "1.3"
family: muse-spark
superseded_by: null
category: llm-agents
release_date: null
status: generally_available
access:
  - Free access
  - API
regions: null
accent: violet
context_window: null
official_sources:
  - url: https://ai.meta.com/llama
    label: Meta AI (official site; blocks scripted reading)
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 1.25
    output: 4.25
    amount: null
    currency: USD
    variant: independent price tracker
    source_url: https://www.eesel.ai/blog/muse-spark-1-3-pricing
    quote: null
    evidence: price-check-2026-10-01
plans: []
benchmarks:
  - name: Artificial Analysis
    metric: Coding Agent Index v1.5
    score: "54"
    confidence_interval: null
    samples: 303 tasks · 3 attempts/task
    source_rank: 4–5
    kind: independent
    source_label: Artificial Analysis
    source_url: https://artificialanalysis.ai/agents/coding-agents
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: coding
review_notes:
  - No official Meta announcement for Muse Spark 1.3 was found (Meta's blog index shows Muse Spark 1.1). Axios reports a 2026-09-02 release; release date left null under the official-source rule.
  - The migrated API price comes from independent price trackers, not a Meta page.
  - The snapshot's official link (ai.meta.com/llama) is a general page; replace it with the Muse Spark 1.3 announcement when available.
---

# English

## Summary

Muse Spark 1.3 is a multimodal agent family from Meta, tuned for long-horizon coding and available through Muse Code and the Meta Model API. In MAblog's production-coding ranking it scores 54 on the Artificial Analysis Coding Agent Index v1.5 and shares source range 4–5 with GLM-5.3, so the two are interchangeable on this benchmark. Its standard API price, as reported by independent price trackers, is $1.25 per million input tokens and $4.25 per million output tokens, the lowest token price among the five ranked coding families. Meta offers free access to Muse Spark in its own products. An official Meta announcement for version 1.3 with a release date, context window or plan details was not found when this file was written, so those details are marked as not published.

## Description

Muse Spark is the agent-oriented model family from Meta Superintelligence Labs. Version 1.3 is reached through Meta's own coding tool, Muse Code, and through the Meta Model API. On the coding-agent benchmark used by MAblog it performs close to GLM-5.3 and a few points behind Grok 4.7, while costing considerably less per token than the top models.

## What's new compared with the previous version

- Not published by the provider.

## Key capabilities

- Multimodal agent model tuned for long-horizon coding.
- Available in Muse Code and through the Meta Model API.

## Benchmarks

| Benchmark                              | Score         | Kind        | Source                                                                    | Date       |
| -------------------------------------- | ------------- | ----------- | ------------------------------------------------------------------------- | ---------- |
| Coding Agent Index v1.5                | 54            | independent | [Artificial Analysis](https://artificialanalysis.ai/agents/coding-agents) | 2026-09-22 |
| SWE-bench Verified                     | Not published | —           | —                                                                         | —          |
| Terminal-Bench                         | Not published | —           | —                                                                         | —          |
| Artificial Analysis Intelligence Index | Not published | —           | —                                                                         | —          |

## Pricing and availability

- **Comparable price on /ai-models:** $1.25 per 1M input tokens and $4.25 per 1M output tokens (independent price tracker); migrated from the 2026-10-01 price check.
- Subscription plans: not published for this model.
- Access: Free access, API.
- Status: Generally available.

## Limitations and caveats

- Release date, context window and plan details: not published in an official source found for this file.
- API price comes from independent trackers rather than a Meta price page.

## Best for users / best for developers

- **Users:** An approachable route into agentic coding through Muse Code and Meta AI products.
- **Developers:** Worth evaluating when multimodal inputs and an OpenAI-compatible API matter.

## Sources

1. [Meta AI (official site; blocks scripted reading)](https://ai.meta.com/llama)
2. [Artificial Analysis (evaluated 2026-09-22)](https://artificialanalysis.ai/agents/coding-agents)
3. [Price source (2026-10-01)](https://www.eesel.ai/blog/muse-spark-1-3-pricing)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.
- 2026-10-02 — `family` set to the version-free model line and `superseded_by` added (instructions v1.2).

# Español

## Resumen

Muse Spark 1.3 es una familia de agentes multimodales de Meta, ajustada para programación a largo plazo y disponible en Muse Code y la Meta Model API. En la clasificación de código de producción de MAblog obtiene 54 puntos en el Coding Agent Index v1.5 de Artificial Analysis y comparte el rango 4–5 de la fuente con GLM-5.3, así que ambos son intercambiables en este benchmark. Su precio estándar en la API, según rastreadores de precios independientes, es de 1,25 $ por millón de tokens de entrada y 4,25 $ por millón de salida, el precio por token más bajo de las cinco familias de código clasificadas. Meta ofrece acceso gratuito a Muse Spark en sus propios productos. No se encontró un anuncio oficial de Meta para la versión 1.3 con fecha de lanzamiento, ventana de contexto o planes, por lo que esos datos figuran como no publicados.

## Descripción

Muse Spark es la familia de modelos orientada a agentes de Meta Superintelligence Labs. La versión 1.3 se usa con Muse Code, la herramienta de programación de Meta, y mediante la Meta Model API. En el benchmark de agentes de programación que usa MAblog rinde de forma similar a GLM-5.3 y unos puntos por detrás de Grok 4.7, con un coste por token muy inferior al de los modelos punteros.

## Novedades respecto a la versión anterior

- No publicado por el proveedor.

## Capacidades clave

- Modelo agéntico multimodal ajustado para programación a largo plazo.
- Disponible en Muse Code y mediante la Meta Model API.

## Benchmarks

| Benchmark                              | Puntuación   | Tipo          | Fuente                                                                    | Fecha      |
| -------------------------------------- | ------------ | ------------- | ------------------------------------------------------------------------- | ---------- |
| Coding Agent Index v1.5                | 54           | independiente | [Artificial Analysis](https://artificialanalysis.ai/agents/coding-agents) | 2026-09-22 |
| SWE-bench Verified                     | No publicado | —             | —                                                                         | —          |
| Terminal-Bench                         | No publicado | —             | —                                                                         | —          |
| Artificial Analysis Intelligence Index | No publicado | —             | —                                                                         | —          |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 1,25 $ por 1M de tokens de entrada y 4,25 $ por 1M de salida (independent price tracker); valor migrado de la comprobación de precios del 2026-10-01.
- Planes de suscripción: no publicados para este modelo.
- Acceso: Acceso gratuito, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Fecha de lanzamiento, ventana de contexto y planes: no publicados en una fuente oficial encontrada para esta ficha.
- El precio de la API procede de rastreadores independientes, no de una página de precios de Meta.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Una vía accesible a la programación agéntica mediante Muse Code y los productos de Meta AI.
- **Desarrolladores:** Merece evaluación cuando importan las entradas multimodales y una API compatible con OpenAI.

## Fuentes

1. [Meta AI (official site; blocks scripted reading)](https://ai.meta.com/llama)
2. [Artificial Analysis (evaluado 2026-09-22)](https://artificialanalysis.ai/agents/coding-agents)
3. [Fuente de precio (2026-10-01)](https://www.eesel.ai/blog/muse-spark-1-3-pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
- 2026-10-02 — `family` pasa a ser la línea de modelo sin versión y se añade `superseded_by` (instrucciones v1.2).
