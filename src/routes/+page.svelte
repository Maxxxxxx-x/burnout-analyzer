<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { SYMPTOMS, DAYS, GRADE_LEVELS } from '$lib/types';
	import type { ScheduleEntry } from '$lib/types';

	let { form }: { form: ActionData } = $props();

	// Multi-step wizard
	let step = $state(1);
	const TOTAL_STEPS = 4;

	// Form state
	let studentName = $state('');
	let gradeLevel = $state('');
	let academicGoals = $state('');
	let dailyStudyHours = $state(4);
	let sleepHours = $state(7);
	let breakFrequency = $state('');
	let exerciseFrequency = $state('');
	let extracurriculars = $state('');
	let currentStressLevel = $state(5);
	let selectedSymptoms = $state<string[]>([]);

	// Schedule builder
	let schedule = $state<ScheduleEntry[]>([]);
	let newEntry = $state<Partial<ScheduleEntry>>({
		day: 'Monday',
		subject: '',
		startTime: '09:00',
		endTime: '10:00',
		type: 'class'
	});
	let scheduleError = $state('');

	let submitting = $state(false);

	function addEntry() {
		scheduleError = '';
		if (!newEntry.subject?.trim()) { scheduleError = 'Subject is required.'; return; }
		if (!newEntry.startTime || !newEntry.endTime) { scheduleError = 'Set start and end times.'; return; }
		if (newEntry.startTime! >= newEntry.endTime!) { scheduleError = 'End time must be after start time.'; return; }

		schedule = [...schedule, { ...newEntry } as ScheduleEntry];
		newEntry = { day: newEntry.day, subject: '', startTime: newEntry.endTime, endTime: '', type: 'class' };
	}

	function removeEntry(i: number) {
		schedule = schedule.filter((_, idx) => idx !== i);
	}

	function toggleSymptom(s: string) {
		if (selectedSymptoms.includes(s)) {
			selectedSymptoms = selectedSymptoms.filter(x => x !== s);
		} else {
			selectedSymptoms = [...selectedSymptoms, s];
		}
	}

	function canProceed() {
		if (step === 1) return studentName.trim() && gradeLevel;
		if (step === 2) return schedule.length > 0;
		if (step === 3) return breakFrequency && exerciseFrequency;
		return true;
	}

	const TYPE_COLORS: Record<string, string> = {
		class: '#7C6FF7',
		study: '#5BAD8F',
		lab: '#E8A838',
		exam: '#F4715A',
		other: '#8A8880'
	};

	const stepTitles = ['Profile', 'Your Schedule', 'Study Habits', 'Wellbeing'];
</script>

<!-- Hero -->
<section class="hero">
	<div class="container">
		<div class="hero__eyebrow">AI-Powered Student Wellness</div>
		<h1 class="hero__title">
			Know your burnout risk<br />
			<span class="hero__title--accent">before it knows you.</span>
		</h1>
		<p class="hero__desc">
			Share your weekly schedule and study habits. Our AI analyzes your workload,
			identifies risk patterns, and gives you a personalized wellness plan.
		</p>
	</div>
</section>

<!-- Form wizard -->
<section class="wizard-section">
	<div class="container">
		<!-- Step indicator -->
		<div class="step-indicator">
			{#each stepTitles as title, i}
				<button
					type="button"
					class="step-pill"
					class:active={step === i + 1}
					class:done={step > i + 1}
					onclick={() => { if (step > i + 1) step = i + 1; }}
				>
					<span class="step-pill__num">
						{#if step > i + 1}
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
						{:else}
							{i + 1}
						{/if}
					</span>
					<span class="step-pill__label">{title}</span>
				</button>
				{#if i < stepTitles.length - 1}
					<div class="step-connector" class:done={step > i + 1}></div>
				{/if}
			{/each}
		</div>

		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<!-- Always submit wizard state (step panels unmount earlier fields) -->
			<input type="hidden" name="studentName" value={studentName} />
			<input type="hidden" name="gradeLevel" value={gradeLevel} />
			<input type="hidden" name="academicGoals" value={academicGoals} />
			<input type="hidden" name="dailyStudyHours" value={dailyStudyHours} />
			<input type="hidden" name="sleepHours" value={sleepHours} />
			<input type="hidden" name="breakFrequency" value={breakFrequency} />
			<input type="hidden" name="exerciseFrequency" value={exerciseFrequency} />
			<input type="hidden" name="extracurriculars" value={extracurriculars} />
			<input type="hidden" name="currentStressLevel" value={currentStressLevel} />
			<input type="hidden" name="schedule" value={JSON.stringify(schedule)} />
			{#each selectedSymptoms as symptom}
				<input type="hidden" name="symptoms" value={symptom} />
			{/each}

			{#if form?.error}
				<div class="form-error-banner">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#F4715A" stroke-width="1.5"/><path d="M8 5v3.5M8 11h.01" stroke="#F4715A" stroke-width="1.5" stroke-linecap="round"/></svg>
					{form.error}
				</div>
			{/if}

			<!-- STEP 1: Profile -->
			{#if step === 1}
				<div class="card fade-up">
					<h2 class="card-title">Tell us about yourself</h2>
					<p class="card-subtitle">We personalize the analysis based on your level and goals.</p>

					<div class="form-grid">
						<div class="form-group">
							<label class="form-label" for="studentName">Your Name</label>
							<input
								id="studentName"
								class="form-input"
								type="text"
								placeholder="e.g. Alex Chen"
								bind:value={studentName}
								required
							/>
						</div>

						<div class="form-group">
							<label class="form-label" for="gradeLevel">Grade / Year</label>
							<select id="gradeLevel" class="form-select" bind:value={gradeLevel} required>
								<option value="" disabled>Select your level</option>
								{#each GRADE_LEVELS as level}
									<option value={level}>{level}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="form-group" style="margin-top: 1.25rem;">
						<label class="form-label" for="academicGoals">Academic Goals</label>
						<textarea
							id="academicGoals"
							class="form-textarea"
							placeholder="e.g. Maintain a 3.8 GPA, prepare for medical school entrance exams, and graduate by May 2026."
							bind:value={academicGoals}
							rows="3"
						></textarea>
					</div>
				</div>

			<!-- STEP 2: Schedule -->
			{:else if step === 2}
				<div class="card fade-up">
					<h2 class="card-title">Your weekly schedule</h2>
					<p class="card-subtitle">Add all your classes, study blocks, labs, and exams.</p>

					<!-- Add entry form -->
					<div class="schedule-builder">
						<div class="schedule-row">
							<div class="form-group">
								<label class="form-label" for="entry-day">Day</label>
								<select id="entry-day" class="form-select" bind:value={newEntry.day}>
									{#each DAYS as day}
										<option value={day}>{day}</option>
									{/each}
								</select>
							</div>
							<div class="form-group schedule-subject">
								<label class="form-label" for="entry-subject">Subject / Activity</label>
								<input id="entry-subject" class="form-input" type="text" placeholder="e.g. Calculus II" bind:value={newEntry.subject} />
							</div>
							<div class="form-group">
								<label class="form-label" for="entry-type">Type</label>
								<select id="entry-type" class="form-select" bind:value={newEntry.type}>
									<option value="class">Class</option>
									<option value="study">Study</option>
									<option value="lab">Lab</option>
									<option value="exam">Exam</option>
									<option value="other">Other</option>
								</select>
							</div>
						</div>
						<div class="schedule-row">
							<div class="form-group">
								<label class="form-label" for="entry-start">Start</label>
								<input id="entry-start" class="form-input" type="time" bind:value={newEntry.startTime} />
							</div>
							<div class="form-group">
								<label class="form-label" for="entry-end">End</label>
								<input id="entry-end" class="form-input" type="time" bind:value={newEntry.endTime} />
							</div>
							<div class="form-group schedule-add">
								
								<button type="button" class="btn btn--primary" onclick={addEntry}>
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
									Add
								</button>
							</div>
						</div>
						{#if scheduleError}
							<p class="form-error">{scheduleError}</p>
						{/if}
					</div>

					<!-- Schedule list -->
					{#if schedule.length > 0}
						<div class="schedule-list">
							{#each DAYS as day}
								{@const dayEntries = schedule.filter(e => e.day === day)}
								{#if dayEntries.length > 0}
									<div class="schedule-day-group">
										<div class="schedule-day-label">{day}</div>
										{#each dayEntries as entry, globalIdx}
											{@const realIdx = schedule.indexOf(entry)}
											<div class="schedule-entry">
												<span class="entry-type-dot" style="background:{TYPE_COLORS[entry.type]}"></span>
												<span class="entry-time">{entry.startTime}–{entry.endTime}</span>
												<span class="entry-subject">{entry.subject}</span>
												<span class="entry-type">{entry.type}</span>
												<button type="button" class="entry-remove" onclick={() => removeEntry(realIdx)} aria-label="Remove">
													<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
												</button>
											</div>
										{/each}
									</div>
								{/if}
							{/each}
						</div>
					{:else}
						<div class="schedule-empty">
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="20" rx="3" stroke="#3D3880" stroke-width="1.5"/><path d="M10 4v8M22 4v8M4 14h24" stroke="#3D3880" stroke-width="1.5" stroke-linecap="round"/></svg>
							<p>No schedule entries yet. Add your first class above.</p>
						</div>
					{/if}
				</div>

			<!-- STEP 3: Study habits -->
			{:else if step === 3}
				<div class="card fade-up">
					<h2 class="card-title">Study habits & lifestyle</h2>
					<p class="card-subtitle">These habits significantly affect burnout risk.</p>

					<div class="form-grid">
						<div class="form-group">
							<label class="form-label" for="dailyStudyHours">
								Daily study hours (outside class): <strong class="form-label-value">{dailyStudyHours}h</strong>
							</label>
							<input
								id="dailyStudyHours"
								type="range"
								min="0" max="16" step="0.5"
								bind:value={dailyStudyHours}
							/>
							<div class="range-labels"><span>0h</span><span>8h</span><span>16h</span></div>
						</div>

						<div class="form-group">
							<label class="form-label" for="sleepHours">
								Sleep per night: <strong class="form-label-value">{sleepHours}h</strong>
							</label>
							<input
								id="sleepHours"
								type="range"
								min="2" max="12" step="0.5"
								bind:value={sleepHours}
							/>
							<div class="range-labels"><span>2h</span><span>7h</span><span>12h</span></div>
						</div>
					</div>

					<div class="form-grid" style="margin-top:1.25rem;">
						<div class="form-group">
							<label class="form-label" for="breakFrequency">How often do you take study breaks?</label>
							<select id="breakFrequency" class="form-select" bind:value={breakFrequency} required>
								<option value="" disabled>Select frequency</option>
								<option value="Every 25-30 min (Pomodoro)">Every 25–30 min (Pomodoro)</option>
								<option value="Every 45-60 min">Every 45–60 min</option>
								<option value="Every 90+ min">Every 90+ min</option>
								<option value="Rarely or never">Rarely or never</option>
							</select>
						</div>

						<div class="form-group">
							<label class="form-label" for="exerciseFrequency">Exercise frequency</label>
							<select id="exerciseFrequency" class="form-select" bind:value={exerciseFrequency} required>
								<option value="" disabled>Select frequency</option>
								<option value="Daily">Daily (every day)</option>
								<option value="4-5 times per week">4–5 times/week</option>
								<option value="2-3 times per week">2–3 times/week</option>
								<option value="Once per week">Once a week</option>
								<option value="Rarely">Rarely / never</option>
							</select>
						</div>
					</div>

					<div class="form-group" style="margin-top:1.25rem;">
						<label class="form-label" for="extracurriculars">Extracurricular activities (optional)</label>
						<input
							id="extracurriculars"
							class="form-input"
							type="text"
							placeholder="e.g. Chess club, part-time barista job, student council"
							bind:value={extracurriculars}
						/>
					</div>
				</div>

			<!-- STEP 4: Wellbeing -->
			{:else if step === 4}
				<div class="card fade-up">
					<h2 class="card-title">Current wellbeing</h2>
					<p class="card-subtitle">Be honest — this helps the AI give you more accurate recommendations.</p>

					<div class="form-group">
						<label class="form-label" for="stressSlider">
							Stress level right now:
							<strong class="form-label-value stress-val" data-level={currentStressLevel}>{currentStressLevel}/10</strong>
						</label>
						<input
							id="stressSlider"
							type="range"
							min="1" max="10" step="1"
							bind:value={currentStressLevel}
							class="stress-slider"
							style="--stress: {(currentStressLevel - 1) / 9}"
						/>
						<div class="range-labels">
							<span>😌 Calm</span>
							<span>😐 Moderate</span>
							<span>😰 Overwhelmed</span>
						</div>
					</div>

					<div class="form-group" style="margin-top:1.5rem;">
						<p class="form-label">Symptoms you've noticed recently</p>
						<p class="form-hint">Select all that apply — even mild occurrences count.</p>
						<div class="checkbox-grid">
							{#each SYMPTOMS as symptom}
								<label class="checkbox-item" class:checked={selectedSymptoms.includes(symptom)}>
									<input
										type="checkbox"
										checked={selectedSymptoms.includes(symptom)}
										onchange={() => toggleSymptom(symptom)}
									/>
									<span class="checkbox-box">
										{#if selectedSymptoms.includes(symptom)}
											<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
										{/if}
									</span>
									{symptom}
								</label>
							{/each}
						</div>
					</div>

					<!-- Review summary -->
					<div class="review-box">
						<div class="review-title">Ready to analyze</div>
						<div class="review-stats">
							<div class="review-stat">
								<span class="review-stat__val">{schedule.length}</span>
								<span class="review-stat__label">schedule entries</span>
							</div>
							<div class="review-stat">
								<span class="review-stat__val">{dailyStudyHours}h</span>
								<span class="review-stat__label">daily study</span>
							</div>
							<div class="review-stat">
								<span class="review-stat__val">{sleepHours}h</span>
								<span class="review-stat__label">sleep/night</span>
							</div>
							<div class="review-stat">
								<span class="review-stat__val">{selectedSymptoms.length}</span>
								<span class="review-stat__label">symptoms noted</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Navigation -->
			<div class="wizard-nav">
				{#if step > 1}
					<button type="button" class="btn btn--ghost" onclick={() => step--}>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
						Back
					</button>
				{:else}
					<div></div>
				{/if}

				{#if step < TOTAL_STEPS}
					<button
						type="button"
						class="btn btn--primary"
						disabled={!canProceed()}
						onclick={() => step++}
					>
						Continue
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
					</button>
				{:else}
					<button
						type="submit"
						class="btn btn--primary btn--analyze"
						disabled={submitting || !canProceed()}
					>
						{#if submitting}
							<span class="spinner"></span>
							Analyzing with Gemini AI…
						{:else}
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 5.5H16l-4.9 3.5 1.8 5.5L8 12 3.1 15.5l1.8-5.5L0 6.5h6.2z" fill="currentColor"/></svg>
							Analyze My Schedule
						{/if}
					</button>
				{/if}
			</div>
		</form>
	</div>
</section>

<style>
	/* Hero */
	.hero {
		padding: 5rem 0 3rem;
		text-align: center;
	}

	.hero__eyebrow {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--lavender-light);
		margin-bottom: 1.25rem;
		padding: 0.3rem 1rem;
		border: 1px solid rgba(124,111,247,0.3);
		border-radius: 100px;
		background: rgba(124,111,247,0.08);
	}

	.hero__title {
		font-size: clamp(2rem, 5vw, 3.25rem);
		font-weight: 700;
		color: var(--cream);
		margin-bottom: 1.25rem;
		line-height: 1.15;
	}

	.hero__title--accent {
		color: var(--lavender-light);
	}

	.hero__desc {
		max-width: 540px;
		margin: 0 auto;
		color: var(--cream-muted);
		font-size: 1.05rem;
		line-height: 1.7;
	}

	/* Wizard */
	.wizard-section {
		padding-bottom: 4rem;
	}

	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.step-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.875rem 0.4rem 0.4rem;
		border-radius: 100px;
		border: 1px solid var(--border-subtle);
		background: transparent;
		color: var(--cream-dim);
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: default;
		transition: all var(--transition);
	}

	.step-pill.active {
		border-color: var(--lavender);
		color: var(--cream);
		background: rgba(124,111,247,0.1);
	}

	.step-pill.done {
		border-color: rgba(91,173,143,0.4);
		color: var(--sage-light);
		background: rgba(91,173,143,0.08);
		cursor: pointer;
	}

	.step-pill__num {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--bg-elevated);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		border: 1px solid var(--border-subtle);
	}

	.step-pill.active .step-pill__num {
		background: var(--lavender);
		border-color: var(--lavender);
		color: white;
	}

	.step-pill.done .step-pill__num {
		background: var(--sage);
		border-color: var(--sage);
		color: white;
	}

	.step-connector {
		width: 24px;
		height: 1px;
		background: var(--border-subtle);
		flex-shrink: 0;
	}

	.step-connector.done { background: rgba(91,173,143,0.4); }

	/* Card */
	.card-title {
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--cream);
		margin-bottom: 0.375rem;
	}

	.card-subtitle {
		font-size: 0.9rem;
		color: var(--cream-muted);
		margin-bottom: 1.75rem;
	}

	/* Grid */
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
	}

	@media (max-width: 580px) {
		.form-grid { grid-template-columns: 1fr; }
	}

	/* Schedule builder */
	.schedule-builder {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 1.25rem;
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.schedule-row {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: 0.75rem;
		align-items: end;
	}

	@media (max-width: 600px) {
		.schedule-row { grid-template-columns: 1fr 1fr; }
		.schedule-subject { grid-column: 1 / -1; }
	}

	.schedule-add .btn {
		width: 100%;
		justify-content: center;
	}

	.schedule-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.schedule-day-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.schedule-day-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--lavender-light);
		padding: 0 0.25rem;
	}

	.schedule-entry {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.875rem;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
	}

	.entry-type-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.entry-time {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--cream-dim);
		white-space: nowrap;
	}

	.entry-subject {
		flex: 1;
		color: var(--cream);
		font-weight: 500;
	}

	.entry-type {
		font-size: 0.72rem;
		color: var(--cream-dim);
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.entry-remove {
		background: none;
		border: none;
		color: var(--cream-dim);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		border-radius: 4px;
		transition: all var(--transition);
	}

	.entry-remove:hover {
		color: var(--coral-light);
		background: rgba(244,113,90,0.1);
	}

	.schedule-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2.5rem;
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		color: var(--cream-dim);
		font-size: 0.875rem;
		text-align: center;
	}

	/* Sliders */
	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--cream-dim);
		margin-top: 0.35rem;
	}

	.form-label-value {
		color: var(--lavender-light);
		font-family: var(--font-mono);
	}

	.form-hint {
		font-size: 0.8rem;
		color: var(--cream-dim);
		margin-bottom: 0.75rem;
	}

	/* Stress slider coloring */
	.stress-val {
		color: color-mix(in srgb, var(--sage-light) calc(100% - var(--stress, 0) * 100%), var(--coral-light) calc(var(--stress, 0) * 100%));
	}

	/* Review box */
	.review-box {
		margin-top: 2rem;
		padding: 1.25rem 1.5rem;
		background: rgba(124,111,247,0.07);
		border: 1px solid rgba(124,111,247,0.2);
		border-radius: var(--radius-md);
	}

	.review-title {
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--lavender-light);
		margin-bottom: 1rem;
	}

	.review-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	@media (max-width: 480px) {
		.review-stats { grid-template-columns: 1fr 1fr; }
	}

	.review-stat {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.review-stat__val {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--cream);
	}

	.review-stat__label {
		font-size: 0.75rem;
		color: var(--cream-dim);
	}

	/* Navigation */
	.wizard-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1.5rem;
	}

	.btn--analyze {
		font-size: 1rem;
		padding: 0.875rem 2rem;
		background: linear-gradient(135deg, var(--lavender), #9C8BFF);
		animation: pulse-glow 3s ease infinite;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	/* Error banner */
	.form-error-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		background: rgba(244,113,90,0.1);
		border: 1px solid rgba(244,113,90,0.3);
		border-radius: var(--radius-md);
		color: var(--coral-light);
		font-size: 0.9rem;
		margin-bottom: 1.25rem;
	}
</style>
