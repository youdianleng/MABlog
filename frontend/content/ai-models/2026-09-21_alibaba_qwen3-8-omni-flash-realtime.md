---
schema: mablog-ai-model/1
review_status: reviewed
slug: qwen3-8-omni-flash-realtime
title_en: "Qwen3.8-Omni-Flash-Realtime: real-time audio and video conversations"
title_es: "Qwen3.8-Omni-Flash-Realtime: conversaciones de audio y vídeo en tiempo real"
provider: Alibaba
provider_key: alibaba
model: Qwen3.8-Omni-Flash-Realtime
version: "3.8"
family: qwen-omni-flash-realtime
superseded_by: null
category: voice-sound
release_date: 2026-09-21
status: generally_available
access:
  - API
regions: null
accent: gold
context_window: null
official_sources:
  - url: "https://www.alibabacloud.com/help/en/model-studio/newly-released-models"
    label: "Alibaba Cloud Model Studio: model releases"
    published: 2026-09-21
  - url: "https://www.alibabacloud.com/help/en/model-studio/model-pricing"
    label: "Alibaba Cloud Model Studio: model pricing"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 0.93
    output: 1.87
    amount: null
    currency: USD
    variant: "audio, Singapore"
    source_url: "https://www.alibabacloud.com/help/en/model-studio/model-pricing"
    quote: qwen3.8-omni-flash-realtime 0.23 0.93 0.70 1.87 1 million tokens
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

Qwen3.8-Omni-Flash-Realtime is the real-time version of Alibaba's Qwen3.8-Omni-Flash, added to Alibaba Cloud Model Studio on September 21, 2026, four days after the base model. It supports live audio and video interaction and answers with text and speech. Compared with earlier realtime Omni models, Alibaba lists new multichannel audio, video aggregation and remote MCP tools, and it can be reached over WebSocket, WebRTC and AOQ connections. In Model Studio's Singapore region it costs $0.23 per million text, image or video input tokens, $0.93 per million audio input tokens, $0.70 per million text output tokens and $1.87 per million audio output tokens, with a free quota of one million tokens for new users. Unlike the previous Qwen3.5 realtime models, it bills both the spoken audio and its matching text at their output rates. The sources read were Alibaba's release list and pricing page; no announcement post or benchmark results were found.

## Description

This model turns Alibaba's omni-modal understanding into a live conversation partner that can see through a camera, listen and talk back. Remote MCP tools let it call external services during a session, which suits voice and video agents for support and assistance.

## What's new compared with the previous version

- Previous version: the Qwen3.5-Omni-Realtime models.
- Multichannel audio and video aggregation.
- Remote MCP tools during live sessions.
- Bills both speech audio and its text transcript at output rates.

## Key capabilities

- Real-time audio and video input; text and audio output.
- WebSocket, WebRTC and AOQ connections.
- Remote MCP tool calls.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | Not published | — | — | — |

## Pricing and availability

- **API (Singapore):** input $0.23 (text, image, video) and $0.93 (audio) per 1M tokens; output $0.70 (text) and $1.87 (audio) per 1M tokens.
- Free quota: 1 million tokens for 90 days, in Singapore only.
- Access: API (Alibaba Cloud Model Studio).
- Status: Generally available.

## Limitations and caveats

- The free quota applies only in the Singapore region.
- Speech output is billed for both audio and its text, unlike Qwen3.5 realtime models.

## Best for users / best for developers

- **Users:** People will meet it as a voice or video assistant inside apps built on Alibaba Cloud.
- **Developers:** Low per-token audio prices, WebRTC support and MCP tools make it a budget option for live multimodal agents.

## Sources

1. [Alibaba Cloud Model Studio: model releases](https://www.alibabacloud.com/help/en/model-studio/newly-released-models) (2026-09-21)
2. [Alibaba Cloud Model Studio: model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

Qwen3.8-Omni-Flash-Realtime es la versión en tiempo real de Qwen3.8-Omni-Flash de Alibaba, añadida a Alibaba Cloud Model Studio el 21 de septiembre de 2026, cuatro días después del modelo base. Admite interacción en directo por audio y vídeo y responde con texto y voz. Frente a los modelos Omni en tiempo real anteriores, Alibaba menciona audio multicanal, agregación de vídeo y herramientas MCP remotas, y se puede conectar por WebSocket, WebRTC y AOQ. En la región de Singapur de Model Studio cuesta 0,23 $ por millón de tokens de entrada de texto, imagen o vídeo, 0,93 $ por millón de tokens de entrada de audio, 0,70 $ por millón de tokens de salida de texto y 1,87 $ por millón de tokens de salida de audio, con una cuota gratuita de un millón de tokens para nuevos usuarios. A diferencia de los modelos Qwen3.5 en tiempo real, cobra tanto el audio hablado como su texto a las tarifas de salida. Las fuentes leídas fueron la lista de lanzamientos y la página de precios de Alibaba; no se encontraron un anuncio ni resultados de benchmarks.

## Descripción

Este modelo convierte la comprensión omnimodal de Alibaba en un interlocutor en directo que puede ver a través de una cámara, escuchar y responder. Las herramientas MCP remotas le permiten llamar a servicios externos durante la sesión, lo que encaja con agentes de voz y vídeo para soporte y asistencia.

## Novedades respecto a la versión anterior

- Versión anterior: los modelos Qwen3.5-Omni-Realtime.
- Audio multicanal y agregación de vídeo.
- Herramientas MCP remotas durante las sesiones en directo.
- Cobra tanto el audio de voz como su transcripción a las tarifas de salida.

## Capacidades clave

- Entrada de audio y vídeo en tiempo real; salida de texto y audio.
- Conexiones WebSocket, WebRTC y AOQ.
- Llamadas a herramientas MCP remotas.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API (Singapur):** entrada a 0,23 $ (texto, imagen, vídeo) y 0,93 $ (audio) por 1M de tokens; salida a 0,70 $ (texto) y 1,87 $ (audio) por 1M de tokens.
- Cuota gratuita: 1 millón de tokens durante 90 días, solo en Singapur.
- Acceso: API (Alibaba Cloud Model Studio).
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- La cuota gratuita solo se aplica en la región de Singapur.
- La salida de voz se cobra por el audio y por su texto, a diferencia de los modelos Qwen3.5 en tiempo real.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La gente lo conocerá como asistente de voz o vídeo dentro de apps construidas sobre Alibaba Cloud.
- **Desarrolladores:** Precios bajos de audio por token, soporte de WebRTC y herramientas MCP lo convierten en una opción económica para agentes multimodales en directo.

## Fuentes

1. [Alibaba Cloud Model Studio: model releases](https://www.alibabacloud.com/help/en/model-studio/newly-released-models) (2026-09-21)
2. [Alibaba Cloud Model Studio: model pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
