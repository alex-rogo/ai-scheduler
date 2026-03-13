type GoalFormProps = {
  goal: string;
  hoursPerWeek: string;
  onGoalChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onGeneratePlan: () => void;
  isLoading: boolean;
};

export default function GoalForm({
  goal,
  hoursPerWeek,
  onGoalChange,
  onHoursChange,
  onGeneratePlan,
  isLoading,
}: GoalFormProps) {
  return (
    <div className="mt-8 space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Goal
        </label>

        <input
          type="text"
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="Learn computer science"
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Hours per week
        </label>

        <input
          type="number"
          value={hoursPerWeek}
          onChange={(e) => onHoursChange(e.target.value)}
          placeholder="6"
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
        />
      </div>

      <button
        onClick={onGeneratePlan}
        disabled={isLoading}
        className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Generating..." : "Generate Plan"}
      </button>
    </div>
  );
}