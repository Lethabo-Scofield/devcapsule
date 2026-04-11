# Dev Capsule (Dev-Time-Capsule)

AI-powered code analysis tool that provides deep insights into repositories using Google Gemini AI multi-agent orchestration.

## Tech Stack
- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Icons**: Lucide React
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Git/File Handling**: simple-git, tmp-promise, glob

## Project Structure
```
src/
├── agents/agents.tsx         # AI agent definitions (Architect, Security, DX)
├── app/
│   ├── api/scan/route.ts     # Backend API route for Gemini AI orchestration
│   ├── layout.tsx            # Global layout
│   ├── page.tsx              # Main page (upload → loading → results phases)
│   └── lib/                  # Utilities
├── components/
│   ├── Navigation.tsx        # Header + tab switcher
│   ├── UploadPhase.tsx       # Repo URL input
│   ├── LoadingPhase.tsx      # Animated multi-agent progress
│   ├── ResultsPhase.tsx      # Results display parent
│   └── tabs/                 # OverviewTab, AnatomyTab, SecurityTab
public/                       # Static assets
```

## Environment Variables
- `GOOGLE_API_KEY` (secret) — Required for Gemini AI scan feature

## Running
- Dev: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Start: `npm start` (port 5000)
