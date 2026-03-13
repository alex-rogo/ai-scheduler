"use client";

import { useState } from "react";
import GoalForm from "@/components/GoalForm";
import ScheduleList from "@/components/ScheduleList";
import type { ScheduleItem } from "@/types/schedule";

export default function Home() {
  const [goal, setGoal] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  async function generatePlan() {
    const response = await fetch("/api/generate-schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal,
        hoursPerWeek,
      }),
    });

    const data = await response.json();
    setSchedule(data.schedule);
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white px-6 py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-zinc-800 p-8">
        <h1 className="text-3xl font-bold">GetCracked AI Scheduler</h1>
        <p className="mt-3 text-zinc-400">
          Enter a goal and generate a simple weekly study plan.
        </p>

        <GoalForm
          goal={goal}
          hoursPerWeek={hoursPerWeek}
          onGoalChange={setGoal}
          onHoursChange={setHoursPerWeek}
          onGeneratePlan={generatePlan}
        />

        <ScheduleList schedule={schedule} />
      </div>
    </main>
  );
}