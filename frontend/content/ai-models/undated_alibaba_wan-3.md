---
schema: mablog-ai-model/1
review_status: draft
slug: wan-3
title_en: "Wan 3.0: Alibaba's open video model with 30-second clips"
title_es: "Wan 3.0: el modelo de vídeo abierto de Alibaba con clips de 30 segundos"
provider: Alibaba
provider_key: alibaba
model: Wan 3.0
version: "3.0"
family: wan
superseded_by: null
category: video
release_date: null
status: generally_available
access:
  - API
  - Open weights
regions: null
accent: gold
context_window: null
official_sources:
  - url: https://github.com/AlibabaCloud-Official/Wan3.0
    label: Wan 3.0 official repository
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-minute
    input: null
    output: null
    amount: 12
    currency: USD
    variant: Wan 3.0
    source_url: https://artificialanalysis.ai/video/leaderboard/text-to-video
    quote: null
    evidence: price-check-2026-10-01
plans: []
benchmarks:
  - name: Artificial Analysis Video Arena
    metric: Arena Elo · with audio
    score: "1229"
    confidence_interval: ±9
    samples: 6,011 votes
    source_rank: 1–3
    kind: independent
    source_label: Artificial Analysis Video Arena
    source_url: https://artificialanalysis.ai/video/leaderboard/text-to-video
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: video
review_notes:
  - The official repository gives no announcement date (it was created on 2026-08-11); release_date left null.
  - "Licence shown on the repository: Apache-2.0."
---

# English

## Summary

Wan 3.0 is Alibaba's open-weight video generation model, published in the official AlibabaCloud-Official repository under the Apache-2.0 licence. Its headline feature is native 30-second video generation with intelligent duration control, and it can generate from up to 20 reference assets, including documents, web pages, text and images, with integrated sound design. In MAblog's video ranking with native audio it is second with an Elo of 1229 ±9 in the Artificial Analysis Text-to-Video Arena, statistically tied with first place. Because the weights are open, teams can self-host it; through hosted APIs its comparable price is about $12 per generated minute, as measured by Artificial Analysis on 2026-10-01. It is available through APIs and as open weights.

## Description

Wan is Alibaba's video model family. Version 3.0 pushes clip length to 30 seconds in a single pass and broadens the kinds of input it can turn into video, from text and images to documents and web pages. Its open licence makes it one of two self-hostable models in this top five, with MiniMax H3.

## What's new compared with the previous version

- Native 30-second video generation with intelligent duration control.
- Generation from up to 20 reference assets, including documents and web pages.

## Key capabilities

- Text, image, document and web-page inputs (up to 20 references).
- Integrated sound design for audiovisual output.
- Open weights under Apache-2.0.

## Benchmarks

| Benchmark              | Score   | Kind        | Source                                                                                           | Date       |
| ---------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo · with audio | 1229 ±9 | independent | [Artificial Analysis Video Arena](https://artificialanalysis.ai/video/leaderboard/text-to-video) | 2026-09-22 |

## Pricing and availability

- **Comparable price on /ai-models:** $12 per generated minute (Wan 3.0); migrated from the 2026-10-01 price check.
- Subscription plans: not published for this model.
- Access: API, Open weights.
- Status: Generally available.

## Limitations and caveats

- Official announcement date: not published in the repository.

## Best for users / best for developers

- **Users:** A strong choice for creators who want long-form flexibility and provider choice.
- **Developers:** The best open option in this edition because code and weights support deployment control.

## Sources

1. [Wan 3.0 official repository](https://github.com/AlibabaCloud-Official/Wan3.0)
2. [Artificial Analysis Video Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/video/leaderboard/text-to-video)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.
- 2026-10-02 — `family` set to the version-free model line and `superseded_by` added (instructions v1.2).

# Español

## Resumen

Wan 3.0 es el modelo de generación de vídeo de pesos abiertos de Alibaba, publicado en el repositorio oficial AlibabaCloud-Official con licencia Apache-2.0. Su principal novedad es la generación nativa de vídeos de 30 segundos con control inteligente de la duración, y puede generar a partir de hasta 20 recursos de referencia, como documentos, páginas web, texto e imágenes, con diseño de sonido integrado. En la clasificación de vídeo con audio nativo de MAblog es segundo con un Elo de 1229 ±9 en el Text-to-Video Arena de Artificial Analysis, estadísticamente empatado con el primero. Al tener pesos abiertos, los equipos pueden alojarlo por su cuenta; en APIs alojadas su precio comparable es de unos 12 $ por minuto generado, según Artificial Analysis el 2026-10-01. Está disponible por API y como pesos abiertos.

## Descripción

Wan es la familia de modelos de vídeo de Alibaba. La versión 3.0 lleva la duración de los clips a 30 segundos en una sola pasada y amplía los tipos de entrada que puede convertir en vídeo, de texto e imágenes a documentos y páginas web. Su licencia abierta la convierte en uno de los dos modelos autoalojables de este top cinco, junto con MiniMax H3.

## Novedades respecto a la versión anterior

- Generación nativa de vídeos de 30 segundos con control inteligente de la duración.
- Generación a partir de hasta 20 recursos de referencia, incluidos documentos y páginas web.

## Capacidades clave

- Entrada de texto, imagen, documentos y páginas web (hasta 20 referencias).
- Diseño de sonido integrado en la salida audiovisual.
- Pesos abiertos con licencia Apache-2.0.

## Benchmarks

| Benchmark              | Puntuación | Tipo          | Fuente                                                                                           | Fecha      |
| ---------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo · with audio | 1229 ±9    | independiente | [Artificial Analysis Video Arena](https://artificialanalysis.ai/video/leaderboard/text-to-video) | 2026-09-22 |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 12 $ por minuto generado (Wan 3.0); valor migrado de la comprobación de precios del 2026-10-01.
- Planes de suscripción: no publicados para este modelo.
- Acceso: API, Pesos abiertos.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Fecha oficial del anuncio: no publicada en el repositorio.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Una opción sólida para creadores que buscan flexibilidad de duración y de proveedor.
- **Desarrolladores:** La mejor opción abierta de esta edición porque su código y pesos permiten controlar el despliegue.

## Fuentes

1. [Wan 3.0 official repository](https://github.com/AlibabaCloud-Official/Wan3.0)
2. [Artificial Analysis Video Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/video/leaderboard/text-to-video)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
- 2026-10-02 — `family` pasa a ser la línea de modelo sin versión y se añade `superseded_by` (instrucciones v1.2).
