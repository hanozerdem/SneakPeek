"use client";
import { useState, useEffect } from "react";
import Fuse from "fuse.js";

interface FuzzySearchInputProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export const FuzzySearchInput = ({ options, value, onChange }: FuzzySearchInputProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fuse = new Fuse(options, {
    includeScore: true,
    threshold: 0.4, 
  });

  useEffect(() => {
    if (value.length === 0) {
      setSuggestions([]);
      return;
    }
    const results = fuse.search(value).map(result => result.item);
    setSuggestions(results.slice(0, 5)); // ilk 5 öneri göster
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        className="border border-gray-300 px-3 py-2 w-full"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        placeholder="Search tags..."
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 w-full z-10 max-h-40 overflow-y-auto">
          <li className="px-3 py-1 text-sm text-gray-500">Did you mean:</li>
          {suggestions.map((suggestion, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => {
                onChange(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
