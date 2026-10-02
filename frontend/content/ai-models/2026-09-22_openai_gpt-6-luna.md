---
schema: mablog-ai-model/1
review_status: reviewed
slug: gpt-6-luna
title_en: "GPT-6 Luna: OpenAI's most efficient GPT-6 model"
title_es: "GPT-6 Luna: el modelo GPT-6 más eficiente de OpenAI"
provider: OpenAI
provider_key: openai
model: GPT-6 Luna
version: "6"
family: gpt-luna
superseded_by: null
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
  - url: "https://developers.openai.com/api/docs/models/gpt-6-luna"
    label: "OpenAI API model page: GPT-6 Luna"
    published: null
  - url: "https://chatgpt.com/pricing"
    label: ChatGPT pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 0.1
    output: 0.5
    amount: null
    currency: USD
    variant: null
    source_url: "https://developers.openai.com/api/docs/models/gpt-6-luna"
    quote: "Price $0.1 • $0.5 Input • Output"
plans:
  - name: ChatGPT Plus
    price_monthly: null
    currency: USD
    includes:
      - GPT-6 Luna
    limits: null
    regions: null
    source_url: "https://chatgpt.com/pricing"
    quote: "Plan: Plus, Feature: GPT-6 Luna, Yes"
  - name: ChatGPT Pro
    price_monthly: null
    currency: USD
    includes:
      - GPT-6 Luna (expanded)
    limits: null
    regions: null
    source_url: "https://chatgpt.com/pricing"
    quote: "Plan: Pro, Feature: GPT-6 Luna, Expanded"
benchmarks: []
review_notes: []
---

# English

## Summary

GPT-6 Luna is the most efficient model in OpenAI's GPT-6 generation, announced on September 22, 2026 alongside GPT-6 Sol. OpenAI describes it as its most efficient model for focused, high-volume tasks, and prices it on the API at $0.10 per million input tokens and $0.50 per million output tokens, one-twentieth of Sol's price. It keeps the same 1,050,000-token context window and 128,000-token output limit as Sol, has a May 18, 2026 knowledge cutoff and supports reasoning effort settings from none to max. In ChatGPT, GPT-6 Luna is included in the Plus plan and in expanded form in Pro, but not in Free or Go, where the pricing page still lists GPT-5.6 Luna for free users. Developers can use it through the Responses API for built-in tools, or through Chat Completions with function calling when reasoning is set to none.

## Description

Luna is the low-cost member of the GPT-6 lineup, below Sol and Astra. It suits classification, extraction, routing and other high-volume jobs where price and speed matter more than peak reasoning. The API model page lists EU data residency with Standard, Flex and Batch processing, with Batch and Flex at half the Standard rate.

## What's new compared with the previous version

- Previous version: GPT-5.6 Luna.
- Moves the Luna line to the GPT-6 generation, with a 1,050,000-token context window and a May 18, 2026 knowledge cutoff.
- A detailed comparison with GPT-5.6 Luna was not available in the sources read (the announcement page blocks scripts).

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

- **API:** $0.10 per 1M input tokens and $0.50 per 1M output tokens; cached input $0.01 per 1M tokens.
- **ChatGPT Plus:** price not published in the page text; includes GPT-6 Luna.
- **ChatGPT Pro:** price not published in the page text; includes GPT-6 Luna (expanded).
- Not included in ChatGPT Free or Go.
- Access: Subscription, API.
- Status: Generally available.

## Limitations and caveats

- Chat Completions supports function calling only with reasoning effort set to none.
- Prompts with more than 272K input tokens are billed at 2x input and 1.5x output rates.

## Best for users / best for developers

- **Users:** Most people meet it inside ChatGPT Plus or Pro for quick everyday answers; free users still get GPT-5.6 Luna.
- **Developers:** At $0.10 and $0.50 per million tokens with a million-token context, it is a cheap default for high-volume pipelines and agent sub-tasks.

## Sources

1. [OpenAI: Introducing GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna) (2026-09-22)
2. [OpenAI API model page: GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
3. [ChatGPT pricing](https://chatgpt.com/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

GPT-6 Luna es el modelo más eficiente de la generación GPT-6 de OpenAI, anunciado el 22 de septiembre de 2026 junto a GPT-6 Sol. OpenAI lo describe como su modelo más eficiente para tareas concretas y de gran volumen, y en la API cuesta 0,10 $ por millón de tokens de entrada y 0,50 $ por millón de salida, la vigésima parte del precio de Sol. Mantiene la misma ventana de contexto de 1.050.000 tokens y el límite de 128.000 tokens de salida que Sol, tiene conocimiento hasta el 18 de mayo de 2026 y admite niveles de razonamiento de none a max. En ChatGPT, GPT-6 Luna está incluido en el plan Plus y, de forma ampliada, en Pro, pero no en Free ni Go, donde la página de precios sigue mostrando GPT-5.6 Luna para usuarios gratuitos. Los desarrolladores pueden usarlo mediante la Responses API con herramientas integradas, o con Chat Completions y llamadas a funciones si el razonamiento está en none.

## Descripción

Luna es el miembro económico de la gama GPT-6, por debajo de Sol y Astra. Encaja en clasificación, extracción, enrutamiento y otros trabajos de gran volumen en los que el precio y la velocidad importan más que el razonamiento máximo. La página del modelo ofrece residencia de datos en la UE con procesamiento Standard, Flex y Batch, y Batch y Flex cuestan la mitad de la tarifa Standard.

## Novedades respecto a la versión anterior

- Versión anterior: GPT-5.6 Luna.
- Lleva la línea Luna a la generación GPT-6, con una ventana de contexto de 1.050.000 tokens y conocimiento hasta el 18 de mayo de 2026.
- No había una comparación detallada con GPT-5.6 Luna en las fuentes leídas (la página del anuncio bloquea scripts).

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

- **API:** 0,10 $ por 1M de tokens de entrada y 0,50 $ por 1M de salida; entrada en caché a 0,01 $ por 1M de tokens.
- **ChatGPT Plus:** precio no publicado en el texto de la página; incluye GPT-6 Luna.
- **ChatGPT Pro:** precio no publicado en el texto de la página; incluye GPT-6 Luna (ampliado).
- No incluido en ChatGPT Free ni Go.
- Acceso: Suscripción, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Chat Completions solo admite llamadas a funciones con el razonamiento en none.
- Los prompts de más de 272K tokens de entrada se cobran a 2x en entrada y 1,5x en salida.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** La mayoría lo usará dentro de ChatGPT Plus o Pro para respuestas rápidas del día a día; los usuarios gratuitos siguen con GPT-5.6 Luna.
- **Desarrolladores:** A 0,10 $ y 0,50 $ por millón de tokens y con un millón de tokens de contexto, es una opción barata por defecto para flujos de gran volumen y subtareas de agentes.

## Fuentes

1. [OpenAI: Introducing GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna) (2026-09-22)
2. [OpenAI API model page: GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
3. [ChatGPT pricing](https://chatgpt.com/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
