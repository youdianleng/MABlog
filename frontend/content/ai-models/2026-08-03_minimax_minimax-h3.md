---
schema: mablog-ai-model/1
review_status: draft
slug: minimax-h3
title_en: "MiniMax H3: the lowest-priced ranked video model, now open source"
title_es: "MiniMax H3: el modelo de vídeo clasificado más barato, ahora de código abierto"
provider: MiniMax
provider_key: minimax
model: MiniMax H3
version: H3
family: minimax-video
superseded_by: null
category: video
release_date: 2026-08-03
status: generally_available
access:
  - Free access
  - API
  - Open weights
regions: null
accent: crimson
context_window: null
official_sources:
  - url: https://www.minimax.io/news/minimax-h3-open-source
    label: "MiniMax: MiniMax H3 is now open source"
    published: 2026-08-03
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-minute
    input: null
    output: null
    amount: 4.8
    currency: USD
    variant: 768p
    source_url: https://artificialanalysis.ai/video/leaderboard/text-to-video
    quote: null
    evidence: price-check-2026-10-01
plans: []
benchmarks:
  - name: Artificial Analysis Video Arena
    metric: Arena Elo · with audio
    score: "1220"
    confidence_interval: ±8
    samples: 8,602 votes
    source_rank: 3–4
    kind: independent
    source_label: Artificial Analysis Video Arena
    source_url: https://artificialanalysis.ai/video/leaderboard/text-to-video
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: video
review_notes:
  - 2026-08-03 is the open-source release date from the article metadata; an earlier closed release may exist.
---

# English

## Summary

MiniMax H3 is MiniMax's next-generation general-purpose video model, which the company open-sourced on 3 August 2026. It is available for free, through the MiniMax API and as open weights. In MAblog's video ranking with native audio it is third with an Elo of 1220 ±8 in the Artificial Analysis Text-to-Video Arena, closing the overlapping top three, which share source ranks 1–4. It is also the lowest-priced video model with a published price in the list, at about $4.80 per generated minute at 768p as measured by Artificial Analysis on 2026-10-01. For creators who want near-top quality at a low cost, or developers who want to run a video model themselves, it is one of the strongest options in this ranking.

## Description

H3 is MiniMax's current video model. Open-sourcing it gives developers a general-purpose video model they can host and adapt, while MiniMax continues to offer it in its own apps and API.

## What's new compared with the previous version

- Open-sourced on 3 August 2026 (MiniMax).

## Key capabilities

- General-purpose video generation.
- Available free, via API and as open weights.

## Benchmarks

| Benchmark              | Score   | Kind        | Source                                                                                           | Date       |
| ---------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo · with audio | 1220 ±8 | independent | [Artificial Analysis Video Arena](https://artificialanalysis.ai/video/leaderboard/text-to-video) | 2026-09-22 |

## Pricing and availability

- **Comparable price on /ai-models:** $4.80 per generated minute (768p); migrated from the 2026-10-01 price check.
- Subscription plans: not published for this model.
- Access: Free access, API, Open weights.
- Status: Generally available.

## Limitations and caveats

- Resolution of the comparable price: 768p.

## Best for users / best for developers

- **Users:** Easy to trial in Hailuo before deciding whether the workflow fits.
- **Developers:** A flexible open family; the ranking excludes the separately post-trained Fal variant.

## Sources

1. [MiniMax: MiniMax H3 is now open source (2026-08-03)](https://www.minimax.io/news/minimax-h3-open-source)
2. [Artificial Analysis Video Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/video/leaderboard/text-to-video)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.
- 2026-10-02 — `family` set to the version-free model line and `superseded_by` added (instructions v1.2).

# Español

## Resumen

MiniMax H3 es el modelo de vídeo de propósito general de nueva generación de MiniMax, que la empresa liberó como código abierto el 3 de agosto de 2026. Está disponible gratis, mediante la API de MiniMax y como pesos abiertos. En la clasificación de vídeo con audio nativo de MAblog es tercero con un Elo de 1220 ±8 en el Text-to-Video Arena de Artificial Analysis, y cierra el trío superior solapado, que comparte los rangos 1–4 de la fuente. También es el modelo de vídeo con precio publicado más barato de la lista, unos 4,80 $ por minuto generado a 768p según Artificial Analysis el 2026-10-01. Para creadores que buscan calidad casi punta a bajo coste, o desarrolladores que quieren ejecutar un modelo de vídeo por su cuenta, es una de las opciones más sólidas de esta clasificación.

## Descripción

H3 es el modelo de vídeo actual de MiniMax. Liberarlo como código abierto da a los desarrolladores un modelo de vídeo de propósito general que pueden alojar y adaptar, mientras MiniMax lo sigue ofreciendo en sus apps y su API.

## Novedades respecto a la versión anterior

- Liberado como código abierto el 3 de agosto de 2026 (MiniMax).

## Capacidades clave

- Generación de vídeo de propósito general.
- Disponible gratis, por API y como pesos abiertos.

## Benchmarks

| Benchmark              | Puntuación | Tipo          | Fuente                                                                                           | Fecha      |
| ---------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Arena Elo · with audio | 1220 ±8    | independiente | [Artificial Analysis Video Arena](https://artificialanalysis.ai/video/leaderboard/text-to-video) | 2026-09-22 |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 4,80 $ por minuto generado (768p); valor migrado de la comprobación de precios del 2026-10-01.
- Planes de suscripción: no publicados para este modelo.
- Acceso: Acceso gratuito, API, Pesos abiertos.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Resolución del precio comparable: 768p.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Fácil de probar en Hailuo antes de decidir si el flujo encaja.
- **Desarrolladores:** Una familia abierta flexible; la clasificación excluye la variante reentrenada por Fal.

## Fuentes

1. [MiniMax: MiniMax H3 is now open source (2026-08-03)](https://www.minimax.io/news/minimax-h3-open-source)
2. [Artificial Analysis Video Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/video/leaderboard/text-to-video)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
- 2026-10-02 — `family` pasa a ser la línea de modelo sin versión y se añade `superseded_by` (instrucciones v1.2).
