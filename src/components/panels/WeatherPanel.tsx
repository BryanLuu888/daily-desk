"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  high: number;
  low: number;
  description: string;
  icon: string;
  city: string;
}

export default function WeatherPanel() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/weather")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
      })
      .then((data: WeatherData) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-gray-500">Unable to load weather</p>;
  }

  if (!weather) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  const capitalizedDescription = weather.description
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs text-gray-400">{weather.city}</p>

      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        alt={weather.description}
        width={80}
        height={80}
        className="my-1"
      />

      <p className="text-5xl font-bold text-gray-900">{Math.round(weather.temp)}°F</p>

      <p className="mt-1 text-sm text-gray-600">{capitalizedDescription}</p>

      <p className="mt-1 text-xs text-gray-400">
        H: {Math.round(weather.high)}° &nbsp; L: {Math.round(weather.low)}°
      </p>
    </div>
  );
}
