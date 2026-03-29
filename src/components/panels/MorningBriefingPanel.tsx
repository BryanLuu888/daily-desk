"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  description: string;
}

const PRODUCTIVITY_TIPS = [
  "Focus on your top 3 tasks.",
  "Take breaks every 90 minutes.",
  "Drink water before coffee.",
  "Block time for deep work.",
  "Review tomorrow's calendar tonight.",
  "Start with your hardest task.",
  "Keep your workspace clutter-free.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning — here's your day at a glance.";
  if (hour < 17) return "Good afternoon — stay on track.";
  return "Good evening — time to wind down.";
}

function getDayTip(): string | null {
  const day = new Date().getDay();
  if (day === 1) return "Start the week strong — review your priorities.";
  if (day === 3) return "Midweek check-in — are you on track?";
  if (day === 5) return "It's Friday — wrap up loose ends and plan your weekend.";
  return null;
}

function getWeatherTip(weather: WeatherData): string {
  const desc = weather.description.toLowerCase();
  if (weather.temp > 85) return "It's hot out — stay hydrated.";
  if (weather.temp < 40) return "Bundle up — it's cold outside.";
  if (desc.includes("rain")) return "Rain expected — grab an umbrella.";
  if (desc.includes("cloud")) return "Cloudy skies today.";
  return "Nice weather — enjoy your day.";
}

function getProductivityTip(): string {
  const index = new Date().getDate() % PRODUCTIVITY_TIPS.length;
  return PRODUCTIVITY_TIPS[index];
}

export default function MorningBriefingPanel() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data: WeatherData) => setWeather(data))
      .catch(() => {
        /* weather tip simply won't show */
      });
  }, []);

  const greeting = getGreeting();
  const dayTip = getDayTip();
  const productivityTip = getProductivityTip();

  const items: { text: string; bold?: boolean }[] = [
    { text: greeting, bold: true },
  ];

  if (dayTip) items.push({ text: dayTip });

  if (weather) {
    items.push({ text: getWeatherTip(weather) });
  }

  items.push({ text: productivityTip });

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
          <span className={item.bold ? "font-medium text-gray-800" : ""}>
            {item.text}
          </span>
        </li>
      ))}
      {!weather && (
        <li className="flex items-start gap-2 text-sm text-gray-400">
          <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-200" />
          <span>Loading weather tip...</span>
        </li>
      )}
    </ul>
  );
}
