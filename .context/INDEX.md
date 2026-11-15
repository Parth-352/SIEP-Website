# 🗂️ MASTER RECORDS & CODEBASE INDEX
> **Authoritative Agent Lookup Registry & 300-Line Upper Bound Standard**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0 (ISIEINDIA)*  
> *Last Updated: 2026-11-15 14:05 IST*

---

## 📐 1. THE 300-LINE UPPER BOUND RULE & INDEX-AHEAD STANDARD
1. **Universal 300-Line Upper Bound:**  
   Every source file (`.tsx`, `.ts`, `.md`) must remain strictly under 300 lines. If a file approaches 300 lines, it must be bifurcated into focused sub-modules or sharded volumes.
2. **Index-Ahead Directory Manifests:**  
   Every modularized component suite has an `index.ts` or `INDEX.md` manifest at its root describing every exported module, its purpose, and line count so any agent or developer knows what is inside before reading.
3. **Zero Monoliths Policy:**  
   No mega-files. Fast, compartmentalized reading, zero re-render bloat, and clean git diffs.

---

## 📚 2. RECORD FILES INVENTORY (`.context/`)

| File | Scope & Contents | Lines | Status |
| :--- | :--- | :--- | :--- |
| **[INDEX.md](file://.context/INDEX.md)** | Master records registry, 300-line standard, directory manifests (This file) | ~110 | Active |
| **[CODEBASE_MAP.md](file://.context/CODEBASE_MAP.md)** | "Kya Cheez Kidhar Hai" — Master directory and route index | ~295 | Active |
| **[ARCHITECTURE.md](file://.context/ARCHITECTURE.md)** | System topology, tech stack (Next.js 16/React 19/Tailwind v4), data flow | ~285 | Active |
| **[DATABASE.md](file://.context/DATABASE.md)** | Cloud Firestore collections, schemas, indexes, and fallback stores | ~241 | Active |
| **[DECISIONS.md](file://.context/DECISIONS.md)** | Architectural Decision Records (ADR-001 to ADR-034 Master Table) | ~57 | Active |
| ↳ **[decisions/ADR_VOL1.md](file://.context/decisions/ADR_VOL1.md)** | ADR-001 to ADR-015: Core, Auth, 3D Pipeline, PWA, Mobile Rework, Hierarchy | ~168 | Sharded |
| ↳ **[decisions/ADR_VOL2.md](file://.context/decisions/ADR_VOL2.md)** | ADR-016 to ADR-024: Slide Drawer, Desktop Portal 5 Mockups, Materials, Roles | ~82 | Sharded |
| ↳ **[decisions/ADR_VOL3.md](file://.context/decisions/ADR_VOL3.md)** | ADR-025 to ADR-034: Gemini AI, Rulebook Copilot, SPA Bus, Modular Bifurcations | ~105 | Sharded |
| **[CONTEXT.md](file://.context/CONTEXT.md)** | Vehicle engineering specs, 9 squads summary, runtime constraints | ~150 | Active |
| **[HANDOVER.md](file://.context/HANDOVER.md)** | In-flight session continuity, verified commits, and next steps | ~70 | Active |

---

## 🌐 3. NEXT.JS PAGE ROUTES INVENTORY (`web/src/app/`)
*All 16 page routes are strictly under 300 lines (average: ~92 lines).*

| Route | File Path | Lines | Core Responsibility |
| :--- | :--- | :--- | :--- |
| `/` | `web/src/app/page.tsx` | 18 | Landing page orchestrator (Hero, Overview, Showcase, Footer) |
| `/dashboard` | `web/src/app/dashboard/page.tsx` | **267** | Operations nexus orchestrator (10 operational views + modals) |
| `/login` | `web/src/app/login/page.tsx` | **142** | Member 6-digit PIN authentication portal & OTP reset orchestrator |
| `/contact` | `web/src/app/contact/page.tsx` | **59** | Sponsorship & institutional inquiry form + leadership contacts |
| `/log` | `web/src/app/log/page.tsx` | **237** | Workshop daily build log timeline, media feed & review submission |
| `/copilot` | `web/src/app/copilot/page.tsx` | **166** | Season 7.0 Rulebook AI assistant full-screen chat interface |
| `/competition` | `web/src/app/competition/page.tsx` | 283 | SIEP Season 7.0 dynamic trials, scoring, and event regulations |
| `/about` | `web/src/app/about/page.tsx` | 188 | SNJB engineering legacy & team story showcase |
| `/bike` | `web/src/app/bike/page.tsx` | 82 | Staged engineering prototype testing showcase (ADR-031/032) |
| `/tasks` | `web/src/app/tasks/page.tsx` | 5 | Deep-link redirect to `/dashboard?tab=team_tasks` |
| `/teams` | `web/src/app/teams/page.tsx` | 5 | Deep-link redirect to `/dashboard?tab=teams` |
| `/materials` | `web/src/app/materials/page.tsx` | 5 | Deep-link redirect to `/dashboard?tab=materials` |
| `/reports` | `web/src/app/reports/page.tsx` | 5 | Deep-link redirect to `/dashboard?tab=metrics` |
| `/roles` | `web/src/app/roles/page.tsx` | 5 | Deep-link redirect to `/dashboard?tab=roles` |
| `/profile` | `web/src/app/profile/page.tsx` | 5 | Deep-link redirect to `/dashboard?tab=profile` |
| `/build-log` | `web/src/app/build-log/page.tsx` | 5 | Deep-link redirect to `/log` |

---

## 🧩 4. MODULAR COMPONENT SUITES & INDEX MANIFESTS

| Suite Directory | Index Manifest | Sub-Files | Max File Lines | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `web/src/components/dashboard/hooks/` | [index.ts](file://web/src/components/dashboard/hooks/index.ts) | 5 hooks | 296 (`useDashboardTaskActions.ts`) | Data sync, URL navigation, search filters, task actions, admin backup |
| `web/src/components/dashboard/layout/` | [index.ts](file://web/src/components/dashboard/layout/index.ts) | 2 layout hosts | 203 (`DashboardModalsHost.tsx`) | 10-tab router switcher and consolidated 7-dialog modals host |
| `web/src/components/dashboard/tasks/` | [index.ts](file://web/src/components/dashboard/tasks/index.ts) | 5 modules | 284 (`DesktopTaskTable.tsx`) | Team Kanban board, mobile task list, filter pills, badge utils |
| `web/src/components/dashboard/materials/` | [index.ts](file://web/src/components/dashboard/materials/index.ts) | 5 modules | 295 (`MaterialsTable.tsx`) | Research paper table, batch upload modal, Google Drive streaming |
| `web/src/components/dashboard/roles/` | [rolesConfig.ts](file://web/src/components/dashboard/roles/rolesConfig.ts) | 8 modules | 290 (`EditMemberModal.tsx`) | Parth Kshirsagar master role console, appointment modals, table |
| `web/src/components/login/` | [index.ts](file://web/src/components/login/index.ts) | 3 modules | 282 (`ForgotPinModal.tsx`) | Login card, hero brand header, and OTP PIN reset workflow |
| ↳ `web/src/components/login/forgot/` | [index.ts](file://web/src/components/login/forgot/index.ts) | 4 steps | 114 (`ForgotOtpStep.tsx`) | 4-step dialog: email input, 6-digit OTP code, new PIN, success |
| `web/src/components/contact/` | [index.ts](file://web/src/components/contact/index.ts) | 4 modules | 219 (`InquiryForm.tsx`) | Support areas, dual FormSubmit/Web3Forms inquiry form, key contacts |
| `web/src/components/log/` | [index.ts](file://web/src/components/log/index.ts) | 8 modules | 295 (`LogDesktopView.tsx`) | Build log data hook, modals host, mobile/desktop views, modals |
| `web/src/components/copilot/` | [index.ts](file://web/src/components/copilot/index.ts) | 6 modules | 260 (`MarkdownMessage.tsx`) | Header, message stream, citation badges, quick pills, input bar |
| `web/src/components/bike/` | [bikeSpecsData.ts](file://web/src/components/bike/bikeSpecsData.ts) | 8 modules | 285 (`BikeSchematicViewer.tsx`) | 2D vector CAD blueprint, 8-subsystem explorer, CAE/CFD validation |
| `web/src/components/navigation/` | [navConfig.ts](file://web/src/components/navigation/navConfig.ts) | 6 modules | 280 (`MobileSlideDrawer.tsx`) | Desktop portal pills, public nav, user dropdown, PWA bottom dock |
| `web/src/components/team/` | [index.ts](file://web/src/components/team/index.ts) | 5 modules | 225 (`MobileTeamAccordion.tsx`) | Public crew showcase, domain normalization, member card, accordion |
