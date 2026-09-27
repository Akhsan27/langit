import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return NextResponse.json({ error: "Koordinat lokasi tidak valid." }, { status: 400 });
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(lat), longitude: String(lon), timezone: "auto",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
    forecast_days: "7",
  }).toString();

  try {
    const response = await fetch(url, { next: { revalidate: 900 } });
    if (!response.ok) throw new Error("Weather provider returned an error");
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "Data cuaca belum bisa dimuat. Coba lagi sebentar." }, { status: 502 });
  }
}
