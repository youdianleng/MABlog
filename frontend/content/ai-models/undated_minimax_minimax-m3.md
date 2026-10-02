---
schema: mablog-ai-model/1
review_status: draft
slug: minimax-m3
title_en: "MiniMax M3: an open-weight coding model with a 1M-token context"
title_es: "MiniMax M3: un modelo de código de pesos abiertos con 1M de contexto"
provider: MiniMax
provider_key: minimax
model: MiniMax M3
version: M3
family: minimax-m
superseded_by: null
category: llm-agents
release_date: null
status: generally_available
access:
  - Subscription
  - API
regions: null
accent: violet
context_window: 1000000
official_sources:
  - url: "https://www.minimax.io/models/text/m3"
    label: "MiniMax: MiniMax M3 model page"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing: []
plans: []
benchmarks:
  - name: BrowseComp
    metric: Score
    score: "83.5"
    confidence_interval: null
    samples: null
    source_rank: null
    kind: self-reported
    source_label: MiniMax
    source_url: "https://www.minimax.io/models/text/m3"
    measured_at: 2026-10-02
    quote: "On BrowseComp, M3 scores 83.5, surpassing Opus 4.7 (79.3), demonstrating strong autonomous browsing and information retrieval capabilities."
    ranking: null
review_notes:
  - "Release date not published on the model page; find the dated announcement before review."
  - "The BrowseComp measured_at is the date the page was read (2026-10-02), because the page has no date."
  - "The page compares M3 with Opus 4.7 and GPT-5.5, which suggests it predates the September 2026 frontier releases."
  - "The page says M3 \"will soon be fully open-sourced on HuggingFace and GitHub\", so access does not list Open weights yet."
---

# English

## Summary

MiniMax M3 is the newest language model from MiniMax, listed as new on its model menu but published without a release date on the pages read. MiniMax describes it as natively multimodal and built for coding and agent work, using its own MiniMax Sparse Attention architecture to offer up to a 1M-token context window through the API, with a guaranteed minimum of 512K tokens. Among MiniMax's self-reported results, M3 scores 83.5 on BrowseComp, ahead of the 79.3 it reports for Claude Opus 4.7, and ranks third on PostTrainBench. Showcases include a nearly 12-hour autonomous replication of an ICLR paper and a 9.4-times speed-up of a CUDA kernel over about 24 hours. Developers can use it through the MiniMax API as MiniMax-M3 or through the M Plan subscription for AI coding tools, and MiniMax says it will soon publish the weights on Hugging Face and GitHub. Prices were not read for this file.

## Description

M3 succeeds the MiniMax M2.x models as the company's main language model. It combines coding, long context and image understanding in one model, which MiniMax presents as rare among open-weight releases. The comparisons on its page are against Opus 4.7 and GPT-5.5, so it was probably released before the September 2026 frontier models.

## What's new compared with the previous version

- Previous version: MiniMax M2.7.
- MiniMax Sparse Attention with up to 1M tokens of context (512K guaranteed).
- Native multimodality, trained on images and text from the start.
- Stronger coding and agent results, according to MiniMax.

## Key capabilities

- Coding and agentic tasks with tool use and multi-step reasoning.
- Up to 1,000,000 tokens of context through the API.
- Image and chart understanding.
- Automatic caching in the API.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| BrowseComp | 83.5 | self-reported | [MiniMax](https://www.minimax.io/models/text/m3) | 2026-10-02 |
| SWE-bench Verified | Not published | — | — | — |
| Terminal-Bench | Not published | — | — | — |
| Artificial Analysis Intelligence Index | Not published | — | — | — |
| Artificial Analysis Coding Agent Index | Not published | — | — | — |

## Pricing and availability

- API price: not published in the sources read.
- **M Plan:** subscription for AI coding tools; price not published in the sources read.
- Access: Subscription, API.
- Status: Generally available.

## Limitations and caveats

- Release date not published on the model page.
- Benchmark results are self-reported by MiniMax.
- Open weights are announced as coming soon, not yet available.

## Best for users / best for developers

- **Users:** Developers who use AI coding tools can reach it through MiniMax's M Plan or MiniMax Code without writing integration code.
- **Developers:** A 1M-token context, multimodal input and planned open weights make it worth testing for long-running coding agents.

## Sources

1. [MiniMax: MiniMax M3 model page](https://www.minimax.io/models/text/m3)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.

# Español

## Resumen

MiniMax M3 es el modelo de lenguaje más reciente de MiniMax, marcado como nuevo en su menú de modelos pero publicado sin fecha de lanzamiento en las páginas leídas. MiniMax lo describe como nativamente multimodal y pensado para programación y agentes, con su propia arquitectura MiniMax Sparse Attention, que ofrece hasta 1M de tokens de contexto mediante la API, con un mínimo garantizado de 512K. Entre los resultados autodeclarados por MiniMax, M3 obtiene 83,5 en BrowseComp, por delante de los 79,3 que atribuye a Claude Opus 4.7, y queda tercero en PostTrainBench. Entre sus demostraciones figuran la réplica autónoma de un artículo del ICLR durante casi 12 horas y una aceleración de 9,4 veces de un kernel CUDA en unas 24 horas. Los desarrolladores pueden usarlo mediante la API de MiniMax como MiniMax-M3 o con la suscripción M Plan para herramientas de programación, y MiniMax afirma que pronto publicará los pesos en Hugging Face y GitHub. No se leyeron precios para esta ficha.

## Descripción

M3 sucede a los modelos MiniMax M2.x como principal modelo de lenguaje de la empresa. Combina programación, contexto largo y comprensión de imágenes en un solo modelo, algo que MiniMax presenta como poco habitual entre los modelos de pesos abiertos. Las comparaciones de su página son con Opus 4.7 y GPT-5.5, así que probablemente salió antes de los modelos punteros de septiembre de 2026.

## Novedades respecto a la versión anterior

- Versión anterior: MiniMax M2.7.
- MiniMax Sparse Attention con hasta 1M de tokens de contexto (512K garantizados).
- Multimodalidad nativa, entrenado con imágenes y texto desde el principio.
- Mejores resultados en código y agentes, según MiniMax.

## Capacidades clave

- Programación y tareas agénticas con uso de herramientas y razonamiento en varios pasos.
- Hasta 1.000.000 de tokens de contexto mediante la API.
- Comprensión de imágenes y gráficos.
- Caché automática en la API.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| BrowseComp | 83.5 | autodeclarado | [MiniMax](https://www.minimax.io/models/text/m3) | 2026-10-02 |
| SWE-bench Verified | No publicado | — | — | — |
| Terminal-Bench | No publicado | — | — | — |
| Artificial Analysis Intelligence Index | No publicado | — | — | — |
| Artificial Analysis Coding Agent Index | No publicado | — | — | — |

## Precios y disponibilidad

- Precio de API: no publicado en las fuentes leídas.
- **M Plan:** suscripción para herramientas de programación; precio no publicado en las fuentes leídas.
- Acceso: Suscripción, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Fecha de lanzamiento no publicada en la página del modelo.
- Los resultados de benchmarks son autodeclarados por MiniMax.
- Los pesos abiertos están anunciados como próximos, todavía no disponibles.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Quien usa herramientas de programación con IA puede acceder a él con el M Plan de MiniMax o MiniMax Code sin escribir código de integración.
- **Desarrolladores:** Un contexto de 1M de tokens, entrada multimodal y pesos abiertos previstos hacen que merezca la pena probarlo en agentes de programación de larga duración.

## Fuentes

1. [MiniMax: MiniMax M3 model page](https://www.minimax.io/models/text/m3)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
