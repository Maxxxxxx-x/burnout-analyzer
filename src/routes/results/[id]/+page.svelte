<script lang="ts">
	import type { PageData } from './$types';
	import type { Suggestion } from '$lib/types';

	let { data }: { data: PageData } = $props();

	

	const LEVEL_META = {
		low:      { label: 'Low Risk',      color: '#5BAD8F', glow: 'rgba(91,173,143,0.3)',  emoji: '🟢', msg: "You're managing your workload well. Keep up the healthy habits!" },
		moderate: { label: 'Moderate Risk',  color: '#E8A838', glow: 'rgba(232,168,56,0.3)', emoji: '🟡', msg: "Some warning signs present. Now's a great time to adjust your routine." },
		high:     { label: 'High Risk',      color: '#F4715A', glow: 'rgba(244,113,90,0.3)', emoji: '🟠', msg: "Several burnout indicators detected. Please take these recommendations seriously." },
		critical: { label: 'Critical Risk',  color: '#FF4D4D', glow: 'rgba(255,77,77,0.35)', emoji: '🔴', msg: "Urgent attention needed. Consider speaking to an academic advisor or counselor soon." }
	};

	const meta = LEVEL_META[data.analysis.burnoutRiskLevel];

	const CATEGORY_META: Record<string, { icon: string; color: string }> = {
		sleep:       { icon: '🌙', color: '#7C6FF7' },
		exercise:    { icon: '🏃', color: '#5BAD8F' },
		study:       { icon: '📚', color: '#E8A838' },
		social:      { icon: '🤝', color: '#A99EFA' },
		mindfulness: { icon: '🧘', color: '#87CBAE' },
		schedule:    { icon: '📅', color: '#F4715A' }
	};

	const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
	const sortedSuggestions = [...data.analysis.suggestions].sort(
		(a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
	);

	const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	const DAY_LABELS: Record<string, string> = {
		monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
		friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
	};

	// SVG gauge math
	const r = 90;
	const circumference = Math.PI * r; // half circle
	const scorePercent = data.analysis.burnoutRiskScore / 100;
	const dashOffset = circumference * (1 - scorePercent);
</script>

<svelte:head>
	<title>Burnout Analysis — {data.student.name}</title>
</svelte:head>

<div class="results-page">
	<div class="container">

		<!-- Header -->
		<div class="results-header fade-up">
			<a href="/" class="back-link">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				New Analysis
			</a>
			<div class="results-meta">
				<h1 class="results-title">Analysis for <span>{data.student.name}</span></h1>
				<p class="results-subtitle">{data.student.gradeLevel}</p>
			</div>
		</div>

		<!-- Hero card: Burnout gauge -->
		<div class="gauge-card card fade-up" style="--glow: {meta.glow}; animation-delay: 0.05s">
			<div class="gauge-layout">
				<!-- SVG arc gauge -->
				<div class="gauge-wrap">
					<svg class="gauge-svg" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
						<!-- Track -->
						<path
							d="M 20 110 A 90 90 0 0 1 200 110"
							stroke="rgba(255,255,255,0.07)"
							stroke-width="14"
							stroke-linecap="round"
							fill="none"
						/>
						<!-- Fill -->
						<path
							d="M 20 110 A 90 90 0 0 1 200 110"
							stroke={meta.color}
							stroke-width="14"
							stroke-linecap="round"
							fill="none"
							stroke-dasharray={circumference}
							stroke-dashoffset={dashOffset}
							style="transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1); filter: drop-shadow(0 0 8px {meta.color}80)"
						/>
						<!-- Score text -->
						<text x="110" y="105" text-anchor="middle" font-family="Space Grotesk" font-size="36" font-weight="700" fill={meta.color}>{data.analysis.burnoutRiskScore}</text>
						<text x="110" y="122" text-anchor="middle" font-family="Inter" font-size="10" fill="#8A8880" letter-spacing="2">/100</text>
					</svg>

					<div class="gauge-label" style="color: {meta.color}">
						{meta.label}
					</div>
				</div>

				<!-- Summary text -->
				<div class="gauge-summary">
					<div class="gauge-summary__badge badge badge--{data.analysis.burnoutRiskLevel}">
						{meta.emoji} {meta.label}
					</div>
					<p class="gauge-summary__alert">{meta.msg}</p>
					<p class="gauge-summary__text">{data.analysis.summary}</p>
				</div>
			</div>
		</div>

		<!-- Two-col: risks + protective -->
		<div class="two-col fade-up" style="animation-delay:0.1s">
			<div class="card factors-card factors-card--risk">
				<h2 class="section-title">
					<span class="section-icon">⚠️</span>
					Risk Factors
				</h2>
				<ul class="factors-list">
					{#each data.analysis.riskFactors as factor}
						<li class="factor-item factor-item--risk">
							<span class="factor-dot"></span>
							{factor}
						</li>
					{/each}
				</ul>
			</div>

			<div class="card factors-card factors-card--protect">
				<h2 class="section-title">
					<span class="section-icon">🛡️</span>
					Protective Factors
				</h2>
				<ul class="factors-list">
					{#each data.analysis.protectiveFactors as factor}
						<li class="factor-item factor-item--protect">
							<span class="factor-dot"></span>
							{factor}
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Suggestions -->
		<section class="suggestions-section fade-up" style="animation-delay:0.15s">
			<h2 class="page-section-title">Personalized Recommendations</h2>
			<div class="suggestions-grid">
				{#each sortedSuggestions as suggestion}
					{@const cm = CATEGORY_META[suggestion.category] ?? { icon: '💡', color: '#7C6FF7' }}
					<div class="suggestion-card card" style="--cat-color: {cm.color}">
						<div class="suggestion-header">
							<span class="suggestion-icon">{cm.icon}</span>
							<div class="suggestion-meta">
								<span class="suggestion-category">{suggestion.category}</span>
								<span class="suggestion-priority priority--{suggestion.priority}">{suggestion.priority} priority</span>
							</div>
							<span class="suggestion-time">⏱ {suggestion.timeRequired}</span>
						</div>
						<h3 class="suggestion-title">{suggestion.title}</h3>
						<p class="suggestion-desc">{suggestion.description}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Weekly Plan -->
		<section class="weekly-section fade-up" style="animation-delay:0.2s">
			<h2 class="page-section-title">Your Personalized Weekly Plan</h2>
			<div class="weekly-grid">
				{#each DAYS_ORDER as dayKey}
					{@const tasks = (data.analysis.weeklyPlan as Record<string, string[]>)[dayKey] ?? []}
					<div class="day-card card" class:weekend={dayKey === 'saturday' || dayKey === 'sunday'}>
						<div class="day-label">{DAY_LABELS[dayKey]}</div>
						<ul class="day-tasks">
							{#each tasks as task}
								<li class="day-task">{task}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</section>

		<!-- CTA -->
		<div class="cta-row fade-up" style="animation-delay:0.25s">
			<a href="/" class="btn btn--ghost">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				Analyze again
			</a>
			<button class="btn btn--primary" onclick={() => window.print()}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6V2h8v4M4 11H3a1 1 0 01-1-1V7a1 1 0 011-1h10a1 1 0 011 1v3a1 1 0 01-1 1h-1m-8 0v3h8v-3H4z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
				Save / Print
			</button>
		</div>

	</div>
</div>

<style>
	.results-page { padding: 2.5rem 0 4rem; }

	/* Header */
	.results-header { margin-bottom: 2rem; }
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--cream-muted);
		font-size: 0.85rem;
		margin-bottom: 1rem;
		transition: color var(--transition);
	}
	.back-link:hover { color: var(--cream); }

	.results-title {
		font-size: clamp(1.5rem, 3vw, 2rem);
		color: var(--cream);
	}
	.results-title span { color: var(--lavender-light); }
	.results-subtitle { color: var(--cream-muted); font-size: 0.9rem; margin-top: 0.25rem; }

	/* Gauge card */
	.gauge-card {
		margin-bottom: 1.5rem;
		box-shadow: var(--shadow-card), 0 0 48px var(--glow, transparent);
	}

	.gauge-layout {
		display: flex;
		align-items: center;
		gap: 3rem;
	}

	@media (max-width: 640px) {
		.gauge-layout { flex-direction: column; gap: 1.5rem; }
	}

	.gauge-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
	}

	.gauge-svg { width: 220px; }

	.gauge-label {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin-top: -0.5rem;
	}

	.gauge-summary { flex: 1; }
	.gauge-summary__badge { margin-bottom: 0.875rem; }
	.gauge-summary__alert {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--cream);
		margin-bottom: 0.75rem;
		font-family: var(--font-display);
	}
	.gauge-summary__text {
		color: var(--cream-muted);
		font-size: 0.925rem;
		line-height: 1.7;
	}

	/* Two col */
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		margin-bottom: 2.5rem;
	}
	@media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } }

	.factors-card { }
	.section-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--cream);
		margin-bottom: 1rem;
	}
	.section-icon { font-size: 1rem; }

	.factors-list { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
	.factor-item {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--cream-muted);
	}
	.factor-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		margin-top: 0.4rem;
		flex-shrink: 0;
	}
	.factor-item--risk .factor-dot { background: var(--coral); }
	.factor-item--protect .factor-dot { background: var(--sage); }

	/* Suggestions */
	.page-section-title {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--cream);
		margin-bottom: 1.25rem;
		letter-spacing: -0.02em;
	}

	.suggestions-section { margin-bottom: 2.5rem; }
	.suggestions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.suggestion-card {
		border-top: 2px solid var(--cat-color, var(--lavender));
		padding: 1.375rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.suggestion-header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.suggestion-icon { font-size: 1.25rem; }
	.suggestion-meta { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; }
	.suggestion-category {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--cat-color, var(--lavender));
	}
	.suggestion-priority {
		font-size: 0.7rem;
		color: var(--cream-dim);
		font-family: var(--font-mono);
	}
	.priority--high { color: var(--coral-light); }
	.priority--medium { color: var(--amber-light); }
	.priority--low { color: var(--sage-light); }

	.suggestion-time {
		font-size: 0.75rem;
		color: var(--cream-dim);
		white-space: nowrap;
	}

	.suggestion-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--cream);
		line-height: 1.3;
	}
	.suggestion-desc {
		font-size: 0.85rem;
		color: var(--cream-muted);
		line-height: 1.65;
	}

	/* Weekly plan */
	.weekly-section { margin-bottom: 2.5rem; }
	.weekly-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 900px) { .weekly-grid { grid-template-columns: repeat(4, 1fr); } }
	@media (max-width: 560px) { .weekly-grid { grid-template-columns: repeat(2, 1fr); } }

	.day-card {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.day-card.weekend {
		background: rgba(124,111,247,0.05);
	}

	.day-label {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--lavender-light);
		padding-bottom: 0.625rem;
		border-bottom: 1px solid var(--border-subtle);
	}
	.day-card.weekend .day-label { color: var(--sage-light); }

	.day-tasks { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
	.day-task {
		font-size: 0.775rem;
		color: var(--cream-muted);
		line-height: 1.5;
		padding-left: 0.75rem;
		position: relative;
	}
	.day-task::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--lavender-dim);
	}

	/* CTA */
	.cta-row {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
</style>
