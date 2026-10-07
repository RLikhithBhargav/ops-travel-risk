# Architecture — Travel Disruption Assessment

## Product slice

**Input:** origin city, destination city, travel date (today → +7 days)  
**Output:** overall risk, Ops narrative, prioritized risks with evidence IDs, recommended actions, confidence + gaps.

Air travel is primary. City/airport coverage comes from **OurAirports** (US large/medium + scheduled small with IATA, ~1000 airports). Autocomplete filters that set. **Hub rule:** best-ranked airport in the same municipality+state (large > medium > small, scheduled boost); if the place is unknown locally, the assess API geocodes via Open-Meteo and picks the **nearest** commercial airport by haversine.

## Request flow

```
Browser form (city autocomplete → hub)
  → POST /api/assess
      → resolve cities → coords + primary ICAO
      → Promise.allSettled([
            Open-Meteo forecast,
            NWS alerts,
            AviationWeather METAR/TAF
         ])
      → normalize to Evidence[]
      → synthesize (OpenAI if OPENAI_API_KEY else rules)
      → validate cited evidenceIds
      → AssessmentResponse JSON
```

Partial source failures still return an assessment with `partialFailures[]` and a UI banner. All sources failing → HTTP 502.

## External sources (free / no purchase)

| Source | Signal | Auth |
| --- | --- | --- |
| Open-Meteo | Daily precip, wind, gusts, WMO weather codes at origin/dest | None |
| NWS `api.weather.gov` | Active watches/warnings near airport lat/lon | Descriptive `User-Agent` |
| AviationWeather.gov | METAR (now) + TAF (forecast) by ICAO | None |

Short in-memory TTL cache (~10 min) per `origin|dest|date`.

## AI role

OpenAI synthesizes **only** from the normalized evidence payload (default model `gpt-4o-mini`). It must not invent numbers, alerts, URLs, or evidence IDs. Server post-validates citations (unknown IDs dropped). Without `OPENAI_API_KEY`, a deterministic rules synthesizer scores evidence thresholds and emits a templated narrative — UI shows **Rule-based synthesis (no LLM key)**.

## Brand

UI tokens follow public nuKudo site theme: black ground, crimson primary (`#D0011D`), gold accent (`#C1A15C`).

## Response schema (summary)

- `overallRisk`: `low | moderate | high | severe`
- `narrative`, `confidence` (0–1), `gaps[]`
- `risks[]` / `actions[]` with `evidenceIds[]`
- `evidence[]`: `id`, `source`, `title`, `summary`, `url?`, `fetchedAt`, `location?`
- `synthesisMode`: `llm | rules`
- `partialFailures[]`: source display names that failed

## Why these choices

- Three orthogonal free signals (forecast, alerts, airport conditions)
- Facts from APIs; interpretation from synthesis; cite-or-drop prevents hallucinations
- Rules fallback keeps the E2E path runnable for reviewers without an LLM key
