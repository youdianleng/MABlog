---
schema: mablog-ai-model/1
review_status: reviewed
slug: gemini-3-8-flash-tts
title_en: "Gemini 3.8 Flash TTS: Google's studio-grade text-to-speech model"
title_es: "Gemini 3.8 Flash TTS: el modelo de texto a voz de calidad de estudio de Google"
provider: Google
provider_key: google
model: Gemini 3.8 Flash TTS
version: "3.8"
family: gemini-flash-tts
superseded_by: null
category: voice-sound
release_date: 2026-09-22
status: generally_available
access:
  - Free access
  - API
regions: null
accent: blue
context_window: null
official_sources:
  - url: "https://ai.google.dev/gemini-api/docs/changelog"
    label: Gemini API changelog
    published: 2026-09-22
  - url: "https://ai.google.dev/gemini-api/docs/pricing"
    label: Gemini Developer API pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 0.5
    output: 9
    amount: null
    currency: USD
    variant: introductory price through 2026-12-31
    source_url: "https://ai.google.dev/gemini-api/docs/pricing"
    quote: "Output price Free of charge $9.00 (audio) through December 31, 2026. $18.00 (audio) starting January 1, 2027."
plans: []
benchmarks: []
review_notes: []
---

# English

## Summary

Gemini 3.8 Flash TTS is Google's flagship creative text-to-speech model, made generally available in the Gemini API on September 22, 2026 together with Gemini 3.8 Flash-Lite TTS and a new Voices endpoint. Google says it is engineered for studio-grade voice fidelity, nuanced acting, regional dialects and long-form multi-turn stability. With the launch, developers can design persistent custom voices from text prompts, replicate voices with consent verification, and choose from more than 150 prebuilt and custom voices. A free tier is available in Google AI Studio. On the paid tier, text input costs $0.50 per million tokens and audio output $9.00 per million tokens through December 31, 2026, which Google equates to about $0.00225 per 10 seconds of audio; from January 1, 2027 the prices double to $1.00 and $18.00. Availability in the Gemini app was not stated in the sources read for this file.

## Description

Flash TTS is aimed at narration, characters and other expressive speech where quality matters more than raw speed, while Flash-Lite TTS covers high-volume and real-time use. The new voice design and replication tools make it possible to keep a consistent custom voice across an application.

## What's new compared with the previous version

- Previous Google TTS model in the API: gemini-3.1-flash-tts-preview.
- Generally available instead of preview.
- Voice design from text prompts, voice replication with consent verification, and a library of 150+ voices.
- Introductory pricing until December 31, 2026.

## Key capabilities

- Text-to-speech with expressive acting and regional dialects.
- Long-form, multi-turn speech generation.
- Custom voices through the Gemini API Voices endpoint.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | Not published | — | — | — |

## Pricing and availability

- **API (until 2026-12-31):** $0.50 per 1M text input tokens and $9.00 per 1M audio output tokens (about $0.00225 per 10 s of audio).
- **API (from 2027-01-01):** $1.00 per 1M input tokens and $18.00 per 1M audio output tokens.
- **Free tier:** free of charge within limits.
- Access: Free access, API.
- Status: Generally available.

## Limitations and caveats

- The introductory price ends on December 31, 2026, after which prices double.
- Voice replication requires consent verification.

## Best for users / best for developers

- **Users:** Creators and narrators will meet it through apps built on the Gemini API; it is a developer release.
- **Developers:** Studio-grade quality, voice design and a free tier make it a strong option for narration and character voices.

## Sources

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-22)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

Gemini 3.8 Flash TTS es el modelo principal de texto a voz creativo de Google, disponible de forma general en la API de Gemini desde el 22 de septiembre de 2026, junto a Gemini 3.8 Flash-Lite TTS y un nuevo endpoint de voces. Google afirma que está diseñado para una fidelidad de voz de calidad de estudio, interpretación con matices, dialectos regionales y estabilidad en textos largos y conversaciones de varios turnos. Con el lanzamiento, los desarrolladores pueden diseñar voces personalizadas persistentes a partir de descripciones de texto, replicar voces con verificación de consentimiento y elegir entre más de 150 voces predefinidas y personalizadas. Hay un nivel gratuito en Google AI Studio. En el nivel de pago, la entrada de texto cuesta 0,50 $ por millón de tokens y la salida de audio 9,00 $ por millón de tokens hasta el 31 de diciembre de 2026, lo que Google equipara a unos 0,00225 $ por cada 10 segundos de audio; desde el 1 de enero de 2027 los precios se duplican a 1,00 $ y 18,00 $. Las fuentes leídas no indicaban su disponibilidad en la app de Gemini.

## Descripción

Flash TTS se orienta a narración, personajes y otra voz expresiva en la que la calidad importa más que la velocidad, mientras que Flash-Lite TTS cubre usos de gran volumen y en tiempo real. Las nuevas herramientas de diseño y réplica de voz permiten mantener una voz personalizada coherente en toda una aplicación.

## Novedades respecto a la versión anterior

- Modelo TTS anterior de Google en la API: gemini-3.1-flash-tts-preview.
- Disponible de forma general en lugar de vista previa.
- Diseño de voces a partir de texto, réplica de voces con verificación de consentimiento y una biblioteca de más de 150 voces.
- Precio de lanzamiento hasta el 31 de diciembre de 2026.

## Capacidades clave

- Texto a voz con interpretación expresiva y dialectos regionales.
- Generación de voz larga y de varios turnos.
- Voces personalizadas mediante el endpoint de voces de la API de Gemini.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API (hasta el 2026-12-31):** 0,50 $ por 1M de tokens de texto de entrada y 9,00 $ por 1M de tokens de audio de salida (unos 0,00225 $ por 10 s de audio).
- **API (desde el 2027-01-01):** 1,00 $ por 1M de tokens de entrada y 18,00 $ por 1M de tokens de audio de salida.
- **Nivel gratuito:** gratis dentro de los límites.
- Acceso: Acceso gratuito, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- El precio de lanzamiento termina el 31 de diciembre de 2026; después, los precios se duplican.
- La réplica de voces exige verificación de consentimiento.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Creadores y narradores lo usarán a través de apps construidas sobre la API de Gemini; es una versión para desarrolladores.
- **Desarrolladores:** La calidad de estudio, el diseño de voces y el nivel gratuito lo convierten en una opción sólida para narración y voces de personajes.

## Fuentes

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-22)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
