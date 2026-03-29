"use client";

import { useState, useEffect } from "react";

export default function ConnectCalendarLink() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data: { connected: boolean }) => setConnected(data.connected))
      .catch(() => setConnected(null));
  }, []);

  if (connected !== false) return null;

  return (
    <a
      href="/api/auth/login"
      className="mb-3 inline-block text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
    >
      Connect Google Calendar
    </a>
  );
}
