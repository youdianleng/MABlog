---
schema: mablog-ai-model/1
review_status: reviewed
slug: lyria-3-5
title_en: "Lyria 3.5: Google's full-song music model is generally available"
title_es: "Lyria 3.5: el modelo de canciones completas de Google, disponible de forma general"
provider: Google
provider_key: google
model: Lyria 3.5
version: "3.5"
family: lyria-pro
superseded_by: null
category: music
release_date: 2026-09-03
status: generally_available
access:
  - API
regions: null
accent: sage
context_window: null
official_sources:
  - url: "https://ai.google.dev/gemini-api/docs/changelog"
    label: Gemini API changelog
    published: 2026-09-03
  - url: "https://ai.google.dev/gemini-api/docs/pricing"
    label: Gemini Developer API pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-song
    input: null
    output: null
    amount: 0.08
    currency: USD
    variant: null
    source_url: "https://ai.google.dev/gemini-api/docs/pricing"
    quote: "Lyria 3.5 (Full Song) Not available $0.08 per song"
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

Lyria 3.5 is Google's newest music generation model, made generally available in the Gemini API on September 3, 2026. It generates full-length songs with what Google describes as improved musical coherence, natural vocals and fine-grained control over duration and structure. Prompts can combine text and images, and the output is high-fidelity 44.1 kHz stereo audio. It succeeds the Lyria 3 previews, including Lyria 3 Pro, which Google's pricing page now lists as its legacy music generation models. Developers pay $0.08 per full song on the paid tier of the Gemini API, the same per-song price as the Lyria 3 Pro preview; there is no free tier for the model. Google documents it in the API's music generation guide with code samples. Availability in the Gemini app and in Google AI subscription plans was not stated in the sources read for this file.

## Description

Lyria is Google DeepMind's music model family. Lyria 3.5 is the first generally available full-song release in the Gemini API, where the earlier Lyria 3 Pro was a preview. It is aimed at developers who want to add song generation to their own products, with control over how long a track runs and how it is structured.

## What's new compared with the previous version

- Previous version: Lyria 3 Pro (preview).
- Generally available instead of preview.
- Google cites improved musical coherence, more natural vocals and finer control of duration and structure.
- Accepts image input as well as text.

## Key capabilities

- Full-length song generation with vocals.
- Text and image input.
- High-fidelity 44.1 kHz stereo output.
- Duration and structure control.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Music Arena (Vocals) | Not published | — | — | — |
| Artificial Analysis Music Arena (Instrumental) | Not published | — | — | — |

## Pricing and availability

- **API:** $0.08 per full song (paid tier).
- **Free tier:** not available.
- Subscription plans: not published for this model in the sources read.
- Access: API.
- Status: Generally available.

## Limitations and caveats

- Paid tier only.
- No independent music-arena score was found yet for this version.

## Best for users / best for developers

- **Users:** Musicians and hobbyists will mainly reach Lyria through Google's apps; this file covers the API release, so app access still needs checking.
- **Developers:** A flat $0.08 per song and full-song control make it easy to budget for music features in apps and games.

## Sources

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-03)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

Lyria 3.5 es el modelo de generación musical más reciente de Google, disponible de forma general en la API de Gemini desde el 3 de septiembre de 2026. Genera canciones completas con lo que Google describe como mayor coherencia musical, voces naturales y un control preciso de la duración y la estructura. Los prompts pueden combinar texto e imágenes, y la salida es audio estéreo de alta fidelidad a 44,1 kHz. Sucede a las vistas previas de Lyria 3, incluida Lyria 3 Pro, que la página de precios de Google muestra ahora como modelos musicales heredados. Los desarrolladores pagan 0,08 $ por canción completa en el nivel de pago de la API de Gemini, el mismo precio por canción que la vista previa de Lyria 3 Pro; no hay nivel gratuito para el modelo. Google lo documenta en la guía de generación musical de la API, con ejemplos de código. Las fuentes leídas no indicaban su disponibilidad en la app de Gemini ni en los planes de suscripción de Google AI.

## Descripción

Lyria es la familia de modelos musicales de Google DeepMind. Lyria 3.5 es la primera versión de canciones completas disponible de forma general en la API de Gemini, donde la anterior Lyria 3 Pro era una vista previa. Está pensada para desarrolladores que quieren añadir generación de canciones a sus productos, con control sobre la duración y la estructura de cada pista.

## Novedades respecto a la versión anterior

- Versión anterior: Lyria 3 Pro (vista previa).
- Disponible de forma general en lugar de vista previa.
- Google menciona mayor coherencia musical, voces más naturales y un control más fino de la duración y la estructura.
- Acepta imágenes además de texto.

## Capacidades clave

- Generación de canciones completas con voz.
- Entrada de texto e imagen.
- Salida estéreo de alta fidelidad a 44,1 kHz.
- Control de duración y estructura.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Music Arena (Vocals) | No publicado | — | — | — |
| Artificial Analysis Music Arena (Instrumental) | No publicado | — | — | — |

## Precios y disponibilidad

- **API:** 0,08 $ por canción completa (nivel de pago).
- **Nivel gratuito:** no disponible.
- Planes de suscripción: no publicados para este modelo en las fuentes leídas.
- Acceso: API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Solo en el nivel de pago.
- Todavía no hay una puntuación independiente en arenas musicales para esta versión.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Músicos y aficionados llegarán a Lyria sobre todo por las apps de Google; esta ficha cubre la versión de la API, así que falta comprobar el acceso desde las apps.
- **Desarrolladores:** Un precio fijo de 0,08 $ por canción y el control de canciones completas facilitan presupuestar funciones musicales en apps y juegos.

## Fuentes

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-03)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
