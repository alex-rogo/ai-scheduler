type GoalFormProps = {
  goal: string;
  hoursPerWeek: string;
  fixedCommitments: string;
  bestFocusTime: string;
  onGoalChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onFixedCommitmentsChange: (value: string) => void;
  onBestFocusTimeChange: (value: string) => void;
  onGeneratePlan: () => void;
  isLoading: boolean;
};

export default function GoalForm({
  goal,
  hoursPerWeek,
  fixedCommitments,
  bestFocusTime,
  onGoalChange,
  onHoursChange,
  onFixedCommitmentsChange,
  onBestFocusTimeChange,
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
          placeholder="10"
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Fixed commitments
        </label>
        <textarea
          value={fixedCommitments}
          onChange={(e) => onFixedCommitmentsChange(e.target.value)}
          placeholder="Class Mon-Thu 9-11, Gym Tue 6-7"
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Best focus time
        </label>
        <select
          value={bestFocusTime}
          onChange={(e) => onBestFocusTimeChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none"
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
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