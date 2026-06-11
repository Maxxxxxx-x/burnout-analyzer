import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/index';
import { analyses, submissions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Suggestion, WeeklyPlan } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const rows = await db
		.select()
		.from(analyses)
		.innerJoin(submissions, eq(analyses.submissionId, submissions.id))
		.where(eq(analyses.id, id))
		.limit(1);

	if (rows.length === 0) {
		throw error(404, 'Analysis not found.');
	}

	const { analyses: a, submissions: s } = rows[0];

	return {
		student: {
			name: s.studentName,
			gradeLevel: s.gradeLevel,
			academicGoals: s.academicGoals
		},
		analysis: {
			burnoutRiskScore: a.burnoutRiskScore,
			burnoutRiskLevel: a.burnoutRiskLevel as 'low' | 'moderate' | 'high' | 'critical',
			summary: a.summary,
			riskFactors: JSON.parse(a.riskFactors) as string[],
			protectiveFactors: JSON.parse(a.protectiveFactors) as string[],
			suggestions: JSON.parse(a.suggestions) as Suggestion[],
			weeklyPlan: JSON.parse(a.weeklyPlan) as WeeklyPlan,
			createdAt: a.createdAt
		}
	};
};
