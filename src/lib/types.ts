export interface ScheduleEntry {
	day: string;
	subject: string;
	startTime: string;
	endTime: string;
	type: 'class' | 'study' | 'lab' | 'exam' | 'other';
}

export interface Suggestion {
	category: 'sleep' | 'exercise' | 'study' | 'social' | 'mindfulness' | 'schedule';
	title: string;
	description: string;
	priority: 'high' | 'medium' | 'low';
	timeRequired: string;
}

export interface WeeklyPlan {
	monday: string[];
	tuesday: string[];
	wednesday: string[];
	thursday: string[];
	friday: string[];
	saturday: string[];
	sunday: string[];
}

export interface AnalysisResult {
	burnoutRiskScore: number;
	burnoutRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
	riskFactors: string[];
	protectiveFactors: string[];
	suggestions: Suggestion[];
	weeklyPlan: WeeklyPlan;
	summary: string;
}

export const SYMPTOMS = [
	'Difficulty concentrating',
	'Chronic fatigue',
	'Headaches',
	'Irritability',
	'Loss of motivation',
	'Anxiety before exams',
	'Trouble sleeping',
	'Feeling overwhelmed',
	'Social withdrawal',
	'Procrastination spike',
	'Physical tension',
	'Emotional numbness'
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const GRADE_LEVELS = [
	'High School (9th)',
	'High School (10th)',
	'High School (11th)',
	'High School (12th)',
	'University Year 1',
	'University Year 2',
	'University Year 3',
	'University Year 4',
	'Graduate / Masters',
	'PhD'
];
