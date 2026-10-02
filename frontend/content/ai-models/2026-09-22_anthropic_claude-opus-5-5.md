---
schema: mablog-ai-model/1
review_status: draft
slug: claude-opus-5-5
title_en: "Claude Opus 5.5: Anthropic's cheaper Opus at Fable 5.1 level"
title_es: "Claude Opus 5.5: el Opus más barato de Anthropic al nivel de Fable 5.1"
provider: Anthropic
provider_key: anthropic
model: Claude Opus 5.5
version: "5.5"
family: claude-opus
superseded_by: null
category: llm-agents
release_date: 2026-09-22
status: generally_available
access:
  - Subscription
  - API
regions: null
accent: crimson
context_window: null
official_sources:
  - url: "https://www.anthropic.com/news/claude-opus-5-5"
    label: "Anthropic: Introducing Claude Opus 5.5"
    published: 2026-09-22
  - url: "https://claude.com/pricing"
    label: Claude pricing
    published: null
discovered_via: official
checked_at: 2026-10-02
pricing:
  - unit: per-1m-tokens
    input: 4
    output: 20
    amount: null
    currency: USD
    variant: null
    source_url: "https://www.anthropic.com/news/claude-opus-5-5"
    quote: "Input and output tokens are $4 and $20 per million, 20% less than Opus 5."
  - unit: per-1m-tokens
    input: 8
    output: 40
    amount: null
    currency: USD
    variant: fast mode
    source_url: "https://www.anthropic.com/news/claude-opus-5-5"
    quote: "It costs $8 per million input tokens and $40 per million output tokens."
plans:
  - name: "Claude Pro, Max, Team and Enterprise"
    price_monthly: null
    currency: USD
    includes:
      - Claude Opus 5.5
      - Higher five-hour usage limits
    limits: null
    regions: null
    source_url: "https://www.anthropic.com/news/claude-opus-5-5"
    quote: "In addition to the price drop, we’re increasing five-hour usage limits on Pro, Max, Team, and seat-based Enterprise plans."
benchmarks:
  - name: Terminal-Bench 4.0
    metric: Accuracy (xhigh effort)
    score: "66.4%"
    confidence_interval: null
    samples: null
    source_rank: null
    kind: self-reported
    source_label: Anthropic
    source_url: "https://www.anthropic.com/news/claude-opus-5-5"
    measured_at: 2026-09-22
    quote: "Terminal-Bench 4.0¹ 66.4% 55.8% 52.3% 57.9% 37.3%"
    ranking: null
review_notes:
  - "Context window is not stated in the announcement; check the Claude model overview before review."
  - "Claude plan prices are not in the announcement; the plan entry records the higher usage limits only."
  - "Not ranked: rankings.yaml is human-curated. Consider it for the coding leaderboard once an independent Coding Agent Index score exists."
---

# English

## Summary

Claude Opus 5.5 is Anthropic's newest Opus model, announced on September 22, 2026 as the first model in the Claude 5.5 family. Anthropic says it performs at the level of Claude Fable 5.1 on most work while costing about 40% less to run than Opus 5, and in Anthropic's own comparisons it leads in agentic coding, computer use and knowledge work, including a self-reported 66.4% on Terminal-Bench 4.0. People can use it in the Claude apps on paid plans: with the launch, Anthropic raised five-hour usage limits on Pro, Max, Team and seat-based Enterprise plans. It is also available in Claude Code, where a fast mode runs up to 2.5 times faster at a higher price. Developers can call it as claude-opus-5-5 on the Claude Platform and through Amazon Web Services, Google Cloud and Microsoft Azure, at $4 per million input tokens and $20 per million output tokens.

## Description

Opus 5.5 replaces Opus 5 as Anthropic's flagship for long, complex work such as codebase-wide migrations and audits. Anthropic places it close to Claude Fable 5.1 in capability but cheaper to serve, and says it writes more clearly and generates output more than 30% faster than Opus 5. Because Anthropic rates it comparable to Claude Mythos 5.1 in biology and cybersecurity, it ships with safeguards similar to those on Fable 5.1, and vetted organisations can apply for wider access through Anthropic's verification programmes. Anthropic says Claude Sonnet 5.5 and Claude Haiku 5.5 will follow in the coming weeks.

## What's new compared with the previous version

- Previous version: Claude Opus 5.
- Input and output prices are 20% lower ($4 and $20 per million tokens, down from $5 and $25), and cache reads are 60% lower.
- Anthropic says it costs about 40% less than Opus 5 on typical workloads and generates output more than 30% faster.
- Higher self-reported scores than Opus 5 across Anthropic's table, for example 66.4% against 52.3% on Terminal-Bench 4.0.
- More resistant to prompt injection, and no longer available with thinking switched off.

## Key capabilities

- Text and code model aimed at agentic coding, computer use and knowledge work.
- Adaptive thinking with effort levels up to max.
- Fast mode in Claude Code and the Claude Platform, up to 2.5 times faster at higher prices.
- Available with zero data retention.
- Context window: not published in the announcement.

## Benchmarks

| Benchmark | Score | Kind | Source | Date |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | self-reported | [Anthropic](https://www.anthropic.com/news/claude-opus-5-5) | 2026-09-22 |
| SWE-bench Verified | Not published | — | — | — |
| Artificial Analysis Intelligence Index | Not published | — | — | — |
| Artificial Analysis Coding Agent Index | Not published | — | — | — |

## Pricing and availability

- **API:** $4 per 1M input tokens and $20 per 1M output tokens; cache reads $0.20 per 1M tokens.
- **Fast mode:** $8 per 1M input tokens and $40 per 1M output tokens.
- **Claude Pro, Max, Team and Enterprise:** plan prices not published in the announcement; Anthropic raised five-hour usage limits on these plans with this launch.
- Access: Subscription, API (Claude Platform, Amazon Web Services, Google Cloud, Microsoft Azure).
- Status: Generally available.

## Limitations and caveats

- Ships with safeguards similar to Claude Fable 5.1; some biology and cybersecurity work requires Anthropic's verification programmes.
- Thinking cannot be switched off.
- Anthropic notes that benchmark margins at this level are a less reliable guide to real-world differences.

## Best for users / best for developers

- **Users:** A good fit for Claude Pro, Max, Team and Enterprise subscribers who want Anthropic's newest model for long writing, research and coding sessions, now with higher five-hour limits.
- **Developers:** Fable-level results on most work at $4 and $20 per million tokens, with cheap cache reads and a fast mode, make it a strong default for agentic coding pipelines.

## Sources

1. [Anthropic: Introducing Claude Opus 5.5](https://www.anthropic.com/news/claude-opus-5-5) (2026-09-22)
2. [Claude pricing](https://claude.com/pricing)

## Update history

- 2026-10-02 — File created by the freshness sweep (instructions v1.2) from official sources.

# Español

## Resumen

Claude Opus 5.5 es el modelo Opus más reciente de Anthropic, anunciado el 22 de septiembre de 2026 como el primero de la familia Claude 5.5. Anthropic afirma que rinde al nivel de Claude Fable 5.1 en la mayoría de tareas y que cuesta alrededor de un 40% menos de ejecutar que Opus 5; en sus propias comparativas lidera en programación agéntica, uso del ordenador y trabajo de conocimiento, con un 66,4% autodeclarado en Terminal-Bench 4.0. Se puede usar en las apps de Claude con planes de pago: con el lanzamiento, Anthropic amplió los límites de uso de cinco horas en los planes Pro, Max, Team y Enterprise por puesto. También está disponible en Claude Code, donde un modo rápido funciona hasta 2,5 veces más deprisa a un precio mayor. Los desarrolladores pueden llamarlo como claude-opus-5-5 en Claude Platform y a través de Amazon Web Services, Google Cloud y Microsoft Azure, a 4 $ por millón de tokens de entrada y 20 $ por millón de salida.

## Descripción

Opus 5.5 sustituye a Opus 5 como modelo principal de Anthropic para trabajos largos y complejos, como migraciones y auditorías de bases de código completas. Anthropic lo sitúa cerca de Claude Fable 5.1 en capacidad, pero más barato de servir, y afirma que redacta con más claridad y genera texto más de un 30% más rápido que Opus 5. Como Anthropic lo considera comparable a Claude Mythos 5.1 en biología y ciberseguridad, se publica con salvaguardas similares a las de Fable 5.1, y las organizaciones verificadas pueden solicitar un acceso más amplio mediante sus programas de verificación. Anthropic anuncia que Claude Sonnet 5.5 y Claude Haiku 5.5 llegarán en las próximas semanas.

## Novedades respecto a la versión anterior

- Versión anterior: Claude Opus 5.
- Precios de entrada y salida un 20% más bajos (4 $ y 20 $ por millón de tokens, frente a 5 $ y 25 $), y lecturas de caché un 60% más baratas.
- Según Anthropic, cuesta alrededor de un 40% menos que Opus 5 en cargas típicas y genera texto más de un 30% más rápido.
- Puntuaciones autodeclaradas superiores a Opus 5 en toda la tabla de Anthropic, por ejemplo 66,4% frente a 52,3% en Terminal-Bench 4.0.
- Más resistente a la inyección de prompts, y ya no se puede usar con el razonamiento desactivado.

## Capacidades clave

- Modelo de texto y código orientado a programación agéntica, uso del ordenador y trabajo de conocimiento.
- Razonamiento adaptativo con niveles de esfuerzo hasta max.
- Modo rápido en Claude Code y Claude Platform, hasta 2,5 veces más rápido a precios mayores.
- Disponible con retención de datos cero.
- Ventana de contexto: no publicada en el anuncio.

## Benchmarks

| Benchmark | Puntuación | Tipo | Fuente | Fecha |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | autodeclarado | [Anthropic](https://www.anthropic.com/news/claude-opus-5-5) | 2026-09-22 |
| SWE-bench Verified | No publicado | — | — | — |
| Artificial Analysis Intelligence Index | No publicado | — | — | — |
| Artificial Analysis Coding Agent Index | No publicado | — | — | — |

## Precios y disponibilidad

- **API:** 4 $ por 1M de tokens de entrada y 20 $ por 1M de salida; lecturas de caché a 0,20 $ por 1M de tokens.
- **Modo rápido:** 8 $ por 1M de tokens de entrada y 40 $ por 1M de salida.
- **Claude Pro, Max, Team y Enterprise:** precios de los planes no publicados en el anuncio; Anthropic amplió los límites de uso de cinco horas en estos planes con este lanzamiento.
- Acceso: Suscripción, API (Claude Platform, Amazon Web Services, Google Cloud, Microsoft Azure).
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Se publica con salvaguardas similares a las de Claude Fable 5.1; algunos usos en biología y ciberseguridad requieren los programas de verificación de Anthropic.
- El razonamiento no se puede desactivar.
- Anthropic advierte que, a este nivel, las diferencias en benchmarks reflejan peor las diferencias reales.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Una buena opción para suscriptores de Claude Pro, Max, Team y Enterprise que quieren el modelo más nuevo de Anthropic para sesiones largas de escritura, investigación y código, ahora con límites de cinco horas más amplios.
- **Desarrolladores:** Resultados al nivel de Fable en la mayoría de tareas a 4 $ y 20 $ por millón de tokens, con caché barata y modo rápido, lo convierten en una opción por defecto sólida para flujos de programación agéntica.

## Fuentes

1. [Anthropic: Introducing Claude Opus 5.5](https://www.anthropic.com/news/claude-opus-5-5) (2026-09-22)
2. [Claude pricing](https://claude.com/pricing)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada por la revisión de actualidad (instrucciones v1.2) a partir de fuentes oficiales.
