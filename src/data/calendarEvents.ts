export interface CalendarEvent {
  id: string;
  time: string;
  hour: number;
  minute: number;
  title: string;
  location?: string;
}

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", time: "9:00 AM", hour: 9, minute: 0, title: "Team standup", location: "Zoom" },
  { id: "2", time: "10:30 AM", hour: 10, minute: 30, title: "Design review", location: "Conf Room B" },
  { id: "3", time: "12:00 PM", hour: 12, minute: 0, title: "Lunch with Alex" },
  { id: "4", time: "2:00 PM", hour: 14, minute: 0, title: "Sprint planning", location: "Zoom" },
  { id: "5", time: "4:30 PM", hour: 16, minute: 30, title: "Gym" },
];
