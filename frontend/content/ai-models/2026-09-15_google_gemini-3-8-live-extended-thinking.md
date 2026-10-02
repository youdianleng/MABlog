---
schema: mablog-ai-model/1
review_status: draft
slug: gemini-3-8-live-extended-thinking
title_en: "Gemini 3.8 Live Extended Thinking: voice agents that reason in the background"
title_es: "Gemini 3.8 Live Extended Thinking: agentes de voz que razonan en segundo plano"
provider: Google
provider_key: google
model: Gemini 3.8 Live Extended Thinking
version: "3.8"
family: gemini-live-extended-thinking
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
  - "Google lists this model in the same pricing row as Gemini 3.8 Live, so the prices are shared."
  - "First release of this line; no earlier Extended Thinking Live model was found."
---

# English

## Summary

Gemini 3.8 Live Extended Thinking is a high-reasoning audio-to-audio model from Google, made generally available in the Gemini API's Live API on September 15, 2026 alongside Gemini 3.8 Live. It supports background reasoning during live audio interactions, so a voice agent can keep talking while the model works through a harder request, and Google recommends it when more background reasoning is needed than the standard Live model provides. It shares the Live API features of its sibling, and Google publishes both models in the same pricing row: on the paid tier, audio costs $3.00 per million input tokens or $0.005 per minute, and $12.00 per million output tokens or $0.018 per minute, while text costs $0.75 for input and $4.50 for output per million tokens, including thinking tokens. A free tier is available in Google AI Studio. Availability in the Gemini app was not stated in the sources read for this file.

## Description

Extended Thinking is the reasoning-heavy option in Google's new Live pair. It suits voice tasks that need planning or tool use mid-conversation, such as troubleshooting or booking flows, where a short pause for thinking is acceptable. For the fastest replies, Google points developers to the standard Gemini 3.8 Live model.

## What's new compared with the previous version

- First Extended Thinking model in Google's Live API.
- Background reasoning while the live audio conversation continues.
- Generally available from launch, sharing pricing with Gemini 3.8 Live.

## Key capabilities

- Audio-to-audio conversation with background reasoning.
- Text, audio, image and video input; text and audio output.
- Function calling and grounding with Google Search.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | Not published | — | — | — |

## Pricing and availability

- **API (audio):** $3.00 per 1M input tokens ($0.005 per minute) and $12.00 per 1M output tokens ($0.018 per minute).
- **API (text):** $0.75 per 1M input tokens and $4.50 per 1M output tokens, including thinking tokens.
- **Free tier:** free of charge within limits.
- Access: Free access, API.
- Status: Generally available.

## Limitations and caveats

- Thinking tokens are billed as output tokens.
- Google recommends the standard Gemini 3.8 Live model for most low-latency use.

## Best for users / best for developers

- **Users:** This model works behind the scenes in voice products; end users notice it as an agent that handles harder requests without hanging up.
- **Developers:** Choose it over Gemini 3.8 Live when a voice agent must reason or plan mid-call; the price per token is the same.

## Sources

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-15)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.

# Español

## Resumen

Gemini 3.8 Live Extended Thinking es un modelo de audio a audio de Google con razonamiento avanzado, disponible de forma general en la Live API de Gemini desde el 15 de septiembre de 2026, junto a Gemini 3.8 Live. Admite razonamiento en segundo plano durante las interacciones de audio en directo, de modo que un agente de voz puede seguir hablando mientras el modelo resuelve una petición más difícil, y Google lo recomienda cuando hace falta más razonamiento del que ofrece el modelo Live estándar. Comparte las funciones de la Live API con su hermano, y Google publica ambos modelos en la misma fila de precios: en el nivel de pago, el audio cuesta 3,00 $ por millón de tokens de entrada o 0,005 $ por minuto, y 12,00 $ por millón de tokens de salida o 0,018 $ por minuto, mientras que el texto cuesta 0,75 $ de entrada y 4,50 $ de salida por millón de tokens, incluidos los de razonamiento. Hay un nivel gratuito en Google AI Studio. Las fuentes leídas no indicaban su disponibilidad en la app de Gemini.

## Descripción

Extended Thinking es la opción con más razonamiento de la nueva pareja Live de Google. Encaja en tareas de voz que requieren planificar o usar herramientas en mitad de la conversación, como resolución de incidencias o reservas, donde una breve pausa para pensar es aceptable. Para las respuestas más rápidas, Google remite al modelo Gemini 3.8 Live estándar.

## Novedades respecto a la versión anterior

- Primer modelo Extended Thinking de la Live API de Google.
- Razonamiento en segundo plano mientras continúa la conversación de audio en directo.
- Disponible de forma general desde el lanzamiento, con el mismo precio que Gemini 3.8 Live.

## Capacidades clave

- Conversación de audio a audio con razonamiento en segundo plano.
- Entrada de texto, audio, imagen y vídeo; salida de texto y audio.
- Llamadas a funciones y grounding con Google Search.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API (audio):** 3,00 $ por 1M de tokens de entrada (0,005 $ por minuto) y 12,00 $ por 1M de salida (0,018 $ por minuto).
- **API (texto):** 0,75 $ por 1M de tokens de entrada y 4,50 $ por 1M de salida, incluidos los tokens de razonamiento.
- **Nivel gratuito:** gratis dentro de los límites.
- Acceso: Acceso gratuito, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Los tokens de razonamiento se cobran como tokens de salida.
- Google recomienda el modelo Gemini 3.8 Live estándar para la mayoría de usos de baja latencia.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Este modelo trabaja entre bastidores en productos de voz; el usuario lo nota como un agente que resuelve peticiones más difíciles sin cortar la llamada.
- **Desarrolladores:** Conviene elegirlo frente a Gemini 3.8 Live cuando un agente de voz debe razonar o planificar durante la llamada; el precio por token es el mismo.

## Fuentes

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-15)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
