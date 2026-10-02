---
schema: mablog-ai-model/1
review_status: draft
slug: deepseek-v4-1-flash
title_en: "DeepSeek-V4.1-Flash: the first model of DeepSeek's new architecture"
title_es: "DeepSeek-V4.1-Flash: el primer modelo de la nueva arquitectura de DeepSeek"
provider: DeepSeek
provider_key: deepseek
model: DeepSeek-V4.1-Flash
version: "4.1"
family: deepseek-flash
superseded_by: null
category: llm-agents
release_date: 2026-09-10
status: generally_available
access:
  - API
regions: null
accent: blue
context_window: 1000000
official_sources:
  - url: "https://api-docs.deepseek.com/updates"
    label: DeepSeek API change log
    published: 2026-09-10
  - url: "https://api-docs.deepseek.com/quick_start/pricing"
    label: "DeepSeek API: Models & Pricing"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 0.3
    output: 1.2
    amount: null
    currency: USD
    variant: "peak hours, cache miss (off-peak is half)"
    source_url: "https://api-docs.deepseek.com/quick_start/pricing"
    quote: "PEAK $0.3 $1.32 1M OUTPUT TOKENS OFF-PEAK $0.6 $1.98 PEAK $1.2 $3.96"
plans: []
benchmarks:
  - name: Terminal-Bench 4.0
    metric: Score
    score: "31.2"
    confidence_interval: null
    samples: null
    source_rank: null
    kind: self-reported
    source_label: DeepSeek
    source_url: "https://api-docs.deepseek.com/updates"
    measured_at: 2026-09-10
    quote: "Terminal-Bench 4.0: 31.2"
    ranking: null
  - name: DeepSWE v1.1
    metric: Score
    score: "74.2"
    confidence_interval: null
    samples: null
    source_rank: null
    kind: self-reported
    source_label: DeepSeek
    source_url: "https://api-docs.deepseek.com/updates"
    measured_at: 2026-09-10
    quote: "DeepSWE v1.1: 74.2"
    ranking: null
review_notes:
  - "The price quote is part of the pricing table: the first value after each PEAK label is the V4.1 Flash column ($0.3 input on cache miss, $1.2 output)."
  - Open-weights availability and the DeepSeek chat app were not checked.
---

# English

## Summary

DeepSeek-V4.1-Flash is DeepSeek's newest model, released on its API on September 10, 2026. DeepSeek describes it as the smallest model in a new architecture family designed for a higher capability ceiling, faster inference, higher throughput and scaling to larger models, and it adds native visual understanding. It replaces V4 Flash and the experimental V4 Flash Vision model, whose model names are temporarily routed to V4.1 Flash. Developers call it as deepseek-flash, with a 1M-token context, outputs of up to 384K tokens, thinking and non-thinking modes, tool calls and JSON output. DeepSeek cut prices with the release: at peak hours input costs $0.30 per million tokens on a cache miss and output $1.20 per million, and off-peak rates are half of that. DeepSeek's self-reported results include 31.2 on Terminal-Bench 4.0 and 74.2 on DeepSWE v1.1. The DeepSeek chat app and open weights were not covered in the sources read.

## Description

DeepSeek is a Chinese AI lab known for low API prices and open releases. V4.1 Flash is the first model of its next architecture and the new default fast model on the DeepSeek API, while V4 Pro remains available for heavier work. Native image understanding means one model now covers text and vision requests.

## What's new compared with the previous version

- Previous version: DeepSeek-V4-Flash (and the experimental V4-Flash-Vision-Exp).
- New architecture family aimed at faster inference, higher throughput and larger future models.
- Native multimodal visual understanding in the main Flash model.
- Lower API prices than the previous Flash model, according to DeepSeek.

## Key capabilities

- Text and image input, text output.
- 1M-token context and up to 384K output tokens.
- Thinking (default) and non-thinking modes; tool calls and JSON output.
- OpenAI-format and Anthropic-format APIs.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 31.2 | self-reported | [DeepSeek](https://api-docs.deepseek.com/updates) | 2026-09-10 |
| DeepSWE v1.1 | 74.2 | self-reported | [DeepSeek](https://api-docs.deepseek.com/updates) | 2026-09-10 |
| SWE-bench Verified | Not published | — | — | — |
| Artificial Analysis Intelligence Index | Not published | — | — | — |
| Artificial Analysis Coding Agent Index | Not published | — | — | — |

## Pricing and availability

- **API (peak hours):** $0.30 per 1M input tokens (cache miss), $0.006 on a cache hit, and $1.20 per 1M output tokens.
- **API (off-peak):** half of the peak rates.
- Plans: not applicable (pay-as-you-go balance).
- Access: API.
- Status: Generally available.

## Limitations and caveats

- Peak hours (01:00–04:00 and 06:00–10:00 UTC on weekdays) cost twice the off-peak rate.
- Benchmark results are self-reported by DeepSeek.

## Best for users / best for developers

- **Users:** Most people will use it through apps built on DeepSeek's API; the DeepSeek chat app was not covered in this file.
- **Developers:** Very low prices, a 1M-token context and native vision make it a strong budget option for agents and batch work, especially off-peak.

## Sources

1. [DeepSeek API change log](https://api-docs.deepseek.com/updates) (2026-09-10)
2. [DeepSeek API: Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.

# Español

## Resumen

DeepSeek-V4.1-Flash es el modelo más reciente de DeepSeek, lanzado en su API el 10 de septiembre de 2026. DeepSeek lo describe como el modelo más pequeño de una nueva familia de arquitectura pensada para un techo de capacidad más alto, inferencia más rápida, mayor rendimiento y modelos más grandes en el futuro, y añade comprensión visual nativa. Sustituye a V4 Flash y al modelo experimental V4 Flash Vision, cuyos nombres se redirigen temporalmente a V4.1 Flash. Los desarrolladores lo llaman como deepseek-flash, con 1M de tokens de contexto, salidas de hasta 384K tokens, modos con y sin razonamiento, llamadas a herramientas y salida JSON. DeepSeek bajó los precios con el lanzamiento: en horas punta la entrada cuesta 0,30 $ por millón de tokens sin caché y la salida 1,20 $ por millón, y fuera de las horas punta la tarifa es la mitad. Entre sus resultados autodeclarados figuran 31,2 en Terminal-Bench 4.0 y 74,2 en DeepSWE v1.1. Las fuentes leídas no cubrían la app de chat ni los pesos abiertos.

## Descripción

DeepSeek es un laboratorio chino de IA conocido por sus precios de API bajos y sus lanzamientos abiertos. V4.1 Flash es el primer modelo de su nueva arquitectura y el nuevo modelo rápido por defecto de su API, mientras V4 Pro sigue disponible para trabajos más pesados. La comprensión de imágenes nativa permite que un solo modelo atienda peticiones de texto y de visión.

## Novedades respecto a la versión anterior

- Versión anterior: DeepSeek-V4-Flash (y el experimental V4-Flash-Vision-Exp).
- Nueva familia de arquitectura orientada a inferencia más rápida, mayor rendimiento y modelos futuros más grandes.
- Comprensión visual multimodal nativa en el modelo Flash principal.
- Precios de API más bajos que el Flash anterior, según DeepSeek.

## Capacidades clave

- Entrada de texto e imagen, salida de texto.
- 1M de tokens de contexto y hasta 384K tokens de salida.
- Modos con razonamiento (por defecto) y sin razonamiento; llamadas a herramientas y salida JSON.
- APIs con formato de OpenAI y de Anthropic.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 31.2 | autodeclarado | [DeepSeek](https://api-docs.deepseek.com/updates) | 2026-09-10 |
| DeepSWE v1.1 | 74.2 | autodeclarado | [DeepSeek](https://api-docs.deepseek.com/updates) | 2026-09-10 |
| SWE-bench Verified | No publicado | — | — | — |
| Artificial Analysis Intelligence Index | No publicado | — | — | — |
| Artificial Analysis Coding Agent Index | No publicado | — | — | — |

## Precios y disponibilidad

- **API (horas punta):** 0,30 $ por 1M de tokens de entrada sin caché, 0,006 $ con caché, y 1,20 $ por 1M de tokens de salida.
- **API (fuera de horas punta):** la mitad de la tarifa punta.
- Planes: no aplica (saldo de prepago).
- Acceso: API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Las horas punta (01:00–04:00 y 06:00–10:00 UTC entre semana) cuestan el doble que el resto.
- Los resultados de benchmarks son autodeclarados por DeepSeek.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La mayoría lo usará a través de apps construidas sobre la API de DeepSeek; esta ficha no cubre la app de chat.
- **Desarrolladores:** Precios muy bajos, 1M de tokens de contexto y visión nativa lo convierten en una opción económica sólida para agentes y trabajo por lotes, sobre todo fuera de horas punta.

## Fuentes

1. [DeepSeek API change log](https://api-docs.deepseek.com/updates) (2026-09-10)
2. [DeepSeek API: Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
