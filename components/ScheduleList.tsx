import type { ScheduleItem } from "@/types/schedule";

type ScheduleListProps = {
  schedule: ScheduleItem[];
};

function getTypeLabel(type: ScheduleItem["type"]) {
  switch (type) {
    case "deep_work":
      return "Deep Work";
    case "review":
      return "Review";
    case "exercise":
      return "Exercise";
    case "break":
      return "Break";
    default:
      return type;
  }
}

export default function ScheduleList({ schedule }: ScheduleListProps) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold">Your Schedule</h2>

      {schedule.length === 0 ? (
        <p className="mt-4 text-zinc-400">No schedule yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {schedule.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">{item.day}</p>
                  <p className="mt-1 text-lg font-semibold">{item.task}</p>
                  <p className="mt-1 text-zinc-300">
                    {item.startTime} - {item.endTime}
                  </p>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">
                  {getTypeLabel(item.type)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}