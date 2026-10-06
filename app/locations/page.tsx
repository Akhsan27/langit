"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppearanceControls from "@/components/AppearanceControls";
import { usePreferences } from "@/components/Preferences";

type Place = { id: number; name: string; region?: string; country?: string; lat: number; lon: number; timezone?: string };
const popularPlaces: Place[] = [
  { id: 1642911, name: "Jakarta", region: "DKI Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
  { id: 1650357, name: "Bandung", region: "Jawa Barat", country: "Indonesia", lat: -6.9175, lon: 107.6191 },
  { id: 1625822, name: "Surabaya", region: "Jawa Timur", country: "Indonesia", lat: -7.2575, lon: 112.7521 },
  { id: 1214520, name: "Yogyakarta", region: "DI Yogyakarta", country: "Indonesia", lat: -7.7956, lon: 110.3695 },
  { id: 1650535, name: "Denpasar", region: "Bali", country: "Indonesia", lat: -8.65, lon: 115.2167 },
  { id: 1633070, name: "Makassar", region: "Sulawesi Selatan", country: "Indonesia", lat: -5.1477, lon: 119.4327 },
];

export default function LocationsPage() {
  const router = useRouter();
  const { t } = usePreferences();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    try { setFavorites(JSON.parse(localStorage.getItem("langit.favoritePlaces") ?? "[]")); } catch { setFavorites([]); }
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setSearchError(""); return; }
    const timer = setTimeout(async () => {
      setSearching(true); setSearchError("");
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Pencarian gagal.");
        setResults(data);
      } catch { setResults([]); setSearchError("Kota belum ditemukan. Coba kata kunci lain."); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const selectPlace = (place: Place) => {
    sessionStorage.setItem("langit.selectedPlace", JSON.stringify(place));
    router.push("/");
  };

  const toggleFavorite = (place: Place) => {
    const exists = favorites.some((item) => item.id === place.id || (item.name === place.name && item.lat === place.lat));
    const next = exists ? favorites.filter((item) => !(item.id === place.id || (item.name === place.name && item.lat === place.lat))) : [...favorites, place];
    setFavorites(next);
    localStorage.setItem("langit.favoritePlaces", JSON.stringify(next));
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (results[0]) selectPlace(results[0]);
  };

  const PlaceCard = ({ place }: { place: Place }) => {
    const favorite = favorites.some((item) => item.id === place.id || (item.name === place.name && item.lat === place.lat));
    return <article className="location-card"><div className="location-card-icon">⌖</div><div className="location-card-info"><strong>{place.name}</strong><span>{[place.region, place.country].filter(Boolean).join(", ")}</span></div><button className={`favorite-button ${favorite ? "is-favorite" : ""}`} onClick={() => toggleFavorite(place)} aria-label={favorite ? t("removeFavorite") : t("save")}>{favorite ? "★" : "☆"}</button><button className="location-select-button" onClick={() => selectPlace(place)}>{t("seeWeather")} <span>↗</span></button></article>;
  };

  return <main className="app-shell"><AppSidebar active="locations"/><section className="main-content">
    <header className="topbar"><div className="breadcrumb">{t("dashboard")} <span>/</span> {t("locations")}</div><div className="top-actions"><AppearanceControls/><div className="avatar">U</div></div></header>
    <div className="dashboard locations-dashboard"><div className="eyebrow">{t("locationHeading")}</div><h1>{t("locationTitle")}</h1><p className="subtitle">{t("locationText")}</p>
      <form className="location-search" onSubmit={submitSearch}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("locationPlaceholder")} aria-label={t("locationPlaceholder")}/><button type="submit" disabled={!results.length}>{t("search")}</button></form>
      {searching && <p className="location-search-status">{t("searchResults")}…</p>}{searchError && <p className="location-search-status search-error">{t("noResults")}</p>}
      {results.length > 0 && <section className="location-section"><div className="location-section-heading"><div><h2>{t("searchResults")}</h2><p>{t("selectCity")}</p></div><button className="clear-search" onClick={() => { setQuery(""); setResults([]); }}>{t("clear")}</button></div><div className="location-grid">{results.map((place) => <PlaceCard key={`${place.id}-${place.lat}`} place={place}/>)}</div></section>}
      <section className="location-section"><div className="location-section-heading"><div><h2>{t("popular")}</h2><p>{t("popularText")}</p></div></div><div className="location-grid">{popularPlaces.map((place) => <PlaceCard key={place.id} place={place}/>)}</div></section>
      {favorites.length > 0 && <section className="location-section"><div className="location-section-heading"><div><h2>{t("favorites")}</h2><p>{t("favoritesText")}</p></div></div><div className="location-grid">{favorites.map((place) => <PlaceCard key={`${place.id}-${place.lat}`} place={place}/>)}</div></section>}
      <div className="location-data-note">{t("locationNote")}</div>
    </div>
  </section></main>;
}
