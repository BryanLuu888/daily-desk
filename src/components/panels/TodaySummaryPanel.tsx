"use client";

import { useState, useEffect } from "react";
import { MOCK_EVENTS, type CalendarEvent } from "@/data/calendarEvents";

interface WeatherData {
  temp: number;
  description: string;
}

function getNextEvent(events: CalendarEvent[], now: Date): CalendarEvent | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const event of events) {
    const eventMinutes = event.hour * 60 + event.minute;
    if (eventMinutes > currentMinutes) {
      return event;
    }
  }

  return null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function TodaySummaryPanel() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null | undefined>(
    undefined
  );

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data: WeatherData) => setWeather(data))
      .catch(() => setWeather(null));
  }, []);

  useEffect(() => {
    function update() {
      setNextEvent(getNextEvent(MOCK_EVENTS, new Date()));
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const rows = [
    {
      label: "📅",
      value: formatDate(new Date()),
    },
    {
      label: "🌤",
      value: weather
        ? `${Math.round(weather.temp)}°F, ${weather.description}`
        : "Loading...",
    },
    {
      label: "⏭",
      value:
        nextEvent === undefined
          ? "Loading..."
          : nextEvent
            ? `Next: ${nextEvent.title} at ${nextEvent.time}`
            : "No more events today",
    },
    {
      label: "✨",
      value: "Make today count.",
    },
  ];

  return (
    <ul className="flex flex-col divide-y divide-gray-100">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
          <span className="w-6 shrink-0 text-center text-sm">{row.label}</span>
          <span className="text-sm text-gray-700">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}
