"use client";

import { useEffect, useRef, useState } from "react";
import GoalForm from "@/components/GoalForm";
import Calendar, { type CalendarView } from "@/components/Calendar";
import Assistant from "@/components/Assistant";
import Reminders from "@/components/Reminders";
import Icon, { type IconName } from "@/components/Icon";
import {
  addDays,
  categories,
  exampleSchedule,
  freeSlots,
  isSchedule,
  itemsOnDate,
  sameDate,
  weekStart,
} from "@/lib/calendar";
import type { ScheduleItem, ScheduleType } from "@/types/schedule";

type Section = "Home" | "Calendar" | "Tasks" | "Reminders";
const navigation: { name: Section; icon: IconName }[] = [
  { name: "Home", icon: "home" },
  { name: "Calendar", icon: "calendar" },
  { name: "Tasks", icon: "check" },
  { name: "Reminders", icon: "bell" },
];
const tags: { label: string; type: ScheduleType }[] = [
  { label: "work", type: "deep_work" },
  { label: "personal", type: "chill" },
  { label: "study", type: "review" },
  { label: "health", type: "exercise" },
];

export default function Home() {
  const [today, setToday] = useState<Date | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>("Day");
  const [section, setSection] = useState<Section>("Calendar");
  const [goal, setGoal] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("10");
  const [fixedCommitments, setFixedCommitments] = useState("");
  const [bestFocusTime, setBestFocusTime] = useState("afternoon");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isDemo, setIsDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<ScheduleType[]>([]);
  const [selected, setSelected] = useState<ScheduleItem | null>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const planDialog = useRef<HTMLDialogElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setDate(now);
    setMonth(now);
    setAnchor(now);
    setSchedule(exampleSchedule(now));
    setAssistantOpen(window.innerWidth > 1000);
    const timer = setInterval(() => setToday(new Date()), 60_000);
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (window.innerWidth <= 700) setSidebarOpen((value) => !value);
        else setSidebarCollapsed((value) => !value);
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "p"
      ) {
        event.preventDefault();
        planDialog.current?.showModal();
        document.getElementById("goal")?.focus();
      }
      if (event.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", handleShortcut);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);
  useEffect(() => {
    if (selected) detailDialog.current?.showModal();
  }, [selected]);

  function pickDate(next: Date) {
    setDate(next);
    setMonth(next);
    setSidebarOpen(false);
  }
  function openPlanner(suggestedGoal?: string) {
    if (suggestedGoal) setGoal(suggestedGoal);
    setSidebarOpen(false);
    planDialog.current?.showModal();
    document.getElementById("goal")?.focus();
  }
  async function generatePlan() {
    if (isLoading) return;
    if (!goal.trim()) {
      setError("Enter a goal to generate a schedule.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          hoursPerWeek,
          fixedCommitments,
          bestFocusTime,
        }),
      });
      const data = await response.json().catch(() => {
        throw new Error(
          "Could not read the server response. Please try again.",
        );
      });
      if (!response.ok)
        throw new Error(
          data.error || "Could not generate a plan. Please try again.",
        );
      if (!isSchedule(data.schedule) || !data.schedule.length)
        throw new Error("The plan was incomplete. Please try again.");
      const now = new Date();
      setSchedule(data.schedule);
      setAnchor(now);
      setIsDemo(false);
      setHiddenTypes([]);
      const firstDay = Array.from({ length: 7 }, (_, index) =>
        addDays(weekStart(now), index),
      ).find((day) => itemsOnDate(data.schedule, day, now).length);
      pickDate(firstDay ?? now);
      setSection("Calendar");
      setView("Week");
      planDialog.current?.close();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }
  if (!today || !date || !month || !anchor)
    return (
      <main className="app-loading">
        <Icon name="calendar" /> Loading calendar…
      </main>
    );

  const visible = schedule.filter((item) => !hiddenTypes.includes(item.type));
  const todayItems = itemsOnDate(schedule, today, anchor);
  const monthStart = weekStart(
    new Date(month.getFullYear(), month.getMonth(), 1),
  );
  const dateLabel =
    view === "Week"
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).formatRange(weekStart(date), addDays(weekStart(date), 6))
      : date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  function navigate(direction: number) {
    const next = new Date(date!);
    if (view === "Month") {
      next.setDate(1);
      next.setMonth(next.getMonth() + direction);
    } else next.setDate(next.getDate() + direction * (view === "Week" ? 7 : 1));
    pickDate(next);
  }

  return (
    <main
      className={`workspace ${assistantOpen ? "with-assistant" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="icon-button"
            aria-label="Collapse sidebar"
            title="Collapse sidebar (Ctrl+B)"
            onClick={() => {
              setSidebarCollapsed(true);
              setSidebarOpen(false);
            }}
          >
            <Icon name="grid" size={23} />
          </button>
          <button
            className="icon-button"
            aria-label="Create a plan"
            title="Generate a weekly plan"
            onClick={() => openPlanner()}
          >
            <Icon name="plus" size={21} />
          </button>
        </div>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${section === item.name ? "active" : ""}`}
              aria-current={section === item.name ? "page" : undefined}
              onClick={() => {
                setSection(item.name);
                setSidebarOpen(false);
              }}
            >
              <Icon name={item.icon} size={21} />
              {item.name}
            </button>
          ))}
        </nav>
        <section className="mini-calendar" aria-label="Date picker">
          <div className="mini-heading">
            <strong>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </strong>
            <div>
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <Icon name="left" size={14} />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <Icon name="right" size={14} />
              </button>
            </div>
          </div>
          <div className="mini-grid">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span className="mini-day-label" key={index}>
                {day}
              </span>
            ))}
            {Array.from({ length: 42 }, (_, index) => {
              const cell = addDays(monthStart, index);
              return (
                <button
                  key={index}
                  aria-label={cell.toDateString()}
                  aria-pressed={sameDate(cell, date)}
                  className={`${cell.getMonth() !== month.getMonth() ? "muted-date" : ""} ${sameDate(cell, date) ? "selected-date" : ""} ${sameDate(cell, today) ? "today-date" : ""}`}
                  onClick={() => {
                    pickDate(cell);
                    setSection("Calendar");
                  }}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
        </section>
        <section className="calendar-filters">
          <div className="section-label">
            Calendars
            <button
              className="icon-button"
              aria-label="Generate schedule"
              onClick={() => openPlanner()}
            >
              <Icon name="plus" size={17} />
            </button>
          </div>
          {categories.map((category) => (
            <button
              key={category.type}
              className={`filter-row ${hiddenTypes.includes(category.type) ? "filter-off" : ""}`}
              aria-pressed={!hiddenTypes.includes(category.type)}
              onClick={() =>
                setHiddenTypes((current) =>
                  current.includes(category.type)
                    ? current.filter((type) => type !== category.type)
                    : [...current, category.type],
                )
              }
            >
              <span
                className="category-dot"
                style={{ background: category.color }}
              />
              {category.label}
            </button>
          ))}
        </section>
        <section className="tag-filters">
          <div className="section-label">
            Tags
            {hiddenTypes.length > 0 && (
              <button
                className="icon-button"
                aria-label="Clear calendar filters"
                title="Clear filters"
                onClick={() => setHiddenTypes([])}
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
          {tags.map((tag) => (
            <button
              key={tag.type}
              onClick={() => {
                setHiddenTypes(
                  categories
                    .filter((category) => category.type !== tag.type)
                    .map((category) => category.type),
                );
                setSection("Calendar");
                setSidebarOpen(false);
              }}
            >
              <span>#</span>
              {tag.label}
            </button>
          ))}
        </section>
        <footer className="sidebar-footer">
          <button
            className="icon-button"
            aria-label="Workspace information"
            title="Workspace information"
            onClick={() => infoDialog.current?.showModal()}
          >
            <Icon name="settings" size={22} />
          </button>
          <button
            className="icon-button"
            aria-label="Hide sidebar"
            onClick={() => {
              setSidebarCollapsed(true);
              setSidebarOpen(false);
            }}
          >
            <Icon name="left" size={18} />
          </button>
        </footer>
      </aside>

      <section className="main-calendar" aria-label="Schedule">
        <header className="calendar-toolbar">
          <button
            className={`icon-button navigation-toggle ${sidebarCollapsed ? "show-toggle" : ""}`}
            aria-label="Open navigation"
            onClick={() => {
              setSidebarCollapsed(false);
              setSidebarOpen(true);
            }}
          >
            <Icon name="grid" size={21} />
          </button>
          {section === "Calendar" && (
            <div className="date-controls">
              <div className="arrow-pair">
                <button
                  className="icon-button"
                  aria-label="Previous period"
                  onClick={() => navigate(-1)}
                >
                  <Icon name="left" size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next period"
                  onClick={() => navigate(1)}
                >
                  <Icon name="right" size={17} />
                </button>
              </div>
              <button className="today-button" onClick={() => pickDate(today)}>
                Today
              </button>
            </div>
          )}
          <h1>
            {section === "Calendar"
              ? view === "Month"
                ? date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : dateLabel
              : section}
          </h1>
          {section === "Calendar" ? (
            <div className="view-switch" aria-label="Calendar view">
              {(["Day", "Week", "Month"] as const).map((mode) => (
                <button
                  key={mode}
                  aria-pressed={view === mode}
                  className={view === mode ? "selected-view" : ""}
                  onClick={() => setView(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          ) : (
            <button className="toolbar-plan" onClick={() => openPlanner()}>
              <Icon name="plus" size={16} /> New plan
            </button>
          )}
          <button
            className={`icon-button assistant-toggle ${assistantOpen ? "is-open" : ""}`}
            aria-label={assistantOpen ? "Hide assistant" : "Show assistant"}
            title="Toggle assistant"
            onClick={() => setAssistantOpen((value) => !value)}
          >
            <span className="ellipsis">···</span>
          </button>
        </header>
        {section === "Calendar" ? (
          <>
            <div className="calendar-context">
              <span>{isDemo ? "Example schedule" : "Generated schedule"}</span>
              <span>
                {Intl.DateTimeFormat()
                  .resolvedOptions()
                  .timeZone.replaceAll("_", " ")}
              </span>
            </div>
            <Calendar
              date={date}
              today={today}
              anchor={anchor}
              items={visible}
              view={view}
              onDateChange={(next) => {
                pickDate(next);
                setView("Day");
              }}
              onSelect={setSelected}
            />
          </>
        ) : section === "Reminders" ? (
          <Reminders />
        ) : (
          <div className="session-list">
            {section === "Home" ? (
              <>
                <div className="section-title">
                  <div>
                    <h2>
                      {today.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                    <p>{isDemo ? "Example schedule" : "Today’s schedule"}</p>
                  </div>
                </div>
                <div className="home-stats">
                  <div>
                    <span>Sessions today</span>
                    <strong>{todayItems.length}</strong>
                  </div>
                  <div>
                    <span>Open hour-long blocks</span>
                    <strong>{freeSlots(todayItems).length}</strong>
                  </div>
                </div>
                <div className="list-heading">
                  Today
                  <button
                    onClick={() => {
                      pickDate(today);
                      setSection("Calendar");
                      setView("Day");
                    }}
                  >
                    Open calendar <Icon name="arrow" size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div className="section-title">
                <div>
                  <h2>Scheduled tasks</h2>
                  <p>
                    {visible.length} {isDemo ? "example" : "scheduled"} sessions
                  </p>
                </div>
              </div>
            )}
            {(section === "Home" ? todayItems : visible).length === 0 && (
              <p className="empty-state">No sessions to show.</p>
            )}
            {(section === "Home" ? todayItems : visible).map((item, index) => (
              <button
                key={index}
                className={`session-row event-${item.type}`}
                onClick={() => setSelected(item)}
              >
                <span className="session-symbol">
                  <Icon
                    name={item.type === "exercise" ? "sun" : "clock"}
                    size={20}
                  />
                </span>
                <span>
                  <strong>{item.task}</strong>
                  <small>
                    {item.day} · {item.startTime} – {item.endTime}
                  </small>
                </span>
                <Icon name="right" size={16} />
              </button>
            ))}
          </div>
        )}
      </section>

      {assistantOpen && (
        <Assistant
          key={`${date.toDateString()}-${isDemo}`}
          date={date}
          anchor={anchor}
          schedule={schedule}
          isDemo={isDemo}
          onClose={() => setAssistantOpen(false)}
          onPlan={openPlanner}
          onSelect={setSelected}
        />
      )}

      <dialog
        ref={planDialog}
        className="plan-dialog"
        aria-labelledby="plan-title"
        onClick={(event) => {
          if (event.target === event.currentTarget && !isLoading)
            planDialog.current?.close();
        }}
      >
        <div className="dialog-top">
          <h2 id="plan-title">Plan your week</h2>
          <button
            className="icon-button"
            aria-label="Close planner"
            onClick={() => planDialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
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
        {error && (
          <div className="error-message" role="alert">
            {error}
            <span>Current schedule preserved. Try again.</span>
          </div>
        )}
        <p className="form-note">
          Generating a schedule replaces the current plan.
        </p>
      </dialog>
      <dialog
        ref={detailDialog}
        className="event-dialog"
        aria-labelledby="session-title"
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            detailDialog.current?.close();
        }}
      >
        {selected && (
          <>
            <div className="dialog-top">
              <span className={`event-type-pill event-${selected.type}`}>
                {
                  categories.find((category) => category.type === selected.type)
                    ?.label
                }
              </span>
              <button
                className="icon-button"
                aria-label="Close session details"
                onClick={() => detailDialog.current?.close()}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2 id="session-title">{selected.task}</h2>
            <p>
              <Icon name="calendar" size={17} />
              {selected.day}
            </p>
            <p>
              <Icon name="clock" size={17} />
              {selected.startTime} – {selected.endTime}
            </p>
            {isDemo && <small>Example session</small>}
          </>
        )}
      </dialog>
      <dialog
        ref={infoDialog}
        className="info-dialog"
        aria-labelledby="workspace-title"
      >
        <div className="dialog-top">
          <h2 id="workspace-title">GetCracked</h2>
          <button
            className="icon-button"
            aria-label="Close workspace information"
            onClick={() => infoDialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        <p>
          Schedules are kept for this session. Reminders are saved in this
          browser.
        </p>
        <p>
          The assistant summarizes your schedule and finds free time locally.
          Weekly plans are generated with Gemini.
        </p>
        <div className="shortcut-row">
          <span>Toggle sidebar</span>
          <kbd>Ctrl B</kbd>
        </div>
        <div className="shortcut-row">
          <span>New plan</span>
          <kbd>Ctrl Shift P</kbd>
        </div>
      </dialog>
    </main>
  );
}
