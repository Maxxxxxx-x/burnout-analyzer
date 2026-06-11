import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/db/index';
import { submissions, analyses } from '$lib/db/schema';
import { analyzeStudentBurnout } from '$lib/server/gemini';
import { v4 as uuidv4 } from 'uuid';
import type { ScheduleEntry } from '$lib/types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		// Basic fields (use safe coercion)
		const studentName = String(formData.get('studentName') ?? '').trim();
		const gradeLevel = String(formData.get('gradeLevel') ?? '').trim();
		const dailyStudyHoursRaw = String(formData.get('dailyStudyHours') ?? '');
		const sleepHoursRaw = String(formData.get('sleepHours') ?? '');
		const breakFrequency = String(formData.get('breakFrequency') ?? '').trim();
		const exerciseFrequency = String(formData.get('exerciseFrequency') ?? '').trim();
		const extracurriculars = String(formData.get('extracurriculars') ?? '').trim();
		const currentStressLevelRaw = String(formData.get('currentStressLevel') ?? '');
		const academicGoals = String(formData.get('academicGoals') ?? '').trim();

		// Parse numeric fields
		const dailyStudyHours = parseFloat(dailyStudyHoursRaw);
		const sleepHours = parseFloat(sleepHoursRaw);
		const currentStressLevel = parseInt(currentStressLevelRaw, 10);

		// Symptoms (multi-value)
		const recentSymptoms = (formData.getAll('symptoms') || []).map((v) => String(v));

		// Schedule entries
		const scheduleJson = String(formData.get('schedule') ?? '[]');
		let weeklySchedule: ScheduleEntry[] = [];
		try {
			const parsed = JSON.parse(scheduleJson);
			if (!Array.isArray(parsed)) {
				return fail(400, { error: 'Invalid schedule data.' });
			}
			weeklySchedule = parsed as ScheduleEntry[];
		} catch {
			return fail(400, { error: 'Invalid schedule data.' });
		}

		// Validation
		if (!studentName) return fail(400, { error: 'Please enter your name.' });
		if (!gradeLevel) return fail(400, { error: 'Please select your grade level.' });
		if (isNaN(dailyStudyHours)) return fail(400, { error: 'Invalid study hours.' });
		if (isNaN(sleepHours)) return fail(400, { error: 'Invalid sleep hours.' });
		if (isNaN(currentStressLevel)) return fail(400, { error: 'Invalid stress level.' });
		if (!academicGoals) return fail(400, { error: 'Please describe your academic goals.' });
		if (weeklySchedule.length === 0) return fail(400, { error: 'Please add at least one schedule entry.' });

		const submissionId = uuidv4();
		const now = new Date();

		// Save submission
		await db.insert(submissions).values({
			id: submissionId,
			createdAt: now,
			studentName,
			gradeLevel,
			weeklySchedule: JSON.stringify(weeklySchedule),
			dailyStudyHours,
			sleepHours,
			breakFrequency,
			exerciseFrequency,
			extracurriculars,
			currentStressLevel,
			recentSymptoms: JSON.stringify(recentSymptoms),
			academicGoals
		});

		// Run AI analysis
		let analysis;
		try {
			analysis = await analyzeStudentBurnout({
				studentName,
				gradeLevel,
				weeklySchedule,
				dailyStudyHours,
				sleepHours,
				breakFrequency,
				exerciseFrequency,
				extracurriculars,
				currentStressLevel,
				recentSymptoms,
				academicGoals
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'AI analysis failed.';
			return fail(500, { error: msg });
		}

		// Ensure analysis has expected shape, provide safe defaults if missing
		const analysisResult = {
			burnoutRiskScore: typeof analysis?.burnoutRiskScore === 'number' ? analysis.burnoutRiskScore : 0,
			burnoutRiskLevel: String(analysis?.burnoutRiskLevel ?? 'unknown'),
			riskFactors: Array.isArray(analysis?.riskFactors) ? analysis.riskFactors : [],
			protectiveFactors: Array.isArray(analysis?.protectiveFactors) ? analysis.protectiveFactors : [],
			suggestions: Array.isArray(analysis?.suggestions) ? analysis.suggestions : [],
			weeklyPlan: Array.isArray(analysis?.weeklyPlan) ? analysis.weeklyPlan : [],
			summary: String(analysis?.summary ?? '')
		};

		const analysisId = uuidv4();
		await db.insert(analyses).values({
			id: analysisId,
			submissionId,
			createdAt: now,
			burnoutRiskScore: analysisResult.burnoutRiskScore,
			burnoutRiskLevel: analysisResult.burnoutRiskLevel,
			riskFactors: JSON.stringify(analysisResult.riskFactors),
			protectiveFactors: JSON.stringify(analysisResult.protectiveFactors),
			suggestions: JSON.stringify(analysisResult.suggestions),
			weeklyPlan: JSON.stringify(analysisResult.weeklyPlan),
			summary: analysisResult.summary
		});

		throw redirect(303, `/results/${analysisId}`);
	}
};
