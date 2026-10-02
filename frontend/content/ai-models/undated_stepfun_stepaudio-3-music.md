---
schema: mablog-ai-model/1
review_status: draft
slug: stepaudio-3-music
title_en: "StepAudio 3 Music: StepFun's song, cover and vocal-to-song model"
title_es: "StepAudio 3 Music: el modelo de StepFun para canciones, versiones y voz a canción"
provider: StepFun
provider_key: stepfun
model: StepAudio 3 Music
version: "3"
family: stepaudio-music
superseded_by: null
category: music
release_date: null
status: generally_available
access:
  - Free access
  - API
regions: null
accent: blue
context_window: null
official_sources:
  - url: https://static.stepfun.com/blog/stepaudio3/music/assets/video/promo.html
    label: "StepFun: StepAudio 3 Music promo"
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing: []
plans: []
benchmarks:
  - name: Artificial Analysis Music Arena
    metric: Arena Elo · vocals
    score: "1092"
    confidence_interval: ±15
    samples: 2,043 votes
    source_rank: 4–6
    kind: independent
    source_label: Artificial Analysis Music Arena
    source_url: https://artificialanalysis.ai/music/leaderboard/vocals
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: music-vocal
  - name: Artificial Analysis Music Arena
    metric: Arena Elo · instrumental
    score: "1113"
    confidence_interval: ±14
    samples: 2,212 votes
    source_rank: 5–6
    kind: independent
    source_label: Artificial Analysis Music Arena
    source_url: https://artificialanalysis.ai/music/leaderboard/instrumental
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: music-instrumental
review_notes:
  - The official promo page has no date or prices; release_date left null.
---

# English

## Summary

StepAudio 3 Music is StepFun's music generation model, offered free and through an API. Its official page shows three ways to create: write lyrics and a prompt to get a full song, turn a vocal recording into a song, or make a cover of an uploaded reference track, with a full song usually taking one to two minutes. In MAblog's music rankings it is third for vocal songs with an Elo of 1092 ±15 in the Artificial Analysis Music Arena (Vocals), a narrow edge over MiniMax Music rather than a clear gap, and third for instrumental music at 1113 ±14, 58 points behind the leading pair. Release date and prices are not published on the official page, so they are marked as not published in this file.

## Description

StepAudio 3 Music comes from StepFun's StepAudio speech and audio family. Beyond prompt-to-song generation, it supports cover and vocal-to-song workflows built on a user's own recordings, which makes it useful for musicians who want to develop an existing idea.

## What's new compared with the previous version

- Not published by the provider.

## Key capabilities

- Song generation from lyrics and a prompt.
- Vocal-to-song and song cover from uploaded audio.
- Optional instrumental mode.

## Benchmarks

| Benchmark                | Score    | Kind        | Source                                                                                          | Date       |
| ------------------------ | -------- | ----------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Arena Elo · vocals       | 1092 ±15 | independent | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/vocals)       | 2026-09-22 |
| Arena Elo · instrumental | 1113 ±14 | independent | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/instrumental) | 2026-09-22 |

## Pricing and availability

- API price: not published.
- Subscription plans: not published for this model.
- Access: Free access, API.
- Status: Generally available.

## Limitations and caveats

- Release date and prices: not published on the official page.

## Best for users / best for developers

- **Users:** A promising browser-based option for creators who want lyrics and arrangement controls.
- **Developers:** Consistent third-place evidence in both music views makes it a balanced integration candidate.

## Sources

1. [StepFun: StepAudio 3 Music promo](https://static.stepfun.com/blog/stepaudio3/music/assets/video/promo.html)
2. [Artificial Analysis Music Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/vocals)
3. [Artificial Analysis Music Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/instrumental)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.
- 2026-10-02 — `family` set to the version-free model line and `superseded_by` added (instructions v1.2).

# Español

## Resumen

StepAudio 3 Music es el modelo de generación musical de StepFun, disponible gratis y por API. Su página oficial muestra tres formas de crear: escribir letra y una descripción para obtener una canción completa, convertir una grabación de voz en una canción o crear una versión de una pista de referencia subida, y una canción completa suele tardar entre uno y dos minutos. En las clasificaciones de música de MAblog es tercero en canciones con voz con un Elo de 1092 ±15 en el Music Arena de Artificial Analysis (voces), una ligera ventaja sobre MiniMax Music más que una diferencia clara, y tercero en música instrumental con 1113 ±14, 58 puntos por detrás de la pareja líder. La fecha de lanzamiento y los precios no figuran en la página oficial.

## Descripción

StepAudio 3 Music procede de la familia StepAudio de voz y audio de StepFun. Además de generar canciones a partir de texto, admite versiones y flujos de voz a canción basados en grabaciones del usuario, lo que resulta útil para músicos que quieren desarrollar una idea existente.

## Novedades respecto a la versión anterior

- No publicado por el proveedor.

## Capacidades clave

- Generación de canciones a partir de letra y descripción.
- Voz a canción y versiones a partir de audio subido.
- Modo instrumental opcional.

## Benchmarks

| Benchmark                | Puntuación | Tipo          | Fuente                                                                                          | Fecha      |
| ------------------------ | ---------- | ------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Arena Elo · vocals       | 1092 ±15   | independiente | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/vocals)       | 2026-09-22 |
| Arena Elo · instrumental | 1113 ±14   | independiente | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/instrumental) | 2026-09-22 |

## Precios y disponibilidad

- Precio de API: no publicado.
- Planes de suscripción: no publicados para este modelo.
- Acceso: Acceso gratuito, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Fecha de lanzamiento y precios: no publicados en la página oficial.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Una opción web prometedora para creadores que quieren controlar letra y arreglo.
- **Desarrolladores:** Su tercera posición consistente en ambas vistas la convierte en una integración equilibrada.

## Fuentes

1. [StepFun: StepAudio 3 Music promo](https://static.stepfun.com/blog/stepaudio3/music/assets/video/promo.html)
2. [Artificial Analysis Music Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/vocals)
3. [Artificial Analysis Music Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/instrumental)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
- 2026-10-02 — `family` pasa a ser la línea de modelo sin versión y se añade `superseded_by` (instrucciones v1.2).
