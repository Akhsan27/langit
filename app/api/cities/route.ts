import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) return NextResponse.json([]);
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({ name: query, count: "6", language: "id", format: "json" }).toString();
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error("Geocoding provider returned an error");
    const data = await response.json();
    return NextResponse.json((data.results ?? []).map((place: { id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone?: string }) => ({
      id: place.id, name: place.name, region: place.admin1, country: place.country,
      lat: place.latitude, lon: place.longitude, timezone: place.timezone,
    })));
  } catch {
    return NextResponse.json({ error: "Pencarian kota gagal." }, { status: 502 });
  }
}
