# Dev Capsule (Dev-Time-Capsule)

AI-powered code analysis tool that provides deep insights into repositories using a multi-agent system powered by Google Gemini AI and real OSV.dev vulnerability scanning.

## Tech Stack
- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Icons**: Lucide React
- **AI**: Google Gemini API (`gemini-2.5-flash`) for Architect and DX agents
- **Security**: Real OSV.dev API for vulnerability detection (npm + PyPI)
- **Git/File Handling**: GitHub raw + API for repo analysis

## Multi-Agent Architecture
- **Orchestrator** (`src/lib/agents/orchestrator.ts`): Fetches repo data, launches agents in parallel, computes health score
- **Architect Agent** (`src/lib/agents/architect.ts`): Analyzes tech stack, architecture, and components via Gemini
- **Security Agent** (`src/lib/agents/security.ts`): Scans dependencies against OSV.dev for real CVEs, then uses Gemini for fix commands
- **DX Agent** (`src/lib/agents/dx.ts`): Generates onboarding steps and remediation commands via Gemini
- **GitHub Module** (`src/lib/agents/github.ts`): Fetches package.json, requirements.txt, file tree, README from GitHub
- **OSV Module** (`src/lib/agents/osv.ts`): Queries OSV.dev batch API for npm and PyPI vulnerabilities
- **LLM Module** (`src/lib/agents/grok.ts`): Wraps Gemini API calls with JSON response mode

## Project Structure
```
src/
├── agents/agents.tsx         # AI agent definitions for UI (Architect, Security, DX)
├── app/
│   ├── api/scan/route.ts     # Backend API route — calls orchestrator
│   ├── layout.tsx            # Global layout
│   ├── page.tsx              # Main page (upload → loading → results phases)
│   └── lib/                  # Utilities
├── lib/agents/               # Multi-agent backend
│   ├── orchestrator.ts       # Main orchestrator (parallel agent execution)
│   ├── architect.ts          # Architect agent (Gemini)
│   ├── security.ts           # Security agent (OSV.dev + Gemini)
│   ├── dx.ts                 # DX agent (Gemini)
│   ├── github.ts             # GitHub data fetcher
│   ├── osv.ts                # OSV.dev vulnerability scanner
│   └── grok.ts               # Gemini LLM wrapper
├── components/
│   ├── Navigation.tsx        # Floating pill navbar
│   ├── UploadPhase.tsx       # Landing page (hero, demo video, agent diagram)
│   ├── LoadingPhase.tsx      # Terminal-style loader with simulated failures + real error display
│   ├── ResultsPhase.tsx      # Results display parent
│   └── tabs/                 # OverviewTab, AnatomyTab, SecurityTab
public/                       # Static assets (hero-bg.png, HowItWorks.mp4)
```

## Environment Variables
- `GOOGLE_API_KEY` (secret) — Required for Gemini AI agents

## Running
- Dev: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Start: `npm start` (port 5000)

## Design
- White/grey monochromatic palette with single indigo accent on interactive elements
- Floating pill navbar with frosted glass effect on scroll
- Hero section with background image overlay
- Demo video with mute/unmute toggle
- Fully mobile-responsive: all tabs (Overview, Security, Anatomy), loading phase, landing page sections (hero, How It Works, Capabilities, Demo, CTA), and footer use `sm:` breakpoints for consistent mobile-first layout
- Terminal-style loading screen with macOS traffic lights, color-coded agent logs, ASCII progress bars, blinking cursor, LIVE/FAIL indicator
- Random simulated failures (rate limits, timeouts, parse errors) that self-heal during animation (~45% chance per agent)
- Real API errors display inside the terminal with FATAL ERROR box and Back button (stays in terminal, doesn't bounce to upload)
- Soft-failure detection for bad/private/empty repos
