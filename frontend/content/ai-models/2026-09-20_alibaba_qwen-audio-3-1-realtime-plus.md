---
schema: mablog-ai-model/1
review_status: reviewed
slug: qwen-audio-3-1-realtime-plus
title_en: "Qwen-Audio-3.1-Realtime-Plus: Alibaba's duplex voice chat model"
title_es: "Qwen-Audio-3.1-Realtime-Plus: el modelo de voz dúplex de Alibaba"
provider: Alibaba
provider_key: alibaba
model: Qwen-Audio-3.1-Realtime-Plus
version: "3.1"
family: qwen-audio-realtime-plus
superseded_by: null
category: voice-sound
release_date: 2026-09-20
status: generally_available
access:
  - API
regions: null
accent: gold
context_window: null
official_sources:
  - url: "https://www.alibabacloud.com/help/en/model-studio/newly-released-models"
    label: "Alibaba Cloud Model Studio: model releases"
    published: 2026-09-20
  - url: "https://www.alibabacloud.com/help/en/model-studio/model-pricing"
    label: "Alibaba Cloud Model Studio: model pricing"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 6.4
    output: 24
    amount: null
    currency: USD
    variant: "audio, International"
    source_url: "https://www.alibabacloud.com/help/en/model-studio/model-pricing"
    quote: "qwen-audio-3.1-realtime-plus International $0.8 $6.4 $6.4 $24 1,000,000 tokens"
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

Qwen-Audio-3.1-Realtime-Plus is Alibaba's newest real-time voice conversation model, added to Alibaba Cloud Model Studio on September 20, 2026. It supports full-duplex speech conversations, so the user and the model can speak at the same time, and it uses the same integration protocol as Qwen-Audio-3.0-Realtime-Plus, which makes upgrading straightforward. It keeps the existing voices and adds eight new system voices, with a 262,144-token context window, function calling, web search and voice cloning. In the International deployment it costs $0.80 per million text input tokens and $6.40 per million audio input tokens, and $6.40 per million text output tokens and $24 per million audio output tokens, the same prices as version 3.0 Plus; new users get a free quota of one million tokens in Singapore. The sources read for this file were Alibaba's release list and pricing page; no announcement post or benchmark results were found.

## Description

The Qwen-Audio realtime line focuses on spoken conversation rather than video. The Plus tier is the higher-quality option, above Qwen-Audio-3.0-Realtime-Flash, and suits voice assistants and customer-service agents that need tools and a long memory of the conversation.

## What's new compared with the previous version

- Previous version: Qwen-Audio-3.0-Realtime-Plus.
- Eight new system voices, keeping the existing ones.
- Same integration protocol and the same prices as 3.0 Plus.

## Key capabilities

- Full-duplex real-time speech conversation.
- 262,144-token context window.
- Function calling, web search and voice cloning.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | Not published | — | — | — |

## Pricing and availability

- **API (International):** input $0.80 (text) and $6.40 (audio) per 1M tokens; output $6.40 (text) and $24 (audio) per 1M tokens.
- Free quota: 1 million tokens for 90 days, in Singapore only.
- Access: API (Alibaba Cloud Model Studio).
- Status: Generally available.

## Limitations and caveats

- Audio output is far more expensive than the Omni Flash realtime model.
- No benchmark results were found in the sources read.

## Best for users / best for developers

- **Users:** People will meet it as a voice assistant in apps and phone services built on Alibaba Cloud.
- **Developers:** A drop-in upgrade from 3.0 Plus with more voices, voice cloning and a long context for voice agents.

## Sources

1. [Alibaba Cloud Model Studio: model releases](https://www.alibabacloud.com/help/en/model-studio/newly-released-models) (2026-09-20)
2. [Alibaba Cloud Model Studio: model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

Qwen-Audio-3.1-Realtime-Plus es el modelo más reciente de Alibaba para conversaciones de voz en tiempo real, añadido a Alibaba Cloud Model Studio el 20 de septiembre de 2026. Admite conversaciones de voz full-dúplex, de modo que el usuario y el modelo pueden hablar a la vez, y usa el mismo protocolo de integración que Qwen-Audio-3.0-Realtime-Plus, lo que facilita la actualización. Mantiene las voces existentes y añade ocho voces de sistema nuevas, con una ventana de contexto de 262.144 tokens, llamadas a funciones, búsqueda web y clonación de voz. En el despliegue International cuesta 0,80 $ por millón de tokens de entrada de texto y 6,40 $ por millón de tokens de entrada de audio, y 6,40 $ por millón de tokens de salida de texto y 24 $ por millón de tokens de salida de audio, los mismos precios que la versión 3.0 Plus; los nuevos usuarios tienen una cuota gratuita de un millón de tokens en Singapur. Las fuentes leídas fueron la lista de lanzamientos y la página de precios de Alibaba; no se encontraron un anuncio ni resultados de benchmarks.

## Descripción

La línea Qwen-Audio en tiempo real se centra en la conversación hablada y no en el vídeo. El nivel Plus es la opción de mayor calidad, por encima de Qwen-Audio-3.0-Realtime-Flash, y encaja en asistentes de voz y agentes de atención al cliente que necesitan herramientas y una larga memoria de la conversación.

## Novedades respecto a la versión anterior

- Versión anterior: Qwen-Audio-3.0-Realtime-Plus.
- Ocho voces de sistema nuevas, manteniendo las existentes.
- Mismo protocolo de integración y mismos precios que 3.0 Plus.

## Capacidades clave

- Conversación de voz full-dúplex en tiempo real.
- Ventana de contexto de 262.144 tokens.
- Llamadas a funciones, búsqueda web y clonación de voz.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API (International):** entrada a 0,80 $ (texto) y 6,40 $ (audio) por 1M de tokens; salida a 6,40 $ (texto) y 24 $ (audio) por 1M de tokens.
- Cuota gratuita: 1 millón de tokens durante 90 días, solo en Singapur.
- Acceso: API (Alibaba Cloud Model Studio).
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- La salida de audio es mucho más cara que en el modelo Omni Flash en tiempo real.
- No se encontraron resultados de benchmarks en las fuentes leídas.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La gente lo conocerá como asistente de voz en apps y servicios telefónicos construidos sobre Alibaba Cloud.
- **Desarrolladores:** Una actualización directa desde 3.0 Plus con más voces, clonación de voz y un contexto largo para agentes de voz.

## Fuentes

1. [Alibaba Cloud Model Studio: model releases](https://www.alibabacloud.com/help/en/model-studio/newly-released-models) (2026-09-20)
2. [Alibaba Cloud Model Studio: model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
