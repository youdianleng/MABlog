---
schema: mablog-ai-model/1
review_status: draft
slug: claude-fable-5-1
title_en: "Claude Fable 5.1: Anthropic's frontier model for long-running coding"
title_es: "Claude Fable 5.1: el modelo de frontera de Anthropic para programación prolongada"
provider: Anthropic
provider_key: anthropic
model: Claude Fable 5.1
version: "5.1"
family: claude-fable
category: llm-agents
release_date: 2026-09-01
status: generally_available
access:
  - Subscription
  - API
regions: null
accent: crimson
context_window: null
official_sources:
  - url: https://www.anthropic.com/claude/fable
    label: "Anthropic: Introducing Claude Fable 5.1"
    published: 2026-09-01
  - url: https://claude.com/pricing
    label: Claude pricing
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
    source_url: https://www.anthropic.com/claude/fable
    quote: null
    evidence: price-check-2026-10-01
  - unit: per-1m-tokens
    input: 0.25
    output: null
    amount: null
    currency: USD
    variant: Cache reads (input only)
    source_url: https://www.anthropic.com/claude/fable
    quote: Cache reads now cost $0.25 per million tokens, 75% less than Fable 5
    evidence: null
plans:
  - name: Claude Pro
    price_monthly: 20
    currency: USD
    includes:
      - Claude Fable 5.1
      - Claude Code
    limits: null
    regions: null
    source_url: https://claude.com/pricing
    quote: $20 if billed monthly.
  - name: Claude Max
    price_monthly: 100
    currency: USD
    includes:
      - Claude Fable 5.1
      - Claude Code
    limits: 5x or 20x more usage than Pro
    regions: null
    source_url: https://claude.com/pricing
    quote: From $100 Per month
  - name: Claude Team (standard seat)
    price_monthly: 25
    currency: USD
    includes:
      - Claude Fable 5.1
      - Claude Code
    limits: null
    regions: null
    source_url: https://claude.com/pricing
    quote: $25 if billed monthly.
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
  - Plan inclusion of Claude Fable 5.1 comes from the announcement sentence 'available to Pro, Max, Team, and Enterprise users'; Claude Code inclusion comes from the Pro feature list on claude.com/pricing.
  - Context window is not stated on the announcement page.
---

# English

## Summary

Claude Fable 5.1 is Anthropic's frontier model for long-running coding and knowledge work, announced on 1 September 2026. In MAblog's production-coding ranking it shares the top Artificial Analysis Coding Agent Index v1.5 score of 62 with GPT-6 Astra, a statistical tie. Anthropic says the model plans its work, uses the tools it needs and recovers when a step fails. People can use it in the Claude apps on the Pro plan ($20 per month billed monthly), Max (from $100 per month), Team and Enterprise, and through Claude Code, which is part of Pro and higher plans. Developers reach it on the Claude Platform, cloud marketplaces, Amazon Web Services, Google Cloud and Microsoft Foundry at $10 per million input tokens and $50 per million output tokens, with cached input reads at $0.25 per million tokens.

## Description

Fable 5.1 is the current top model in Anthropic's Fable line, aimed at difficult engineering decisions and multi-step knowledge work that runs with little supervision. Anthropic highlights agentic behaviour: the model plans a task, chooses tools, recovers from failed steps and can write its own tests to check its work. It also reads diagrams, charts and tables inside files and PDFs. The main change Anthropic lists against Fable 5 is cheaper cached input, which it estimates lowers the cost of typical workloads by about a quarter.

## What's new compared with the previous version

- Cached input reads cost $0.25 per million tokens, 75% less than Fable 5 (Anthropic).
- Anthropic estimates about 25% lower cost for typical workloads and up to about 45% for highly agentic workloads.

## Key capabilities

- Plans multi-step work, uses tools and recovers when a step fails.
- Writes its own tests to check its work and implements designs with high fidelity.
- Understands diagrams, charts and tables inside files and PDFs.
- Available in Claude apps, Claude Code, the Claude Platform and major cloud marketplaces.

## Benchmarks

| Benchmark                              | Score         | Kind        | Source                                                                    | Date       |
| -------------------------------------- | ------------- | ----------- | ------------------------------------------------------------------------- | ---------- |
| Coding Agent Index v1.5                | 62            | independent | [Artificial Analysis](https://artificialanalysis.ai/agents/coding-agents) | 2026-09-22 |
| SWE-bench Verified                     | Not published | —           | —                                                                         | —          |
| Terminal-Bench                         | Not published | —           | —                                                                         | —          |
| Artificial Analysis Intelligence Index | Not published | —           | —                                                                         | —          |

## Pricing and availability

- **Comparable price on /ai-models:** $10 per 1M input tokens and $50 per 1M output tokens; migrated from the 2026-10-01 price check.
- $0.25 per 1M tokens (Cache reads (input only)); quoted from the source.
- **Claude Pro:** $20 per month; includes Claude Fable 5.1, Claude Code. $17 per month with annual billing.
- **Claude Max:** $100 per month; includes Claude Fable 5.1, Claude Code. Starting price.
- **Claude Team (standard seat):** $25 per month; includes Claude Fable 5.1, Claude Code. Per seat; $20 per seat with annual billing.
- Access: Subscription, API.
- Status: Generally available.

## Limitations and caveats

- Requests flagged by cybersecurity and biology safeguards can be routed to less capable models; Anthropic does not charge Fable prices for rerouted requests.
- Using Fable requires 30-day data retention for safety monitoring by default.
- Context window: not published on the announcement page.

## Best for users / best for developers

- **Users:** Best when a substantial coding project needs sustained attention and reviewable progress.
- **Developers:** The leading production-coding choice in this snapshot, with API and Claude Code access.

## Sources

1. [Anthropic: Introducing Claude Fable 5.1 (2026-09-01)](https://www.anthropic.com/claude/fable)
2. [Claude pricing](https://claude.com/pricing)
3. [Artificial Analysis (evaluated 2026-09-22)](https://artificialanalysis.ai/agents/coding-agents)

## Update history

- 2026-10-02 — File created from the reviewed 2026-09-22 ranking snapshot and the 2026-10-01 price check; new facts researched from official pages.

# Español

## Resumen

Claude Fable 5.1 es el modelo de frontera de Anthropic para trabajo prolongado de programación y conocimiento, anunciado el 1 de septiembre de 2026. En la clasificación de código de producción de MAblog comparte la mejor puntuación del Coding Agent Index v1.5 de Artificial Analysis, 62, con GPT-6 Astra: un empate estadístico. Anthropic afirma que el modelo planifica su trabajo, usa las herramientas que necesita y se recupera cuando falla un paso. Se puede usar en las apps de Claude con el plan Pro (20 $ al mes con pago mensual), Max (desde 100 $ al mes), Team y Enterprise, y en Claude Code, incluido en Pro y planes superiores. Los desarrolladores acceden a él en Claude Platform, marketplaces en la nube, Amazon Web Services, Google Cloud y Microsoft Foundry a 10 $ por millón de tokens de entrada y 50 $ por millón de salida, con lecturas de caché a 0,25 $ por millón.

## Descripción

Fable 5.1 es el modelo principal actual de la línea Fable de Anthropic, pensado para decisiones de ingeniería difíciles y trabajo de conocimiento en varios pasos con poca supervisión. Anthropic destaca su comportamiento agéntico: planifica la tarea, elige herramientas, se recupera de pasos fallidos y puede escribir sus propias pruebas para comprobar su trabajo. También interpreta diagramas, gráficos y tablas dentro de archivos y PDF. El cambio principal que Anthropic indica frente a Fable 5 es la entrada en caché más barata, que según sus estimaciones reduce alrededor de una cuarta parte el coste de las cargas habituales.

## Novedades respecto a la versión anterior

- Las lecturas de entrada en caché cuestan 0,25 $ por millón de tokens, un 75 % menos que Fable 5 (Anthropic).
- Anthropic estima un coste un 25 % menor en cargas habituales y hasta un 45 % menor en cargas muy agénticas.

## Capacidades clave

- Planifica trabajo en varios pasos, usa herramientas y se recupera cuando falla un paso.
- Escribe sus propias pruebas para comprobar su trabajo e implementa diseños con gran fidelidad.
- Entiende diagramas, gráficos y tablas dentro de archivos y PDF.
- Disponible en las apps de Claude, Claude Code, Claude Platform y los principales marketplaces en la nube.

## Benchmarks

| Benchmark                              | Puntuación   | Tipo          | Fuente                                                                    | Fecha      |
| -------------------------------------- | ------------ | ------------- | ------------------------------------------------------------------------- | ---------- |
| Coding Agent Index v1.5                | 62           | independiente | [Artificial Analysis](https://artificialanalysis.ai/agents/coding-agents) | 2026-09-22 |
| SWE-bench Verified                     | No publicado | —             | —                                                                         | —          |
| Terminal-Bench                         | No publicado | —             | —                                                                         | —          |
| Artificial Analysis Intelligence Index | No publicado | —             | —                                                                         | —          |

## Precios y disponibilidad

- **Precio comparable en /ai-models:** 10 $ por 1M de tokens de entrada y 50 $ por 1M de salida; valor migrado de la comprobación de precios del 2026-10-01.
- 0,25 $ por 1M de tokens (Cache reads (input only)); cita en la fuente.
- **Claude Pro:** 20 $ al mes; incluye Claude Fable 5.1, Claude Code. 17 $ al mes con facturación anual.
- **Claude Max:** 100 $ al mes; incluye Claude Fable 5.1, Claude Code. Precio inicial.
- **Claude Team (standard seat):** 25 $ al mes; incluye Claude Fable 5.1, Claude Code. Por puesto; 20 $ por puesto con facturación anual.
- Acceso: Suscripción, API.
- Estado: Disponible de forma general.

## Limitaciones y advertencias

- Las peticiones marcadas por las salvaguardas de ciberseguridad y biología pueden derivarse a modelos menos capaces; Anthropic no cobra precio de Fable por ellas.
- Usar Fable requiere por defecto conservar los datos 30 días para supervisión de seguridad.
- Ventana de contexto: no publicada en la página del anuncio.

## Ideal para usuarios / ideal para desarrolladores

- **Usuarios:** Ideal cuando un proyecto de código importante necesita atención sostenida y progreso revisable.
- **Desarrolladores:** La opción líder para código de producción en esta edición, con acceso por API y Claude Code.

## Fuentes

1. [Anthropic: Introducing Claude Fable 5.1 (2026-09-01)](https://www.anthropic.com/claude/fable)
2. [Claude pricing](https://claude.com/pricing)
3. [Artificial Analysis (evaluado 2026-09-22)](https://artificialanalysis.ai/agents/coding-agents)

## Historial de actualizaciones

- 2026-10-02 — Ficha creada a partir de la clasificación revisada del 2026-09-22 y la comprobación de precios del 2026-10-01; datos nuevos investigados en páginas oficiales.
