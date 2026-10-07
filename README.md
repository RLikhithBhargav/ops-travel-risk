# nuKudo — Travel Disruption Assessment

Prototype for assessing U.S. air travel disruption for a **city pair + date**. Live signals from Open-Meteo, NWS alerts, and AviationWeather METARs/TAFs are normalized into evidence, then synthesized into an Ops-facing narrative with risks, actions, confidence, and citations.

## Prerequisites

- Node.js 20+ (tested on Node 22)
- npm 10+
- Optional: `OPENAI_API_KEY` for OpenAI synthesis (rules fallback works without it)

## Setup

```bash
npm install
cp .env.example .env.local
# Optionally set OPENAI_API_KEY in .env.local
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

## Example query

- Origin: `Chicago` (autocomplete suggests ORD)
- Destination: `San Francisco` (autocomplete suggests SFO)
- Date: today (or any day within the next 7 days)

Cities resolve from an OurAirports-derived US commercial set (~1000 airports). Typing filters suggestions (e.g. Wilmington → ILM / ILG / ILN by state). Unknown places geocode then map to the nearest hub. IATA codes also work.

## Env vars

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | OpenAI synthesis. If absent, UI labels **Rule-based synthesis (no LLM key)**. |
| `OPENAI_MODEL` | No | Model override (default `gpt-4o-mini`) |

Open-Meteo, NWS (`api.weather.gov`), and AviationWeather.gov need **no keys**.

## What it does

1. Resolve cities → primary commercial airports + coordinates (with autocomplete)
2. Fetch in parallel: Open-Meteo daily forecast, NWS active alerts by lat/lon, AviationWeather METAR/TAF
3. Normalize to `Evidence[]` with source URLs and timestamps
4. Synthesize (`llm` if OpenAI key present, else `rules`) with citation validation
5. Return overall risk, narrative, risks, actions, confidence, gaps, partial failures

## Known limitations

- Air-primary only; no booking/rebooking or paid flight-status APIs
- Static city → primary-hub table (not full U.S. airport disambiguation)
- Date window: today through +7 days
- Assesses environmental / NAS-adjacent **conditions**, not carrier cancellation decisions
- Short in-memory cache (~10 min) per origin|dest|date

See [ARCHITECTURE.md](./ARCHITECTURE.md) for request flow, sources, and schema.
