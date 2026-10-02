---
schema: mablog-ai-model/1
review_status: reviewed
slug: minimax-music-3
title_en: "MiniMax Music 3.0: an open-weights model for complete songs"
title_es: "MiniMax Music 3.0: un modelo de pesos abiertos para canciones completas"
provider: MiniMax
provider_key: minimax
model: MiniMax Music 3.0
version: "3.0"
family: minimax-music
superseded_by: null
category: music
release_date: 2026-08-13
status: generally_available
access:
  - Open weights
regions: null
accent: violet
context_window: null
official_sources:
  - url: "https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model"
    label: "MiniMax: MiniMax Music 3.0, next-generation open-weights music model"
    published: 2026-08-13
discovered_via: official
checked_at: 2026-10-02
pricing: []
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

MiniMax Music 3.0 is MiniMax's next-generation music model, announced on August 13, 2026 and labelled by MiniMax as open-weights and production-ready. Given a creative concept and optional lyrics, it composes, arranges, performs and produces a complete song of up to five minutes in a single generation. MiniMax says it focuses on the hardest parts of music creation to capture from a prompt: understanding the creator's intent, sustaining it across a whole song, rendering instruments with clarity and physical realism, and producing vocals that sound performed rather than synthesised. To do this, MiniMax redesigned the pipeline with an eight-layer audio tokenizer, a hybrid language model pairing an 8B global model initialised from Qwen3.5-8B with a 0.6B local model, and a 2.4B flow-matching module decoded by a 123M Flow-VAE. The post did not state prices, a licence or where to download the weights.

## Description

MiniMax Music is the music line of MiniMax's multimodal lineup. Version 3.0 is a full redesign rather than an update, and its open-weights label makes it one of the few full-song models that developers could run themselves. The previous public release was Music 2.6 in April 2026.

## What's new compared with the previous version

- Previous version: MiniMax Music 2.6 (April 2026).
- Open-weights release, according to the post title.
- Complete songs of up to five minutes in one generation.
- New architecture: eight-layer RVQ tokenizer, 8B + 0.6B hybrid language model, 2.4B flow matching and a Flow-VAE decoder.

## Key capabilities

- Song generation from a concept and optional lyrics.
- Vocals and multi-instrument arrangements.
- Fine-grained descriptions of emotion, instrumentation and vocal delivery over time.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Music Arena (Vocals) | Not published | — | — | — |
| Artificial Analysis Music Arena (Instrumental) | Not published | — | — | — |

## Pricing and availability

- Price: not published in the announcement.
- Access: Open weights (download location and licence not stated in the post).
- Status: Generally available.

## Limitations and caveats

- Weights link and licence were not found in the post text.
- No independent music-arena score was read for this version.

## Best for users / best for developers

- **Users:** Musicians can expect full songs with performed-sounding vocals; app availability still needs checking.
- **Developers:** Open weights and a published architecture make it a candidate for self-hosted song generation, once the licence is confirmed.

## Sources

1. [MiniMax: MiniMax Music 3.0, next-generation open-weights music model](https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model) (2026-08-13)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

MiniMax Music 3.0 es el modelo musical de nueva generación de MiniMax, anunciado el 13 de agosto de 2026 y presentado por MiniMax como de pesos abiertos y listo para producción. A partir de una idea creativa y una letra opcional, compone, arregla, interpreta y produce una canción completa de hasta cinco minutos en una sola generación. MiniMax afirma que se centra en lo más difícil de captar con un prompt: entender la intención del creador, mantenerla a lo largo de toda la canción, reproducir los instrumentos con claridad y realismo físico y generar voces que suenen interpretadas y no sintetizadas. Para ello rediseñó el proceso con un tokenizador de audio de ocho capas, un modelo de lenguaje híbrido que combina un modelo global de 8B inicializado desde Qwen3.5-8B con uno local de 0,6B, y un módulo de flow matching de 2,4B decodificado por un Flow-VAE de 123M. El anuncio no indicaba precios, licencia ni dónde descargar los pesos.

## Descripción

MiniMax Music es la línea musical de la gama multimodal de MiniMax. La versión 3.0 es un rediseño completo y no una simple actualización, y su etiqueta de pesos abiertos la convierte en uno de los pocos modelos de canciones completas que los desarrolladores podrían ejecutar por su cuenta. La versión pública anterior era Music 2.6, de abril de 2026.

## Novedades respecto a la versión anterior

- Versión anterior: MiniMax Music 2.6 (abril de 2026).
- Publicación con pesos abiertos, según el título del anuncio.
- Canciones completas de hasta cinco minutos en una sola generación.
- Nueva arquitectura: tokenizador RVQ de ocho capas, modelo de lenguaje híbrido de 8B + 0,6B, flow matching de 2,4B y decodificador Flow-VAE.

## Capacidades clave

- Generación de canciones a partir de una idea y una letra opcional.
- Voces y arreglos con varios instrumentos.
- Descripciones detalladas de la evolución de la emoción, la instrumentación y la interpretación vocal.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Music Arena (Vocals) | No publicado | — | — | — |
| Artificial Analysis Music Arena (Instrumental) | No publicado | — | — | — |

## Precios y disponibilidad

- Precio: no publicado en el anuncio.
- Acceso: Pesos abiertos (ubicación de descarga y licencia no indicadas en el anuncio).
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- No se encontraron el enlace a los pesos ni la licencia en el texto del anuncio.
- No se leyó una puntuación independiente en arenas musicales para esta versión.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Los músicos pueden esperar canciones completas con voces que suenan interpretadas; falta comprobar su disponibilidad en apps.
- **Desarrolladores:** Los pesos abiertos y una arquitectura publicada lo convierten en candidato para generar canciones en servidores propios, una vez confirmada la licencia.

## Fuentes

1. [MiniMax: MiniMax Music 3.0, next-generation open-weights music model](https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model) (2026-08-13)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
