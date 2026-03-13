export type ScheduleType = "deep_work" | "review" | "exercise" | "break" | "chill";

export type ScheduleItem = {
  day: string;
  task: string;
  startTime: string;
  endTime: string;
  type: ScheduleType;
};