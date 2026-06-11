import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, ScheduleEntry } from "$lib/types";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw new Error("GEMINI_API_KEY environment variable is not set");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

interface SubmissionData {
  studentName: string;
  gradeLevel: string;
  weeklySchedule: ScheduleEntry[];
  dailyStudyHours: number;
  sleepHours: number;
  breakFrequency: string;
  exerciseFrequency: string;
  extracurriculars: string;
  currentStressLevel: number;
  recentSymptoms: string[];
  academicGoals: string;
}

export async function analyzeStudentBurnout(
  data: SubmissionData,
): Promise<AnalysisResult> {
  const genAI = getClient();

  // Compute schedule density
  const totalClassHours = data.weeklySchedule.reduce((acc, entry) => {
    const start = timeToMinutes(entry.startTime);
    const end = timeToMinutes(entry.endTime);
    return acc + (end - start) / 60;
  }, 0);

  const prompt = `You are a student wellness expert and academic advisor. Analyze this student's schedule and lifestyle data to assess burnout risk and provide actionable recommendations.

STUDENT PROFILE:
- Name: ${data.studentName}
- Grade/Year: ${data.gradeLevel}
- Academic Goals: ${data.academicGoals}

SCHEDULE DATA:
- Total weekly class/study hours (scheduled): ${totalClassHours.toFixed(1)} hours
- Daily study hours (self-reported): ${data.dailyStudyHours} hours
- Weekly Schedule:
${data.weeklySchedule
  .map(
    (e) =>
      `  • ${e.day} | ${e.startTime}-${e.endTime} | ${e.subject} (${e.type})`,
  )
  .join("\n")}

LIFESTYLE HABITS:
- Sleep per night: ${data.sleepHours} hours
- Study breaks: ${data.breakFrequency}
- Exercise frequency: ${data.exerciseFrequency}
- Extracurricular activities: ${data.extracurriculars || "None"}

CURRENT WELLBEING:
- Self-reported stress level: ${data.currentStressLevel}/10
- Reported symptoms: ${data.recentSymptoms.length > 0 ? data.recentSymptoms.join(", ") : "None"}

Based on this data, provide a comprehensive burnout risk analysis and personalized wellness plan.

Respond ONLY with a valid JSON object (no markdown, no backticks) in this exact structure:
{
  "burnoutRiskScore": <0-100 integer>,
  "burnoutRiskLevel": "<low|moderate|high|critical>",
  "summary": "<2-3 sentence personalized summary of the student's situation and main concern>",
  "riskFactors": ["<specific risk factor 1>", "<specific risk factor 2>", ...],
  "protectiveFactors": ["<protective factor 1>", ...],
  "suggestions": [
    {
      "category": "<sleep|exercise|study|social|mindfulness|schedule>",
      "title": "<short action title>",
      "description": "<2-3 sentence concrete, actionable advice>",
      "priority": "<high|medium|low>",
      "timeRequired": "<e.g. 20 min/day>"
    }
  ],
  "weeklyPlan": {
    "monday": ["<specific tip or task>", ...],
    "tuesday": ["<specific tip or task>", ...],
    "wednesday": ["<specific tip or task>", ...],
    "thursday": ["<specific tip or task>", ...],
    "friday": ["<specific tip or task>", ...],
    "saturday": ["<specific tip or task>", ...],
    "sunday": ["<specific tip or task>", ...]
  }
}

Rules:
- burnoutRiskScore: 0=no risk, 100=severe burnout. Be accurate based on the data.
- Include 3-6 risk factors and 2-4 protective factors (strings)
- Include 4-7 actionable suggestions across different categories
- Weekly plan should have 2-3 items per day, specific to this student's schedule
- Be empathetic, specific, and evidence-based`;

  const response = await genAI.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  const text = response.text!;

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, "").trim();

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error(
      "AI returned an invalid response format. Please try again.",
    );
  }

  // Validate burnout level
  const validLevels = ["low", "moderate", "high", "critical"];
  if (!validLevels.includes(parsed.burnoutRiskLevel)) {
    parsed.burnoutRiskLevel = scoreToLevel(parsed.burnoutRiskScore);
  }

  return parsed;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function scoreToLevel(score: number): "low" | "moderate" | "high" | "critical" {
  if (score < 30) return "low";
  if (score < 55) return "moderate";
  if (score < 75) return "high";
  return "critical";
}
