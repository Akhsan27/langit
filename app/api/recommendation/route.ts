import { NextRequest, NextResponse } from "next/server";

type WeatherInput = {
  temperatureC: number;
  condition: string;
  rainProbability: number;
  humidity: number;
  windKmh: number;
  uvIndex: number;
};

const requestTimes = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI is not configured." }, { status: 503 });

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientId = forwardedFor || "local";
  const now = Date.now();
  const recent = (requestTimes.get(clientId) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Please try again in a minute." }, { status: 429 });
  recent.push(now);
  requestTimes.set(clientId, recent);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const input = body as WeatherInput;

  const numericValues = [input.temperatureC, input.rainProbability, input.humidity, input.windKmh, input.uvIndex];
  if (!numericValues.every(Number.isFinite) || input.temperatureC < -80 || input.temperatureC > 60 || input.rainProbability < 0 || input.rainProbability > 100 || input.humidity < 0 || input.humidity > 100 || input.windKmh < 0 || input.windKmh > 250 || input.uvIndex < 0 || input.uvIndex > 30 || typeof input.condition !== "string" || input.condition.length > 40) {
    return NextResponse.json({ error: "Weather values are invalid." }, { status: 400 });
  }

  const prompt = `You are a concise Indonesian weather activity assistant. Use only this weather data: temperature ${Math.round(input.temperatureC)}°C, condition ${input.condition}, chance of rain ${Math.round(input.rainProbability)}%, humidity ${Math.round(input.humidity)}%, wind ${Math.round(input.windKmh)} km/h, UV index ${input.uvIndex.toFixed(1)}. Return valid JSON only with exactly these keys: {"title":"short Indonesian title","summary":"one or two friendly Indonesian sentences","tips":["tip 1","tip 2","tip 3"]}. Give practical, low-risk activity suggestions. Do not invent forecasts, make medical claims, or claim an activity is completely safe.`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.5, maxOutputTokens: 300 } }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return NextResponse.json({ error: "AI provider is temporarily unavailable." }, { status: 502 });
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") throw new Error("Empty AI response");
    const parsed = JSON.parse(text);
    const recommendation = {
      title: String(parsed.title ?? "Ide kegiatan hari ini").slice(0, 90),
      summary: String(parsed.summary ?? "Sesuaikan rencana dengan kondisi cuaca.").slice(0, 280),
      tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3).map((tip: unknown) => String(tip).slice(0, 130)) : [],
    };
    if (!recommendation.tips.length) throw new Error("Incomplete AI response");
    return NextResponse.json({ recommendation });
  } catch {
    return NextResponse.json({ error: "Could not generate an AI recommendation." }, { status: 502 });
  }
}
