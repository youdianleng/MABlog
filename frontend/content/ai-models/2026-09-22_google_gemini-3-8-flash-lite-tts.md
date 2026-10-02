---
schema: mablog-ai-model/1
review_status: draft
slug: gemini-3-8-flash-lite-tts
title_en: "Gemini 3.8 Flash-Lite TTS: fast, low-cost speech for voice agents"
title_es: "Gemini 3.8 Flash-Lite TTS: voz rápida y económica para agentes"
provider: Google
provider_key: google
model: Gemini 3.8 Flash-Lite TTS
version: "3.8"
family: gemini-flash-lite-tts
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
    output: 6
    amount: null
    currency: USD
    variant: introductory price through 2026-12-31
    source_url: "https://ai.google.dev/gemini-api/docs/pricing"
    quote: "Output price Free of charge $6.00 (audio) through December 31, 2026. $12.00 (audio) starting January 1, 2027."
plans: []
benchmarks: []
review_notes:
  - "The pricing entry quotes the output row; the $0.50 text input price is in the input row, which is the same as for Gemini 3.8 Flash TTS."
  - Gemini app availability was not checked.
---

# English

## Summary

Gemini 3.8 Flash-Lite TTS is Google's fast, cost-efficient text-to-speech model, made generally available in the Gemini API on September 22, 2026 together with Gemini 3.8 Flash TTS. Google built it to replace gemini-3.1-flash-tts-preview for high-throughput production and real-time voice agent cascades, where a text model's answer is spoken aloud with as little delay as possible. It works with the new Voices endpoint, so developers can design custom voices from text prompts, replicate voices with consent verification and pick from more than 150 prebuilt and custom voices. A free tier is available in Google AI Studio. On the paid tier, text input costs $0.50 per million tokens and audio output $6.00 per million tokens through December 31, 2026, about $0.0015 per 10 seconds of audio; from January 1, 2027 the prices rise to $1.00 and $12.00. Availability in the Gemini app was not stated in the sources read for this file.

## Description

Flash-Lite TTS is the volume option of Google's new speech pair: cheaper and faster than Flash TTS, and intended for agents and services that generate a lot of speech. It directly replaces the earlier 3.1 Flash TTS preview in production setups.

## What's new compared with the previous version

- Previous version: gemini-3.1-flash-tts-preview, which Google says this model is built to replace.
- Generally available instead of preview.
- Access to voice design, voice replication and the 150+ voice library.
- Introductory pricing until December 31, 2026.

## Key capabilities

- Low-latency text-to-speech for real-time voice agents.
- High-throughput production speech.
- Custom voices through the Gemini API Voices endpoint.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | Not published | — | — | — |

## Pricing and availability

- **API (until 2026-12-31):** $0.50 per 1M text input tokens and $6.00 per 1M audio output tokens (about $0.0015 per 10 s of audio).
- **API (from 2027-01-01):** $1.00 per 1M input tokens and $12.00 per 1M audio output tokens.
- **Free tier:** free of charge within limits.
- Access: Free access, API.
- Status: Generally available.

## Limitations and caveats

- The introductory price ends on December 31, 2026, after which prices double.
- Google positions Flash TTS, not Flash-Lite TTS, for the most expressive studio-grade output.

## Best for users / best for developers

- **Users:** End users hear it inside voice agents and apps; it is a developer release.
- **Developers:** The cheapest Gemini 3.8 voice output makes it the natural choice for high-volume agents and spoken replies.

## Sources

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-22)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.

# Español

## Resumen

Gemini 3.8 Flash-Lite TTS es el modelo de texto a voz rápido y económico de Google, disponible de forma general en la API de Gemini desde el 22 de septiembre de 2026, junto a Gemini 3.8 Flash TTS. Google lo creó para sustituir a gemini-3.1-flash-tts-preview en producción de gran volumen y en cadenas de agentes de voz en tiempo real, donde la respuesta de un modelo de texto se pronuncia con el menor retraso posible. Funciona con el nuevo endpoint de voces, de modo que los desarrolladores pueden diseñar voces personalizadas a partir de texto, replicar voces con verificación de consentimiento y elegir entre más de 150 voces predefinidas y personalizadas. Hay un nivel gratuito en Google AI Studio. En el nivel de pago, la entrada de texto cuesta 0,50 $ por millón de tokens y la salida de audio 6,00 $ por millón de tokens hasta el 31 de diciembre de 2026, unos 0,0015 $ por cada 10 segundos de audio; desde el 1 de enero de 2027 los precios suben a 1,00 $ y 12,00 $. Las fuentes leídas no indicaban su disponibilidad en la app de Gemini.

## Descripción

Flash-Lite TTS es la opción de volumen de la nueva pareja de voz de Google: más barata y rápida que Flash TTS, y pensada para agentes y servicios que generan mucha voz. Sustituye directamente a la anterior vista previa 3.1 Flash TTS en entornos de producción.

## Novedades respecto a la versión anterior

- Versión anterior: gemini-3.1-flash-tts-preview, que según Google este modelo viene a sustituir.
- Disponible de forma general en lugar de vista previa.
- Acceso al diseño y la réplica de voces y a la biblioteca de más de 150 voces.
- Precio de lanzamiento hasta el 31 de diciembre de 2026.

## Capacidades clave

- Texto a voz de baja latencia para agentes de voz en tiempo real.
- Voz de producción de gran volumen.
- Voces personalizadas mediante el endpoint de voces de la API de Gemini.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Artificial Analysis Speech Arena | No publicado | — | — | — |

## Precios y disponibilidad

- **API (hasta el 2026-12-31):** 0,50 $ por 1M de tokens de texto de entrada y 6,00 $ por 1M de tokens de audio de salida (unos 0,0015 $ por 10 s de audio).
- **API (desde el 2027-01-01):** 1,00 $ por 1M de tokens de entrada y 12,00 $ por 1M de tokens de audio de salida.
- **Nivel gratuito:** gratis dentro de los límites.
- Acceso: Acceso gratuito, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- El precio de lanzamiento termina el 31 de diciembre de 2026; después, los precios se duplican.
- Google reserva Flash TTS, no Flash-Lite TTS, para la salida más expresiva con calidad de estudio.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Los usuarios lo escuchan dentro de agentes de voz y apps; es una versión para desarrolladores.
- **Desarrolladores:** Al ser la salida de voz más barata de Gemini 3.8, es la opción natural para agentes de gran volumen y respuestas habladas.

## Fuentes

1. [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) (2026-09-22)
2. [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
