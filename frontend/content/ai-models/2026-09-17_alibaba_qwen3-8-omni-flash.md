---
schema: mablog-ai-model/1
review_status: draft
slug: qwen3-8-omni-flash
title_en: "Qwen3.8-Omni-Flash: Alibaba's low-cost omni-modal understanding model"
title_es: "Qwen3.8-Omni-Flash: el modelo omnimodal económico de Alibaba"
provider: Alibaba
provider_key: alibaba
model: Qwen3.8-Omni-Flash
version: "3.8"
family: qwen-omni-flash
superseded_by: null
category: llm-agents
release_date: 2026-09-17
status: generally_available
access:
  - API
regions: null
accent: gold
context_window: null
official_sources:
  - url: "https://www.alibabacloud.com/help/en/model-studio/newly-released-models"
    label: "Alibaba Cloud Model Studio: model releases"
    published: 2026-09-17
  - url: "https://www.alibabacloud.com/help/en/model-studio/model-pricing"
    label: "Alibaba Cloud Model Studio: model pricing"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 0.15
    output: 0.47
    amount: null
    currency: USD
    variant: International deployment
    source_url: "https://www.alibabacloud.com/help/en/model-studio/model-pricing"
    quote: qwen3.8-omni-flash International USD 0.15 USD 0.016 USD 0.47
plans: []
benchmarks: []
review_notes:
  - "The International price row has three values; by the column order of the other regional tables they are input, cache-hit input and output per 1M tokens. Confirm the column headers in a browser."
  - "Only the Model Studio release list and pricing page were read; no announcement post or context window was found."
---

# English

## Summary

Qwen3.8-Omni-Flash is an omni-modal model from Alibaba's Qwen team, added to Alibaba Cloud Model Studio on September 17, 2026. It accepts text, image, audio and video input and returns text, with thinking and non-thinking modes, function calling, web search and context caching. Alibaba lists it for audio and video understanding, multimodal analysis and agent applications. In the International deployment it costs $0.15 per million input tokens, $0.016 per million cached input tokens and $0.47 per million output tokens, and the Global deployment is cheaper still at $0.113 and $0.382. A companion real-time model, qwen3.8-omni-flash-realtime, followed on September 21 for spoken conversations. The sources read for this file were Alibaba's release list and pricing page; no announcement post, benchmark results or context window were found, and availability in the Qwen consumer app was not checked.

## Description

The Omni line is Alibaba's family of models that understand every common media type in one request. The Flash tier is the low-cost option, suited to analysing calls, meetings and videos at scale or to agents that need to look at and listen to their inputs.

## What's new compared with the previous version

- Previous version: Qwen3.5-Omni-Flash.
- Thinking and non-thinking modes with function calling and web search.
- Context caching for audio and video understanding.

## Key capabilities

- Text, image, audio and video input; text output.
- Thinking and non-thinking modes.
- Function calling, web search and context caching.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | Not published | — | — | — |
| Terminal-Bench | Not published | — | — | — |
| Artificial Analysis Intelligence Index | Not published | — | — | — |
| Artificial Analysis Coding Agent Index | Not published | — | — | — |

## Pricing and availability

- **API (International):** $0.15 per 1M input tokens, $0.016 cached, and $0.47 per 1M output tokens.
- **API (Global):** $0.113 per 1M input tokens and $0.382 per 1M output tokens.
- Access: API (Alibaba Cloud Model Studio).
- Status: Generally available.

## Limitations and caveats

- Text output only; speech output needs the separate realtime model.
- No benchmark results were found in the sources read.

## Best for users / best for developers

- **Users:** This is a developer model; most people will meet it inside apps built on Alibaba Cloud.
- **Developers:** Very low prices for full audio and video understanding make it attractive for large-scale media analysis and multimodal agents.

## Sources

1. [Alibaba Cloud Model Studio: model releases](https://www.alibabacloud.com/help/en/model-studio/newly-released-models) (2026-09-17)
2. [Alibaba Cloud Model Studio: model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.

# Español

## Resumen

Qwen3.8-Omni-Flash es un modelo omnimodal del equipo Qwen de Alibaba, añadido a Alibaba Cloud Model Studio el 17 de septiembre de 2026. Acepta texto, imagen, audio y vídeo y devuelve texto, con modos con y sin razonamiento, llamadas a funciones, búsqueda web y caché de contexto. Alibaba lo recomienda para comprensión de audio y vídeo, análisis multimodal y aplicaciones con agentes. En el despliegue International cuesta 0,15 $ por millón de tokens de entrada, 0,016 $ por millón de tokens en caché y 0,47 $ por millón de tokens de salida, y el despliegue Global es aún más barato, con 0,113 $ y 0,382 $. Un modelo complementario en tiempo real, qwen3.8-omni-flash-realtime, llegó el 21 de septiembre para conversaciones habladas. Las fuentes leídas fueron la lista de lanzamientos y la página de precios de Alibaba; no se encontraron un anuncio, resultados de benchmarks ni la ventana de contexto, y no se comprobó su disponibilidad en la app Qwen.

## Descripción

La línea Omni es la familia de Alibaba que entiende todos los tipos de medios habituales en una sola petición. El nivel Flash es la opción económica, adecuada para analizar llamadas, reuniones y vídeos a gran escala o para agentes que necesitan ver y escuchar sus entradas.

## Novedades respecto a la versión anterior

- Versión anterior: Qwen3.5-Omni-Flash.
- Modos con y sin razonamiento, con llamadas a funciones y búsqueda web.
- Caché de contexto para comprensión de audio y vídeo.

## Capacidades clave

- Entrada de texto, imagen, audio y vídeo; salida de texto.
- Modos con y sin razonamiento.
- Llamadas a funciones, búsqueda web y caché de contexto.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | No publicado | — | — | — |
| Terminal-Bench | No publicado | — | — | — |
| Artificial Analysis Intelligence Index | No publicado | — | — | — |
| Artificial Analysis Coding Agent Index | No publicado | — | — | — |

## Precios y disponibilidad

- **API (International):** 0,15 $ por 1M de tokens de entrada, 0,016 $ en caché y 0,47 $ por 1M de tokens de salida.
- **API (Global):** 0,113 $ por 1M de tokens de entrada y 0,382 $ por 1M de salida.
- Acceso: API (Alibaba Cloud Model Studio).
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Solo salida de texto; la salida de voz requiere el modelo en tiempo real aparte.
- No se encontraron resultados de benchmarks en las fuentes leídas.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Es un modelo para desarrolladores; la mayoría lo encontrará dentro de apps construidas sobre Alibaba Cloud.
- **Desarrolladores:** Precios muy bajos para comprensión completa de audio y vídeo lo hacen atractivo para análisis de medios a gran escala y agentes multimodales.

## Fuentes

1. [Alibaba Cloud Model Studio: model releases](https://www.alibabacloud.com/help/en/model-studio/newly-released-models) (2026-09-17)
2. [Alibaba Cloud Model Studio: model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
