import Icon from "@/components/Icon";

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

export default function GoalForm(props: GoalFormProps) {
  return (
    <form
      className="goal-form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onGeneratePlan();
      }}
    >
      <label htmlFor="goal">Goal</label>
      <textarea
        id="goal"
        value={props.goal}
        onChange={(event) => props.onGoalChange(event.target.value)}
        placeholder="e.g. Complete a TypeScript course"
        rows={3}
        required
        maxLength={2000}
      />
      <div className="form-row">
        <div>
          <label htmlFor="hours">Hours per week</label>
          <div className="hours-input">
            <input
              id="hours"
              type="number"
              min="1"
              max="112"
              step="0.5"
              required
              placeholder="10"
              value={props.hoursPerWeek}
              onChange={(event) => props.onHoursChange(event.target.value)}
            />
            <span>hrs</span>
          </div>
        </div>
        <div>
          <label htmlFor="focus">Focus time</label>
          <select
            id="focus"
            value={props.bestFocusTime}
            onChange={(event) =>
              props.onBestFocusTimeChange(event.target.value)
            }
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </div>
      <label htmlFor="commitments">
        Fixed commitments <span>Optional</span>
      </label>
      <textarea
        id="commitments"
        rows={2}
        maxLength={4000}
        value={props.fixedCommitments}
        onChange={(event) => props.onFixedCommitmentsChange(event.target.value)}
        placeholder="e.g. Work Mon–Fri, 9–5. Gym on Tuesday."
      />
      <button
        className="generate-button"
        disabled={props.isLoading}
        type="submit"
      >
        <Icon name="sparkles" size={17} />
        {props.isLoading ? "Generating…" : "Generate schedule"}
        {!props.isLoading && <Icon name="arrow" size={17} />}
      </button>
    </form>
  );
}
