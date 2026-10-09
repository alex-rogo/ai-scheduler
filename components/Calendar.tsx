import type { CSSProperties } from "react";
import type { ScheduleItem } from "@/types/schedule";
import {
  addDays,
  categories,
  formatMinutes,
  itemsOnDate,
  parseTime,
  sameDate,
  weekStart,
} from "@/lib/calendar";
export type CalendarView = "Day" | "Week" | "Month";
function EventCard({
  item,
  compact = false,
  style,
  onSelect,
}: {
  item: ScheduleItem;
  compact?: boolean;
  style?: CSSProperties;
  onSelect: (item: ScheduleItem) => void;
}) {
  return (
    <button
      className={`calendar-event event-${item.type} ${compact ? "compact-event" : ""}`}
      style={style}
      onClick={() => onSelect(item)}
      title={`${item.task}, ${item.startTime} – ${item.endTime}`}
    >
      <span className="event-title">{item.task}</span>
      <span className="event-time">
        {parseTime(item.startTime) === null
          ? item.startTime
          : formatMinutes(parseTime(item.startTime)!)}{" "}
        –{" "}
        {parseTime(item.endTime) === null
          ? item.endTime
          : formatMinutes(parseTime(item.endTime)!)}
      </span>
      {!compact && (
        <span className="event-category">
          {categories.find((category) => category.type === item.type)?.label}
        </span>
      )}
    </button>
  );
}
export default function Calendar({
  date,
  today,
  anchor,
  items,
  view,
  onDateChange,
  onSelect,
}: {
  date: Date;
  today: Date;
  anchor: Date;
  items: ScheduleItem[];
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onSelect: (item: ScheduleItem) => void;
}) {
  if (view === "Month") {
    const start = weekStart(new Date(date.getFullYear(), date.getMonth(), 1));
    return (
      <div className="month-calendar">
        <div className="month-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="month-grid">
          {Array.from({ length: 42 }, (_, index) => {
            const cell = addDays(start, index);
            const events = itemsOnDate(items, cell, anchor);
            return (
              <div
                key={index}
                className={`month-cell ${cell.getMonth() !== date.getMonth() ? "outside-month" : ""}`}
              >
                <button
                  className={`month-date ${sameDate(cell, today) ? "is-today" : ""}`}
                  onClick={() => onDateChange(cell)}
                  aria-label={cell.toDateString()}
                >
                  {cell.getDate()}
                </button>
                {events.slice(0, 3).map((item, i) => (
                  <EventCard key={i} item={item} compact onSelect={onSelect} />
                ))}
                {events.length > 3 && (
                  <button
                    className="more-events"
                    onClick={() => onDateChange(cell)}
                  >
                    +{events.length - 3} more
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  const dates =
    view === "Week"
      ? Array.from({ length: 7 }, (_, index) => addDays(weekStart(date), index))
      : [date];
  const visibleItems = dates.flatMap((day) => itemsOnDate(items, day, anchor));
  const starts = visibleItems
    .map((item) => parseTime(item.startTime))
    .filter((time): time is number => time !== null);
  const ends = visibleItems
    .map((item) => parseTime(item.endTime))
    .filter((time): time is number => time !== null);
  const firstHour = Math.min(6, Math.floor(Math.min(...starts, 360) / 60));
  const lastHour = Math.max(22, Math.ceil(Math.max(...ends, 1320) / 60));
  const hours = Array.from(
    { length: lastHour - firstHour + 1 },
    (_, index) => firstHour + index,
  );
  const now = today.getHours() * 60 + today.getMinutes();
  return (
    <div className={`calendar-scroll ${view === "Week" ? "week-view" : ""}`}>
      {view === "Week" && (
        <div className="week-heading">
          <span />
          {dates.map((day) => (
            <button
              key={day.toISOString()}
              className={sameDate(day, date) ? "selected-weekday" : ""}
              onClick={() => onDateChange(day)}
            >
              {day.toLocaleDateString("en-US", { weekday: "short" })}
              <strong>{day.getDate()}</strong>
            </button>
          ))}
        </div>
      )}
      <div
        className="time-calendar"
        style={{ height: `calc(${hours.length} * var(--hour-height))` }}
      >
        <div className="time-labels">
          {hours.map((hour) => (
            <span
              key={hour}
              style={{ top: `calc(${hour - firstHour} * var(--hour-height))` }}
            >{`${hour}:00`}</span>
          ))}
        </div>
        <div className="day-columns">
          {dates.map((day) => {
            const events = itemsOnDate(items, day, anchor);
            const timed = events.filter(
              (item) =>
                parseTime(item.startTime) !== null &&
                parseTime(item.endTime) !== null &&
                parseTime(item.endTime)! > parseTime(item.startTime)!,
            );
            const untimed = events.filter((item) => !timed.includes(item));
            // Separate simultaneous sessions into lanes, keeping each block clickable.
            const laneEnds: number[] = [];
            const positioned = timed.map((item) => {
              const start = parseTime(item.startTime)!;
              const end = parseTime(item.endTime)!;
              let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
              if (lane < 0) lane = laneEnds.length;
              laneEnds[lane] = end;
              return { item, start, end, lane };
            });
            const lanes = Math.max(1, laneEnds.length);
            return (
              <div className="day-column" key={day.toISOString()}>
                {hours.map((hour) => (
                  <div
                    className="hour-line"
                    key={hour}
                    style={{
                      top: `calc(${hour - firstHour} * var(--hour-height))`,
                    }}
                  />
                ))}
                {positioned.map(({ item, start, end, lane }, index) => (
                  <EventCard
                    key={index}
                    item={item}
                    compact={view === "Week" || end - start <= 75}
                    onSelect={onSelect}
                    style={{
                      top: `calc(${(start - firstHour * 60) / 60} * var(--hour-height))`,
                      height: `max(35px, calc(${(end - start) / 60} * var(--hour-height) - 5px))`,
                      left: `calc(${(lane * 100) / lanes}% + 8px)`,
                      width: `calc(${100 / lanes}% - 18px)`,
                    }}
                  />
                ))}
                {sameDate(day, today) &&
                  now >= firstHour * 60 &&
                  now <= lastHour * 60 && (
                    <div
                      className="now-line"
                      style={{
                        top: `calc(${(now - firstHour * 60) / 60} * var(--hour-height))`,
                      }}
                    >
                      <span />
                    </div>
                  )}
                {events.length === 0 && (
                  <div className="day-empty">No sessions scheduled.</div>
                )}
                {untimed.length > 0 && (
                  <div className="untimed-events">
                    <p>Other sessions</p>
                    {untimed.map((item, index) => (
                      <EventCard
                        key={index}
                        item={item}
                        compact
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
