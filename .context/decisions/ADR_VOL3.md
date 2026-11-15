# 📜 ADR VOLUME 3 (ADR-025 to ADR-034)
> **AI Copilot Grounding, Event-Driven Architecture, Staging & 300-Line Modular Bifurcation**  
> *Parent Index:* [.context/DECISIONS.md](file://.context/DECISIONS.md)  
> *Scope: Multi-document Gemini batch upload, Rulebook AI Copilot, SPA notification bus, 3D model staging/detachment, Round 3 component bifurcation, and Round 4 universal 300-line page bifurcation.*

---

## 📑 VOLUME 3 INDEX
| ADR | Title | Date | Status |
| :--- | :--- | :--- | :--- |
| **ADR-025** | Multi-Document Batch Upload, Gemini AI Auto-Bifurcation, Tag Indexing & Personal Deck Alerts | 2026-11-13 | Accepted |
| **ADR-026** | Official SIEP Season 7.0 Rulebook AI Copilot with Non-Overridable Citations | 2026-11-13 | Accepted |
| **ADR-027** | AI Copilot Dual-Domain Grounding, Gemini 2.5 Flash Engine & Zero-Dependency Rich Markdown | 2026-11-14 | Accepted |
| **ADR-028** | Seamless Event-Driven Notification Bus, SPA Navigation & Real-Time Deck Sync | 2026-11-15 | Accepted |
| **ADR-029** | Modular Bifurcation of Monolithic Dashboard & Activity Log Engines | 2026-11-15 | Accepted |
| **ADR-030** | Modular Bifurcation of Navigation Engine & Task Detail Modal | 2026-11-15 | Accepted |
| **ADR-031** | Complete Rework of The Bike Page Architecture & 3D Model Staging Protocol | 2026-11-15 | Accepted |
| **ADR-032** | Staging "The Bike" in Testing/Validation Phase & Detachment from Public Navigation | 2026-11-15 | Accepted |
| **ADR-033** | Modular Bifurcation of Tasks Engine, Materials Repository & Public Team Showcase | 2026-11-15 | Accepted |
| **ADR-034** | Universal 300-Line Upper Bound & Modular Bifurcation of Next.js Page Routes | 2026-11-15 | Accepted |

---

## 🚀 ADR-025: Multi-Document Batch Upload, Gemini AI Auto-Bifurcation & Tag Indexing
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Batch document uploads required automatic squad categorization and high-speed keyword search.
- **Decision:** Batch file upload queue with review table. Integrated Gemini 1.5 Flash API with domain heuristic fallbacks. Extracted searchable technical tags (#BMS, #CAN-bus, etc.) and personalized alerts for member domains.

---

## 🛡️ ADR-026: Official SIEP Season 7.0 Rulebook AI Copilot with Non-Overridable Citations
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Rulebook queries must be strictly grounded in the official 46-page rulebook with zero hallucination.
- **Decision:** Optical character recognition of `Rulebook-V-1.0.pdf` into `web/data/siep_rulebook_index.json`. Grounding service retrieves top scoring rulebook pages. Server-side non-overridable citation injection (`Section` and `Page`). Interactive drawer and `/copilot` dedicated route.

---

## ⚡ ADR-027: AI Copilot Dual-Domain Grounding, Gemini 2.5 Flash Engine & Zero-Dependency Markdown
- **Date:** 2026-11-14 | **Status:** Accepted & Implemented
- **Context:** Copilot required dual-domain knowledge (Rulebook + Vehicle Specifications) and rich formatting.
- **Decision:** Dual grounding in Rulebook v1.0 and `EVERYTHINGUWANNAKNOW.MD`. Model set to `gemini-2.5-flash` with deterministic semantic fallback for offline/keyless environments. Built zero-dependency `MarkdownMessage.tsx` renderer.

---

## 🔔 ADR-028: Seamless Event-Driven Notification Bus, SPA Navigation & Real-Time Deck Sync
- **Date:** 2026-11-15 | **Status:** Accepted & Implemented
- **Context:** Notification links caused full-page refreshes; task modals failed to open on deep links; duplicate alerts.
- **Decision:** Replaced hard reloads with custom event transitions (`siep_tab_change`, `siep_open_task`). Aliased `tasks` to `team_tasks`. Added composite key deduplication. Real-time bell count sync across desktop and mobile.

---

## 🧩 ADR-029: Modular Bifurcation of Monolithic Dashboard & Activity Log Engines
- **Date:** 2026-11-15 | **Status:** Accepted & Implemented
- **Context:** `web/src/app/log/page.tsx` was 2,449 lines; `RolesManagementTab.tsx` was 1,530 lines.
- **Decision:** Bifurcated `log/page.tsx` into 8 sub-modules in `web/src/components/log/` (-82.2%). Bifurcated `RolesManagementTab.tsx` into 8 sub-modules in `web/src/components/dashboard/roles/` (-75.0%).

---

## 🧩 ADR-030: Modular Bifurcation of Navigation Engine & Task Detail Modal
- **Date:** 2026-11-15 | **Status:** Accepted & Implemented
- **Context:** `Navigation.tsx` (1,569 lines) and `TaskDetailModal.tsx` (1,259 lines) were oversized.
- **Decision:** Segmented `Navigation.tsx` into 6 sub-components in `web/src/components/navigation/` (-78.8%). Segmented `TaskDetailModal.tsx` into 9 sub-components in `web/src/components/tasks/modal/` (-51.9%).

---

## 🏍️ ADR-031: Complete Rework of The Bike Page Architecture & 3D Model Staging Protocol
- **Date:** 2026-11-15 | **Status:** Accepted & Implemented
- **Context:** `/bike` page was a basic placeholder. 3D WebGL model needed staging pending pre-competition scrutiny.
- **Decision:** Removed 3D model from `/bike` and home page canvas. Created 2D vector technical blueprint `BikeSchematicViewer.tsx` with millimeter dimensions and 6 hotspots. Subsystem matrix, CAE validation cards, and proving ground trials in `web/src/components/bike/`.

---

## 🧪 ADR-032: Staging "The Bike" in Testing/Validation Phase & Detachment from Public Navigation
- **Date:** 2026-11-15 | **Status:** Accepted & Implemented
- **Context:** Leadership directive: Keep `/bike` in testing phase, detached from public menus until physical vehicle assembly is complete.
- **Decision:** Detached `/bike` from `DesktopPublicNav.tsx`, `MobileSlideDrawer.tsx`, and `GlobalMobileBottomBar.tsx`. Added industrial `Engineering Prototype // Testing Phase` amber banner to `/bike`. Direct URL access preserved at `/bike` for internal scrutiny.

---

## 🧩 ADR-033: Modular Bifurcation of Tasks Engine, Materials Repository & Public Team Showcase
- **Date:** 2026-11-15 | **Status:** Accepted & Implemented
- **Context:** 3 remaining components exceeded 1,000 lines: `TeamTasksTab.tsx` (1,213 lines), `MaterialsTab.tsx` (1,169 lines), and `TeamSection.tsx` (1,072 lines).
- **Decision:** Segmented `TeamTasksTab.tsx` into 5 sub-modules in `web/src/components/dashboard/tasks/` (-81.0%). Segmented `MaterialsTab.tsx` into 5 sub-modules in `web/src/components/dashboard/materials/` (-64.2%). Segmented `TeamSection.tsx` into 5 sub-modules in `web/src/components/team/` (-71.4%). Combined line reduction: -72.4%.

---

## 🧩 ADR-034: Universal 300-Line Upper Bound & Modular Bifurcation of Next.js Page Routes
- **Date:** 2026-11-15 | **Status:** Accepted & Implemented
- **Context:**
  - 5 Next.js page routes in `web/src/app/` exceeded 300 lines: `dashboard/page.tsx` (1,173 lines), `login/page.tsx` (724 lines), `contact/page.tsx` (534 lines), `log/page.tsx` (436 lines), and `copilot/page.tsx` (347 lines).
  - User rule: Any file exceeding 300 lines must be bifurcated with index-ahead manifests so agents know what is inside before reading.
- **Decisions:**
  1. **Strict 300-Line Limit:** Enforced that no file in `web/src/app` or `.context` shall exceed 300 lines.
  2. **Page Bifurcations:**
     - `dashboard/page.tsx`: Extracted 4 hooks (`useDashboardData`, `useDashboardNavigation`, `useDashboardFilters`, `useDashboardTaskActions`, `useDashboardBackup`) and 2 layout wrappers (`DashboardTabContent`, `DashboardModalsHost`). Page lines: 1,173 $\rightarrow$ 267.
     - `login/page.tsx`: Extracted `ForgotPinModal` (and sharded it into 4 sub-steps in `login/forgot/`), `LoginFormCard`, and `LoginHeroHeader`. Page lines: 724 $\rightarrow$ 142.
     - `contact/page.tsx`: Extracted `SupportAreasGrid`, `InquiryForm`, `KeyTeamContacts`, and `CampusLocationBanner`. Page lines: 534 $\rightarrow$ 59.
     - `log/page.tsx`: Extracted `useLogData` and `LogModalsHost`. Page lines: 436 $\rightarrow$ 237.
     - `copilot/page.tsx`: Extracted `CopilotHeader`, `CopilotMessageList`, `CopilotPromptPills`, and `CopilotInputForm`. Page lines: 347 $\rightarrow$ 166.
  3. **Index-Ahead Directory Manifests:** Created `index.ts` manifests in all split component folders.
  4. **Record Files Sharding:** Sharded `DECISIONS.md` into 3 indexed volumes (`ADR_VOL1.md`, `ADR_VOL2.md`, `ADR_VOL3.md`) with a master index table.
- **Consequences:**
  - Zero pages in `web/src/app/` exceed 300 lines (maximum is `competition/page.tsx` at 283 lines).
  - Total page lines dropped from 3,820 to 1,477 (-61.3%).
  - Fast, modular developer & AI agent comprehension.
