"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import AppearanceControls from "@/components/AppearanceControls";
import { usePreferences } from "@/components/Preferences";

type Place = { id: number; name: string; region?: string; country?: string; lat: number; lon: number; isCurrentLocation?: boolean };
type Forecast = {
  timezone: string;
  current: { time: string; temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; wind_speed_10m: number; precipitation: number };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[] };
  daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; weather_code: number[] };
};
const defaultPlace: Place = { id: 1642911, name: "Jakarta", region: "DKI Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 };

function clock(value: string, locale: string) { return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
function weekday(value: string, index: number, locale: string, today: string) { return index === 0 ? today : new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(value)); }

export default function DetailsPage() {
  const { locale, t } = usePreferences();
  const [place, setPlace] = useState<Place>(defaultPlace);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const convert = (value: number) => Math.round(unit === "C" ? value : value * 9 / 5 + 32);

  useEffect(() => {
    let selected = defaultPlace;
    try {
      const stored = sessionStorage.getItem("langit.selectedPlace");
      if (stored) {
        const parsed = JSON.parse(stored) as Place;
        if (Number.isFinite(parsed.lat) && Number.isFinite(parsed.lon)) selected = parsed;
      }
    } catch { sessionStorage.removeItem("langit.selectedPlace"); }
    setPlace(selected);
    fetch(`/api/weather?lat=${selected.lat}&lon=${selected.lon}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat prakiraan.");
      setForecast(data);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Gagal memuat prakiraan.")).finally(() => setLoading(false));
  }, []);

  const hours = useMemo(() => {
    if (!forecast) return [];
    const start = Math.max(0, forecast.hourly.time.findIndex((time) => time >= forecast.current.time));
    return forecast.hourly.time.slice(start, start + 24).map((time, index) => ({ time, temp: forecast.hourly.temperature_2m[start + index], rain: forecast.hourly.precipitation_probability[start + index] }));
  }, [forecast]);
  const temperaturePoints = useMemo(() => {
    if (!hours.length) return "";
    const temps = hours.map((hour) => convert(hour.temp));
    const min = Math.floor(Math.min(...temps) / 2) * 2 - 2;
    const max = Math.ceil(Math.max(...temps) / 2) * 2 + 2;
    return temps.map((value, index) => `${42 + index * (680 / Math.max(1, temps.length - 1))},${158 - ((value - min) / Math.max(4, max - min)) * 118}`).join(" ");
  }, [hours, unit]);
  const chartTemps = hours.map((hour) => convert(hour.temp));
  const chartMinimum = chartTemps.length ? Math.floor(Math.min(...chartTemps) / 2) * 2 - 2 : 0;
  const chartMaximum = chartTemps.length ? Math.ceil(Math.max(...chartTemps) / 2) * 2 + 2 : 10;

  return <main className="app-shell"><AppSidebar active="details"/><section className="main-content">
    <header className="topbar"><div className="breadcrumb"><Link href="/">{t("dashboard")}</Link> <span>/</span> {t("details")}</div><div className="top-actions"><AppearanceControls/><div className="unit-toggle"><button className={unit === "C" ? "chosen" : ""} onClick={() => setUnit("C")}>°C</button><button className={unit === "F" ? "chosen" : ""} onClick={() => setUnit("F")}>°F</button></div><div className="avatar">U</div></div></header>
    <div className="dashboard details-dashboard"><div className="eyebrow">{t("analysis")}</div><h1>{t("detailTitle")}</h1><p className="subtitle">{t("detailText")}</p>
      <section className="detail-location-card"><div className="detail-location-pin">⌖</div><div><span>{t("activeLocation")}</span><strong>{place.name}{place.region && !place.isCurrentLocation && place.region !== place.name ? `, ${place.region}` : ""}</strong></div><Link href="/locations">{t("changeLocation")} <span>↗</span></Link></section>
      {error && <div className="error-banner"><span>{t("notAvailable")}</span><Link href="/">{t("dashboard")}</Link></div>}
      {loading && <div className="detail-loading">{t("loading")}</div>}
      {forecast && <>
        <section className="detail-stats"><article><span>{t("currentTemp")}</span><strong>{convert(forecast.current.temperature_2m)}°{unit}</strong><small>{t("feels")} {convert(forecast.current.apparent_temperature)}°{unit}</small></article><article><span>{t("humidity")}</span><strong>{forecast.current.relative_humidity_2m}%</strong><small>{t("humidityNow")}</small></article><article><span>{t("wind")}</span><strong>{Math.round(forecast.current.wind_speed_10m)} <small>km/h</small></strong><small>{t("windSurface")}</small></article><article><span>{t("rainCurrent")}</span><strong>{forecast.current.precipitation} <small>mm</small></strong><small>{t("rainMeasured")}</small></article></section>
        <section className="panel detail-chart-panel"><div className="panel-heading"><div><h2>{t("tempChart")}</h2><p>{t("hourlyTemp")}</p></div><span className="detail-chart-legend"><i/> {t("temperature")} °{unit}</span></div><div className="large-chart-wrap"><svg className="large-chart" viewBox="0 0 750 215" role="img" aria-label={t("tempChart")}>
          {[0, 0.5, 1].map((step) => <g key={step}><line x1="42" x2="722" y1={40 + step * 118} y2={40 + step * 118} className="chart-grid-line"/><text x="2" y={43 + step * 118} className="chart-axis-label">{Math.round(chartMaximum - step * (chartMaximum - chartMinimum))}°</text></g>)}
          {temperaturePoints && <><polygon points={`${temperaturePoints} 722,158 42,158`} className="detail-temp-area"/><polyline points={temperaturePoints} className="temperature-line"/></>}
          {hours.map((hour, index) => <g key={hour.time}><circle cx={42 + index * (680 / Math.max(1, hours.length - 1))} cy={Number(temperaturePoints.split(" ")[index]?.split(",")[1] ?? 0)} r="6" className="temperature-point chart-hover-point" tabIndex={0} aria-label={`${clock(hour.time, locale)} · ${convert(hour.temp)}°${unit}`}><title>{clock(hour.time, locale)} · {convert(hour.temp)}°{unit}</title></circle>{(index % 4 === 0 || index === hours.length - 1) && <text x={42 + index * (680 / Math.max(1, hours.length - 1))} y="184" textAnchor="middle" className="chart-axis-label">{clock(hour.time, locale)}</text>}</g>)}
        </svg></div></section>
        <section className="panel detail-chart-panel rain-detail-panel"><div className="panel-heading"><div><h2>{t("rainChart")}</h2><p>{t("rainPerHour")}</p></div><span className="detail-chart-legend rain-legend"><i/> {t("chanceRain")}</span></div><div className="large-chart-wrap"><svg className="large-chart" viewBox="0 0 750 215" role="img" aria-label={t("rainChart")}>
          {[0, 50, 100].map((value) => <g key={value}><line x1="42" x2="722" y1={158 - value * 1.18} y2={158 - value * 1.18} className="chart-grid-line"/><text x="2" y={161 - value * 1.18} className="chart-axis-label">{value}%</text></g>)}
          {hours.map((hour, index) => { const x = 42 + index * (680 / Math.max(1, hours.length - 1)); const height = hour.rain * 1.18; return <g key={hour.time}><rect x={x - 8} y={158 - height} width="16" height={height} rx="6" className={hour.rain >= 60 ? "rain-bar high" : "rain-bar"}/><rect x={x - 10} y="40" width="20" height="118" fill="transparent" className="chart-hit-area" tabIndex={0} aria-label={`${clock(hour.time, locale)} · ${hour.rain}%`}><title>{clock(hour.time, locale)} · {hour.rain}%</title></rect>{(index % 4 === 0 || index === hours.length - 1) && <text x={x} y="184" textAnchor="middle" className="chart-axis-label">{clock(hour.time, locale)}</text>}</g>; })}
        </svg></div></section>
        <section className="panel detail-days-panel"><div className="panel-heading"><div><h2>{t("sevenDaySummary")}</h2><p>{t("rangeAndChance")}</p></div></div><div className="detail-days-list">{forecast.daily.time.map((date, index) => <div className="detail-day-row" key={date}><strong>{weekday(date, index, locale, t("todayLabel"))}</strong><span>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(date))}</span><span className="detail-day-rain">💧 {forecast.daily.precipitation_probability_max[index]}%</span><div className="detail-day-range"><span>{convert(forecast.daily.temperature_2m_min[index])}°</span><i><b style={{ left: `${10 + index * 5}%`, width: "50%" }}/></i><strong>{convert(forecast.daily.temperature_2m_max[index])}°</strong></div></div>)}</div>
        </section>
      </>}
      <div className="attribution detail-attribution">{t("dataAttribution")} <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · CC BY 4.0</div>
    </div>
  </section></main>;
}
