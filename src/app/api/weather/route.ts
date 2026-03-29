import { NextResponse } from "next/server";

interface WeatherResponse {
  temp: number;
  high: number;
  low: number;
  description: string;
  icon: string;
  city: string;
}

const MOCK_WEATHER: WeatherResponse = {
  temp: 18,
  high: 22,
  low: 14,
  description: "Partly cloudy",
  icon: "02d",
  city: "Toronto",
};

export async function GET() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(MOCK_WEATHER);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Toronto&units=metric&appid=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) {
      return NextResponse.json(MOCK_WEATHER);
    }

    const data = await res.json();

    const weather: WeatherResponse = {
      temp: data.main.temp,
      high: data.main.temp_max,
      low: data.main.temp_min,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
    };

    return NextResponse.json(weather);
  } catch {
    return NextResponse.json(MOCK_WEATHER);
  }
}
