"use client";

import { useState, useEffect, useCallback } from "react";
import { type CalendarEvent } from "@/data/calendarEvents";

function getHighlightedEventId(events: CalendarEvent[], now: Date): string | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find the current or next upcoming event
  for (const event of events) {
    const eventMinutes = event.hour * 60 + event.minute;
    // Highlight if event is within the current 30-min window or is the next upcoming
    if (eventMinutes >= currentMinutes - 30) {
      return event.id;
    }
  }

  // All events are past
  return null;
}

interface CalendarResponse {
  connected: boolean;
  events: CalendarEvent[];
}

export default function CalendarPanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/events");
      const data: CalendarResponse = await res.json();
      setEvents(data.events);
    } catch {
      // Keep existing events on fetch failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 60_000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  useEffect(() => {
    function update() {
      setHighlightId(getHighlightedEventId(events, new Date()));
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [events]);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading calendar...</p>;
  }

  if (events.length === 0) {
    return <p className="text-sm text-gray-400">No events today.</p>;
  }

  return (
    <ul className="flex flex-col">
      {events.map((event, index) => (
        <li
          key={event.id}
          className={`flex gap-3 py-2 ${
            highlightId === event.id
              ? "rounded-lg border-l-4 border-indigo-500 bg-indigo-50 pl-2"
              : "border-l-4 border-transparent pl-2"
          } ${index < events.length - 1 ? "border-b border-b-gray-100" : ""}`}
        >
          <span className="w-16 shrink-0 pt-0.5 text-xs text-gray-400">
            {event.time}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{event.title}</p>
            {event.location && (
              <p className="text-xs text-gray-400">{event.location}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
