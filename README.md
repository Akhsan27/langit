# Langit Weather Dashboard

A responsive weather dashboard built with Next.js and TypeScript. It shows current conditions and forecasts for cities around the world using the Open-Meteo API.

## Features

- Current temperature and weather conditions
- Search for cities around the world
- Hourly forecast
- Seven-day forecast
- Humidity, wind speed, precipitation, and UV index details
- Celsius and Fahrenheit temperature units
- Responsive layout for desktop and mobile screens
- No API key required

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
git clone <your-repository-url>
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

Weather responses are cached for 15 minutes, and city search responses for 24 hours.

## Weather Data and License

Weather and geocoding data are provided by [Open-Meteo](https://open-meteo.com/). The free API is available for non-commercial use without an API key. Commercial use requires an appropriate Open-Meteo customer subscription. Review the current [pricing and usage terms](https://open-meteo.com/en/pricing) before deployment.

Weather data is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Open-Meteo attribution is included in the dashboard.

## Deployment

This is a standard Next.js app and can be deployed to a hosting provider that supports Next.js. Check the provider's current free-tier limits and Open-Meteo's usage terms before publishing.
