---
schema: mablog-ai-model/1
review_status: draft
slug: gpt-image-2-5-sunburst
title_en: "GPT Image 2.5 Sunburst: OpenAI's top-rated image model"
title_es: "GPT Image 2.5 Sunburst: el modelo de imagen mejor valorado de OpenAI"
provider: OpenAI
provider_key: openai
model: GPT Image 2.5 Sunburst
version: "2.5"
family: gpt-image-sunburst
superseded_by: null
category: image
release_date: 2026-09-08
status: generally_available
access:
  - API
regions: null
accent: gold
context_window: null
official_sources:
  - url: https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
    label: "OpenAI API model page: GPT Image 2.5 Sunburst"
    published: 2026-09-08
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1k-images
    input: null
    output: null
    amount: 210.7
    currency: USD
    variant: 1024×1024, default settings
    source_url: https://artificialanalysis.ai/image/leaderboard/text-to-image
    quote: null
    evidence: price-check-2026-10-01
  - unit: per-1m-tokens
    input: 5
    output: 30
    amount: null
    currency: USD
    variant: Token pricing (text and image input, image output)
    source_url: https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
    quote: Price $5 • $30 Input • Output
    evidence: null
plans: []
benchmarks:
  - name: Artificial Analysis Image Arena
    metric: Arena Elo
    score: "1197"
    confidence_interval: ±9
    samples: 13,401 votes
    source_rank: 1–2
    kind: independent
    source_label: Artificial Analysis Image Arena
    source_url: https://artificialanalysis.ai/image/leaderboard/text-to-image
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: image
review_notes:
  - Release date is the dated snapshot ID (gpt-image-2.5-sunburst-2026-09-08), not an announcement post.
---

# English

## Summary

GPT Image 2.5 Sunburst is OpenAI's most capable model for image generation and editing, available in the OpenAI API with a dated snapshot from 8 September 2026. It leads MAblog's image ranking with an Elo of 1197 ±9 in the Artificial Analysis Text-to-Image Arena, 43 points ahead of second place, the widest lead at the top of any category on the page. That quality comes at the highest price in the list: about $210.70 per 1,000 images at 1024×1024 with default settings, as measured by Artificial Analysis on 2026-10-01. OpenAI prices it per token at $5 per million input tokens and $30 per million output tokens. It accepts text and image input and returns images. Consumer plan availability for this specific model was not stated on the API page.

## Description

Sunburst sits at the top of OpenAI's GPT Image line, above GPT Image 2.5 Flare, GPT Image 2 and the older 1.x models. It handles both generation from text and editing of supplied images. Because pricing is token-based, the cost of a single image depends on its size and quality setting; the per-1,000-image figure above is the comparable price used across MAblog's image ranking.

## What's new compared with the previous version

- Not published by the provider.

## Key capabilities

- Text-to-image generation and image editing.
- Text and image input; image output.
- Pinned dated snapshot (gpt-image-2.5-sunburst-2026-09-08) for reproducible results.

## Benchmarks

| Benchmark | Score   | Kind        | Source                                                                                           | Date       |
| --------- | ------- | ----------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo | 1197 ±9 | independent | [Artificial Analysis Image Arena](https://artificialanalysis.ai/image/leaderboard/text-to-image) | 2026-09-22 |

## Pricing and availability

- **Comparable price on /ai-models:** $210.70 per 1,000 images (1024×1024, default settings); migrated from the 2026-10-01 price check.
- $5 per 1M input tokens and $30 per 1M output tokens (Token pricing (text and image input, image output)); quoted from the source.
- Subscription plans: not published for this model.
- Access: API.
- Status: Generally available.

## Limitations and caveats

- Highest price per image among the five ranked image models.
- Consumer plan availability: not published on the API page.

## Best for users / best for developers

- **Users:** Best for polished, high-detail visual work when generation time is secondary.
- **Developers:** The snapshot leader for teams that can integrate the paid image API.

## Sources

1. [OpenAI API model page: GPT Image 2.5 Sunburst (2026-09-08)](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)
2. [Artificial Analysis Image Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/image/leaderboard/text-to-image)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.
- 2026-10-02 — `family` set to the version-free model line and `superseded_by` added (instructions v1.2).

# Español

## Resumen

GPT Image 2.5 Sunburst es el modelo más capaz de OpenAI para generar y editar imágenes, disponible en la API de OpenAI con una versión fechada del 8 de septiembre de 2026. Lidera la clasificación de imagen de MAblog con un Elo de 1197 ±9 en el Text-to-Image Arena de Artificial Analysis, 43 puntos por delante del segundo, la mayor ventaja en cabeza de todas las categorías de la página. Esa calidad tiene el precio más alto de la lista: unos 210,70 $ por 1.000 imágenes a 1024×1024 con la configuración predeterminada, según Artificial Analysis el 2026-10-01. OpenAI lo cobra por tokens a 5 $ por millón de tokens de entrada y 30 $ por millón de salida. Acepta texto e imágenes como entrada y devuelve imágenes. La disponibilidad en planes de consumo para este modelo concreto no figuraba en la página de la API.

## Descripción

Sunburst encabeza la línea GPT Image de OpenAI, por encima de GPT Image 2.5 Flare, GPT Image 2 y los modelos 1.x anteriores. Sirve tanto para generar a partir de texto como para editar imágenes aportadas. Como el precio se basa en tokens, el coste de una imagen depende de su tamaño y calidad; la cifra por 1.000 imágenes es el precio comparable que usa la clasificación de imagen de MAblog.

## Novedades respecto a la versión anterior

- No publicado por el proveedor.

## Capacidades clave

- Generación de imágenes a partir de texto y edición de imágenes.
- Entrada de texto e imagen; salida de imagen.
- Versión fechada fija (gpt-image-2.5-sunburst-2026-09-08) para resultados reproducibles.

## Benchmarks

| Benchmark | Puntuación | Tipo          | Fuente                                                                                           | Fecha      |
| --------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo | 1197 ±9    | independiente | [Artificial Analysis Image Arena](https://artificialanalysis.ai/image/leaderboard/text-to-image) | 2026-09-22 |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 210,70 $ por 1.000 imágenes (1024×1024, default settings); valor migrado de la comprobación de precios del 2026-10-01.
- 5 $ por 1M de tokens de entrada y 30 $ por 1M de salida (Token pricing (text and image input, image output)); cita en la fuente.
- Planes de suscripción: no publicados para este modelo.
- Acceso: API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Precio por imagen más alto de los cinco modelos de imagen clasificados.
- Disponibilidad en planes de consumo: no publicada en la página de la API.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Ideal para trabajo visual pulido y detallado cuando el tiempo de generación es secundario.
- **Desarrolladores:** El líder de esta edición para equipos capaces de integrar la API de imagen de pago.

## Fuentes

1. [OpenAI API model page: GPT Image 2.5 Sunburst (2026-09-08)](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)
2. [Artificial Analysis Image Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/image/leaderboard/text-to-image)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
- 2026-10-02 — `family` pasa a ser la línea de modelo sin versión y se añade `superseded_by` (instrucciones v1.2).
