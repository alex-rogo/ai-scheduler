import { GoogleGenAI, Type } from "@google/genai";
import type { ScheduleItem } from "@/types/schedule";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateSchedule(
  goal: string,
  hours: number,
  fixedCommitments: string,
  bestFocusTime: string
): Promise<ScheduleItem[]> {
  const prompt = `
Create a realistic weekly schedule for this user.

Goal: ${goal}
Hours per week: ${hours}
Fixed commitments: ${fixedCommitments}
Best focus time: ${bestFocusTime}

Important rules:
- Return only valid JSON.
- Create a practical schedule for one week.
- Use these types only: deep_work, review, exercise, break.
- Times should be realistic and readable like "1:00 PM".
- Each item must include day, task, startTime, endTime, and type.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            task: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING },
            type: {
              type: Type.STRING,
              enum: ["deep_work", "review", "exercise", "break"],
            },
          },
          required: ["day", "task", "startTime", "endTime", "type"],
        },
      },
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(text) as ScheduleItem[];
}