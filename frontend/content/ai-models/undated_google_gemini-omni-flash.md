---
schema: mablog-ai-model/1
review_status: draft
slug: gemini-omni-flash
title_en: "Gemini Omni Flash: Google's multimodal video model with native audio"
title_es: "Gemini Omni Flash: el modelo de vídeo multimodal de Google con audio nativo"
provider: Google
provider_key: google
model: Gemini Omni Flash
version: null
family: gemini-omni-flash
superseded_by: gemini-omni-1-1-flash
category: video
release_date: null
status: generally_available
access:
  - Subscription
  - API
regions: null
accent: blue
context_window: null
official_sources:
  - url: https://ai.google.dev/gemini-api/docs/omni
    label: "Gemini API docs: Gemini Omni Flash"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing: []
plans: []
benchmarks:
  - name: Artificial Analysis Video Arena
    metric: Arena Elo · with audio
    score: "1233"
    confidence_interval: ±7
    samples: 15,172 votes
    source_rank: 1–3
    kind: independent
    source_label: Artificial Analysis Video Arena
    source_url: https://artificialanalysis.ai/video/leaderboard/text-to-video
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: video
review_notes:
  - Superseded by Gemini Omni Flash 1.1 (GA 2026-08-27, file gemini-omni-1-1-flash); the preview endpoint was scheduled for deprecation on 2026-09-30. The 2026-09-22 ranking scored this file; check which version the arena used before moving the ranking.
  - Price is not published for the ranked version; the source lists a price only for the 1.1 release.
---

# English

## Summary

Gemini Omni Flash is Google's high-speed multimodal model for video generation, editing and cinematic control. Google says it processes text, image, audio and video together, supports conversational editing through the Interactions API, and draws on Gemini's knowledge of physics, history, science and culture. In MAblog's video ranking, which evaluates videos with their generated audio, it is first with an Elo of 1233 ±7 in the Artificial Analysis Text-to-Video Arena, only four points ahead of Wan 3.0; the top three share a source rank range of 1–3. It is available by subscription and through the Gemini API. Google's documentation now describes the newer gemini-omni-1.1-flash release, and no price is published for the version scored in the ranking, so its price bar on MAblog stays empty.

## Description

Gemini Omni is Google's unified model for video creation. Instead of separate models for each input type, it reasons over text, images, audio and video at once, which Google says gives more cohesive and controllable output. Conversational editing lets users refine a video in plain language while keeping the parts they want.

## What's new compared with the previous version

- Not published by the provider.

## Key capabilities

- Video generation and editing with native audio.
- Native multimodality: text, image, audio and video input.
- Conversational editing through the Interactions API.

## Benchmarks

| Benchmark              | Score   | Kind        | Source                                                                                           | Date       |
| ---------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo · with audio | 1233 ±7 | independent | [Artificial Analysis Video Arena](https://artificialanalysis.ai/video/leaderboard/text-to-video) | 2026-09-22 |

## Pricing and availability

- API price: not published.
- Subscription plans: not published for this model.
- Access: Subscription, API.
- Status: Generally available.

## Limitations and caveats

- The ranked version's price is not published.
- Documentation now covers the newer 1.1 release.

## Best for users / best for developers

- **Users:** The strongest current all-round entry for guided video creation in Google's tools.
- **Developers:** The snapshot leader with documented API access and native audio output.

## Sources

1. [Gemini API docs: Gemini Omni Flash](https://ai.google.dev/gemini-api/docs/omni)
2. [Artificial Analysis Video Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/video/leaderboard/text-to-video)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.
- 2026-10-02 — `family` set to the version-free model line and `superseded_by` added (instructions v1.2).
- 2026-10-02 — `superseded_by` set to `gemini-omni-1-1-flash` (generally available 2026-08-27; freshness sweep).

# Español

## Resumen

Gemini Omni Flash es el modelo multimodal de alta velocidad de Google para generar y editar vídeo con control cinematográfico. Google afirma que procesa texto, imagen, audio y vídeo a la vez, permite la edición conversacional mediante la Interactions API y aprovecha el conocimiento de Gemini sobre física, historia, ciencia y cultura. En la clasificación de vídeo de MAblog, que evalúa los vídeos con su audio generado, es primero con un Elo de 1233 ±7 en el Text-to-Video Arena de Artificial Analysis, solo cuatro puntos por delante de Wan 3.0; los tres primeros comparten el rango 1–3 de la fuente. Está disponible por suscripción y mediante la API de Gemini. La documentación de Google describe ahora la versión más reciente gemini-omni-1.1-flash, y no hay precio publicado para la versión puntuada en la clasificación, por lo que su barra de precio en MAblog queda vacía.

## Descripción

Gemini Omni es el modelo unificado de Google para crear vídeo. En lugar de modelos separados para cada tipo de entrada, razona a la vez sobre texto, imágenes, audio y vídeo, lo que según Google produce resultados más coherentes y controlables. La edición conversacional permite refinar un vídeo en lenguaje natural conservando las partes deseadas.

## Novedades respecto a la versión anterior

- No publicado por el proveedor.

## Capacidades clave

- Generación y edición de vídeo con audio nativo.
- Multimodalidad nativa: entrada de texto, imagen, audio y vídeo.
- Edición conversacional mediante la Interactions API.

## Benchmarks

| Benchmark              | Puntuación | Tipo          | Fuente                                                                                           | Fecha      |
| ---------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo · with audio | 1233 ±7    | independiente | [Artificial Analysis Video Arena](https://artificialanalysis.ai/video/leaderboard/text-to-video) | 2026-09-22 |

## Precios y disponibilidad

- Precio de API: no publicado.
- Planes de suscripción: no publicados para este modelo.
- Acceso: Suscripción, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- El precio de la versión clasificada no está publicado.
- La documentación cubre ya la versión 1.1.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La entrada integral más sólida para creación guiada de vídeo en las herramientas de Google.
- **Desarrolladores:** El líder de esta edición con API documentada y salida de audio nativo.

## Fuentes

1. [Gemini API docs: Gemini Omni Flash](https://ai.google.dev/gemini-api/docs/omni)
2. [Artificial Analysis Video Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/video/leaderboard/text-to-video)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
- 2026-10-02 — `family` pasa a ser la línea de modelo sin versión y se añade `superseded_by` (instrucciones v1.2).
- 2026-10-02 — `superseded_by` pasa a `gemini-omni-1-1-flash` (disponible de forma general el 2026-08-27; revisión de actualidad).
