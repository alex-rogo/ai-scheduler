import { NextResponse } from "next/server";
import { generateSchedule } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const goal = body.goal?.trim() || "Study";
    const hours = Number(body.hoursPerWeek ?? 4);
    const fixedCommitments = body.fixedCommitments?.trim() || "None";
    const bestFocusTime = body.bestFocusTime?.trim() || "afternoon";

    const schedule = await generateSchedule(
      goal,
      hours,
      fixedCommitments,
      bestFocusTime
    );

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Failed to generate schedule:", error);

    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 }
    );
  }
}