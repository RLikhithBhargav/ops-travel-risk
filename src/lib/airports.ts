import type { AirportRef } from "@/lib/types";

/**
 * Primary commercial hub per major U.S. metro for the prototype.
 * Production would geocode + rank nearest airports and let the user confirm.
 */
export const AIRPORTS: AirportRef[] = [
  {
    iata: "JFK",
    icao: "KJFK",
    name: "John F. Kennedy International",
    city: "New York",
    lat: 40.6413,
    lon: -73.7781,
  },
  {
    iata: "LGA",
    icao: "KLGA",
    name: "LaGuardia",
    city: "New York",
    lat: 40.7769,
    lon: -73.874,
  },
  {
    iata: "EWR",
    icao: "KEWR",
    name: "Newark Liberty International",
    city: "Newark",
    lat: 40.6895,
    lon: -74.1745,
  },
  {
    iata: "SFO",
    icao: "KSFO",
    name: "San Francisco International",
    city: "San Francisco",
    lat: 37.6213,
    lon: -122.379,
  },
  {
    iata: "OAK",
    icao: "KOAK",
    name: "Oakland International",
    city: "Oakland",
    lat: 37.7126,
    lon: -122.2197,
  },
  {
    iata: "SJC",
    icao: "KSJC",
    name: "Norman Y. Mineta San José International",
    city: "San Jose",
    lat: 37.3639,
    lon: -121.9289,
  },
  {
    iata: "LAX",
    icao: "KLAX",
    name: "Los Angeles International",
    city: "Los Angeles",
    lat: 33.9425,
    lon: -118.4081,
  },
  {
    iata: "ORD",
    icao: "KORD",
    name: "O'Hare International",
    city: "Chicago",
    lat: 41.9742,
    lon: -87.9073,
  },
  {
    iata: "MDW",
    icao: "KMDW",
    name: "Chicago Midway International",
    city: "Chicago",
    lat: 41.7868,
    lon: -87.7522,
  },
  {
    iata: "ATL",
    icao: "KATL",
    name: "Hartsfield-Jackson Atlanta International",
    city: "Atlanta",
    lat: 33.6407,
    lon: -84.4277,
  },
  {
    iata: "DFW",
    icao: "KDFW",
    name: "Dallas/Fort Worth International",
    city: "Dallas",
    lat: 32.8998,
    lon: -97.0403,
  },
  {
    iata: "DAL",
    icao: "KDAL",
    name: "Dallas Love Field",
    city: "Dallas",
    lat: 32.8471,
    lon: -96.8518,
  },
  {
    iata: "DEN",
    icao: "KDEN",
    name: "Denver International",
    city: "Denver",
    lat: 39.8561,
    lon: -104.6737,
  },
  {
    iata: "SEA",
    icao: "KSEA",
    name: "Seattle-Tacoma International",
    city: "Seattle",
    lat: 47.4502,
    lon: -122.3088,
  },
  {
    iata: "MIA",
    icao: "KMIA",
    name: "Miami International",
    city: "Miami",
    lat: 25.7959,
    lon: -80.287,
  },
  {
    iata: "BOS",
    icao: "KBOS",
    name: "Logan International",
    city: "Boston",
    lat: 42.3656,
    lon: -71.0096,
  },
  {
    iata: "IAD",
    icao: "KIAD",
    name: "Dulles International",
    city: "Washington",
    lat: 38.9531,
    lon: -77.4565,
  },
  {
    iata: "DCA",
    icao: "KDCA",
    name: "Ronald Reagan Washington National",
    city: "Washington",
    lat: 38.8512,
    lon: -77.0402,
  },
  {
    iata: "BWI",
    icao: "KBWI",
    name: "Baltimore/Washington International",
    city: "Baltimore",
    lat: 39.1754,
    lon: -76.6683,
  },
  {
    iata: "PHX",
    icao: "KPHX",
    name: "Phoenix Sky Harbor International",
    city: "Phoenix",
    lat: 33.4352,
    lon: -112.0101,
  },
  {
    iata: "LAS",
    icao: "KLAS",
    name: "Harry Reid International",
    city: "Las Vegas",
    lat: 36.084,
    lon: -115.1537,
  },
  {
    iata: "MCO",
    icao: "KMCO",
    name: "Orlando International",
    city: "Orlando",
    lat: 28.4312,
    lon: -81.3081,
  },
  {
    iata: "MSP",
    icao: "KMSP",
    name: "Minneapolis−Saint Paul International",
    city: "Minneapolis",
    lat: 44.8848,
    lon: -93.2223,
  },
  {
    iata: "DTW",
    icao: "KDTW",
    name: "Detroit Metropolitan Wayne County",
    city: "Detroit",
    lat: 42.2162,
    lon: -83.3554,
  },
  {
    iata: "PHL",
    icao: "KPHL",
    name: "Philadelphia International",
    city: "Philadelphia",
    lat: 39.8744,
    lon: -75.2424,
  },
  {
    iata: "CLT",
    icao: "KCLT",
    name: "Charlotte Douglas International",
    city: "Charlotte",
    lat: 35.214,
    lon: -80.9431,
  },
  {
    iata: "IAH",
    icao: "KIAH",
    name: "George Bush Intercontinental",
    city: "Houston",
    lat: 29.9902,
    lon: -95.3368,
  },
  {
    iata: "HOU",
    icao: "KHOU",
    name: "William P. Hobby",
    city: "Houston",
    lat: 29.6454,
    lon: -95.2789,
  },
  {
    iata: "SAN",
    icao: "KSAN",
    name: "San Diego International",
    city: "San Diego",
    lat: 32.7338,
    lon: -117.1933,
  },
  {
    iata: "PDX",
    icao: "KPDX",
    name: "Portland International",
    city: "Portland",
    lat: 45.5898,
    lon: -122.5951,
  },
  {
    iata: "SLC",
    icao: "KSLC",
    name: "Salt Lake City International",
    city: "Salt Lake City",
    lat: 40.7899,
    lon: -111.9791,
  },
  {
    iata: "AUS",
    icao: "KAUS",
    name: "Austin-Bergstrom International",
    city: "Austin",
    lat: 30.1945,
    lon: -97.6699,
  },
  {
    iata: "BNA",
    icao: "KBNA",
    name: "Nashville International",
    city: "Nashville",
    lat: 36.1263,
    lon: -86.6774,
  },
  {
    iata: "RDU",
    icao: "KRDU",
    name: "Raleigh-Durham International",
    city: "Raleigh",
    lat: 35.8801,
    lon: -78.788,
  },
  {
    iata: "TPA",
    icao: "KTPA",
    name: "Tampa International",
    city: "Tampa",
    lat: 27.9755,
    lon: -82.5332,
  },
  {
    iata: "STL",
    icao: "KSTL",
    name: "St. Louis Lambert International",
    city: "St. Louis",
    lat: 38.7487,
    lon: -90.37,
  },
  {
    iata: "MCI",
    icao: "KMCI",
    name: "Kansas City International",
    city: "Kansas City",
    lat: 39.2976,
    lon: -94.7139,
  },
  {
    iata: "IND",
    icao: "KIND",
    name: "Indianapolis International",
    city: "Indianapolis",
    lat: 39.7173,
    lon: -86.2944,
  },
  {
    iata: "CLE",
    icao: "KCLE",
    name: "Cleveland Hopkins International",
    city: "Cleveland",
    lat: 41.4117,
    lon: -81.8498,
  },
  {
    iata: "PIT",
    icao: "KPIT",
    name: "Pittsburgh International",
    city: "Pittsburgh",
    lat: 40.4915,
    lon: -80.2329,
  },
  {
    iata: "CVG",
    icao: "KCVG",
    name: "Cincinnati/Northern Kentucky International",
    city: "Cincinnati",
    lat: 39.0488,
    lon: -84.6678,
  },
  {
    iata: "MKE",
    icao: "KMKE",
    name: "Milwaukee Mitchell International",
    city: "Milwaukee",
    lat: 42.9472,
    lon: -87.8966,
  },
  {
    iata: "MSY",
    icao: "KMSY",
    name: "Louis Armstrong New Orleans International",
    city: "New Orleans",
    lat: 29.9934,
    lon: -90.258,
  },
  {
    iata: "RSW",
    icao: "KRSW",
    name: "Southwest Florida International",
    city: "Fort Myers",
    lat: 26.5362,
    lon: -81.7552,
  },
  {
    iata: "FLL",
    icao: "KFLL",
    name: "Fort Lauderdale-Hollywood International",
    city: "Fort Lauderdale",
    lat: 26.0726,
    lon: -80.1527,
  },
  {
    iata: "HNL",
    icao: "PHNL",
    name: "Daniel K. Inouye International",
    city: "Honolulu",
    lat: 21.3187,
    lon: -157.9225,
  },
  {
    iata: "ANC",
    icao: "PANC",
    name: "Ted Stevens Anchorage International",
    city: "Anchorage",
    lat: 61.1743,
    lon: -149.9983,
  },
  {
    iata: "ABQ",
    icao: "KABQ",
    name: "Albuquerque International Sunport",
    city: "Albuquerque",
    lat: 35.0402,
    lon: -106.6091,
  },
  {
    iata: "OKC",
    icao: "KOKC",
    name: "Will Rogers World",
    city: "Oklahoma City",
    lat: 35.3931,
    lon: -97.6007,
  },
  {
    iata: "TUL",
    icao: "KTUL",
    name: "Tulsa International",
    city: "Tulsa",
    lat: 36.1984,
    lon: -95.8881,
  },
  {
    iata: "SAT",
    icao: "KSAT",
    name: "San Antonio International",
    city: "San Antonio",
    lat: 29.5337,
    lon: -98.4698,
  },
  {
    iata: "SMF",
    icao: "KSMF",
    name: "Sacramento International",
    city: "Sacramento",
    lat: 38.6954,
    lon: -121.5908,
  },
  {
    iata: "BUR",
    icao: "KBUR",
    name: "Hollywood Burbank",
    city: "Burbank",
    lat: 34.2007,
    lon: -118.3585,
  },
  {
    iata: "SNA",
    icao: "KSNA",
    name: "John Wayne / Orange County",
    city: "Santa Ana",
    lat: 33.6757,
    lon: -117.8682,
  },
  {
    iata: "JAX",
    icao: "KJAX",
    name: "Jacksonville International",
    city: "Jacksonville",
    lat: 30.4941,
    lon: -81.6879,
  },
  {
    iata: "RIC",
    icao: "KRIC",
    name: "Richmond International",
    city: "Richmond",
    lat: 37.5052,
    lon: -77.3197,
  },
  {
    iata: "BUF",
    icao: "KBUF",
    name: "Buffalo Niagara International",
    city: "Buffalo",
    lat: 42.9405,
    lon: -78.7322,
  },
  {
    iata: "ROC",
    icao: "KROC",
    name: "Greater Rochester International",
    city: "Rochester",
    lat: 43.1189,
    lon: -77.6724,
  },
  {
    iata: "SYR",
    icao: "KSYR",
    name: "Syracuse Hancock International",
    city: "Syracuse",
    lat: 43.1112,
    lon: -76.1063,
  },
  {
    iata: "ALB",
    icao: "KALB",
    name: "Albany International",
    city: "Albany",
    lat: 42.7483,
    lon: -73.8017,
  },
  {
    iata: "BDL",
    icao: "KBDL",
    name: "Bradley International",
    city: "Hartford",
    lat: 41.9389,
    lon: -72.6832,
  },
  {
    iata: "PWM",
    icao: "KPWM",
    name: "Portland International Jetport",
    city: "Portland ME",
    lat: 43.6462,
    lon: -70.3093,
  },
  {
    iata: "BTV",
    icao: "KBTV",
    name: "Burlington International",
    city: "Burlington",
    lat: 44.4719,
    lon: -73.1533,
  },
  {
    iata: "ORF",
    icao: "KORF",
    name: "Norfolk International",
    city: "Norfolk",
    lat: 36.8946,
    lon: -76.2012,
  },
  {
    iata: "CHS",
    icao: "KCHS",
    name: "Charleston International",
    city: "Charleston",
    lat: 32.8986,
    lon: -80.0405,
  },
  {
    iata: "SAV",
    icao: "KSAV",
    name: "Savannah/Hilton Head International",
    city: "Savannah",
    lat: 32.1276,
    lon: -81.2021,
  },
  {
    iata: "BHM",
    icao: "KBHM",
    name: "Birmingham-Shuttlesworth International",
    city: "Birmingham",
    lat: 33.5629,
    lon: -86.7535,
  },
  {
    iata: "MEM",
    icao: "KMEM",
    name: "Memphis International",
    city: "Memphis",
    lat: 35.0424,
    lon: -89.9767,
  },
  {
    iata: "LIT",
    icao: "KLIT",
    name: "Bill and Hillary Clinton National",
    city: "Little Rock",
    lat: 34.7294,
    lon: -92.2243,
  },
  {
    iata: "OMA",
    icao: "KOMA",
    name: "Eppley Airfield",
    city: "Omaha",
    lat: 41.3032,
    lon: -95.8941,
  },
  {
    iata: "DSM",
    icao: "KDSM",
    name: "Des Moines International",
    city: "Des Moines",
    lat: 41.534,
    lon: -93.6631,
  },
  {
    iata: "MSN",
    icao: "KMSN",
    name: "Dane County Regional",
    city: "Madison",
    lat: 43.1399,
    lon: -89.3375,
  },
  {
    iata: "GRR",
    icao: "KGRR",
    name: "Gerald R. Ford International",
    city: "Grand Rapids",
    lat: 42.8808,
    lon: -85.5228,
  },
  {
    iata: "BOI",
    icao: "KBOI",
    name: "Boise Air Terminal",
    city: "Boise",
    lat: 43.5644,
    lon: -116.2228,
  },
  {
    iata: "GEG",
    icao: "KGEG",
    name: "Spokane International",
    city: "Spokane",
    lat: 47.6199,
    lon: -117.5338,
  },
  {
    iata: "RNO",
    icao: "KRNO",
    name: "Reno-Tahoe International",
    city: "Reno",
    lat: 39.4991,
    lon: -119.7681,
  },
  {
    iata: "TUS",
    icao: "KTUS",
    name: "Tucson International",
    city: "Tucson",
    lat: 32.1161,
    lon: -110.941,
  },
  {
    iata: "ELP",
    icao: "KELP",
    name: "El Paso International",
    city: "El Paso",
    lat: 31.8072,
    lon: -106.3776,
  },
];

/** Prefer these IATA codes when a metro has multiple hubs. */
const PRIMARY_BY_CITY: Record<string, string> = {
  "new york": "JFK",
  nyc: "JFK",
  manhattan: "JFK",
  brooklyn: "JFK",
  chicago: "ORD",
  "los angeles": "LAX",
  la: "LAX",
  "san francisco": "SFO",
  sf: "SFO",
  "bay area": "SFO",
  dallas: "DFW",
  "fort worth": "DFW",
  houston: "IAH",
  washington: "IAD",
  "washington dc": "IAD",
  "washington d.c.": "IAD",
  dc: "DCA",
  "d.c.": "DCA",
  seattle: "SEA",
  boston: "BOS",
  miami: "MIA",
  atlanta: "ATL",
  denver: "DEN",
  phoenix: "PHX",
  "las vegas": "LAS",
  orlando: "MCO",
  minneapolis: "MSP",
  "st paul": "MSP",
  "saint paul": "MSP",
  detroit: "DTW",
  philadelphia: "PHL",
  charlotte: "CLT",
  "san diego": "SAN",
  portland: "PDX",
  "salt lake city": "SLC",
  austin: "AUS",
  nashville: "BNA",
  raleigh: "RDU",
  durham: "RDU",
  tampa: "TPA",
  "st louis": "STL",
  "saint louis": "STL",
  "kansas city": "MCI",
  indianapolis: "IND",
  cleveland: "CLE",
  pittsburgh: "PIT",
  cincinnati: "CVG",
  milwaukee: "MKE",
  "new orleans": "MSY",
  "fort myers": "RSW",
  "fort lauderdale": "FLL",
  honolulu: "HNL",
  anchorage: "ANC",
  albuquerque: "ABQ",
  "oklahoma city": "OKC",
  tulsa: "TUL",
  "san antonio": "SAT",
  sacramento: "SMF",
  burbank: "BUR",
  "santa ana": "SNA",
  "orange county": "SNA",
  jacksonville: "JAX",
  richmond: "RIC",
  buffalo: "BUF",
  rochester: "ROC",
  syracuse: "SYR",
  albany: "ALB",
  hartford: "BDL",
  burlington: "BTV",
  norfolk: "ORF",
  charleston: "CHS",
  savannah: "SAV",
  birmingham: "BHM",
  memphis: "MEM",
  "little rock": "LIT",
  omaha: "OMA",
  "des moines": "DSM",
  madison: "MSN",
  "grand rapids": "GRR",
  boise: "BOI",
  spokane: "GEG",
  reno: "RNO",
  tucson: "TUS",
  "el paso": "ELP",
  newark: "EWR",
  oakland: "OAK",
  "san jose": "SJC",
  baltimore: "BWI",
};

const ALIASES: Record<string, string> = {
  nyc: "new york",
  "n.y.c.": "new york",
  "new york city": "new york",
  "new york, ny": "new york",
  "sf": "san francisco",
  "sfo": "san francisco",
  "la": "los angeles",
  "l.a.": "los angeles",
  "los angeles, ca": "los angeles",
  "chi-town": "chicago",
  "chicago, il": "chicago",
  "dc": "washington",
  "d.c.": "washington",
  "wash dc": "washington",
  "washington, dc": "washington",
  "philly": "philadelphia",
  "vegas": "las vegas",
  "nola": "new orleans",
  "beantown": "boston",
  motown: "detroit",
};

function normalizeCityQuery(input: string): string {
  const trimmed = input.trim().toLowerCase().replace(/\s+/g, " ");
  const withoutState = trimmed.replace(
    /,\s*(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)\.?$/i,
    "",
  );
  const alias = ALIASES[withoutState] ?? ALIASES[trimmed];
  return (alias ?? withoutState).trim();
}

export interface AirportSuggestion {
  label: string;
  city: string;
  iata: string;
  icao: string;
  name: string;
  /** Display value written into the city field on select */
  value: string;
}

/** Deduped hub suggestions: one primary airport per city (plus code matches). */
export function searchAirportSuggestions(
  query: string,
  limit = 8,
): AirportSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    // Popular starters when focused with empty input
    const starters = ["New York", "Chicago", "Los Angeles", "San Francisco", "Dallas", "Miami", "Denver", "Seattle"];
    return starters
      .map((city) => resolveAirport(city))
      .filter((a): a is AirportRef => !!a)
      .map(toSuggestion)
      .slice(0, limit);
  }

  const upper = query.trim().toUpperCase();
  const scored: { airport: AirportRef; score: number }[] = [];
  const seen = new Set<string>();

  for (const airport of AIRPORTS) {
    const city = airport.city.toLowerCase();
    const name = airport.name.toLowerCase();
    let score = 0;
    if (airport.iata === upper || airport.icao === upper) score = 100;
    else if (airport.iata.startsWith(upper) && upper.length >= 2) score = 90;
    else if (city === q) score = 85;
    else if (city.startsWith(q)) score = 70;
    else if (city.includes(q)) score = 50;
    else if (name.includes(q)) score = 40;
    else {
      // Alias / primary-city keys
      for (const [alias, canon] of Object.entries(ALIASES)) {
        if (alias.startsWith(q) && canon === city) {
          score = 65;
          break;
        }
      }
      for (const [cityKey, iata] of Object.entries(PRIMARY_BY_CITY)) {
        if (cityKey.startsWith(q) && iata === airport.iata) {
          score = Math.max(score, 60);
        }
      }
    }
    if (score <= 0) continue;

    // Prefer primary hub when multiple airports share a metro
    const primaryIata = PRIMARY_BY_CITY[city];
    if (primaryIata && primaryIata === airport.iata) score += 5;
    else if (primaryIata && primaryIata !== airport.iata) score -= 10;

    const dedupeKey = primaryIata ?? airport.iata;
    if (seen.has(dedupeKey) && score < 90) continue;
    seen.add(dedupeKey);
    scored.push({ airport, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ airport }) => {
      const primaryIata = PRIMARY_BY_CITY[airport.city.toLowerCase()];
      const hub =
        primaryIata && primaryIata !== airport.iata
          ? AIRPORTS.find((a) => a.iata === primaryIata) ?? airport
          : airport;
      return toSuggestion(hub);
    });
}

function toSuggestion(airport: AirportRef): AirportSuggestion {
  return {
    label: `${airport.city} → ${airport.iata}`,
    city: airport.city,
    iata: airport.iata,
    icao: airport.icao,
    name: airport.name,
    value: airport.city,
  };
}

export function resolveAirport(cityInput: string): AirportRef | null {
  const normalized = normalizeCityQuery(cityInput);
  if (!normalized) return null;

  // Exact IATA / ICAO
  const upper = cityInput.trim().toUpperCase();
  const byCode = AIRPORTS.find(
    (a) => a.iata === upper || a.icao === upper || a.icao === `K${upper}`,
  );
  if (byCode) return byCode;

  const preferredIata = PRIMARY_BY_CITY[normalized];
  if (preferredIata) {
    const preferred = AIRPORTS.find((a) => a.iata === preferredIata);
    if (preferred) return preferred;
  }

  const exactCity = AIRPORTS.find(
    (a) => a.city.toLowerCase() === normalized,
  );
  if (exactCity) {
    const primary = PRIMARY_BY_CITY[exactCity.city.toLowerCase()];
    if (primary) {
      return AIRPORTS.find((a) => a.iata === primary) ?? exactCity;
    }
    return exactCity;
  }

  const startsWith = AIRPORTS.find(
    (a) =>
      a.city.toLowerCase().startsWith(normalized) ||
      normalized.startsWith(a.city.toLowerCase()),
  );
  if (startsWith) {
    const primary = PRIMARY_BY_CITY[startsWith.city.toLowerCase()];
    if (primary) {
      return AIRPORTS.find((a) => a.iata === primary) ?? startsWith;
    }
    return startsWith;
  }

  const includes = AIRPORTS.find(
    (a) =>
      a.city.toLowerCase().includes(normalized) ||
      a.name.toLowerCase().includes(normalized),
  );
  return includes ?? null;
}
