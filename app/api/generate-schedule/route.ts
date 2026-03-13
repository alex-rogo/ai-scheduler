import { NextResponse } from "next/server";
import { buildSchedulePrompt } from "@/lib/ai";
import type { ScheduleItem } from "@/types/schedule";

export async function POST(request: Request) {
  const body = await request.json();

  const goal = body.goal ?? "Study";
  const hours = Number(body.hoursPerWeek ?? 4);

  const prompt = buildSchedulePrompt(goal, hours);

  console.log("Prompt that will go to AI:");
  console.log(prompt);

  // mock result for now
  const schedule: ScheduleItem[] = [
    {
      day: "Monday",
      task: `${goal} Practice`,
      startTime: "1:00 PM",
      endTime: "2:30 PM",
      type: "deep_work",
    },
    {
      day: "Wednesday",
      task: `${goal} Review`,
      startTime: "2:00 PM",
      endTime: "3:00 PM",
      type: "review",
    },
  ];

  return NextResponse.json({ schedule });
}