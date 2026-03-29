import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getAuthenticatedClient } from "@/lib/googleAuth";
import { MOCK_EVENTS } from "@/data/calendarEvents";

export async function GET() {
  const auth = getAuthenticatedClient();

  if (!auth) {
    return NextResponse.json({ connected: false, events: MOCK_EVENTS });
  }

  try {
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const events = (response.data.items || []).map((event) => {
      const start = event.start?.dateTime || event.start?.date || "";
      const startDate = new Date(start);
      const hour = startDate.getHours();
      const minute = startDate.getMinutes();
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, "0");

      return {
        id: event.id || crypto.randomUUID(),
        time: `${displayHour}:${displayMinute} ${ampm}`,
        hour,
        minute,
        title: event.summary || "Untitled",
        location: event.location || undefined,
      };
    });

    return NextResponse.json({ connected: true, events });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ connected: false, events: MOCK_EVENTS });
  }
}
