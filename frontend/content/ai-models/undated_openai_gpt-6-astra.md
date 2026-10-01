---
schema: mablog-ai-model/1
review_status: draft
slug: gpt-6-astra
title_en: "GPT-6 Astra: OpenAI's reasoning and coding model with a 1M-token context"
title_es: "GPT-6 Astra: el modelo de razonamiento y código de OpenAI con 1M de contexto"
provider: OpenAI
provider_key: openai
model: GPT-6 Astra
version: "6"
family: gpt-6
category: llm-agents
release_date: null
status: generally_available
access:
  - Subscription
  - API
regions: null
accent: sage
context_window: 1050000
official_sources:
  - url: https://developers.openai.com/api/docs/models/gpt-6-astra
    label: "OpenAI API model page: GPT-6 Astra"
    published: null
  - url: https://chatgpt.com/pricing
    label: ChatGPT pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 10
    output: 50
    amount: null
    currency: USD
    variant: null
    source_url: https://developers.openai.com/api/docs/models/gpt-6-astra
    quote: null
    evidence: price-check-2026-10-01
plans:
  - name: ChatGPT Plus
    price_monthly: null
    currency: USD
    includes:
      - GPT-6 Astra
    limits: null
    regions: null
    source_url: https://chatgpt.com/pricing
    quote: "Plan: Plus, Feature: GPT-6 Astra, Yes"
  - name: ChatGPT Pro
    price_monthly: null
    currency: USD
    includes:
      - GPT-6 Astra (expanded)
      - Longer Codex sessions
    limits: null
    regions: null
    source_url: https://chatgpt.com/pricing
    quote: Pro reasoning powered by GPT-6 Astra
benchmarks:
  - name: Artificial Analysis
    metric: Coding Agent Index v1.5
    score: "62"
    confidence_interval: null
    samples: 303 tasks · 3 attempts/task
    source_rank: 1–2
    kind: independent
    source_label: Artificial Analysis
    source_url: https://artificialanalysis.ai/agents/coding-agents
    measured_at: 2026-09-22
    quote: null
    evidence: snapshot-2026-09-22
    ranking: coding
review_notes:
  - Release date is not stated on the API model page (only the Apr 30, 2026 knowledge cutoff).
  - ChatGPT plan prices are rendered per region by script and are not in the page text; check them in a browser before marking reviewed.
---

# English

## Summary

GPT-6 Astra is OpenAI's end-to-end reasoning and coding model, with a 1,050,000-token context window, up to 128,000 output tokens and an April 30, 2026 knowledge cutoff. In MAblog's production-coding ranking it is statistically level with Claude Fable 5.1 at 62 points on the Artificial Analysis Coding Agent Index v1.5. In ChatGPT, GPT-6 Astra is included in the Plus plan and in an expanded form in Pro, where OpenAI describes Pro reasoning as powered by GPT-6 Astra and lists longer Codex sessions. Developers can call it through the OpenAI API at $10 per million input tokens and $50 per million output tokens, with built-in tools such as web search, code interpreter, file search and computer use, and reasoning effort settings from low to max.

## Description

Astra is the reasoning-focused member of OpenAI's GPT-6 family. The API model page lists first-party tools for web search, code interpreter, file search, hosted shell, apply patch, skills, MCP and computer use, which makes it practical for agents that need to act across files, terminals and the web. Its very large context window lets it work over whole repositories or long document sets in one request. In ChatGPT it powers the Pro plan's reasoning mode and is available to Plus subscribers.

## What's new compared with the previous version

- Not published by the provider.

## Key capabilities

- 1,050,000-token context window and up to 128,000 output tokens.
- Reasoning effort settings: low, medium, high, xhigh and max.
- Built-in tools including web search, code interpreter, file search, MCP and computer use.
- Available in ChatGPT Plus and Pro, and in the OpenAI API.

## Benchmarks

| Benchmark                              | Score         | Kind        | Source                                                                    | Date       |
| -------------------------------------- | ------------- | ----------- | ------------------------------------------------------------------------- | ---------- |
| Coding Agent Index v1.5                | 62            | independent | [Artificial Analysis](https://artificialanalysis.ai/agents/coding-agents) | 2026-09-22 |
| SWE-bench Verified                     | Not published | —           | —                                                                         | —          |
| Terminal-Bench                         | Not published | —           | —                                                                         | —          |
| Artificial Analysis Intelligence Index | Not published | —           | —                                                                         | —          |

## Pricing and availability

- **Comparable price on /ai-models:** $10 per 1M input tokens and $50 per 1M output tokens; migrated from the 2026-10-01 price check.
- **ChatGPT Plus:** price not published in the page text; includes GPT-6 Astra. Price shown per region on the pricing page; not in the page text.
- **ChatGPT Pro:** price not published in the page text; includes GPT-6 Astra (expanded), Longer Codex sessions. Price shown per region on the pricing page; not in the page text.
- Access: Subscription, API.
- Status: Generally available.

## Limitations and caveats

- The API model page lists endpoints it does not support, including Realtime, Assistants, fine-tuning, embeddings and image, video or speech generation.
- Release date: not published on the API model page.

## Best for users / best for developers

- **Users:** A strong fit for users who want coding work connected to broader research and document workflows.
- **Developers:** Broad tool support and a large context window make it practical for complex software workflows.

## Sources

1. [OpenAI API model page: GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra)
2. [ChatGPT pricing](https://chatgpt.com/pricing)
3. [Artificial Analysis (evaluated 2026-09-22)](https://artificialanalysis.ai/agents/coding-agents)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.

# Español

## Resumen

GPT-6 Astra es el modelo integral de razonamiento y programación de OpenAI, con una ventana de contexto de 1.050.000 tokens, hasta 128.000 tokens de salida y conocimiento hasta el 30 de abril de 2026. En la clasificación de código de producción de MAblog está estadísticamente empatado con Claude Fable 5.1, con 62 puntos en el Coding Agent Index v1.5 de Artificial Analysis. En ChatGPT, GPT-6 Astra está incluido en el plan Plus y, de forma ampliada, en Pro, cuyo razonamiento según OpenAI funciona con GPT-6 Astra y que ofrece sesiones de Codex más largas. Los desarrolladores pueden usarlo mediante la API de OpenAI a 10 $ por millón de tokens de entrada y 50 $ por millón de salida, con herramientas integradas como búsqueda web, intérprete de código, búsqueda de archivos y uso del ordenador, y niveles de razonamiento de low a max.

## Descripción

Astra es el miembro centrado en el razonamiento de la familia GPT-6 de OpenAI. La página del modelo en la API enumera herramientas propias de búsqueda web, intérprete de código, búsqueda de archivos, shell alojado, aplicación de parches, skills, MCP y uso del ordenador, lo que lo hace práctico para agentes que actúan sobre archivos, terminales y la web. Su enorme ventana de contexto le permite trabajar con repositorios completos o grandes conjuntos de documentos en una sola petición. En ChatGPT impulsa el modo de razonamiento del plan Pro y está disponible para suscriptores Plus.

## Novedades respecto a la versión anterior

- No publicado por el proveedor.

## Capacidades clave

- Ventana de contexto de 1.050.000 tokens y hasta 128.000 tokens de salida.
- Niveles de razonamiento: low, medium, high, xhigh y max.
- Herramientas integradas como búsqueda web, intérprete de código, búsqueda de archivos, MCP y uso del ordenador.
- Disponible en ChatGPT Plus y Pro, y en la API de OpenAI.

## Benchmarks

| Benchmark                              | Puntuación   | Tipo          | Fuente                                                                    | Fecha      |
| -------------------------------------- | ------------ | ------------- | ------------------------------------------------------------------------- | ---------- |
| Coding Agent Index v1.5                | 62           | independiente | [Artificial Analysis](https://artificialanalysis.ai/agents/coding-agents) | 2026-09-22 |
| SWE-bench Verified                     | No publicado | —             | —                                                                         | —          |
| Terminal-Bench                         | No publicado | —             | —                                                                         | —          |
| Artificial Analysis Intelligence Index | No publicado | —             | —                                                                         | —          |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 10 $ por 1M de tokens de entrada y 50 $ por 1M de salida; valor migrado de la comprobación de precios del 2026-10-01.
- **ChatGPT Plus:** precio no publicado en el texto de la página; incluye GPT-6 Astra. Precio mostrado por región en la página; no aparece en el texto.
- **ChatGPT Pro:** precio no publicado en el texto de la página; incluye GPT-6 Astra (expanded), Longer Codex sessions. Precio mostrado por región en la página; no aparece en el texto.
- Acceso: Suscripción, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- La página del modelo enumera endpoints no compatibles, como Realtime, Assistants, fine-tuning, embeddings y generación de imagen, vídeo o voz.
- Fecha de lanzamiento: no publicada en la página del modelo.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Una opción sólida para quienes quieren conectar el código con investigación y documentos.
- **Desarrolladores:** Su amplio soporte de herramientas y gran contexto resulta práctico para flujos de software complejos.

## Fuentes

1. [OpenAI API model page: GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra)
2. [ChatGPT pricing](https://chatgpt.com/pricing)
3. [Artificial Analysis (evaluado 2026-09-22)](https://artificialanalysis.ai/agents/coding-agents)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
