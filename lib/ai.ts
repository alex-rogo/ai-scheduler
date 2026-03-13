import type { ScheduleItem } from "@/types/schedule";

export function buildSchedulePrompt(goal: string, hours: number) {
  return `
You are a productivity scheduling assistant.

Create a weekly schedule for this goal:

Goal: ${goal}
Hours per week: ${hours}

Return ONLY valid JSON in this format:

[
  {
    "day": "Monday",
    "task": "DSA Practice",
    "startTime": "1:00 PM",
    "endTime": "2:30 PM",
    "type": "deep_work"
  }
]

Allowed types:
deep_work
review
exercise
break
`;
}