"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import AppearanceControls from "@/components/AppearanceControls";
import { Language, usePreferences } from "@/components/Preferences";

type Place = { id: number; name: string; region?: string; country?: string; lat: number; lon: number; timezone?: string };
type Weather = {
  timezone: string;
  current: { time: string; temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; is_day: number; precipitation: number; weather_code: number; wind_speed_10m: number };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; sunrise: string[]; sunset: string[]; uv_index_max: number[]; precipitation_probability_max: number[] };
};

const defaultPlace: Place = { id: 1642911, name: "Jakarta", region: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, timezone: "Asia/Jakarta" };
function condition(code: number, isDay = 1, language: Language = "id") {
  let key: "clear" | "partlyCloudy" | "cloudy" | "foggy" | "drizzle" | "rainy" | "snowy" | "storm" = "partlyCloudy";
  if (code === 0) key = "clear";
  else if ([1, 2].includes(code)) key = "partlyCloudy";
  else if (code === 3) key = "cloudy";
  else if ([45, 48].includes(code)) key = "foggy";
  else if ([51, 53, 55, 56, 57].includes(code)) key = "drizzle";
  else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) key = "rainy";
  else if ([71, 73, 75, 77, 85, 86].includes(code)) key = "snowy";
  else if ([95, 96, 99].includes(code)) key = "storm";
  const labels: Record<Language, Record<typeof key, string>> = {
    id: { clear: "Cerah", partlyCloudy: "Cerah berawan", cloudy: "Berawan", foggy: "Berkabut", drizzle: "Gerimis", rainy: "Hujan", snowy: "Salju", storm: "Badai petir" },
    en: { clear: "Clear", partlyCloudy: "Partly cloudy", cloudy: "Cloudy", foggy: "Foggy", drizzle: "Drizzle", rainy: "Rainy", snowy: "Snow", storm: "Thunderstorm" },
    ja: { clear: "晴れ", partlyCloudy: "晴れ時々くもり", cloudy: "くもり", foggy: "霧", drizzle: "小雨", rainy: "雨", snowy: "雪", storm: "雷雨" },
    zh: { clear: "晴", partlyCloudy: "多云间晴", cloudy: "多云", foggy: "有雾", drizzle: "小雨", rainy: "下雨", snowy: "下雪", storm: "雷暴" },
    es: { clear: "Despejado", partlyCloudy: "Parcialmente nublado", cloudy: "Nublado", foggy: "Neblina", drizzle: "Llovizna", rainy: "Lluvia", snowy: "Nieve", storm: "Tormenta" },
    fr: { clear: "Dégagé", partlyCloudy: "Partiellement nuageux", cloudy: "Nuageux", foggy: "Brouillard", drizzle: "Bruine", rainy: "Pluie", snowy: "Neige", storm: "Orage" },
  };
  const icon = key === "clear" ? (isDay ? "☀" : "☾") : key === "partlyCloudy" ? (isDay ? "🌤" : "☁") : ({ cloudy: "☁", foggy: "☁", drizzle: "🌦", rainy: "🌧", snowy: "❄", storm: "⛈" } as const)[key];
  return { label: labels[language][key], icon };
}

function timeLabel(value: string, options: Intl.DateTimeFormatOptions, locale: string) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    wind: <><path d="M3 8h12a3 3 0 1 0-3-3"/><path d="M2 12h17a3 3 0 1 1-3 3"/><path d="M4 16h5"/></>, drop: <><path d="M12 3s7 7.1 7 12a7 7 0 0 1-14 0c0-4.9 7-12 7-12Z"/><path d="M9 16a3 3 0 0 0 3 2"/></>, sunrise: <><path d="M12 2v7m-4-3 4 3 4-3M4 16H2m20 0h-2M5 12l-2-2m18 0-2 2"/><path d="M4 20h16M6 16a6 6 0 0 1 12 0"/></>, compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>, uv: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  };
  return <svg {...common}>{paths[name] ?? paths.compass}</svg>;
}

export default function Home() {
  const { language, locale, t } = usePreferences();
  const [place, setPlace] = useState<Place>(defaultPlace);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [updatedAt, setUpdatedAt] = useState(new Date());

  const loadWeather = useCallback(async (selected: Place) => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/weather?lat=${selected.lat}&lon=${selected.lon}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat cuaca.");
      setWeather(data); setUpdatedAt(new Date());
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat cuaca."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadWeather(place); }, [place, loadWeather]);
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try { const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`); const data = await response.json(); setResults(Array.isArray(data) ? data : []); }
      catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const currentCondition = weather ? condition(weather.current.weather_code, weather.current.is_day, language) : condition(2, 1, language);
  const temp = (value: number) => Math.round(unit === "C" ? value : value * 9 / 5 + 32);
  const hourly = useMemo(() => {
    if (!weather) return [];
    const start = Math.max(0, weather.hourly.time.findIndex((time) => time >= weather.current.time));
    return weather.hourly.time.slice(start, start + 8).map((time, index) => ({ time, temperature: weather.hourly.temperature_2m[start + index], rain: weather.hourly.precipitation_probability[start + index], code: weather.hourly.weather_code[start + index] }));
  }, [weather]);
  const dayName = (date: string, index: number) => index === 0 ? t("todayLabel") : timeLabel(date, { weekday: "long" }, locale);
  const submitSearch = (event: FormEvent) => { event.preventDefault(); if (results[0]) { setPlace(results[0]); setQuery(""); setResults([]); } };

  return (
    <main className="app-shell">
      <AppSidebar active="dashboard" />

      <section className="main-content">
        <header className="topbar"><div className="breadcrumb">{t("dashboard")} <span>/</span> {t("today")}</div><div className="top-actions"><AppearanceControls/><div className="unit-toggle"><button className={unit === "C" ? "chosen" : ""} onClick={() => setUnit("C")}>°C</button><button className={unit === "F" ? "chosen" : ""} onClick={() => setUnit("F")}>°F</button></div><div className="avatar">U</div></div></header>

        <div className="dashboard">
          <div className="welcome-row"><div><div className="eyebrow">{t("searchTitle")}</div><h1>{t("today")}</h1><p className="subtitle">{t("subtitle")}</p></div><form className="search-wrap" onSubmit={submitSearch}><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("cityPlaceholder")} aria-label={t("cityPlaceholder")}/><kbd>↵</kbd>{(results.length > 0 || searching) && <div className="search-results">{searching && <div className="search-state">{t("searchResults")}…</div>}{results.map((result) => <button type="button" key={`${result.id}-${result.lat}`} onClick={() => { setPlace(result); setQuery(""); setResults([]); }}><span className="result-pin"><Icon name="pin" size={16}/></span><span><strong>{result.name}</strong><small>{[result.region, result.country].filter(Boolean).join(", ")}</small></span></button>)}</div>}</form></div>

          {error && <div className="error-banner"><span>{t("notAvailable")}</span><button onClick={() => void loadWeather(place)}>{t("retry")}</button></div>}

          <section className="hero-card" id="today">
            <div className="hero-glow"/><div className="hero-content"><div className="hero-location"><span className="location-pin"><Icon name="pin" size={16}/></span><div><strong>{place.name}{place.region && place.region !== place.name ? `, ${place.region}` : ""}</strong><span>{place.country ?? ""}</span></div></div>
              <div className="hero-weather"><div><div className="hero-temp">{loading || !weather ? "—" : temp(weather.current.temperature_2m)}<span>°{unit}</span></div><div className="hero-condition">{currentCondition.label}</div><div className="feels-like">{t("feels")} {weather ? `${temp(weather.current.apparent_temperature)}°${unit}` : "—"}</div></div><div className="hero-illustration" aria-hidden="true"><span>{currentCondition.icon}</span><i/></div></div>
              <div className="hero-footer"><span><Icon name="sunrise" size={16}/> {t("sunrise")} <b>{weather ? timeLabel(weather.daily.sunrise[0], { hour: "2-digit", minute: "2-digit" }, locale) : "—"}</b></span><span className="hero-footer-divider"/><span className="updated-label">{t("updated")} {updatedAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span></div>
            </div><div className="hero-side"><div className="hero-date"><span>{new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</span></div><div className="hero-side-note">{t("today")}<br/><strong>{currentCondition.label.toLowerCase()}</strong></div><div className="hero-watermark">☼</div></div>
          </section>

          <section className="metric-grid" aria-label="Detail cuaca">
            <article className="metric-card"><div className="metric-top"><span>{t("humidity")}</span><span className="metric-icon blue"><Icon name="drop"/></span></div><div className="metric-value">{weather ? `${weather.current.relative_humidity_2m}%` : "—"}</div><div className="metric-hint">{t("humidityHint")}</div><div className="meter"><span style={{ width: `${weather?.current.relative_humidity_2m ?? 0}%` }}/></div></article>
            <article className="metric-card"><div className="metric-top"><span>{t("wind")}</span><span className="metric-icon blue"><Icon name="wind"/></span></div><div className="metric-value">{weather ? <>{Math.round(weather.current.wind_speed_10m)} <small>km/h</small></> : "—"}</div><div className="metric-hint">{t("windHint")}</div><div className="wind-scale"><span>0</span><i/><span>50 km/h</span></div></article>
            <article className="metric-card"><div className="metric-top"><span>{t("rain")}</span><span className="metric-icon aqua"><Icon name="drop"/></span></div><div className="metric-value">{weather ? <>{weather.current.precipitation} <small>mm</small></> : "—"}</div><div className="metric-hint">{t("rainCurrent")}</div><div className="metric-note"><span className="note-dot"/> {t("rainToday")} <b>{weather ? `${weather.daily.precipitation_probability_max[0]}%` : "—"}</b></div></article>
            <article className="metric-card"><div className="metric-top"><span>{t("uv")}</span><span className="metric-icon amber"><Icon name="uv"/></span></div><div className="metric-value">{weather ? weather.daily.uv_index_max[0].toFixed(1) : "—"}</div><div className="metric-hint">{(weather?.daily.uv_index_max[0] ?? 0) > 5 ? t("uvAdvice") : t("uvLow")}</div><div className="uv-scale"><span/><span/><span/><span/><span/><span/></div></article>
          </section>

          <section className="panel hourly-panel"><div className="panel-heading"><div><h2>{t("hourly")}</h2><p>{t("hourlyText")}</p></div><span className="forecast-static-label">{t("nextHours")}</span></div><div className="hourly-scroll"><div className="hourly-list">{hourly.map((item, index) => <div className={`hour-item ${index === 0 ? "now" : ""}`} key={item.time}><span className="hour-time">{index === 0 ? t("now") : timeLabel(item.time, { hour: "2-digit", minute: "2-digit" }, locale)}</span><span className="hour-icon">{condition(item.code, 1, language).icon}</span><span className="hour-temp">{temp(item.temperature)}°</span><div className="rain-chance"><Icon name="drop" size={12}/>{item.rain}%</div></div>)}</div></div></section>

          <section className="panel forecast-panel" id="forecast"><div className="panel-heading"><div><h2>{t("week")}</h2><p>{t("weekText")}</p></div><span className="forecast-static-label">{t("nextWeek")}</span></div><div className="forecast-list">{weather?.daily.time.map((date, index) => { const c = condition(weather.daily.weather_code[index], 1, language); return <div className="forecast-row" key={date}><span className="forecast-day">{dayName(date, index)}</span><span className="forecast-date">{timeLabel(date, { day: "numeric", month: "short" }, locale)}</span><span className="forecast-icon">{c.icon}</span><span className="forecast-condition">{c.label}</span><span className="forecast-rain"><Icon name="drop" size={13}/>{weather.daily.precipitation_probability_max[index]}%</span><span className="forecast-range"><span>{temp(weather.daily.temperature_2m_min[index])}°</span><i><b style={{ left: `${20 + (index * 7) % 30}%`, width: `${35 + (index * 5) % 22}%` }}/></i><strong>{temp(weather.daily.temperature_2m_max[index])}°</strong></span></div>; }) ?? Array.from({ length: 7 }, (_, i) => <div className="forecast-row skeleton" key={i}><span/></div>)}</div><div className="attribution">{t("dataAttribution")} <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · CC BY 4.0</div></section>

          <footer className="page-footer"><span>© 2026 Langit Weather</span><span>{t("brandTitle")} <span className="footer-sun">✳</span></span></footer>
        </div>
      </section>
    </main>
  );
}
