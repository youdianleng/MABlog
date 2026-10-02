---
schema: mablog-ai-model/1
review_status: reviewed
slug: gpt-6-1-sol
title_en: "GPT-6.1 Sol: near-Astra performance at one-fifth of the price"
title_es: "GPT-6.1 Sol: rendimiento cercano a Astra por una quinta parte del precio"
provider: OpenAI
provider_key: openai
model: GPT-6.1 Sol
version: "6.1"
family: gpt-sol
superseded_by: null
category: llm-agents
release_date: 2026-09-29
status: generally_available
access:
  - Subscription
  - API
regions: null
accent: sage
context_window: 1050000
official_sources:
  - url: "https://openai.com/index/introducing-gpt-6-1-sol"
    label: "OpenAI: Introducing GPT-6.1 Sol"
    published: 2026-09-29
  - url: "https://developers.openai.com/api/docs/models/gpt-6.1-sol"
    label: "OpenAI API model page: GPT-6.1 Sol"
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
    source_url: "https://developers.openai.com/api/docs/models/gpt-6.1-sol"
    quote: "Price $2 • $10 Input • Output"
plans:
  - name: ChatGPT Plus
    price_monthly: null
    currency: USD
    includes:
      - GPT-6.1 Sol
    limits: null
    regions: null
    source_url: "https://chatgpt.com/pricing"
    quote: "Plan: Plus, Feature: GPT-6.1 Sol, Yes"
  - name: ChatGPT Pro
    price_monthly: null
    currency: USD
    includes:
      - GPT-6.1 Sol (expanded)
    limits: null
    regions: null
    source_url: "https://chatgpt.com/pricing"
    quote: "Plan: Pro, Feature: GPT-6.1 Sol, Expanded"
benchmarks: []
review_notes: []
---

# English

## Summary

GPT-6.1 Sol is OpenAI's newest Sol model, announced on September 29, 2026, one week after GPT-6 Sol. OpenAI says it delivers near-Astra performance for complex coding, computer use and professional work at one-fifth of GPT-6 Astra's standard API input and output prices. On the API it costs $2 per million input tokens and $10 per million output tokens, with cached input at $0.10, and it has a 1,050,000-token context window, up to 128,000 output tokens and an April 30, 2026 knowledge cutoff. Reasoning effort runs from low to max; the none and minimal settings are not supported. In ChatGPT it is included in the Plus plan and in expanded form in Pro, but not in Free or Go. OpenAI suggests comparing it with Astra on real tasks to judge the trade-off between quality and cost.

## Description

GPT-6.1 Sol replaces GPT-6 Sol as the middle model of OpenAI's lineup, between GPT-6 Astra and GPT-6 Luna. It keeps Sol's price but, according to OpenAI, moves much closer to Astra's quality, which makes it the cost-conscious choice for coding agents and computer-use tasks. It supports US and EU data residency, and Batch and Flex processing are half the Standard price.

## What's new compared with the previous version

- Previous version: GPT-6 Sol (September 22, 2026).
- OpenAI says it reaches near-Astra intelligence for coding, computer use and professional work.
- Same $2 and $10 per million token price as GPT-6 Sol, with cached input halved to $0.10.
- Newer knowledge cutoff (April 30, 2026, against April 20, 2026).
- Reasoning effort none is no longer supported, and Chat Completions works without tool calling.

## Key capabilities

- Text and image input, text output.
- 1,050,000-token context window and up to 128,000 output tokens.
- Reasoning effort: low, medium (default), high, xhigh and max.
- Tool calling through the Responses API; US and EU data residency.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | Not published | — | — | — |
| Terminal-Bench | Not published | — | — | — |
| Artificial Analysis Intelligence Index | Not published | — | — | — |
| Artificial Analysis Coding Agent Index | Not published | — | — | — |

## Pricing and availability

- **API:** $2 per 1M input tokens and $10 per 1M output tokens; cached input $0.10 per 1M tokens. Fast mode costs 2x Standard.
- **ChatGPT Plus:** price not published in the page text; includes GPT-6.1 Sol.
- **ChatGPT Pro:** price not published in the page text; includes GPT-6.1 Sol (expanded).
- Not included in ChatGPT Free or Go.
- Access: Subscription, API.
- Status: Generally available.

## Limitations and caveats

- The none and minimal reasoning efforts are not supported.
- Chat Completions is supported without tool calling; use the Responses API for tools.
- Fast mode is unavailable with EU data residency.
- Prompts with more than 272K input tokens are billed at 2x input and 1.5x output rates.

## Best for users / best for developers

- **Users:** ChatGPT Plus and Pro subscribers get it in the model picker as a faster, cheaper-to-run alternative to Astra for most coding and work tasks.
- **Developers:** At one-fifth of Astra's API price with near-Astra results, according to OpenAI, it is the natural first choice for coding agents before paying for Astra.

## Sources

1. [OpenAI: Introducing GPT-6.1 Sol](https://openai.com/index/introducing-gpt-6-1-sol) (2026-09-29)
2. [OpenAI API model page: GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
3. [ChatGPT pricing](https://chatgpt.com/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.
- 2026-10-02 — Marked reviewed by the site owner; open review notes moved to `docs/ai-models-review-checklist.md`.

# Español

## Resumen

GPT-6.1 Sol es el modelo Sol más reciente de OpenAI, anunciado el 29 de septiembre de 2026, una semana después de GPT-6 Sol. OpenAI afirma que ofrece un rendimiento cercano a Astra en programación compleja, uso del ordenador y trabajo profesional por una quinta parte de los precios estándar de entrada y salida de GPT-6 Astra en la API. Cuesta 2 $ por millón de tokens de entrada y 10 $ por millón de salida, con entrada en caché a 0,10 $, y tiene una ventana de contexto de 1.050.000 tokens, hasta 128.000 tokens de salida y conocimiento hasta el 30 de abril de 2026. El razonamiento va de low a max; los niveles none y minimal no están disponibles. En ChatGPT está incluido en el plan Plus y, de forma ampliada, en Pro, pero no en Free ni Go. OpenAI recomienda compararlo con Astra en tareas reales para valorar el equilibrio entre calidad y coste.

## Descripción

GPT-6.1 Sol sustituye a GPT-6 Sol como modelo intermedio de la gama de OpenAI, entre GPT-6 Astra y GPT-6 Luna. Mantiene el precio de Sol pero, según OpenAI, se acerca mucho a la calidad de Astra, lo que lo convierte en la opción económica para agentes de programación y tareas de uso del ordenador. Admite residencia de datos en EE. UU. y la UE, y el procesamiento Batch y Flex cuesta la mitad que Standard.

## Novedades respecto a la versión anterior

- Versión anterior: GPT-6 Sol (22 de septiembre de 2026).
- OpenAI afirma que alcanza una inteligencia cercana a Astra en programación, uso del ordenador y trabajo profesional.
- Mismo precio que GPT-6 Sol, 2 $ y 10 $ por millón de tokens, con la entrada en caché reducida a la mitad, 0,10 $.
- Conocimiento más reciente (30 de abril de 2026, frente al 20 de abril de 2026).
- Ya no admite el nivel de razonamiento none, y Chat Completions funciona sin llamadas a herramientas.

## Capacidades clave

- Entrada de texto e imagen, salida de texto.
- Ventana de contexto de 1.050.000 tokens y hasta 128.000 tokens de salida.
- Niveles de razonamiento: low, medium (por defecto), high, xhigh y max.
- Llamadas a herramientas mediante la Responses API; residencia de datos en EE. UU. y la UE.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | No publicado | — | — | — |
| Terminal-Bench | No publicado | — | — | — |
| Artificial Analysis Intelligence Index | No publicado | — | — | — |
| Artificial Analysis Coding Agent Index | No publicado | — | — | — |

## Precios y disponibilidad

- **API:** 2 $ por 1M de tokens de entrada y 10 $ por 1M de salida; entrada en caché a 0,10 $ por 1M de tokens. El modo rápido cuesta 2x Standard.
- **ChatGPT Plus:** precio no publicado en el texto de la página; incluye GPT-6.1 Sol.
- **ChatGPT Pro:** precio no publicado en el texto de la página; incluye GPT-6.1 Sol (ampliado).
- No incluido en ChatGPT Free ni Go.
- Acceso: Suscripción, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Los niveles de razonamiento none y minimal no están disponibles.
- Chat Completions funciona sin llamadas a herramientas; para herramientas hay que usar la Responses API.
- El modo rápido no está disponible con residencia de datos en la UE.
- Los prompts de más de 272K tokens de entrada se cobran a 2x en entrada y 1,5x en salida.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Los suscriptores de ChatGPT Plus y Pro lo tienen en el selector de modelos como alternativa más rápida y barata de ejecutar que Astra para la mayoría de tareas de código y trabajo.
- **Desarrolladores:** Por una quinta parte del precio de Astra en la API y con resultados cercanos a Astra, según OpenAI, es la primera opción natural para agentes de programación antes de pagar por Astra.

## Fuentes

1. [OpenAI: Introducing GPT-6.1 Sol](https://openai.com/index/introducing-gpt-6-1-sol) (2026-09-29)
2. [OpenAI API model page: GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
3. [ChatGPT pricing](https://chatgpt.com/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
- 2026-10-02 — Marcada como revisada por el responsable del sitio; las notas de revisión pendientes pasan a `docs/ai-models-review-checklist.md`.
