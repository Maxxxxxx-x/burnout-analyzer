import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const submissions = sqliteTable('submissions', {
	id: text('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	studentName: text('student_name').notNull(),
	gradeLevel: text('grade_level').notNull(),

	// Weekly schedule data (JSON stringified)
	weeklySchedule: text('weekly_schedule').notNull(), // array of ScheduleEntry

	// Study habits
	dailyStudyHours: real('daily_study_hours').notNull(),
	sleepHours: real('sleep_hours').notNull(),
	breakFrequency: text('break_frequency').notNull(),
	exerciseFrequency: text('exercise_frequency').notNull(),
	extracurriculars: text('extracurriculars').notNull(), // comma-separated

	// Stress indicators
	currentStressLevel: integer('current_stress_level').notNull(), // 1-10
	recentSymptoms: text('recent_symptoms').notNull(), // JSON array

	// Goals
	academicGoals: text('academic_goals').notNull()
});

export const analyses = sqliteTable('analyses', {
	id: text('id').primaryKey(),
	submissionId: text('submission_id')
		.notNull()
		.references(() => submissions.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),

	// AI results
	burnoutRiskScore: integer('burnout_risk_score').notNull(), // 0–100
	burnoutRiskLevel: text('burnout_risk_level').notNull(), // low | moderate | high | critical
	riskFactors: text('risk_factors').notNull(), // JSON array of strings
	protectiveFactors: text('protective_factors').notNull(), // JSON array of strings
	suggestions: text('suggestions').notNull(), // JSON array of Suggestion objects
	weeklyPlan: text('weekly_plan').notNull(), // JSON object
	summary: text('summary').notNull()
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
