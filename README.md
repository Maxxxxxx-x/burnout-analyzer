# ClearMind — AI Student Burnout Analyzer

A full-stack web app that analyzes student academic schedules and lifestyle habits using **Gemini AI** to assess burnout risk and generate personalized wellness plans.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | [Bun](https://bun.sh) 1.1 |
| Framework | [SvelteKit](https://kit.svelte.dev) 2 + Svelte 5 |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| AI | [Google Gemini](https://ai.google.dev) 1.5 Flash |
| Containerization | Docker (multistage) + Docker Compose |

---

## Quick Start

### 1. Get a Gemini API key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here
```

### 3. Run with Docker Compose

```bash
docker compose up --build
```

The app will be available at **http://localhost:3000**.

The SQLite database is stored in a named Docker volume (`sqlite_data`) and persists across restarts.

---

## Local Development (without Docker)

```bash
# Install dependencies
bun install

# Copy and configure env
cp .env.example .env
# Set GEMINI_API_KEY in .env

# Start dev server
bun run dev
```

Dev server runs at **http://localhost:5173** with hot module replacement.

---

## Project Structure

```
burnout-analyzer/
├── Dockerfile                  # Multistage: deps → builder → runner
├── docker-compose.yml          # Production compose with named volume
├── drizzle.config.ts           # Drizzle ORM config
├── src/
│   ├── app.css                 # Global design tokens + utility classes
│   ├── app.html                # HTML shell
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts        # SQLite connection + auto-migration
│   │   │   └── schema.ts       # Drizzle table definitions
│   │   ├── server/
│   │   │   └── gemini.ts       # Gemini AI integration
│   │   └── types.ts            # Shared TypeScript types
│   └── routes/
│       ├── +layout.svelte      # Nav + footer
│       ├── +page.svelte        # 4-step form wizard
│       ├── +page.server.ts     # Form action → DB + AI
│       └── results/[id]/
│           ├── +page.svelte    # Results dashboard
│           └── +page.server.ts # Load analysis by ID
└── static/
    └── favicon.svg
```

---

## How It Works

1. **Student fills the 4-step form** — profile, weekly schedule (drag-build), study habits, wellbeing check-in
2. **Form data is saved** to SQLite via Drizzle ORM
3. **Gemini 1.5 Flash** analyzes the full data and returns a structured JSON assessment
4. **Results are stored** in the `analyses` table
5. **Results page** shows an animated burnout gauge (0–100), risk/protective factors, sorted action suggestions, and a day-by-day wellness plan

---

## Database Schema

### `submissions`
Stores raw student input: name, grade, schedule JSON, sleep/study hours, stress level, symptoms, goals.

### `analyses`
Stores Gemini AI output: burnout score, risk level, risk/protective factors, suggestions, weekly plan.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ | — | Google AI Studio API key |
| `DATABASE_URL` | ❌ | `./data/burnout.db` | SQLite file path |
| `PORT` | ❌ | `3000` | HTTP port |
| `HOST` | ❌ | `0.0.0.0` | Bind host |

---

## Docker Details

The Dockerfile uses **3 stages**:

1. **`deps`** — installs all `node_modules` with `bun install --frozen-lockfile`
2. **`builder`** — copies source, runs `bun run build` (SvelteKit → `./build`)
3. **`runner`** — minimal image with only prod deps + compiled output, runs as the non-root `bun` user

The SQLite file lives at `/app/data/burnout.db` inside the container, mounted to the `sqlite_data` named volume.

---

## ⚠️ Disclaimer

ClearMind provides AI-generated wellness suggestions for educational purposes only. It is not a substitute for professional medical or mental health advice. If you're experiencing severe symptoms of burnout or anxiety, please reach out to a qualified counselor or healthcare provider.
