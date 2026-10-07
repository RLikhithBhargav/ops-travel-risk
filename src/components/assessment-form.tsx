"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityAutocomplete } from "@/components/city-autocomplete";

export interface AssessmentFormValues {
  originCity: string;
  destinationCity: string;
  date: string;
}

interface AssessmentFormProps {
  disabled?: boolean;
  onSubmit: (values: AssessmentFormValues) => void;
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function maxISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function AssessmentForm({ disabled, onSubmit }: AssessmentFormProps) {
  const [originCity, setOriginCity] = useState("Chicago");
  const [destinationCity, setDestinationCity] = useState("San Francisco");
  const [date, setDate] = useState(todayISO);
  const minDate = useMemo(() => todayISO(), []);
  const maxDate = useMemo(() => maxISO(), []);

  return (
    <form
      className="assessment-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ originCity, destinationCity, date });
      }}
    >
      <div className="form-grid">
        <CityAutocomplete
          id="origin"
          label="Origin city"
          placeholder="e.g. Chicago"
          value={originCity}
          disabled={disabled}
          required
          onChange={setOriginCity}
        />
        <CityAutocomplete
          id="destination"
          label="Destination city"
          placeholder="e.g. San Francisco"
          value={destinationCity}
          disabled={disabled}
          required
          onChange={setDestinationCity}
        />
        <div className="field">
          <Label htmlFor="date">Travel date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            min={minDate}
            max={maxDate}
            value={date}
            disabled={disabled}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" size="lg" disabled={disabled} className="submit-btn">
        {disabled ? "Assessing…" : "Assess disruption"}
      </Button>
    </form>
  );
}
