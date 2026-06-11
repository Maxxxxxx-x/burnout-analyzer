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

		// Basic fields
		const studentName = (formData.get('studentName') as string)?.trim();
		const gradeLevel = formData.get('gradeLevel') as string;
		const dailyStudyHours = parseFloat(formData.get('dailyStudyHours') as string);
		const sleepHours = parseFloat(formData.get('sleepHours') as string);
		const breakFrequency = formData.get('breakFrequency') as string;
		const exerciseFrequency = formData.get('exerciseFrequency') as string;
		const extracurriculars = (formData.get('extracurriculars') as string)?.trim() ?? '';
		const currentStressLevel = parseInt(formData.get('currentStressLevel') as string, 10);
		const academicGoals = (formData.get('academicGoals') as string)?.trim();

		// Symptoms (multi-value)
		const recentSymptoms = formData.getAll('symptoms') as string[];

		// Schedule entries
		const scheduleJson = formData.get('schedule') as string;
		let weeklySchedule: ScheduleEntry[] = [];
		try {
			weeklySchedule = JSON.parse(scheduleJson || '[]');
		} catch {
			return fail(400, { error: 'Invalid schedule data.' });
		}

		// Validation
		if (!studentName) return fail(400, { error: 'Please enter your name.' });
		if (!gradeLevel) return fail(400, { error: 'Please select your grade level.' });
		if (isNaN(dailyStudyHours)) return fail(400, { error: 'Invalid study hours.' });
		if (isNaN(sleepHours)) return fail(400, { error: 'Invalid sleep hours.' });
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

		const analysisId = uuidv4();
		await db.insert(analyses).values({
			id: analysisId,
			submissionId,
			createdAt: now,
			burnoutRiskScore: analysis.burnoutRiskScore,
			burnoutRiskLevel: analysis.burnoutRiskLevel,
			riskFactors: JSON.stringify(analysis.riskFactors),
			protectiveFactors: JSON.stringify(analysis.protectiveFactors),
			suggestions: JSON.stringify(analysis.suggestions),
			weeklyPlan: JSON.stringify(analysis.weeklyPlan),
			summary: analysis.summary
		});

		throw redirect(303, `/results/${analysisId}`);
	}
};
