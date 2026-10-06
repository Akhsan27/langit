# Langit Weather Dashboard

A responsive weather dashboard built with Next.js and TypeScript. It shows current conditions and forecasts for cities around the world using the Open-Meteo API.

## Features

- Separate Dashboard, Location Search, and Detailed Weather Charts pages
- Current temperature and weather conditions
- Search for cities around the world
- Hourly forecast
- Seven-day forecast
- Humidity, wind speed, precipitation, and UV index details
- Celsius and Fahrenheit temperature units
- Automatic device location with browser permission
- Twelve-hour temperature and rain-probability charts
- AI-generated activity ideas with local weather-based fallback tips
- Responsive layout for desktop and mobile screens
- No API key required

AI-generated recommendations are optional. Copy `.env.example` to `.env.local` and add a Gemini API key as `GEMINI_API_KEY` to enable them. Without a key, the app displays local weather-based suggestions instead. The API key is used only by the server route and is never sent to the browser. The Gemini API currently offers a free tier for some models and usage limits; check Google's [pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). Google may use free-tier prompts to improve its products, so the app sends weather measurements only and does not send precise device coordinates.

## Tech Stack

- [Next.js](https://nextjs.org/) App Router
- React and TypeScript
- Open-Meteo Forecast and Geocoding APIs
- CSS

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm

### Installation

```bash
git clone https://github.com/Akhsan27/langit.git
cd weather-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## API Routes

The app uses Next.js route handlers to request data from Open-Meteo:

- `GET /api/weather?lat={latitude}&lon={longitude}` — current conditions and forecasts for a location.
- `GET /api/cities?q={city}` — city search using Open-Meteo Geocoding.
- `POST /api/recommendation` — generates activity suggestions from weather measurements when `GEMINI_API_KEY` is configured.

The selected city is kept in the current browser session so the dashboard and detail page use the same location. Favorite cities are saved in the browser's local storage.

Weather responses are cached for 15 minutes, and city search responses for 24 hours.

## Weather Data and License

Weather and geocoding data are provided by [Open-Meteo](https://open-meteo.com/). The free API is available for non-commercial use without an API key. Commercial use requires an appropriate Open-Meteo customer subscription. Review the current [pricing and usage terms](https://open-meteo.com/en/pricing) before deployment.

Weather data is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Open-Meteo attribution is included in the dashboard.

## Deployment

This is a standard Next.js app and can be deployed to a hosting provider that supports Next.js. Check the provider's current free-tier limits and Open-Meteo's usage terms before publishing.
