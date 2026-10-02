---
schema: mablog-ai-model/1
review_status: reviewed
slug: gpt-live-1
title_en: "GPT-Live-1: OpenAI's full-duplex voice model in the API"
title_es: "GPT-Live-1: el modelo de voz full-duplex de OpenAI en la API"
provider: OpenAI
provider_key: openai
model: GPT-Live-1
version: "1"
family: gpt-live
superseded_by: null
category: voice-sound
release_date: 2026-09-10
status: generally_available
access:
  - API
regions: null
accent: sage
context_window: null
official_sources:
  - url: "https://openai.com/index/build-more-natural-voice-experiences-with-gpt-live-1"
    label: "OpenAI: Build more natural voice experiences with GPT-Live-1 in the API"
    published: 2026-09-10
  - url: "https://openai.com/index/introducing-gpt-live"
    label: "OpenAI: Introducing GPT-Live"
    published: 2026-07-08
  - url: "https://developers.openai.com/api/docs/models/gpt-live-1"
    label: "OpenAI API model page: GPT-Live 1"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-minute
    input: null
    output: null
    amount: 0.05
    currency: USD
    variant: null
    source_url: "https://developers.openai.com/api/docs/models/gpt-live-1"
    quote: "Voice sessions cost $0.05 per minute, billed per second."
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

GPT-Live-1 is OpenAI's full-duplex voice model for real-time conversations, brought to the API on September 10, 2026, after the GPT-Live family began powering ChatGPT Voice in July. It can listen and speak at the same time, handle interruptions smoothly and delegate reasoning and tool use to a backend agent, so a voice app can keep the conversation going while a text model works. OpenAI highlights stronger instruction following, custom voices and telephony support. Developers use it through the Live sessions endpoint at $0.05 per minute of session time, billed per second and not rounded up, plus the normal price of any backend model and tools. Concurrency limits range from 25 sessions at tier 1 to 500 at tier 5, and the free API tier is not supported. Consumers meet the same technology in ChatGPT's voice mode.

## Description

GPT-Live-1 is a speech-to-speech model rather than a text-to-speech voice. It accepts and produces both audio and text, supports streaming and function calling, and is designed to sit in front of a reasoning model: the live model keeps talking while a backend Responses call does the heavy thinking. This makes it suited to customer-service lines, assistants and other conversational voice products.

## What's new compared with the previous version

- Previous version: GPT-Live, introduced on July 8, 2026 to power ChatGPT Voice.
- Now available to developers in the OpenAI API through a Live sessions endpoint.
- OpenAI cites stronger instruction following, custom voices and telephony support.

## Key capabilities

- Full-duplex conversation: listens and speaks at the same time, with smooth interruption handling.
- Audio and text input and output; streaming and function calling.
- Delegates reasoning and tool use to a backend agent.
- Knowledge cutoff: July 31, 2025.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | Not published | — | — | — |

## Pricing and availability

- **API:** $0.05 per minute of live session, billed per second; backend model and tool usage billed separately.
- Concurrency: 25 sessions at tier 1 up to 500 at tier 5; not available on the free tier.
- Consumer plans: not published for this API model.
- Access: API.
- Status: Generally available.

## Limitations and caveats

- Structured outputs, fine-tuning and image or video input are not supported.
- Backend reasoning and tools are billed on top of the per-minute price.
- Not available on the free API tier.

## Best for users / best for developers

- **Users:** Most people experience GPT-Live through ChatGPT's voice mode rather than directly; this release is mainly for builders.
- **Developers:** A simple per-minute price and backend delegation make it a practical base for natural voice agents and phone lines.

## Sources

1. [OpenAI: Build more natural voice experiences with GPT-Live-1 in the API](https://openai.com/index/build-more-natural-voice-experiences-with-gpt-live-1) (2026-09-10)
2. [OpenAI: Introducing GPT-Live](https://openai.com/index/introducing-gpt-live) (2026-07-08)
3. [OpenAI API model page: GPT-Live 1](https://developers.openai.com/api/docs/models/gpt-live-1)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

GPT-Live-1 es el modelo de voz full-duplex de OpenAI para conversaciones en tiempo real, que llegó a la API el 10 de septiembre de 2026, después de que la familia GPT-Live empezara a impulsar ChatGPT Voice en julio. Puede escuchar y hablar a la vez, gestionar interrupciones con fluidez y delegar el razonamiento y el uso de herramientas en un agente de fondo, de modo que una app de voz mantiene la conversación mientras un modelo de texto trabaja. OpenAI destaca un mejor seguimiento de instrucciones, voces personalizadas y soporte telefónico. Los desarrolladores lo usan mediante el endpoint de sesiones Live a 0,05 $ por minuto de sesión, facturado por segundo y sin redondeo, más el precio normal del modelo y las herramientas de fondo. Los límites de concurrencia van de 25 sesiones en el nivel 1 a 500 en el nivel 5, y el nivel gratuito de la API no está disponible. Los consumidores encuentran la misma tecnología en el modo de voz de ChatGPT.

## Descripción

GPT-Live-1 es un modelo de voz a voz, no una voz de texto a voz. Acepta y produce audio y texto, admite streaming y llamadas a funciones, y está pensado para situarse delante de un modelo de razonamiento: el modelo en directo sigue hablando mientras una llamada a Responses hace el trabajo pesado. Encaja en líneas de atención al cliente, asistentes y otros productos de voz conversacional.

## Novedades respecto a la versión anterior

- Versión anterior: GPT-Live, presentado el 8 de julio de 2026 para impulsar ChatGPT Voice.
- Ahora disponible para desarrolladores en la API de OpenAI mediante un endpoint de sesiones Live.
- OpenAI menciona mejor seguimiento de instrucciones, voces personalizadas y soporte telefónico.

## Capacidades clave

- Conversación full-duplex: escucha y habla a la vez, con buena gestión de interrupciones.
- Entrada y salida de audio y texto; streaming y llamadas a funciones.
- Delega el razonamiento y las herramientas en un agente de fondo.
- Conocimiento hasta el 31 de julio de 2025.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API:** 0,05 $ por minuto de sesión en directo, facturado por segundo; el modelo y las herramientas de fondo se facturan aparte.
- Concurrencia: de 25 sesiones en el nivel 1 a 500 en el nivel 5; no disponible en el nivel gratuito.
- Planes de consumo: no publicados para este modelo de API.
- Acceso: API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- No admite salidas estructuradas, fine-tuning ni entrada de imagen o vídeo.
- El razonamiento y las herramientas de fondo se cobran además del precio por minuto.
- No disponible en el nivel gratuito de la API.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La mayoría conoce GPT-Live a través del modo de voz de ChatGPT, no directamente; esta versión es sobre todo para quienes desarrollan.
- **Desarrolladores:** Un precio sencillo por minuto y la delegación en un modelo de fondo lo convierten en una base práctica para agentes de voz naturales y líneas telefónicas.

## Fuentes

1. [OpenAI: Build more natural voice experiences with GPT-Live-1 in the API](https://openai.com/index/build-more-natural-voice-experiences-with-gpt-live-1) (2026-09-10)
2. [OpenAI: Introducing GPT-Live](https://openai.com/index/introducing-gpt-live) (2026-07-08)
3. [OpenAI API model page: GPT-Live 1](https://developers.openai.com/api/docs/models/gpt-live-1)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
