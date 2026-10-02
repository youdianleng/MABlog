---
schema: mablog-ai-model/1
review_status: reviewed
slug: gemini-omni-1-1-flash
title_en: "Gemini Omni Flash 1.1: Google's video model reaches general availability"
title_es: "Gemini Omni Flash 1.1: el modelo de vídeo de Google ya está disponible de forma general"
provider: Google
provider_key: google
model: Gemini Omni Flash 1.1
version: "1.1"
family: gemini-omni-flash
superseded_by: null
category: video
release_date: 2026-08-27
status: generally_available
access:
  - API
regions: null
accent: blue
context_window: null
official_sources:
  - url: "https://ai.google.dev/gemini-api/docs/changelog"
    label: Gemini API changelog
    published: 2026-08-27
  - url: "https://ai.google.dev/gemini-api/docs/pricing"
    label: Gemini Developer API pricing
    published: null
  - url: "https://ai.google.dev/gemini-api/docs/omni"
    label: "Gemini API docs: Gemini Omni Flash"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 1.5
    output: 17.5
    amount: null
    currency: USD
    variant: video output
    source_url: "https://ai.google.dev/gemini-api/docs/pricing"
    quote: "Input price Not available $1.50 (text / image / video / audio) Output price (including thinking tokens) Not available $9.00 (text) $17.50 (video)"
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

Gemini Omni Flash 1.1, published as gemini-omni-1.1-flash, is the generally available version of Google's fast, conversational video generation and editing model, released in the Gemini API on August 27, 2026. It replaces the gemini-omni-flash-preview endpoint, which Google scheduled for deprecation on September 30, 2026. The release adds video extension, which continues an existing clip from its end; interpolation between a first and a last frame using up to two images; and a resolution setting with 360p, 720p by default, 1080p and 4K output, where 1080p and 4K are produced by upscaling. Developers use it on the paid tier of the Gemini API: input of any modality costs $1.50 per million tokens, and output costs $9.00 per million text tokens and $17.50 per million video tokens. There is no free tier for the model. Availability in the Gemini app and Google AI subscriptions was not stated in the sources read for this file.

## Description

Gemini Omni is Google's unified model for video creation: it reasons over text, images, audio and video together and lets users edit a clip conversationally. The 1.1 release turns the preview into a supported production model and adds the controls video teams asked for most: longer clips through extension, guided transitions between two frames, and higher output resolutions.

## What's new compared with the previous version

- Previous version: Gemini Omni Flash preview (gemini-omni-flash-preview), deprecated on September 30, 2026.
- Generally available instead of preview.
- Video extension: continue an existing clip with a prompt or the extend task.
- Interpolation between a first and last frame with up to two images.
- Resolution control: 360p, 720p (default), 1080p and 4K, with 1080p and 4K upscaled.

## Key capabilities

- Video generation and conversational editing.
- Text, image, video and audio input.
- Output resolutions from 360p to 4K (upscaled above 720p).

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Text-to-Video Arena | Not published | — | — | — |

## Pricing and availability

- **API:** $1.50 per 1M input tokens (any modality); output $9.00 per 1M text tokens and $17.50 per 1M video tokens.
- **Free tier:** not available.
- Subscription plans: not published for this model in the sources read.
- Access: API.
- Status: Generally available.

## Limitations and caveats

- 1080p and 4K outputs are upscaled, not generated natively.
- Paid tier only.

## Best for users / best for developers

- **Users:** Creators will mainly meet Omni through Google's apps; this file covers the API release, so app access still needs checking.
- **Developers:** General availability, extension, interpolation and 4K output make it a production-ready choice for video features, billed per token.

## Sources

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-08-27)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)
3. [Gemini API docs: Gemini Omni Flash](https://ai.google.dev/gemini-api/docs/omni)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

Gemini Omni Flash 1.1, publicado como gemini-omni-1.1-flash, es la versión disponible de forma general del modelo rápido y conversacional de Google para generar y editar vídeo, lanzado en la API de Gemini el 27 de agosto de 2026. Sustituye al endpoint gemini-omni-flash-preview, que Google programó para quedar obsoleto el 30 de septiembre de 2026. La versión añade la extensión de vídeo, que continúa un clip desde su final; la interpolación entre un primer y un último fotograma con hasta dos imágenes; y un ajuste de resolución con salidas de 360p, 720p por defecto, 1080p y 4K, en el que 1080p y 4K se obtienen por reescalado. Los desarrolladores lo usan en el nivel de pago de la API de Gemini: la entrada de cualquier modalidad cuesta 1,50 $ por millón de tokens, y la salida 9,00 $ por millón de tokens de texto y 17,50 $ por millón de tokens de vídeo. No hay nivel gratuito para el modelo. Las fuentes leídas no indicaban su disponibilidad en la app de Gemini ni en las suscripciones de Google AI.

## Descripción

Gemini Omni es el modelo unificado de Google para crear vídeo: razona a la vez sobre texto, imágenes, audio y vídeo y permite editar un clip conversando. La versión 1.1 convierte la vista previa en un modelo de producción con soporte y añade los controles que más piden los equipos de vídeo: clips más largos mediante extensión, transiciones guiadas entre dos fotogramas y resoluciones de salida más altas.

## Novedades respecto a la versión anterior

- Versión anterior: vista previa de Gemini Omni Flash (gemini-omni-flash-preview), obsoleta desde el 30 de septiembre de 2026.
- Disponible de forma general en lugar de vista previa.
- Extensión de vídeo: continuar un clip existente con un prompt o la tarea extend.
- Interpolación entre un primer y un último fotograma con hasta dos imágenes.
- Control de resolución: 360p, 720p (por defecto), 1080p y 4K, con 1080p y 4K reescalados.

## Capacidades clave

- Generación de vídeo y edición conversacional.
- Entrada de texto, imagen, vídeo y audio.
- Resoluciones de salida de 360p a 4K (reescaladas por encima de 720p).

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Text-to-Video Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API:** 1,50 $ por 1M de tokens de entrada (cualquier modalidad); salida a 9,00 $ por 1M de tokens de texto y 17,50 $ por 1M de tokens de vídeo.
- **Nivel gratuito:** no disponible.
- Planes de suscripción: no publicados para este modelo en las fuentes leídas.
- Acceso: API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Las salidas 1080p y 4K se reescalan; no se generan de forma nativa.
- Solo en el nivel de pago.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Los creadores conocerán Omni sobre todo a través de las apps de Google; esta ficha cubre la versión de la API, así que falta comprobar el acceso desde las apps.
- **Desarrolladores:** La disponibilidad general, la extensión, la interpolación y la salida 4K lo convierten en una opción lista para producción en funciones de vídeo, con cobro por tokens.

## Fuentes

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-08-27)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)
3. [Gemini API docs: Gemini Omni Flash](https://ai.google.dev/gemini-api/docs/omni)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
