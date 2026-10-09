import type { ScheduleItem, ScheduleType } from "@/types/schedule";
export const categories: {
  type: ScheduleType;
  label: string;
  color: string;
}[] = [
  { type: "deep_work", label: "Deep work", color: "#7dabed" },
  { type: "review", label: "Review", color: "#ad8cf5" },
  { type: "exercise", label: "Exercise", color: "#e9ab70" },
  { type: "break", label: "Breaks", color: "#75c5ad" },
  { type: "chill", label: "Personal", color: "#a4aaba" },
];
export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
export function weekStart(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}
export function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function parseTime(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59 || (match[3] ? hours < 1 || hours > 12 : hours > 23))
    return null;
  if (match[3])
    hours = (hours % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hours * 60 + minutes;
}
export function itemsOnDate(items: ScheduleItem[], date: Date, anchor: Date) {
  if (!sameDate(weekStart(date), weekStart(anchor))) return [];
  const weekday = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return items
    .filter(
      (item) =>
        item.day.trim().toLowerCase().slice(0, 3) === weekday.slice(0, 3) ||
        item.day === iso,
    )
    .sort(
      (a, b) => (parseTime(a.startTime) ?? 0) - (parseTime(b.startTime) ?? 0),
    );
}
export function isSchedule(value: unknown): value is ScheduleItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        ["day", "task", "startTime", "endTime"].every(
          (key) => typeof item[key] === "string",
        ) &&
        categories.some((category) => category.type === item.type),
    )
  );
}

export function formatMinutes(minutes: number) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

export function freeSlots(items: ScheduleItem[], minimumMinutes = 60) {
  const intervals = items
    .map((item) => ({
      start: parseTime(item.startTime),
      end: parseTime(item.endTime),
    }))
    .filter(
      (item): item is { start: number; end: number } =>
        item.start !== null && item.end !== null && item.end > item.start,
    )
    .sort((a, b) => a.start - b.start);
  const slots: { start: number; end: number }[] = [];
  let cursor = 8 * 60;
  for (const item of intervals) {
    const start = Math.min(22 * 60, Math.max(8 * 60, item.start));
    if (start - cursor >= minimumMinutes)
      slots.push({ start: cursor, end: start });
    cursor = Math.max(cursor, item.end);
  }
  if (22 * 60 - cursor >= minimumMinutes)
    slots.push({ start: cursor, end: 22 * 60 });
  return slots;
}
export function exampleSchedule(date: Date): ScheduleItem[] {
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  return [
    {
      day,
      task: "Daily planning",
      startTime: "8:00 AM",
      endTime: "8:45 AM",
      type: "review",
    },
    {
      day,
      task: "Deep work",
      startTime: "9:00 AM",
      endTime: "11:00 AM",
      type: "deep_work",
    },
    {
      day,
      task: "Break",
      startTime: "11:30 AM",
      endTime: "12:15 PM",
      type: "break",
    },
    {
      day,
      task: "Lunch",
      startTime: "1:00 PM",
      endTime: "2:00 PM",
      type: "chill",
    },
    {
      day,
      task: "Study",
      startTime: "2:30 PM",
      endTime: "4:00 PM",
      type: "review",
    },
    {
      day,
      task: "Workout",
      startTime: "4:30 PM",
      endTime: "5:30 PM",
      type: "exercise",
    },
    {
      day,
      task: "Reading",
      startTime: "7:00 PM",
      endTime: "8:00 PM",
      type: "chill",
    },
  ];
}
