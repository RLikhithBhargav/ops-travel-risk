"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchAirportSuggestions,
  type AirportSuggestion,
} from "@/lib/airports";

interface CityAutocompleteProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AirportSuggestion) => void;
}

export function CityAutocomplete({
  id,
  label,
  placeholder,
  value,
  disabled,
  required,
  onChange,
  onSelect,
}: CityAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const suggestions = searchAirportSuggestions(value, 8);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [value]);

  const pick = (s: AirportSuggestion) => {
    onChange(s.value);
    onSelect?.(s);
    setOpen(false);
  };

  return (
    <div className="field city-autocomplete" ref={rootRef}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        required={required}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open) {
            e.preventDefault();
            pick(suggestions[activeIndex] ?? suggestions[0]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {value.trim() && (
        <p className="hub-hint" aria-live="polite">
          {(() => {
            const top = suggestions[0];
            return top
              ? `Hub: ${top.iata} · ${top.name}`
              : "No matching hub in the prototype map";
          })()}
        </p>
      )}
      {open && suggestions.length > 0 && (
        <ul id={listId} role="listbox" className="city-suggest-list">
          {suggestions.map((s, i) => (
            <li key={`${s.iata}-${s.city}`}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className={
                  i === activeIndex
                    ? "city-suggest-item active"
                    : "city-suggest-item"
                }
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => pick(s)}
              >
                <span className="city-suggest-main">
                  <strong>{s.city}</strong>
                  <span className="muted"> → {s.iata}</span>
                </span>
                <span className="city-suggest-sub muted">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
