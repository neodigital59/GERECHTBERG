"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";

// Enregistre la locale dès le chargement du module pour garantir que getNames("fr") dispose des noms
try {
  countries.registerLocale(fr as any);
} catch (_) {}

interface CountrySelectProps {
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
}

export default function CountrySelect({ value, onChange, placeholder = "Sélectionner un pays" }: CountrySelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // options calculées après enregistrement de la locale
  const options = useMemo(() => {
    const names = countries.getNames("fr");
    const entries = Object.entries(names).map(([code, name]) => ({ code, name }));
    const filtered = query
      ? entries.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()) || o.code.toLowerCase().includes(query.toLowerCase()))
      : entries;
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.find((o) => o.code === (value ?? undefined)) || null;

  return (
    <div ref={containerRef} className="relative">
      <label className="flex flex-col text-sm">
        Pays
        <input
          value={selected ? `${selected.name} (${selected.code})` : ""}
          onChange={() => {}}
          readOnly
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2 cursor-pointer"
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
        />
      </label>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg">
          <div className="p-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Rechercher un pays…"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-auto">
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-black/60">Aucun résultat</li>
            )}
            {options.map((o) => (
              <li
                key={o.code}
                className="px-3 py-2 hover:bg-black/5 cursor-pointer text-sm"
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                }}
              >
                {o.name} ({o.code})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}