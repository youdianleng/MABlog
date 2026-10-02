---
schema: mablog-ai-model/1
review_status: reviewed
slug: gpt-6-sol
title_en: "GPT-6 Sol: OpenAI's coding and agent model for everyday work"
title_es: "GPT-6 Sol: el modelo de OpenAI para código y agentes en el trabajo diario"
provider: OpenAI
provider_key: openai
model: GPT-6 Sol
version: "6"
family: gpt-sol
superseded_by: gpt-6-1-sol
category: llm-agents
release_date: 2026-09-22
status: generally_available
access:
  - Subscription
  - API
regions: null
accent: sage
context_window: 1050000
official_sources:
  - url: "https://openai.com/index/introducing-gpt-6-sol-and-luna"
    label: "OpenAI: Introducing GPT-6 Sol and Luna"
    published: 2026-09-22
  - url: "https://developers.openai.com/api/docs/models/gpt-6-sol"
    label: "OpenAI API model page: GPT-6 Sol"
    published: null
  - url: "https://chatgpt.com/pricing"
    label: ChatGPT pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 2
    output: 10
    amount: null
    currency: USD
    variant: null
    source_url: "https://developers.openai.com/api/docs/models/gpt-6-sol"
    quote: "Price $2 • $10 Input • Output"
plans:
  - name: ChatGPT Plus
    price_monthly: null
    currency: USD
    includes:
      - GPT-6 Sol
    limits: null
    regions: null
    source_url: "https://chatgpt.com/pricing"
    quote: "Plan: Plus, Feature: GPT-6 Sol, Yes"
  - name: ChatGPT Pro
    price_monthly: null
    currency: USD
    includes:
      - GPT-6 Sol (expanded)
    limits: null
    regions: null
    source_url: "https://chatgpt.com/pricing"
    quote: "Plan: Pro, Feature: GPT-6 Sol, Expanded"
benchmarks: []
review_notes: []
---

# English

## Summary

GPT-6 Sol is an OpenAI model announced on September 22, 2026 together with GPT-6 Luna, in a launch OpenAI described as bringing frontier intelligence to everyday work with different balances of capability and cost. Sol is the stronger of the two and is built for complex coding and agentic workflows. On the API it has a 1,050,000-token context window, up to 128,000 output tokens, an April 20, 2026 knowledge cutoff and reasoning effort settings from none to max, and it costs $2 per million input tokens and $10 per million output tokens. In ChatGPT, GPT-6 Sol is included in the Plus plan and in expanded form in Pro; it is not part of the Free or Go plans. One week later, on September 29, 2026, OpenAI released GPT-6.1 Sol at the same API price, and the GPT-6 Sol model page now points to it as the newer Sol model.

## Description

Sol sits between OpenAI's top GPT-6 Astra model and the low-cost GPT-6 Luna. The API model page recommends the Responses API for built-in tools and function calling, offers EU data residency with Standard, Flex and Batch processing, and prices Batch and Flex at half the Standard rate. It accepts text and images and returns text.

## What's new compared with the previous version

- Previous version: GPT-5.6 Sol.
- Moves the Sol line to the GPT-6 generation, with a 1,050,000-token context window and an April 20, 2026 knowledge cutoff.
- A detailed comparison with GPT-5.6 Sol was not available in the sources read (the announcement page blocks scripts).

## Key capabilities

- Text and image input, text output.
- 1,050,000-token context window and up to 128,000 output tokens.
- Reasoning effort: none, low, medium (default), high, xhigh and max.
- Built-in tools and function calling through the Responses API.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | Not published | — | — | — |
| Terminal-Bench | Not published | — | — | — |
| Artificial Analysis Intelligence Index | Not published | — | — | — |
| Artificial Analysis Coding Agent Index | Not published | — | — | — |

## Pricing and availability

- **API:** $2 per 1M input tokens and $10 per 1M output tokens; cached input $0.20 per 1M tokens. Prompts above 272K input tokens cost more.
- **ChatGPT Plus:** price not published in the page text; includes GPT-6 Sol.
- **ChatGPT Pro:** price not published in the page text; includes GPT-6 Sol (expanded).
- Not included in ChatGPT Free or Go.
- Access: Subscription, API.
- Status: Generally available; superseded by GPT-6.1 Sol.

## Limitations and caveats

- Superseded by GPT-6.1 Sol on September 29, 2026; the model page points to the newer model.
- Chat Completions supports function calling only with reasoning effort set to none.
- Prompts with more than 272K input tokens are billed at 2x input and 1.5x output rates.

## Best for users / best for developers

- **Users:** ChatGPT Plus and Pro subscribers already have the newer GPT-6.1 Sol in the same plans, so this release matters mainly for existing workflows.
- **Developers:** A capable mid-priced coding model at $2 and $10 per million tokens, but new projects should start with GPT-6.1 Sol at the same price.

## Sources

1. [OpenAI: Introducing GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna) (2026-09-22)
2. [OpenAI API model page: GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol)
3. [ChatGPT pricing](https://chatgpt.com/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

GPT-6 Sol es un modelo de OpenAI anunciado el 22 de septiembre de 2026 junto a GPT-6 Luna, en un lanzamiento que OpenAI presentó como inteligencia de frontera para el trabajo diario con distintos equilibrios entre capacidad y coste. Sol es el más potente de los dos y está pensado para programación compleja y flujos agénticos. En la API tiene una ventana de contexto de 1.050.000 tokens, hasta 128.000 tokens de salida, conocimiento hasta el 20 de abril de 2026 y niveles de razonamiento de none a max, y cuesta 2 $ por millón de tokens de entrada y 10 $ por millón de salida. En ChatGPT, GPT-6 Sol está incluido en el plan Plus y, de forma ampliada, en Pro; no forma parte de los planes Free ni Go. Una semana después, el 29 de septiembre de 2026, OpenAI lanzó GPT-6.1 Sol al mismo precio de API, y la página de GPT-6 Sol remite ya a él como el modelo Sol más reciente.

## Descripción

Sol se sitúa entre GPT-6 Astra, el modelo principal de OpenAI, y el económico GPT-6 Luna. La página del modelo en la API recomienda la Responses API para herramientas integradas y llamadas a funciones, ofrece residencia de datos en la UE con procesamiento Standard, Flex y Batch, y cobra Batch y Flex a la mitad de la tarifa Standard. Acepta texto e imágenes y devuelve texto.

## Novedades respecto a la versión anterior

- Versión anterior: GPT-5.6 Sol.
- Lleva la línea Sol a la generación GPT-6, con una ventana de contexto de 1.050.000 tokens y conocimiento hasta el 20 de abril de 2026.
- No había una comparación detallada con GPT-5.6 Sol en las fuentes leídas (la página del anuncio bloquea scripts).

## Capacidades clave

- Entrada de texto e imagen, salida de texto.
- Ventana de contexto de 1.050.000 tokens y hasta 128.000 tokens de salida.
- Niveles de razonamiento: none, low, medium (por defecto), high, xhigh y max.
- Herramientas integradas y llamadas a funciones mediante la Responses API.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | No publicado | — | — | — |
| Terminal-Bench | No publicado | — | — | — |
| Artificial Analysis Intelligence Index | No publicado | — | — | — |
| Artificial Analysis Coding Agent Index | No publicado | — | — | — |

## Precios y disponibilidad

- **API:** 2 $ por 1M de tokens de entrada y 10 $ por 1M de salida; entrada en caché a 0,20 $ por 1M de tokens. Los prompts de más de 272K tokens de entrada cuestan más.
- **ChatGPT Plus:** precio no publicado en el texto de la página; incluye GPT-6 Sol.
- **ChatGPT Pro:** precio no publicado en el texto de la página; incluye GPT-6 Sol (ampliado).
- No incluido en ChatGPT Free ni Go.
- Acceso: Suscripción, API.
- Estado: Disponible de forma general; sustituido por GPT-6.1 Sol.

## Limitaciones y advertencias

- Sustituido por GPT-6.1 Sol el 29 de septiembre de 2026; la página del modelo remite al nuevo.
- Chat Completions solo admite llamadas a funciones con el razonamiento en none.
- Los prompts de más de 272K tokens de entrada se cobran a 2x en entrada y 1,5x en salida.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Los suscriptores de ChatGPT Plus y Pro ya tienen el nuevo GPT-6.1 Sol en los mismos planes, así que esta versión importa sobre todo para flujos ya existentes.
- **Desarrolladores:** Un modelo de código capaz y de precio medio, a 2 $ y 10 $ por millón de tokens, aunque los proyectos nuevos deberían empezar con GPT-6.1 Sol al mismo precio.

## Fuentes

1. [OpenAI: Introducing GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna) (2026-09-22)
2. [OpenAI API model page: GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol)
3. [ChatGPT pricing](https://chatgpt.com/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
