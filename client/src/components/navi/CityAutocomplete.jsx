import { useEffect, useRef, useState } from "react";
import axios from "axios";

function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function CityAutocomplete({
  label = "City",
  value = "",
  onChange,
  onSelect,
  placeholder = "Search city..."
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchSuggestions() {
      const q = debouncedQuery.trim();

      if (!q || q.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await axios.get("/api/cities", {
          params: { q }
        });

        if (!cancelled) {
          setSuggestions(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = (item) => {
    const fullName = item.display_name || item.name || "";
    setQuery(fullName);
    if (onChange) onChange(fullName);
    if (onSelect) {
      onSelect({
        name: item.name || fullName,
        display_name: fullName,
        lat: item.lat,
        lon: item.lon,
        raw: item
      });
    }
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <label style={{ display: "block", marginBottom: 6, color: "white" }}>
        {label}
      </label>

      <input
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          if (onChange) onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white",
          outline: "none",
          boxSizing: "border-box"
        }}
      />

      {open && (loading || suggestions.length > 0) && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            background: "#111827",
            border: "1px solid #334155",
            borderRadius: 8,
            zIndex: 1000,
            maxHeight: 260,
            overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.35)"
          }}
        >
          {loading && (
            <div style={{ padding: "10px 12px", color: "white" }}>
              Loading...
            </div>
          )}

          {!loading &&
            suggestions.map((item, index) => {
              const display = item.display_name || item.name || "";
              return (
                <div
                  key={`${item.place_id || index}`}
                  onMouseDown={() => handleSelect(item)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    color: "white",
                    borderBottom:
                      index === suggestions.length - 1
                        ? "none"
                        : "1px solid #1f2937"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1e293b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{display}</div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}