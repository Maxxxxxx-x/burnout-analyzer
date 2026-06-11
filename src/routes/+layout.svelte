<script lang="ts">
	import '../app.css';
</script>

<nav class="nav">
	<div class="container nav__inner">
		<a href="/" class="nav__brand">
			<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="14" cy="14" r="13" stroke="#7C6FF7" stroke-width="1.5"/>
				<path d="M14 6v8l5 3" stroke="#7C6FF7" stroke-width="2" stroke-linecap="round"/>
				<circle cx="14" cy="14" r="2" fill="#F4715A"/>
			</svg>
			<span>ClearMind</span>
		</a>
		<div class="nav__links">
			<a href="/" class="nav__link">Analyze</a>
			<a href="https://github.com" class="nav__link nav__link--dim" target="_blank" rel="noopener">Docs</a>
		</div>
	</div>
</nav>

<main>
	<slot />
</main>

<footer class="footer">
	<div class="container footer__inner">
		<p class="footer__text">
			ClearMind uses Gemini AI to analyze academic workloads. Not a substitute for professional mental health support.
		</p>
		<p class="footer__disclaimer">
			If you're struggling, please reach out to a counselor or call a mental health helpline.
		</p>
	</div>
</footer>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(15, 22, 41, 0.85);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--border-subtle);
	}

	.nav__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.nav__brand {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--cream);
		letter-spacing: -0.02em;
	}
	.nav__brand:hover { color: var(--cream); }

	.nav__links {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.nav__link {
		padding: 0.4rem 0.875rem;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--cream-muted);
		transition: all var(--transition);
	}
	.nav__link:hover { background: var(--bg-elevated); color: var(--cream); }
	.nav__link--dim { color: var(--cream-dim); font-size: 0.8rem; }

	main {
		min-height: calc(100vh - 64px - 96px);
	}

	.footer {
		border-top: 1px solid var(--border-subtle);
		padding: 2rem 0;
		margin-top: 4rem;
	}

	.footer__inner {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.footer__text {
		font-size: 0.8rem;
		color: var(--cream-dim);
	}

	.footer__disclaimer {
		font-size: 0.75rem;
		color: var(--cream-dim);
		opacity: 0.7;
	}
</style>
