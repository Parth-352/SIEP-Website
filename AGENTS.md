# 🤖 RIDERS BAY AGENT PLAYBOOK & WORKSPACE RULES
> **Universal Agent Operating Guidelines & Codebase Context**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0 (ISIEINDIA)*  
> *Active Repositories: Web Dashboard (`/web`), 3D Digital Twin (`/Electric_Scrambler_Exo.blend`), CAD Assets*

---

## ⚡ 1. PROJECT ESSENTIALS AT A GLANCE
- **Organization:** Riders Bay (SNJB's KBJ College of Engineering, Chandwad, Nashik).
- **Mission:** High-performance Smart Scrambler Electric Motorcycle for SIEP Season 7.0.
- **Web App (`/web`):** Next.js 16.4.5, React 19, Tailwind CSS v4, Three.js / R3F / Drei, Firebase Auth & Firestore.
- **3D Digital Twin:** Blender 5.2.2 LTS (`Electric_Scrambler_Exo.blend`), WebGL GLB assets (`web/public/moto.glb`, `web/public/chassis.glb`).
- **Engineering Squads (9 Squads):** `chassis`, `powertrain`, `battery`, `electronics`, `telemetry`, `brakes`, `suspension`, `safety`, `marketing` + `core` (management).

---

## 🔄 2. AGENT OPERATING PROTOCOLS (MANDATORY)

### Phase 1: Wake-Up Ritual (Always run on session start / after breaks)
Whenever starting a new session or resuming after a coding break:
1. **Check Working State:** Run `git status` and `git log -n 5 --oneline` to see where work left off.
2. **Read Handover Document:** Inspect [.context/HANDOVER.md](file://.context/HANDOVER.md) for active tasks, blockers, and pickup points.
3. **Verify Type-Safety:** Run `cd web && npx tsc --noEmit` to ensure the codebase starts in a clean compilation state.
4. **Acknowledge Context:** Summarize your understanding of the current state and plan before modifying files.

### Phase 2: In-Flight Rules & Constraints
- **Preserve Credentials & Auth Model:** Never break or alter member PIN auth logic (`web/src/app/api/passwords`, `web/src/app/api/change-password`, `web/src/context/AuthContext.tsx`). Default PIN is `935200`.
- **Preserve Multi-Squad Assignments:** Support primary `user.teamId` and optional `user.secondaryTeams: TeamId[]`.
- **Tailwind CSS v4 Caution:** Uses `@theme` and `@tailwindcss/turbopack`. Avoid legacy Tailwind v3 config patterns.
- **Three.js / WebGL Safety:** 3D canvases must always be client-side rendered with dynamic imports (`ssr: false`) and error boundaries to prevent hydration mismatch.
- **Large File Boundary:** Large CAD / video files (>5MB) must route to Google Drive Resumable API, never committed directly or posted through serverless payloads without chunking.

### Phase 3: Pre-Break / Shutdown Ritual (Before wrapping up any session)
Before ending your turn or when the user indicates a break:
1. **Update Handover:** Overwrite or update [.context/HANDOVER.md](file://.context/HANDOVER.md) with:
   - What was accomplished.
   - Exact files modified or untracked.
   - Any bugs or edge cases encountered.
   - Immediate next steps checklist (`[ ]`) for the next agent/developer.
2. **Record Major Decisions:** If an architectural pattern was introduced or changed, record an entry in [.context/DECISIONS.md](file://.context/DECISIONS.md).
3. **Verify Compilation:** Ensure `cd web && npx tsc --noEmit` passes clean.

---

## 🛠️ 3. CORE VERIFICATION COMMANDS

| Action | Command | Scope |
| :--- | :--- | :--- |
| **Context Check** | `bash scripts/context-check.sh` | Workspace root |
| **TypeScript Compile Check** | `cd web && npx tsc --noEmit` | Web app |
| **Lint Check** | `cd web && npm run lint` | Web app |
| **Next.js Dev Server** | `cd web && npm run dev` | Port 3000 |
| **Production Build** | `cd web && npm run build` | Next.js output |

---

## 📂 4. CRITICAL PATH DIRECTORY MAP
- `.context/` — **The Living Agent Memory Hub** (Handover, Architecture, ADRs, Commands).
- `web/src/app/` — Next.js 16 App Router pages and API routes.
- `web/src/components/` — Modular React 19 UI components and 3D viewers.
- `web/src/context/AuthContext.tsx` — Global session, member roles, and multi-team permissions.
- `web/src/lib/` — `firestoreService.ts`, `roster.ts`, `types.ts`, `session.ts`, `store.ts`.
- `context.md` — Authoritative Blender 3D scene geometry, shaders, and MCP connector documentation.
- `EVERYTHINGUWANNAKNOW.MD` — Comprehensive vehicle engineering specifications and team roster.
