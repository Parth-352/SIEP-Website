# 📜 ADR VOLUME 1 (ADR-001 to ADR-015)
> **Foundational Systems, Authentication, Mobile UI Rework & Hierarchy Controls**  
> *Parent Index:* [.context/DECISIONS.md](file://.context/DECISIONS.md)  
> *Scope: Foundational architecture, PIN authentication, multi-squad assignment, 3D asset pipeline, PWA docking, mobile UI redesign, and hierarchy-gated task completion.*

---

## 📑 VOLUME 1 INDEX
| ADR | Title | Date | Status |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Next.js 16 App Router + React 19 + Tailwind CSS v4 | 2026-11-10 | Accepted |
| **ADR-002** | Dual-Store Authentication & Session Engine (PIN + Firestore) | 2026-11-10 | Accepted |
| **ADR-003** | Multi-Squad Member Assignment (`secondaryTeams`) | 2026-11-10 | Superseded (by ADR-021) |
| **ADR-004** | Direct Resumable Uploads for Large CAD Assets (5 GB Bypass) | 2026-11-10 | Accepted |
| **ADR-005** | Decoupled 3D Asset Pipeline (Blender to Compressed WebGL) | 2026-11-10 | Accepted |
| **ADR-006** | Version-Controlled Agent Context & Handover Standard | 2026-11-10 | Accepted |
| **ADR-007** | Member Profile Customization, Canvas Image Compression & Roster Sync | 2026-11-11 | Accepted |
| **ADR-008** | Mobile Profile UX Refinement, PWA Banner De-clutter & Native Photo Action Sheet | 2026-11-11 | Accepted |
| **ADR-009** | Strict PIN Invalidation, Priority Squad Sorting & Minimal Bottom Action Sheet | 2026-11-12 | Accepted |
| **ADR-010** | Equal Domain Representation in Member Profile | 2026-11-12 | Accepted |
| **ADR-011** | Restrict Bottom Navigation Dock Strictly to Standalone Mobile Web App (PWA) | 2026-11-12 | Accepted |
| **ADR-012** | Mobile UI Rework — Single Responsibility Operational Views | 2026-11-12 | Accepted |
| **ADR-013** | Build Log Mobile Rework & 5-Status Engineering Workflow | 2026-11-13 | Accepted |
| **ADR-014** | Strict Domain-Scoped Task Isolation & 4-Tile Status Uniformity | 2026-11-13 | Accepted |
| **ADR-015** | Hierarchy-Gated Task Completion & Review Observation Protocol | 2026-11-13 | Accepted |

---

## 📌 ADR-001: Next.js 16 App Router + React 19 + Tailwind CSS v4
- **Context:** The project required a modern, performant web application capable of rendering high-framerate 3D WebGL scenes alongside a responsive team Kanban dashboard.
- **Decision:** Adopted Next.js 16 with React 19 and Tailwind CSS v4.
- **Consequences:**
  - Tailwind v4 uses `@theme` CSS directives; avoid creating or demanding legacy `tailwind.config.js` with v3 plugins.
  - React 19 brings concurrent rendering improvements but requires `@react-three/fiber` compatible versions (`^9.8.1`).
  - Strict server-vs-client component separation: Interactive Three.js canvases and client state must use `'use client'` with SSR disabled.

---

## 📌 ADR-002: Dual-Store Authentication & Session Engine (PIN + Firestore)
- **Context:** Team members work in the college workshop and pit garage on mobile phones and shared laptops. Requiring complex email confirmation loops or OAuth logins caused friction and lockouts.
- **Decision:**
  - Every member has an assigned 6-digit numeric PIN (defaulting to `935200`).
  - Members can self-service update their PIN from the dashboard (`/api/change-password`).
  - Authentication checks Cloud Firestore first (`member_passwords` & `team_passwords`), falling back to local memory store (`src/lib/store.ts`).
  - Authenticated session is stored in an HTTP cookie (`siep_session`) with a lightweight JSON payload decoded by `decodeSession()`.
- **Consequences:**
  - Fast, reliable login even during intermittent college Wi-Fi connectivity.
  - Zero third-party OAuth redirect dependencies in the pit garage.
  - **Rule:** Do NOT replace this with NextAuth/Clerk without explicit human instruction.

---

## 📌 ADR-003: Multi-Squad Member Assignment (`secondaryTeams`)
- **Context:** In collegiate racing teams, core members often wear multiple hats (e.g., working on both `chassis` and `suspension`, or `telemetry` and `electronics`). A strict single-team schema caused members to miss relevant tasks.
- **Decision:**
  - Extended `UserProfile` and member models with `secondaryTeams?: TeamId[]`.
  - Added `domainViewScope: 'assigned' | 'all'` to the Kanban dashboard.
  - When `'assigned'`, members see tasks across all squads they belong to; Core Admins retain access to all squads.
- **Consequences:**
  - Flexible squad collaboration without duplicating task items or splitting user identities.

---

## 📌 ADR-004: Direct Resumable Uploads for Large CAD Assets (5 GB Bypass)
- **Context:** CAD models (`.step`, `.stl`, `.iges`) and competition videos easily exceed 50 MB - 1 GB. Serverless platforms (like Vercel) strictly enforce payload caps (~4.5 MB).
- **Decision:**
  - Implement a direct resumable chunked upload protocol streaming directly to Google Drive API / Google Apps Script.
  - The Next.js API route only negotiates the session URI; binary chunks never pass through the serverless function runtime.
- **Consequences:**
  - Enables up to 5 GB uploads with progress indicators and automatic retry logic.

---

## 📌 ADR-005: Decoupled 3D Asset Pipeline (Blender to Compressed WebGL)
- **Context:** The authoritative engineering model in Blender (`Electric_Scrambler_Exo.blend`) contains 111 objects, high-poly CAD geometry, and heavy procedural shaders unsuitable for direct web delivery.
- **Decision:**
  - Maintain the authoritative master CAD/Twin in `Electric_Scrambler_Exo.blend`.
  - Process web assets through Draco geometry compression into `moto.glb` (1.4 MB) and `chassis.glb` (1.0 MB) in `/web/public/`.
  - Load 3D assets on client side only using `@react-three/drei`'s `useGLTF` with Suspense fallbacks.
- **Consequences:**
  - Sub-second 3D model loads on 4G/5G mobile devices while preserving complete visual fidelity.

---

## 📌 ADR-006: Version-Controlled Agent Context & Handover Standard
- **Context:** Long coding breaks lead to context decay, forgotten state, and broken builds when new agent sessions take over.
- **Decision:**
  - Repository contains an `AGENTS.md` root playbook and a dedicated `.context/` memory hub.
  - Before pausing development, agents/developers update `.context/HANDOVER.md`.
  - On resumption, agents execute the wake-up protocol (git status, typecheck, handover review).
- **Consequences:**
  - Zero context loss across weeks of downtime. Instant continuity for any AI assistant.

---

## 📌 ADR-007: Member Profile Customization, Canvas Image Compression & Roster Sync
- **Context:** Team members needed the ability to personalize their display names and profile pictures from the dashboard settings, while having those updates automatically appear on the public team page (`/about#team`), the bottom navigation dock, and throughout the portal. Furthermore, security requirements dictated that if a user already knows their current PIN, they should be able to change it directly without waiting for an OTP, whereas users who forget their PIN can trigger a secure 6-digit email OTP dispatch to their registered college Gmail.
- **Decision:**
  - Direct PIN change vs OTP recovery flow in `PinChangeForm.tsx`.
  - Client-side Canvas square compression into WebP/JPEG data URLs (~20–35 KB).
  - Cloud Firestore storage (`member_profiles`) keyed by clean email.
  - Public team sync (`TeamSection.tsx`) dynamically displaying custom portraits.
- **Consequences:**
  - Instant avatar and name reflection across all views without hard-reloading.
  - Zero storage quota bloat on serverless hosting.

---

## 📌 ADR-008: Mobile Profile UX Refinement, PWA Banner De-clutter & Native Photo Action Sheet
- **Context:** On mobile devices, the Profile view had visual competition from the persistent top `<DashboardHeader>` and `<ActionableKpiRibbon>`, and fixed floating install banners obstructed bottom navigation tabs.
- **Decision:**
  - Header & KPI ribbon suppression on `activeTab === 'profile'`.
  - PWA bottom mobile banner removed from `PwaInstallProvider.tsx`.
  - Native photo action sheet with full-resolution photo preview, upload, and remove actions.
- **Consequences:**
  - Zero floating banner overlap on mobile viewports; clean settings sheets.

---

## 🏛️ ADR-009: Strict PIN Invalidation, Priority Squad Sorting & Minimal Bottom Action Sheet
- **Date:** 2026-11-12 | **Status:** Accepted & Implemented
- **Context:** Fallback default PIN `935200` allowed entry even after PIN changes. Squads were unsorted for multi-squad members.
- **Decision:**
  - Single-PIN invalidation: if custom PIN exists, entering `935200` strictly fails.
  - Priority squad sorting: member's squads always render first at the top of the grid.
  - Minimal '+' action sheet: fast, clean, distraction-free creation.

---

## 🏛️ ADR-010: Equal Domain Representation in Member Profile
- **Date:** 2026-11-12 | **Status:** Accepted & Implemented
- **Context:** Profile accordion classified squads into primary vs secondary domains.
- **Decision:** Unified all assigned domains equally with official squad badges and engineering domain descriptions.

---

## 🏛️ ADR-011: Restrict Bottom Navigation Dock Strictly to Standalone Mobile Web App (PWA)
- **Date:** 2026-11-12 | **Status:** Accepted & Implemented
- **Context:** Bottom dock rendered on desktop and standard mobile Chrome, colliding with browser toolbars.
- **Decision:** Guarded `<BottomNav>` strictly by `isStandalone` (W3C standalone mode, iOS standalone, Android TWA). Zero DOM nodes rendered in standard browsers.

---

## 🏛️ ADR-012: Mobile UI Rework — Single Responsibility Operational Views
- **Date:** 2026-11-12 | **Status:** Accepted & Implemented
- **Context:** Mobile UI showed overlapping KPIs across dashboard, team tasks, and workbench.
- **Decision:** Single-responsibility architecture: Dashboard = Observe, Team Tasks = Manage, Assigned = Execute.

---

## 🏛️ ADR-013: Build Log Mobile Rework & 5-Status Engineering Workflow
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Workshop build logging required mobile-first 5-status engineering workflow.
- **Decision:** Extended `WorkLog` with `LogWorkStatus`, prominent add button, 5 live KPI tiles, and chronological media feed.

---

## 🏛️ ADR-014: Strict Domain-Scoped Task Isolation & 4-Tile Status Uniformity
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Task dropdowns allowed picking irrelevant foreign squads; inconsistent summary tile numbers.
- **Decision:** Scoped task queries strictly to member's assigned domains; unified 4-tile summary row (`Total`, `In Progress`, `Under Review`, `Completed`).

---

## 🏛️ ADR-015: Hierarchy-Gated Task Completion & Review Observation Protocol
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Any member could transition tasks directly to Completed, bypassing quality review.
- **Decision:** Strict authority gate: only Squad Leads and Core Leadership can approve and mark tasks as Completed across API, cards, modals, and kanban boards.
