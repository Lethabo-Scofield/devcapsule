# Dev Capsule

A Next.js multi-agent security and architecture analysis platform. Users submit a GitHub repo URL and the app uses the Google Gemini API to analyze the repository's architecture, security vulnerabilities, and developer experience.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: Node.js 20
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **AI**: Google Gemini API (`gemini-2.5-flash-preview-09-2025`)

## Project Structure

```
src/
  app/
    api/scan/route.ts   - Server-side API route that calls Gemini
    layout.tsx          - Root layout
    page.tsx            - Main page with phase state machine (upload → loading → results)
    globals.css
    lib/clipboard.ts
  agents/agents.tsx     - Agent definitions shown during loading phase
  components/           - UI components (Navigation, UploadPhase, LoadingPhase, ResultsPhase, tabs/)
```

## Environment Variables

- `GOOGLE_API_KEY` - Required. Google Gemini API key for repository analysis.

## Running

- Dev: `npm run dev` → runs on port 5000, bound to 0.0.0.0 (Replit compatible)
- Build: `npm run build`
- Start: `npm run start` → runs on port 5000, bound to 0.0.0.0

## Replit Migration Notes

- Port changed from default (3000) to 5000, bound to `0.0.0.0` for Replit preview compatibility
- Workflow: "Start application" runs `npm run dev`
