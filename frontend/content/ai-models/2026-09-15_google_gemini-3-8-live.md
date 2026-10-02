---
schema: mablog-ai-model/1
review_status: draft
slug: gemini-3-8-live
title_en: "Gemini 3.8 Live: Google's low-latency voice model for agents"
title_es: "Gemini 3.8 Live: el modelo de voz de baja latencia de Google para agentes"
provider: Google
provider_key: google
model: Gemini 3.8 Live
version: "3.8"
family: gemini-live
superseded_by: null
category: voice-sound
release_date: 2026-09-15
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
    published: 2026-09-15
  - url: "https://ai.google.dev/gemini-api/docs/pricing"
    label: Gemini Developer API pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 3
    output: 12
    amount: null
    currency: USD
    variant: audio
    source_url: "https://ai.google.dev/gemini-api/docs/pricing"
    quote: "Output price (including thinking tokens) Free of charge $4.50 (text) $12.00 or $0.018/min (audio)"
plans: []
benchmarks: []
review_notes:
  - "The pricing entry quotes the output row of the shared Live pricing table; the $3.00 audio input price is in the input row: \"Input price Free of charge $0.75 (text) $3.00 or $0.005/min (audio) $1.00 or $0.002/min (image/video)\"."
  - Gemini app availability was not checked.
---

# English

## Summary

Gemini 3.8 Live is Google's audio-to-audio model for real-time voice applications, made generally available in the Gemini API's Live API on September 15, 2026 together with Gemini 3.8 Live Extended Thinking. Google positions it as the default choice for most low-latency voice agents and real-time dialogue without reasoning delays. It adds interleaved reasoning, asynchronous function calling by default and full session updates of client content. Developers can try it free of charge in Google AI Studio within free-tier limits. On the paid tier, audio costs $3.00 per million input tokens or $0.005 per minute, and $12.00 per million output tokens or $0.018 per minute; text input is $0.75 and text output $4.50 per million tokens. Grounding with Google Search is supported and billed separately after a monthly free allowance. Availability in the Gemini app was not stated in the sources read for this file.

## Description

Live models let an app hold a spoken conversation with Gemini over a streaming connection. Gemini 3.8 Live is the fast default of the new pair, while the Extended Thinking variant trades some speed for background reasoning. Both are aimed at voice agents for customer service, assistants and other spoken interfaces.

## What's new compared with the previous version

- Previous version: Gemini 3.1 Flash Live Preview.
- Generally available instead of preview.
- Interleaved reasoning and asynchronous function calling by default.
- Full session client content updates.

## Key capabilities

- Audio-to-audio conversation through the Live API.
- Text, audio, image and video input; text and audio output.
- Function calling and grounding with Google Search.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | Not published | — | — | — |

## Pricing and availability

- **API (audio):** $3.00 per 1M input tokens ($0.005 per minute) and $12.00 per 1M output tokens ($0.018 per minute).
- **API (text):** $0.75 per 1M input tokens and $4.50 per 1M output tokens.
- **Free tier:** free of charge within limits.
- Access: Free access, API.
- Status: Generally available.

## Limitations and caveats

- Grounding with Google Search is free only up to 5,000 requests per month, shared across Gemini 3 models.
- No independent speech-arena score was found for this model.

## Best for users / best for developers

- **Users:** People will mostly meet Gemini Live voices inside Google's apps; this file covers the developer release.
- **Developers:** A generally available, low-latency Live model with a free tier and per-minute audio pricing is a practical base for voice agents.

## Sources

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-15)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.

# Español

## Resumen

Gemini 3.8 Live es el modelo de audio a audio de Google para aplicaciones de voz en tiempo real, disponible de forma general en la Live API de Gemini desde el 15 de septiembre de 2026, junto a Gemini 3.8 Live Extended Thinking. Google lo presenta como la opción por defecto para la mayoría de agentes de voz de baja latencia y diálogos en tiempo real sin esperas de razonamiento. Añade razonamiento intercalado, llamadas a funciones asíncronas por defecto y actualizaciones completas del contenido del cliente durante la sesión. Los desarrolladores pueden probarlo gratis en Google AI Studio dentro de los límites del nivel gratuito. En el nivel de pago, el audio cuesta 3,00 $ por millón de tokens de entrada o 0,005 $ por minuto, y 12,00 $ por millón de tokens de salida o 0,018 $ por minuto; el texto cuesta 0,75 $ de entrada y 4,50 $ de salida por millón de tokens. Admite grounding con Google Search, que se cobra aparte tras una cuota mensual gratuita. Las fuentes leídas no indicaban su disponibilidad en la app de Gemini.

## Descripción

Los modelos Live permiten que una app mantenga una conversación hablada con Gemini mediante una conexión en streaming. Gemini 3.8 Live es la opción rápida por defecto de la nueva pareja, mientras que la variante Extended Thinking cambia algo de velocidad por razonamiento en segundo plano. Ambos se dirigen a agentes de voz para atención al cliente, asistentes y otras interfaces habladas.

## Novedades respecto a la versión anterior

- Versión anterior: Gemini 3.1 Flash Live Preview.
- Disponible de forma general en lugar de vista previa.
- Razonamiento intercalado y llamadas a funciones asíncronas por defecto.
- Actualizaciones completas del contenido del cliente durante la sesión.

## Capacidades clave

- Conversación de audio a audio mediante la Live API.
- Entrada de texto, audio, imagen y vídeo; salida de texto y audio.
- Llamadas a funciones y grounding con Google Search.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API (audio):** 3,00 $ por 1M de tokens de entrada (0,005 $ por minuto) y 12,00 $ por 1M de salida (0,018 $ por minuto).
- **API (texto):** 0,75 $ por 1M de tokens de entrada y 4,50 $ por 1M de salida.
- **Nivel gratuito:** gratis dentro de los límites.
- Acceso: Acceso gratuito, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- El grounding con Google Search solo es gratis hasta 5.000 peticiones al mes, compartidas entre los modelos Gemini 3.
- No se encontró una puntuación independiente en arenas de voz para este modelo.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La mayoría conocerá las voces de Gemini Live dentro de las apps de Google; esta ficha cubre la versión para desarrolladores.
- **Desarrolladores:** Un modelo Live de baja latencia, disponible de forma general, con nivel gratuito y precio de audio por minuto, es una base práctica para agentes de voz.

## Fuentes

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-15)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
