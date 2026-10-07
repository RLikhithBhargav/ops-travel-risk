import type { AirportRef, Evidence, SourceResult } from "@/lib/types";

interface MetarRow {
  icaoId?: string;
  reportTime?: string;
  temp?: number;
  dewp?: number;
  wdir?: number | string;
  wspd?: number;
  wgst?: number;
  visib?: number | string;
  altim?: number;
  fltCat?: string;
  rawOb?: string;
  wxString?: string;
  cover?: string;
}

interface TafRow {
  icaoId?: string;
  issueTime?: string;
  validTimeFrom?: number;
  validTimeTo?: number;
  rawTAF?: string;
  mostRecent?: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "nuKudoTravelDisruption/1.0",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`AviationWeather HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

function flightCategoryLabel(cat: string | undefined): string {
  switch ((cat ?? "").toUpperCase()) {
    case "VFR":
      return "VFR (good visual conditions)";
    case "MVFR":
      return "MVFR (marginal)";
    case "IFR":
      return "IFR (instrument — reduced capacity risk)";
    case "LIFR":
      return "LIFR (low IFR — significant arrival impact)";
    default:
      return cat ? cat : "unknown category";
  }
}

function metarEvidence(
  airport: AirportRef,
  location: "origin" | "destination",
  metar: MetarRow | undefined,
  fetchedAt: string,
): Evidence[] {
  const prefix = location === "origin" ? "avwx-orig" : "avwx-dest";
  const place = `${airport.city} (${airport.icao})`;
  const url = `https://aviationweather.gov/data/metar/?ids=${airport.icao}`;

  if (!metar) {
    return [
      {
        id: `${prefix}-metar-missing`,
        source: "aviationweather",
        title: `No METAR for ${place}`,
        summary: `AviationWeather returned no current METAR for ${airport.icao}.`,
        url,
        fetchedAt,
        location,
      },
    ];
  }

  const wind =
    metar.wspd !== undefined
      ? `Wind ${metar.wdir ?? "VRB"} at ${metar.wspd} kt${metar.wgst ? ` gusting ${metar.wgst}` : ""}`
      : "Wind n/a";
  const vis =
    metar.visib !== undefined ? `Visibility ${metar.visib} SM` : "Visibility n/a";
  const wx = metar.wxString ? ` Weather: ${metar.wxString}.` : "";
  const cat = flightCategoryLabel(metar.fltCat);

  const items: Evidence[] = [
    {
      id: `${prefix}-metar`,
      source: "aviationweather",
      title: `${place} current METAR`,
      summary: `${cat}. ${wind}. ${vis}.${wx} Raw: ${(metar.rawOb ?? "").slice(0, 160)}`,
      url,
      fetchedAt,
      observedAt: metar.reportTime,
      location,
      rawHint: metar.rawOb?.slice(0, 120),
    },
  ];

  const catUpper = (metar.fltCat ?? "").toUpperCase();
  if (catUpper === "IFR" || catUpper === "LIFR" || catUpper === "MVFR") {
    items.push({
      id: `${prefix}-category`,
      source: "aviationweather",
      title: `${place} flight category ${catUpper}`,
      summary: `Current flight category is ${cat}. Reduced ceilings/visibility commonly cut arrival rates and raise delay risk.`,
      url,
      fetchedAt,
      observedAt: metar.reportTime,
      location,
      rawHint: `fltCat=${metar.fltCat}`,
    });
  }

  if ((metar.wspd ?? 0) >= 25 || (metar.wgst ?? 0) >= 35) {
    items.push({
      id: `${prefix}-wind`,
      source: "aviationweather",
      title: `${place} strong surface winds`,
      summary: `${wind}. Sustained/gusty surface winds can force runway changes and ground stops.`,
      url,
      fetchedAt,
      observedAt: metar.reportTime,
      location,
      rawHint: `wspd=${metar.wspd}; wgst=${metar.wgst}`,
    });
  }

  return items;
}

function tafEvidence(
  airport: AirportRef,
  location: "origin" | "destination",
  taf: TafRow | undefined,
  travelDate: string,
  fetchedAt: string,
): Evidence[] {
  const prefix = location === "origin" ? "avwx-orig" : "avwx-dest";
  const place = `${airport.city} (${airport.icao})`;
  const url = `https://aviationweather.gov/data/taf/?ids=${airport.icao}`;

  if (!taf?.rawTAF) {
    return [
      {
        id: `${prefix}-taf-missing`,
        source: "aviationweather",
        title: `No TAF for ${place}`,
        summary: `AviationWeather returned no TAF for ${airport.icao}. Forecast airport conditions for ${travelDate} rely more on Open-Meteo.`,
        url,
        fetchedAt,
        location,
      },
    ];
  }

  const raw = taf.rawTAF.replace(/\s+/g, " ").trim();
  const lower = raw.toLowerCase();
  const signals: string[] = [];
  if (/\b(tsra|ts)\b/i.test(raw)) signals.push("thunderstorms");
  if (/\b(sn|fzra|pl|sg)\b/i.test(raw)) signals.push("winter precip");
  if (/\bfg\b/i.test(raw) || /\bbr\b/i.test(raw)) signals.push("fog/mist");
  if (/\b(ws\d{3}\/\d{2,3}kt)\b/i.test(raw)) signals.push("wind shear");
  if (/\b(tempo|becmg|prob30|prob40)\b/i.test(raw)) {
    signals.push("tempo/becmg/prob groups");
  }

  const signalText =
    signals.length > 0
      ? ` Notable groups: ${signals.join(", ")}.`
      : " No high-impact TEMPO/BECMG keywords flagged in a quick parse.";

  return [
    {
      id: `${prefix}-taf`,
      source: "aviationweather",
      title: `${place} TAF (airport forecast)`,
      summary: `Issued TAF relevant to travel date ${travelDate}.${signalText} Excerpt: ${raw.slice(0, 220)}`,
      url,
      fetchedAt,
      observedAt: taf.issueTime,
      location,
      rawHint: raw.slice(0, 160),
    },
  ];
}

export async function fetchAviationWeatherEvidence(
  origin: AirportRef,
  destination: AirportRef,
  travelDate: string,
): Promise<SourceResult> {
  const fetchedAt = new Date().toISOString();
  const ids = `${origin.icao},${destination.icao}`;

  try {
    const [metars, tafs] = await Promise.all([
      fetchJson<MetarRow[]>(
        `https://aviationweather.gov/api/data/metar?ids=${ids}&format=json`,
      ),
      fetchJson<TafRow[]>(
        `https://aviationweather.gov/api/data/taf?ids=${ids}&format=json`,
      ),
    ]);

    const metarByIcao = new Map(
      (Array.isArray(metars) ? metars : []).map((m) => [
        (m.icaoId ?? "").toUpperCase(),
        m,
      ]),
    );
    const tafByIcao = new Map(
      (Array.isArray(tafs) ? tafs : []).map((t) => [
        (t.icaoId ?? "").toUpperCase(),
        t,
      ]),
    );

    return {
      evidence: [
        ...metarEvidence(
          origin,
          "origin",
          metarByIcao.get(origin.icao.toUpperCase()),
          fetchedAt,
        ),
        ...tafEvidence(
          origin,
          "origin",
          tafByIcao.get(origin.icao.toUpperCase()),
          travelDate,
          fetchedAt,
        ),
        ...metarEvidence(
          destination,
          "destination",
          metarByIcao.get(destination.icao.toUpperCase()),
          fetchedAt,
        ),
        ...tafEvidence(
          destination,
          "destination",
          tafByIcao.get(destination.icao.toUpperCase()),
          travelDate,
          fetchedAt,
        ),
      ],
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AviationWeather failed";
    return { evidence: [], error: message };
  }
}
