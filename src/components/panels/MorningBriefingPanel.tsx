"use client";

import { useEffect, useState } from "react";
import {
  generateBriefing,
  type BriefingContext,
  type BriefingItem,
} from "@/lib/briefingRules";

interface WeatherData {
  temp: number;
  high: number;
  low: number;
  description: string;
}

interface CalendarResponse {
  connected: boolean;
  events: {
    id: string;
    time: string;
    hour: number;
    minute: number;
    title: string;
    location?: string;
  }[];
}

function loadTasks(): BriefingContext["tasks"] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("todo");
    if (stored) {
      const state = JSON.parse(stored);
      return (state.tasks || []).map(
        (t: { id: string; text: string; completed: boolean; priority?: string }) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          priority: t.priority || "medium",
        }),
      );
    }
  } catch {
    /* ignore parse errors */
  }
  return [];
}

export default function MorningBriefingPanel() {
  const [items, setItems] = useState<BriefingItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBriefing() {
      const tasks = loadTasks();

      // Fetch weather and calendar in parallel; tolerate failures
      const [weatherResult, calendarResult] = await Promise.allSettled([
        fetch("/api/weather").then((r) => r.json() as Promise<WeatherData>),
        fetch("/api/calendar/events").then(
          (r) => r.json() as Promise<CalendarResponse>,
        ),
      ]);

      if (cancelled) return;

      const weather: BriefingContext["weather"] =
        weatherResult.status === "fulfilled" ? weatherResult.value : null;

      const events: BriefingContext["events"] =
        calendarResult.status === "fulfilled"
          ? calendarResult.value.events
          : [];

      const briefing = generateBriefing({ tasks, events, weather });
      setItems(briefing);
    }

    loadBriefing();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!items) {
    return (
      <ul className="space-y-3">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-gray-400"
          >
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-200" />
            <span className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm text-gray-600"
        >
          <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
          <span
            className={
              item.category === "greeting"
                ? "font-medium text-gray-800"
                : ""
            }
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
