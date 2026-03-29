export interface BriefingItem {
  text: string;
  score: number;
  category:
    | "greeting"
    | "task"
    | "calendar"
    | "cross-ref"
    | "weather"
    | "day"
    | "tip";
}

export interface BriefingContext {
  tasks: {
    id: string;
    text: string;
    completed: boolean;
    priority: "high" | "medium" | "low";
  }[];
  events: {
    id: string;
    time: string;
    hour: number;
    minute: number;
    title: string;
    location?: string;
  }[];
  weather: {
    temp: number;
    high: number;
    low: number;
    description: string;
  } | null;
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

function getGreetingItem(): BriefingItem {
  const hour = new Date().getHours();
  let text: string;
  if (hour >= 23) {
    text = "Still up? Consider wrapping up and planning tomorrow.";
  } else if (hour < 12) {
    text = "Good morning — here's your day at a glance.";
  } else if (hour < 17) {
    text = "Good afternoon — here's where things stand.";
  } else {
    text = "Good evening — here's how the day went.";
  }
  return { text, score: 10, category: "greeting" };
}

function getTaskItems(
  tasks: BriefingContext["tasks"],
): BriefingItem[] {
  const items: BriefingItem[] = [];
  const incomplete = tasks.filter((t) => !t.completed);
  const highPriority = incomplete.filter((t) => t.priority === "high");
  const medPriority = incomplete.filter((t) => t.priority === "medium");
  const lowPriority = incomplete.filter((t) => t.priority === "low");
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;

  if (incomplete.length === 0 && tasks.length > 0) {
    items.push({
      text: "All tasks complete — great work today!",
      score: 6,
      category: "task",
    });
    return items;
  }

  if (tasks.length === 0) {
    items.push({
      text: "No tasks on your list — add some to stay productive.",
      score: 4,
      category: "task",
    });
    return items;
  }

  if (highPriority.length > 0) {
    items.push({
      text: `Your top priority: '${highPriority[0].text}'. Tackle it first.`,
      score: 7,
      category: "task",
    });
  }

  items.push({
    text: `You have ${incomplete.length} task${incomplete.length !== 1 ? "s" : ""} — ${highPriority.length} high, ${medPriority.length} medium, ${lowPriority.length} low priority.`,
    score: 5,
    category: "task",
  });

  if (incomplete.length > 5) {
    items.push({
      text: `You have ${incomplete.length} incomplete tasks. Consider focusing on the top 3.`,
      score: 5,
      category: "task",
    });
  }

  if (isWeekend && incomplete.length > 0) {
    items.push({
      text: `It's the weekend — ${incomplete.length} task${incomplete.length !== 1 ? "s" : ""} waiting. Tackle them or give yourself a break.`,
      score: 5,
      category: "task",
    });
  }

  return items;
}

function getCalendarItems(
  events: BriefingContext["events"],
): BriefingItem[] {
  const items: BriefingItem[] = [];
  const sorted = [...events].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
  );

  if (sorted.length === 0) {
    items.push({
      text: "No events today — wide open for focused work.",
      score: 4,
      category: "calendar",
    });
    return items;
  }

  if (sorted.length >= 4) {
    items.push({
      text: `Busy day ahead — ${sorted.length} events on your calendar.`,
      score: 7,
      category: "calendar",
    });
  } else if (sorted.length <= 1) {
    items.push({
      text: "Light calendar day — great opportunity for deep work.",
      score: 6,
      category: "calendar",
    });
  }

  // Back-to-back detection: events within 30 minutes of each other
  if (sorted.length >= 2) {
    let backToBackStart: typeof sorted[0] | null = null;
    let backToBackEnd: typeof sorted[0] | null = null;
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = sorted[i].hour * 60 + sorted[i].minute + 60; // assume 1hr events
      const nextStart = sorted[i + 1].hour * 60 + sorted[i + 1].minute;
      if (nextStart - currentEnd <= 30) {
        if (!backToBackStart) backToBackStart = sorted[i];
        backToBackEnd = sorted[i + 1];
      }
    }
    if (backToBackStart && backToBackEnd) {
      items.push({
        text: `Back-to-back from ${backToBackStart.time} to ${backToBackEnd.time}. Plan breaks.`,
        score: 6,
        category: "calendar",
      });
    }
  }

  // First event timing
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const firstEventMinutes = sorted[0].hour * 60 + sorted[0].minute;
  const hoursUntilFirst = (firstEventMinutes - currentMinutes) / 60;
  if (hoursUntilFirst >= 1) {
    items.push({
      text: `First event at ${sorted[0].time}. You have ${Math.floor(hoursUntilFirst)} hour${Math.floor(hoursUntilFirst) !== 1 ? "s" : ""} of focus time.`,
      score: 5,
      category: "calendar",
    });
  }

  return items;
}

function getCrossRefItems(
  tasks: BriefingContext["tasks"],
  events: BriefingContext["events"],
): BriefingItem[] {
  const items: BriefingItem[] = [];
  const incomplete = tasks.filter((t) => !t.completed);
  const highPriority = incomplete.filter((t) => t.priority === "high");
  const sorted = [...events].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
  );

  // High-priority task + next event soon
  if (highPriority.length > 0 && sorted.length > 0) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const nextEvent = sorted.find(
      (e) => e.hour * 60 + e.minute > currentMinutes,
    );
    if (nextEvent) {
      const minsUntil =
        nextEvent.hour * 60 + nextEvent.minute - currentMinutes;
      if (minsUntil <= 120 && minsUntil > 0) {
        items.push({
          text: `Tackle '${highPriority[0].text}' before your ${nextEvent.time} ${nextEvent.title}.`,
          score: 9,
          category: "cross-ref",
        });
      }
    }
  }

  // Busy calendar + many tasks
  if (sorted.length >= 4 && incomplete.length >= 4) {
    items.push({
      text: `Packed calendar and ${incomplete.length} tasks — prioritize ruthlessly today.`,
      score: 8,
      category: "cross-ref",
    });
  }

  // Light calendar + high-priority tasks
  if (sorted.length <= 2 && highPriority.length > 0) {
    items.push({
      text: "Open calendar — perfect day to crush your high-priority tasks.",
      score: 7,
      category: "cross-ref",
    });
  }

  // Longest gap > 1 hour between consecutive events
  if (sorted.length >= 2) {
    let longestGap = 0;
    let gapAfterEvent: typeof sorted[0] | null = null;
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = sorted[i].hour * 60 + sorted[i].minute + 60; // assume 1hr
      const nextStart = sorted[i + 1].hour * 60 + sorted[i + 1].minute;
      const gap = nextStart - currentEnd;
      if (gap > longestGap) {
        longestGap = gap;
        gapAfterEvent = sorted[i];
      }
    }
    if (longestGap > 60 && gapAfterEvent) {
      const gapHours = Math.round(longestGap / 60);
      items.push({
        text: `You have a ${gapHours}h gap after ${gapAfterEvent.title} — good window for task work.`,
        score: 6,
        category: "cross-ref",
      });
    }
  }

  return items;
}

function getWeatherItems(
  weather: BriefingContext["weather"],
): BriefingItem[] {
  if (!weather) return [];
  const items: BriefingItem[] = [];
  const desc = weather.description.toLowerCase();

  if (weather.temp > 90) {
    items.push({
      text: `It's ${Math.round(weather.temp)}°F out — stay hydrated and take it easy.`,
      score: 7,
      category: "weather",
    });
  } else if (weather.temp < 32) {
    items.push({
      text: `It's ${Math.round(weather.temp)}°F — bundle up if heading out.`,
      score: 7,
      category: "weather",
    });
  } else if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower")) {
    items.push({
      text: "Rain in the forecast — grab an umbrella.",
      score: 6,
      category: "weather",
    });
  } else {
    items.push({
      text: `Nice weather at ${Math.round(weather.temp)}°F — enjoy it.`,
      score: 3,
      category: "weather",
    });
  }

  if (weather.high - weather.low > 20) {
    items.push({
      text: `Big temp swing today — ${Math.round(weather.low)}° to ${Math.round(weather.high)}°F. Dress in layers.`,
      score: 5,
      category: "weather",
    });
  }

  return items;
}

function getDayItems(): BriefingItem[] {
  const day = new Date().getDay();
  switch (day) {
    case 1:
      return [
        {
          text: "New week — set your intentions and review priorities.",
          score: 4,
          category: "day",
        },
      ];
    case 3:
      return [
        {
          text: "Midweek check-in — how's your progress?",
          score: 4,
          category: "day",
        },
      ];
    case 5:
      return [
        {
          text: "It's Friday — wrap up loose ends and plan your weekend.",
          score: 4,
          category: "day",
        },
      ];
    case 0:
    case 6:
      return [
        {
          text: "Weekend mode — rest up or tackle personal projects.",
          score: 3,
          category: "day",
        },
      ];
    default:
      return [];
  }
}

function getTipItem(): BriefingItem {
  const index = new Date().getDate() % PRODUCTIVITY_TIPS.length;
  return { text: PRODUCTIVITY_TIPS[index], score: 2, category: "tip" };
}

export function generateBriefing(context: BriefingContext): BriefingItem[] {
  const greeting = getGreetingItem();
  const allItems: BriefingItem[] = [
    ...getTaskItems(context.tasks),
    ...getCalendarItems(context.events),
    ...getCrossRefItems(context.tasks, context.events),
    ...getWeatherItems(context.weather),
    ...getDayItems(),
    getTipItem(),
  ];

  // Sort by score descending
  allItems.sort((a, b) => b.score - a.score);

  // Select top items with max 2 per category
  const selected: BriefingItem[] = [greeting];
  const categoryCounts: Partial<Record<BriefingItem["category"], number>> = {};

  for (const item of allItems) {
    if (selected.length >= 5) break;
    const count = categoryCounts[item.category] || 0;
    if (count >= 2) continue;
    selected.push(item);
    categoryCounts[item.category] = count + 1;
  }

  // Ensure at least 4 items if possible
  if (selected.length < 4) {
    for (const item of allItems) {
      if (selected.length >= 4) break;
      if (!selected.includes(item)) {
        selected.push(item);
      }
    }
  }

  return selected;
}
