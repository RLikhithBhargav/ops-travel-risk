"use client";

import { useEffect, useState } from "react";

const SOURCES = [
  { id: "open-meteo", label: "Open-Meteo forecast" },
  { id: "nws", label: "NWS alerts" },
  { id: "aviation", label: "AviationWeather METAR/TAF" },
  { id: "synthesis", label: "Synthesizing assessment" },
];

export function LoadingSources() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((n) => (n < SOURCES.length - 1 ? n + 1 : n));
    }, 700);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="loading-panel" aria-live="polite">
      <p className="loading-title">Gathering live signals</p>
      <ul className="source-checklist">
        {SOURCES.map((s, i) => {
          const state =
            i < active ? "done" : i === active ? "active" : "pending";
          return (
            <li key={s.id} className={`source-item source-${state}`}>
              <span className="source-dot" aria-hidden />
              <span>{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
