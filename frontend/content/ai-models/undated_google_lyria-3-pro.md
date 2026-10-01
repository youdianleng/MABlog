---
schema: mablog-ai-model/1
review_status: draft
slug: lyria-3-pro
title_en: "Lyria 3 Pro: Google's flagship model for full-length songs"
title_es: "Lyria 3 Pro: el modelo principal de Google para canciones completas"
provider: Google
provider_key: google
model: Lyria 3 Pro
version: "3"
family: lyria
category: music
release_date: null
status: preview
access:
  - Subscription
  - API
regions: null
accent: sage
context_window: null
official_sources:
  - url: https://ai.google.dev/gemini-api/docs/models/lyria-3-pro-preview
    label: "Gemini API docs: Lyria 3 Pro Preview"
    published: null
  - url: https://ai.google.dev/gemini-api/docs/pricing
    label: Gemini API pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-song
    input: null
    output: null
    amount: 0.08
    currency: USD
    variant: Full song, paid tier
    source_url: https://ai.google.dev/gemini-api/docs/pricing
    quote: Lyria 3 Pro Preview (Full Song) Not available $0.08 per song
    evidence: null
plans: []
benchmarks:
  - name: Artificial Analysis Music Arena
    metric: Arena Elo · vocals
    score: "1074"
    confidence_interval: ±13
    samples: 2,870 votes
    source_rank: 5–10
    kind: independent
    source_label: Artificial Analysis Music Arena
    source_url: https://artificialanalysis.ai/music/leaderboard/vocals
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: music-vocal
  - name: Artificial Analysis Music Arena
    metric: Arena Elo · instrumental
    score: "1102"
    confidence_interval: ±13
    samples: 2,959 votes
    source_rank: 5–6
    kind: independent
    source_label: Artificial Analysis Music Arena
    source_url: https://artificialanalysis.ai/music/leaderboard/instrumental
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: music-instrumental
review_notes:
  - The docs give only 'Latest update March 2026', not a release day.
  - Google now publishes $0.08 per song; music had no comparable prices when the 2026-10-01 price check ran.
  - The Gemini API navigation also lists a newer Lyria 3.5; consider a ranking review.
---

# English

## Summary

Lyria 3 Pro is Google's flagship music generation model, currently a preview in the Gemini API and last updated in March 2026. Google says it is optimised for full-length songs with complex structure, including multiple verses, choruses and bridges, and that it generates high-quality 48 kHz stereo audio from text prompts or image inputs, returning MP3 audio and lyrics. On the paid tier it costs $0.08 per full song. In MAblog's music rankings it is fifth for vocal songs with an Elo of 1074 ±13 in the Artificial Analysis Music Arena (Vocals), with the widest source range in the list (5–10), and fourth for instrumental music at 1102 ±13. It is available by subscription and through the API, making it a natural choice for developers already building on Gemini.

## Description

Lyria is Google DeepMind's music model family. Lyria 3 Pro focuses on song structure, so long pieces keep a coherent arrangement from verse to chorus to bridge. It sits alongside Lyria Clip for short pieces and Lyria RealTime for interactive music in the Gemini API.

## What's new compared with the previous version

- Not published by the provider.

## Key capabilities

- Full-length songs with verses, choruses and bridges.
- 48 kHz stereo audio from text or image input.
- MP3 audio output with lyrics.

## Benchmarks

| Benchmark                | Score    | Kind        | Source                                                                                          | Date       |
| ------------------------ | -------- | ----------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Arena Elo · vocals       | 1074 ±13 | independent | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/vocals)       | 2026-09-22 |
| Arena Elo · instrumental | 1102 ±13 | independent | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/instrumental) | 2026-09-22 |

## Pricing and availability

- **Comparable price on /ai-models:** $0.08 per song (Full song, paid tier); quoted from the source.
- Subscription plans: not published for this model.
- Access: Subscription, API.
- Status: Preview.

## Limitations and caveats

- Preview status in the Gemini API.
- Exact release date: not published (latest update March 2026).

## Best for users / best for developers

- **Users:** A good fit for Gemini users who want structured full songs in supported languages.
- **Developers:** Public-preview Gemini API access makes it straightforward to prototype music features.

## Sources

1. [Gemini API docs: Lyria 3 Pro Preview](https://ai.google.dev/gemini-api/docs/models/lyria-3-pro-preview)
2. [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
3. [Artificial Analysis Music Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/vocals)
4. [Artificial Analysis Music Arena (evaluated 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/instrumental)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.

# Español

## Resumen

Lyria 3 Pro es el modelo principal de generación musical de Google, actualmente en vista previa en la API de Gemini y actualizado por última vez en marzo de 2026. Google afirma que está optimizado para canciones completas con estructura compleja, con varias estrofas, estribillos y puentes, y que genera audio estéreo de alta calidad a 48 kHz a partir de texto o imágenes, devolviendo audio MP3 y letra. En el nivel de pago cuesta 0,08 $ por canción completa. En las clasificaciones de música de MAblog es quinto en canciones con voz con un Elo de 1074 ±13 en el Music Arena de Artificial Analysis (voces), con el rango de fuente más amplio de la lista (5–10), y cuarto en música instrumental con 1102 ±13. Está disponible por suscripción y por API, lo que lo hace una opción natural para quien ya desarrolla sobre Gemini.

## Descripción

Lyria es la familia de modelos musicales de Google DeepMind. Lyria 3 Pro se centra en la estructura de la canción, de modo que las piezas largas mantienen un arreglo coherente de la estrofa al estribillo y al puente. Convive con Lyria Clip para piezas cortas y Lyria RealTime para música interactiva en la API de Gemini.

## Novedades respecto a la versión anterior

- No publicado por el proveedor.

## Capacidades clave

- Canciones completas con estrofas, estribillos y puentes.
- Audio estéreo a 48 kHz a partir de texto o imagen.
- Salida de audio MP3 con letra.

## Benchmarks

| Benchmark                | Puntuación | Tipo          | Fuente                                                                                          | Fecha      |
| ------------------------ | ---------- | ------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Arena Elo · vocals       | 1074 ±13   | independiente | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/vocals)       | 2026-09-22 |
| Arena Elo · instrumental | 1102 ±13   | independiente | [Artificial Analysis Music Arena](https://artificialanalysis.ai/music/leaderboard/instrumental) | 2026-09-22 |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 0,08 $ por canción (Full song, paid tier); cita en la fuente.
- Planes de suscripción: no publicados para este modelo.
- Acceso: Suscripción, API.
- Estado: Vista previa.

## Limitaciones y advertencias

- Estado de vista previa en la API de Gemini.
- Fecha exacta de lanzamiento: no publicada (última actualización en marzo de 2026).

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Una buena opción para usuarios de Gemini que quieren canciones estructuradas en idiomas compatibles.
- **Desarrolladores:** La vista previa pública de la API de Gemini facilita prototipar funciones musicales.

## Fuentes

1. [Gemini API docs: Lyria 3 Pro Preview](https://ai.google.dev/gemini-api/docs/models/lyria-3-pro-preview)
2. [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
3. [Artificial Analysis Music Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/vocals)
4. [Artificial Analysis Music Arena (evaluado 2026-09-22)](https://artificialanalysis.ai/music/leaderboard/instrumental)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
