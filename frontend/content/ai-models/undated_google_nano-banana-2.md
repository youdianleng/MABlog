---
schema: mablog-ai-model/1
review_status: draft
slug: nano-banana-2
title_en: "Nano Banana 2: Google's fast, affordable image model"
title_es: "Nano Banana 2: el modelo de imagen rápido y asequible de Google"
provider: Google
provider_key: google
model: Nano Banana 2
version: "3.1"
family: gemini-flash-image
superseded_by: null
category: image
release_date: null
status: generally_available
access:
  - Free access
  - Subscription
  - API
regions: null
accent: sage
context_window: null
official_sources:
  - url: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image
    label: "Gemini API docs: Gemini 3.1 Flash Image (Nano Banana 2)"
    published: null
  - url: https://ai.google.dev/gemini-api/docs/pricing
    label: Gemini API pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1k-images
    input: null
    output: null
    amount: 67
    currency: USD
    variant: 1024×1024, default settings
    source_url: https://artificialanalysis.ai/image/leaderboard/text-to-image
    quote: null
    evidence: price-check-2026-10-01
  - unit: per-1m-tokens
    input: 0.5
    output: 60
    amount: null
    currency: USD
    variant: Official token pricing (text/image input, image output)
    source_url: https://ai.google.dev/gemini-api/docs/pricing
    quote: $0.50 (text/image) Output price Not available $3 (text and thinking) $60.00 (images)
    evidence: null
plans: []
benchmarks:
  - name: Artificial Analysis Image Arena
    metric: Arena Elo
    score: "1122"
    confidence_interval: ±8
    samples: 17,440 votes
    source_rank: "6"
    kind: independent
    source_label: Artificial Analysis Image Arena
    source_url: https://artificialanalysis.ai/image/leaderboard/text-to-image
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: image
review_notes:
  - The docs give only 'Latest update February 2026', not a release day, so release_date is null.
  - Gemini app plan inclusion (free and Google AI plans) was not confirmed in page text for this model; check before marking reviewed.
---

# English

## Summary

Nano Banana 2 is the popular name for Gemini 3.1 Flash Image, Google's image model built for high-quality image generation and conversational editing at a mainstream price point and low latency. It is a stable model in the Gemini API, last updated in February 2026, and accepts up to 131,072 input tokens. In MAblog's image ranking it is fourth with an Elo of 1122 ±8 in the Artificial Analysis Text-to-Image Arena, a 25-point step below the second- and third-placed models. Its comparable price is about $67 per 1,000 images at 1024×1024, as measured by Artificial Analysis on 2026-10-01; Google's own price list charges $0.50 per million input tokens and $60 per million image output tokens. It is available for free, by subscription and through the API.

## Description

Gemini 3.1 Flash Image is the high-efficiency image model in Google's Gemini family. It is designed for quick, interactive responses and high throughput, making it suitable for chat-based editing where users refine an image step by step. Developers use the stable model ID gemini-3.1-flash-image.

## What's new compared with the previous version

- Not published by the provider.

## Key capabilities

- Image generation and conversational, multi-turn editing.
- Text, image, video and PDF input; image and text output.
- Input token limit 131,072; output token limit 32,768.

## Benchmarks

| Benchmark | Score   | Kind        | Source                                                                                           | Date       |
| --------- | ------- | ----------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo | 1122 ±8 | independent | [Artificial Analysis Image Arena](https://artificialanalysis.ai/image/leaderboard/text-to-image) | 2026-09-22 |

## Pricing and availability

- **Comparable price on /ai-models:** $67 per 1,000 images (1024×1024, default settings); migrated from the 2026-10-01 price check.
- $0.50 per 1M input tokens and $60 per 1M output tokens (Official token pricing (text/image input, image output)); quoted from the source.
- Subscription plans: not published for this model.
- Access: Free access, Subscription, API.
- Status: Generally available.

## Limitations and caveats

- Exact release date: not published (latest update February 2026).

## Best for users / best for developers

- **Users:** The easiest high-ranking image family to try across Google's consumer surfaces.
- **Developers:** A practical high-volume option with Gemini API access and multiple resolutions.

## Sources

1. [Gemini API docs: Gemini 3.1 Flash Image (Nano Banana 2)](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image)
2. [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
3. [Artificial Analysis Image Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/image/leaderboard/text-to-image)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.
- 2026-10-02 — `family` set to the version-free model line and `superseded_by` added (instructions v1.2).

# Español

## Resumen

Nano Banana 2 es el nombre popular de Gemini 3.1 Flash Image, el modelo de imagen de Google pensado para generación de imágenes de alta calidad y edición conversacional a un precio asequible y con baja latencia. Es un modelo estable de la API de Gemini, actualizado por última vez en febrero de 2026, y admite hasta 131.072 tokens de entrada. En la clasificación de imagen de MAblog es cuarto con un Elo de 1122 ±8 en el Text-to-Image Arena de Artificial Analysis, 25 puntos por debajo del segundo y el tercero. Su precio comparable es de unos 67 $ por 1.000 imágenes a 1024×1024, según Artificial Analysis el 2026-10-01; la lista de precios de Google cobra 0,50 $ por millón de tokens de entrada y 60 $ por millón de tokens de imagen de salida. Está disponible gratis, por suscripción y por API.

## Descripción

Gemini 3.1 Flash Image es el modelo de imagen de alta eficiencia de la familia Gemini de Google. Está diseñado para respuestas rápidas e interactivas y alto rendimiento, lo que lo hace adecuado para la edición conversacional en la que el usuario refina una imagen paso a paso. Los desarrolladores usan el ID estable gemini-3.1-flash-image.

## Novedades respecto a la versión anterior

- No publicado por el proveedor.

## Capacidades clave

- Generación de imágenes y edición conversacional en varios turnos.
- Entrada de texto, imagen, vídeo y PDF; salida de imagen y texto.
- Límite de 131.072 tokens de entrada y 32.768 de salida.

## Benchmarks

| Benchmark | Puntuación | Tipo          | Fuente                                                                                           | Fecha      |
| --------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo | 1122 ±8    | independiente | [Artificial Analysis Image Arena](https://artificialanalysis.ai/image/leaderboard/text-to-image) | 2026-09-22 |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 67 $ por 1.000 imágenes (1024×1024, default settings); valor migrado de la comprobación de precios del 2026-10-01.
- 0,50 $ por 1M de tokens de entrada y 60 $ por 1M de salida (Official token pricing (text/image input, image output)); cita en la fuente.
- Planes de suscripción: no publicados para este modelo.
- Acceso: Acceso gratuito, Suscripción, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Fecha exacta de lanzamiento: no publicada (última actualización en febrero de 2026).

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La familia visual de alta posición más fácil de probar en los productos de Google.
- **Desarrolladores:** Una opción práctica para alto volumen con API de Gemini y varias resoluciones.

## Fuentes

1. [Gemini API docs: Gemini 3.1 Flash Image (Nano Banana 2)](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image)
2. [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
3. [Artificial Analysis Image Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/image/leaderboard/text-to-image)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
- 2026-10-02 — `family` pasa a ser la línea de modelo sin versión y se añade `superseded_by` (instrucciones v1.2).
