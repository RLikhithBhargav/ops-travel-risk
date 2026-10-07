#!/usr/bin/env node
/**
 * Build src/data/us-airports.json from OurAirports public CSV.
 * Source: https://github.com/davidmegginson/ourairports-data
 *
 * Filter: US + IATA + (large|medium airport OR scheduled small airport)
 * Hub rule: same city+state highest rank; else nearest by haversine.
 */
import { createWriteStream, createReadStream, writeFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SRC =
  "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv";
const OUT = new URL("../src/data/us-airports.json", import.meta.url);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        download(res.headers.location, dest).then(resolve, reject);
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve(dest)));
    }).on("error", reject);
  });
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const TYPE_CODE = {
  large_airport: "L",
  medium_airport: "M",
  small_airport: "S",
};

async function main() {
  const csvPath = join(tmpdir(), "ourairports.csv");
  await download(SRC, csvPath);
  const rl = createInterface({ input: createReadStream(csvPath, "utf8") });
  let header = null;
  const byIata = new Map();

  for await (const line of rl) {
    if (!header) {
      header = parseCsvLine(line);
      continue;
    }
    const cols = parseCsvLine(line);
    const row = Object.fromEntries(header.map((h, i) => [h, cols[i] ?? ""]));
    if (row.iso_country !== "US") continue;
    const iata = (row.iata_code || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{3}$/.test(iata)) continue;
    const typ = row.type;
    const scheduled = row.scheduled_service === "yes";
    if (
      typ !== "large_airport" &&
      typ !== "medium_airport" &&
      !(typ === "small_airport" && scheduled)
    ) {
      continue;
    }
    const city = (row.municipality || "").trim();
    if (!city) continue;
    const lat = Number(row.latitude_deg);
    const lon = Number(row.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const icao = ((row.icao_code || row.gps_code || "").trim() || `K${iata}`).toUpperCase();
    const rank =
      (typ === "large_airport" ? 3 : typ === "medium_airport" ? 2 : 1) +
      (scheduled ? 2 : 0);
    const next = {
      iata,
      icao,
      name: (row.name || "").trim(),
      city,
      region: (row.iso_region || "").replace(/^US-/, ""),
      lat: Math.round(lat * 1e5) / 1e5,
      lon: Math.round(lon * 1e5) / 1e5,
      type: TYPE_CODE[typ] || "M",
      sched: scheduled,
      rank,
    };
    const prev = byIata.get(iata);
    if (!prev || next.rank > prev.rank) byIata.set(iata, next);
  }

  const airports = [...byIata.values()]
    .sort((a, b) => b.rank - a.rank || a.city.localeCompare(b.city))
    .map(({ rank, ...rest }) => rest);

  const payload = {
    source:
      "OurAirports (davidmegginson/ourairports-data) — US large/medium airports plus scheduled small airports with IATA",
    rule:
      "Resolve city to best airport in same municipality+state by rank (large>medium>small, scheduled boost). If no same-city airport, use nearest airport in the filtered set by haversine distance.",
    count: airports.length,
    airports,
  };

  writeFileSync(OUT, JSON.stringify(payload));
  console.log(`Wrote ${airports.length} airports to ${OUT.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
