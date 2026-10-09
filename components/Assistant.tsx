"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import {
  addDays,
  categories,
  formatMinutes,
  freeSlots,
  itemsOnDate,
  parseTime,
} from "@/lib/calendar";
import type { ScheduleItem } from "@/types/schedule";

type Message = { role: "user" | "assistant"; text: string };

export default function Assistant({
  date,
  anchor,
  schedule,
  isDemo,
  onClose,
  onPlan,
  onSelect,
}: {
  date: Date;
  anchor: Date;
  schedule: ScheduleItem[];
  isDemo: boolean;
  onClose: () => void;
  onPlan: (goal?: string) => void;
  onSelect: (item: ScheduleItem) => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLInputElement>(null);
  const dayItems = itemsOnDate(schedule, date, anchor);
  const slots = freeSlots(dayItems);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  useEffect(() => {
    if (messages.length)
      end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  function send(text: string) {
    const request = text.trim();
    if (!request) return;
    const targetDate = /\btomorrow\b/i.test(request)
      ? addDays(new Date(), 1)
      : /\btoday\b/i.test(request)
        ? new Date()
        : date;
    const targetItems = itemsOnDate(schedule, targetDate, anchor);
    const targetLabel = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    let response: string;
    if (/\b(plan|generate|create)\b/i.test(request)) {
      onPlan(
        /^(plan my week|generate a plan|create a plan)$/i.test(request)
          ? undefined
          : request,
      );
      response =
        "Set your goal, weekly hours, fixed commitments, and focus time in the planner to generate a schedule.";
    } else if (/\b(free|find|gap|call|available)\b/i.test(request)) {
      const duration = request.match(
        /(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i,
      );
      const minutes = duration
        ? Number(duration[1]) * (/^(h)/i.test(duration[2]) ? 60 : 1)
        : 60;
      const available = freeSlots(targetItems, Math.max(1, minutes));
      response = `${isDemo ? "Example schedule — " : ""}${targetLabel}, available blocks of at least ${minutes} minutes (8:00–22:00):\n\n${available.length ? available.map((slot) => `${formatMinutes(slot.start)} – ${formatMinutes(slot.end)}`).join("\n") : "No matching blocks."}`;
    } else if (
      /\b(schedule|today|tomorrow|day|sessions|summary)\b/i.test(request)
    ) {
      response = `${isDemo ? "Example schedule — " : ""}${targetLabel}:\n\n${targetItems.length ? targetItems.map((item) => `${item.startTime} – ${item.endTime}   ${item.task}`).join("\n") : "No sessions scheduled."}`;
    } else {
      response =
        "I can show scheduled sessions, find available time, or open the weekly planner. Try “Find a 30 minute gap” or “Plan my week.”";
    }
    setMessages((current) => [
      ...current,
      { role: "user", text: request },
      { role: "assistant", text: response },
    ]);
    setInput("");
  }

  return (
    <aside className="assistant-panel" aria-label="Planning assistant">
      <header className="assistant-header">
        <Icon name="sparkles" size={22} />
        <h2>Assistant</h2>
        <div className="assistant-header-actions">
          <button
            className="icon-button"
            aria-label="New plan"
            title="Generate a weekly plan"
            onClick={() => onPlan()}
          >
            <Icon name="plus" size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="Clear conversation"
            title="Clear conversation"
            onClick={() => {
              setMessages([]);
              setInput("");
              composer.current?.focus();
            }}
          >
            <Icon name="trash" size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Close assistant"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </header>
      <div className="assistant-messages">
        <div className="assistant-context">
          <span>{isDemo ? "Example schedule" : "Your schedule"}</span>
          <span>{dateLabel}</span>
        </div>
        <div className="assistant-reply">
          <span className="assistant-avatar">
            <Icon name="sparkles" size={20} />
          </span>
          <div className="assistant-bubble">
            <p>
              Schedule for <strong>{dateLabel}</strong>:
            </p>
            <div className="agenda-list">
              {dayItems.length ? (
                dayItems.map((item, index) => (
                  <button
                    key={index}
                    className="agenda-row"
                    onClick={() => onSelect(item)}
                  >
                    <span
                      className="agenda-dot"
                      style={{
                        background: categories.find(
                          (category) => category.type === item.type,
                        )?.color,
                      }}
                    />
                    <span className="agenda-time">
                      {parseTime(item.startTime) === null
                        ? item.startTime
                        : formatMinutes(parseTime(item.startTime)!)}{" "}
                      –{" "}
                      {parseTime(item.endTime) === null
                        ? item.endTime
                        : formatMinutes(parseTime(item.endTime)!)}
                    </span>
                    <span>{item.task}</span>
                  </button>
                ))
              ) : (
                <p className="muted">No sessions scheduled.</p>
              )}
            </div>
            {slots.length > 0 && (
              <p className="availability-note">
                {slots.length} open {slots.length === 1 ? "block" : "blocks"} of
                at least an hour between 8:00 and 22:00.
              </p>
            )}
          </div>
        </div>
        {messages.map((message, index) =>
          message.role === "user" ? (
            <div key={index} className="user-message">
              {message.text}
            </div>
          ) : (
            <div key={index} className="assistant-reply">
              <span className="assistant-avatar">
                <Icon name="sparkles" size={20} />
              </span>
              <div className="assistant-bubble message-text">
                {message.text}
              </div>
            </div>
          ),
        )}
        {messages.length === 0 && (
          <div className="assistant-suggestions">
            <button onClick={() => send("Find time for a 1 hour call")}>
              Find time for a 1 hour call <Icon name="arrow" size={15} />
            </button>
            <button onClick={() => onPlan()}>
              Generate a weekly plan <Icon name="plus" size={15} />
            </button>
          </div>
        )}
        <div ref={end} aria-live="polite" className="sr-only">
          {messages.at(-1)?.text}
        </div>
      </div>
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <button
          type="button"
          className="icon-button"
          aria-label="Open planner"
          onClick={() => onPlan()}
        >
          <Icon name="plus" size={21} />
        </button>
        <input
          ref={composer}
          aria-label="Message assistant"
          placeholder="Message…"
          value={input}
          maxLength={2000}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          className="icon-button"
          type="submit"
          aria-label="Send message"
          disabled={!input.trim()}
        >
          <Icon name="send" size={21} />
        </button>
      </form>
    </aside>
  );
}
