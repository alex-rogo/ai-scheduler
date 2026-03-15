"use client";

import { useState } from "react";
import GoalForm from "@/components/GoalForm";
import ScheduleList from "@/components/ScheduleList";
import type { ScheduleItem } from "@/types/schedule";

export default function Home() {
  const [goal, setGoal] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [fixedCommitments, setFixedCommitments] = useState("");
  const [bestFocusTime, setBestFocusTime] = useState("afternoon");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function generatePlan() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          hoursPerWeek,
          fixedCommitments,
          bestFocusTime,
        }),
      });

      const data = await response.json();
      setSchedule(data.schedule);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white px-6 py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-zinc-800 p-8">
        <h1 className="text-3xl font-bold">GetCracked AI Scheduler</h1>
        <p className="mt-3 text-zinc-400">
          Turn your goals into a realistic weekly plan.
        </p>

        <GoalForm
          goal={goal}
          hoursPerWeek={hoursPerWeek}
          fixedCommitments={fixedCommitments}
          bestFocusTime={bestFocusTime}
          onGoalChange={setGoal}
          onHoursChange={setHoursPerWeek}
          onFixedCommitmentsChange={setFixedCommitments}
          onBestFocusTimeChange={setBestFocusTime}
          onGeneratePlan={generatePlan}
          isLoading={isLoading}
        />

        <ScheduleList schedule={schedule} />
      </div>
    </main>
  );
}