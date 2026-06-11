import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { mkdirSync } from "fs";

const dbPath = process.env.DATABASE_URL ?? "./data/burnout.db";

// Ensure data directory exists
const dir = dbPath.substring(0, dbPath.lastIndexOf("/"));
if (dir) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    // already exists
  }
}

const sqlite = new Database(dbPath);
sqlite.run("PRAGMA journal_mode = WAL;");
sqlite.run("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });

// Auto-migrate on startup
sqlite.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    student_name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    weekly_schedule TEXT NOT NULL,
    daily_study_hours REAL NOT NULL,
    sleep_hours REAL NOT NULL,
    break_frequency TEXT NOT NULL,
    exercise_frequency TEXT NOT NULL,
    extracurriculars TEXT NOT NULL,
    current_stress_level INTEGER NOT NULL,
    recent_symptoms TEXT NOT NULL,
    academic_goals TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES submissions(id),
    created_at INTEGER NOT NULL,
    burnout_risk_score INTEGER NOT NULL,
    burnout_risk_level TEXT NOT NULL,
    risk_factors TEXT NOT NULL,
    protective_factors TEXT NOT NULL,
    suggestions TEXT NOT NULL,
    weekly_plan TEXT NOT NULL,
    summary TEXT NOT NULL
  );
`);
