# 📜 ARCHITECTURE DECISION RECORDS (ADRs)
> **Permanent Record of Architectural Trade-offs and Invariant Constraints**  
> *Project: Riders Bay Smart Scrambler E-Bike (SIEP Season 7.0)*  
> *These decisions are intentional. Agents must consult these before proposing major refactorings.*  
> *Last Synced:* 2026-11-12 (Daily Codebase Context Sync)

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
  - **Direct PIN Change vs. OTP Recovery:** Implemented a dual security flow in `PinChangeForm.tsx`. Direct changes verify `currentPin` -> `newPin` -> `confirmPin` via `/api/change-password`. Forgotten PIN triggers an in-page modal calling `/api/forgot-password` (`request` -> `verify` -> `reset`).
  - **Client-Side Canvas Compression:** Avatar uploads are cropped to square and compressed via HTML5 Canvas into lightweight WebP/JPEG data URLs (~20–35 KB). This eliminates unnecessary third-party bucket storage costs and guarantees sub-second rendering.
  - **Cloud Firestore Storage (`member_profiles`):** Custom profile data (`displayName`, `photoUrl`, `bio`, `updatedAt`) is keyed by member email (`member_profiles/${cleanEmail}`) and synchronized across sessions.
  - **Public Team Sync (`TeamSection.tsx`):** Both Desktop `MemberCard` and Mobile `MobileTeamAccordion` dynamically fetch `/api/profile` and map member names to official roster emails, seamlessly replacing static initials with custom portraits and updated display names.
- **Consequences:**
  - Instant avatar and name reflection across all views without hard-reloading.
  - Zero storage quota bloat on serverless hosting.
  - Smooth user experience with no OTP friction for routine PIN adjustments.

---

## 📌 ADR-008: Mobile Profile UX Refinement, PWA Banner De-clutter & Native Photo Action Sheet

- **Context:** On mobile devices, the Profile view had visual competition from the persistent top `<DashboardHeader>` and `<ActionableKpiRibbon>`. In addition, `PwaInstallProvider` rendered a fixed floating bottom banner (`showBanner && !isInstalled`) above the mobile dock, which obstructed bottom navigation tabs and triggered accidental touches. Furthermore, members needed standard mobile photo management workflows: previewing the full-resolution uploaded avatar in a lightbox, uploading/updating a photo, or removing their photo to restore their CAD monogram initials.
- **Decision:**
  - **Header & KPI Ribbon Suppression:** In `web/src/app/dashboard/page.tsx`, conditioned `<DashboardHeader>` and `<ActionableKpiRibbon>` on `activeTab !== 'profile'`, allowing the Profile view to function as a full-screen, dedicated identity workspace without redundant dashboard headers.
  - **PWA Mobile Banner Removal:** Removed the fixed bottom banner from `PwaInstallProvider.tsx`. The install prompt remains accessible on-demand from header buttons and settings without obstructing mobile navigation docks.
  - **Native Photo Action Sheet:** In `ProfileView.tsx`, clicking the profile avatar opens an action sheet modal with options:
    - *View Full Photo* (available when a photo exists, opens a lightbox preview modal).
    - *Upload Profile Picture* / *Upload New Photo* (triggers native file input for square canvas compression).
    - *Remove Photo* (deletes the photo from Firestore `member_profiles` and local session).
    - *Cancel*.
  - **Collapsible Secondary Domains:** Secondary team domains are housed in an expandable/collapsible card to keep vertical scroll clean on mobile devices.
- **Consequences:**
  - Zero floating banner overlap on mobile viewports.
  - Clean, focused mobile profile experience with high UX parity with native iOS/Android settings sheets.
  - Intuitive avatar inspection and management.

---

## 🏛️ ADR-009: Strict PIN Invalidation, Priority Squad Sorting & Minimal Bottom Action Sheet
- **Date:** 2026-11-12
- **Status:** Accepted & Implemented
- **Context:**
  1. Previously, `api/passwords` and `api/change-password` contained a fallback clause allowing the default PIN `935200` to grant entry even after a member set a custom PIN. This defeated password rotation security.
  2. In the Dashboard Overview and Subsystems tab, competition squads were displayed in a static array order, causing members assigned across multiple secondary domains to find their squads scattered across lower grid rows.
  3. The bottom dock `+` action menu had verbose descriptions and opened a secondary "Operations Hub" modal with redundant navigation cards and install prompts.
- **Decision:**
  1. **Strict Single-PIN Invalidation:** Removed all default PIN fallbacks when `customPass` exists in Firestore or local store. If a custom PIN exists, entering `935200` strictly fails. Default PIN remains valid only for un-customized accounts until first rotation.
  2. **Priority Squad Sorting:** Implemented `prioritizedTeams = useMemo(...)` in both `DashboardOverviewTab.tsx` and `SubsystemsTab.tsx` prioritizing `memberDomainIds.includes(team.id)`. The user's primary and secondary squads always render first at the top of the grid.
  3. **Minimal '+' Action Sheet:** Replaced verbose text with clean copy (`Create`, `Log Build Step: Upload video proof`, `New Deliverable: Add to subsystem board`, `Cancel`). Completely excised `OperationsHubModal` and unused triggers.
- **Consequences:**
  - Robust authentication model preventing unauthorized default credential reuse.
  - Immediate high-visibility velocity tracking for member's own domains.
  - Ultra-fast, distraction-free action creation on mobile and desktop.

---

## 🏛️ ADR-010: Equal Domain Representation in Member Profile
- **Date:** 2026-11-12
- **Status:** Accepted & Implemented
- **Context:** The profile accordion previously divided assigned domains into a highlighted "Primary Domain" card and a subdued "Secondary Domains" pill section. In student multi-disciplinary engineering squads, domain involvement is peer-level and equal.
- **Decision:** Excised the hierarchical "Primary" and "Secondary" classification from the profile view (`ProfileView.tsx`). All assigned domains (`[user.teamId, ...(user.secondaryTeams || [])]`) are unified and rendered equally with consistent card styling, official squad badge, and engineering domain description.
- **Consequences:** Clean, non-hierarchical domain presentation celebrating members' multi-squad responsibilities equally.

---

## 🏛️ ADR-011: Restrict Bottom Navigation Dock Strictly to Standalone Mobile Web App (PWA)
- **Date:** 2026-11-12
- **Status:** Accepted & Implemented
- **Context:** Previously, the Instagram-style bottom navigation dock rendered unconditionally on all web browsers (including desktop Chrome/Safari and mobile Chrome/Safari). In standard mobile and desktop web browsers, this bottom floating dock collided with browser navigation toolbars, consumed viewport height, and gave the website the appearance of a forced mobile app when visitors or team members were simply browsing the site. Furthermore, the desktop and mobile website already feature responsive top-level navigation (header logo, hamburger drawer menu, and top `DashboardTabBar`).
- **Decision:**
  1. **Web Standard Display Mode Detection:** Implemented `checkIsStandalone()` in `PwaInstallProvider.tsx` combining W3C standard `display-mode: standalone`, `fullscreen`, and `minimal-ui`, iOS Safari `(navigator).standalone === true`, Android TWA referrer `android-app://`, and developer testing query params `?app=standalone`.
  2. **Reactive State Tracking:** Added a media query change listener to `window.matchMedia('(display-mode: standalone)')` to ensure immediate reactive state sync when display modes change (e.g. Chrome DevTools device mode emulation).
  3. **Zero DOM Loading in Browsers:** In `web/src/app/dashboard/page.tsx` and `web/src/components/Navigation.tsx`, `<BottomNav>` and the global bottom bar are strictly guarded by `isStandalone`. When opened in standard browsers (desktop or mobile Chrome/Safari), bottom navigation is completely omitted from the React render tree (0 DOM nodes, zero event listeners, zero interference).
  4. **Dynamic Container Bottom Padding:** On `/dashboard`, `main` bottom padding dynamically adjusts between `pb-12 sm:pb-16` in browser mode and `pb-32 sm:pb-24` in standalone mode, removing the empty 128px white space when running in mobile Chrome.
  5. **Clean Login Screen:** Suppressed bottom navigation on `/login` in standard browsers so the login view renders as a focused, distraction-free authentication card.
- **Consequences:**
  - Pristine, native-feeling website browsing in Chrome on mobile and desktop without invasive bottom floating docks.
  - Retains the full app-like Instagram navigation dock, safe-area inset padding, and thumb-friendly controls exclusively when launched as an installed Mobile Web App from the device home screen.

---

## 🏛️ ADR-012: Mobile UI Rework — Single Responsibility Operational Views (Dashboard, Team Tasks, Assigned & Uniform '+' Create)
- **Date:** 2026-11-12
- **Status:** Accepted & Implemented
- **Context:** The mobile web app previously displayed overlapping information across operations pages: project-level KPIs appeared repeatedly on Team Tasks and Assigned, secondary page tabs duplicated the persistent bottom dock, search and filters appeared in unnecessary places, and the 4-column Kanban board stacked into 4 tall vertical columns on mobile screens. Furthermore, the '+' Create action sheet had mismatched card styles, unequal heights, and different backgrounds.
- **Decision:** Implemented the single-responsibility architecture defined in *Riders Bay Mobile UI Rework PRD v1.0*:
  1. **Core Principle:** Dashboard = Observe. Team Tasks = Manage. Assigned = Execute.
  2. **Uniform '+' Create Menu (`BottomNav.tsx`):** Unified both *Log Build Step* and *New Deliverable* cards with equal heights, light amber borders (`border-amber-200/80 bg-amber-50/30`), matching icon containers, and right arrows.
  3. **Dashboard (Observe) (`DashboardOverviewTab.tsx`):** Mobile view features the compact project header (`SIEP E-Bike 2026-27`), 2x2 project KPI grid (`Total`, `Completed`, `Due Soon`, `Overdue`), compact subsystem progress bars, and recent activity timeline feed with real data.
  4. **Team Tasks (Manage) (`TeamTasksTab.tsx`):** Features 3-tile task summary (Total, In Progress, Completed), search, squad/priority filters, 4 status chips (`To Do`, `In Progress`, `Under Review`, `Completed`), and single-status task list showing scannable cards with domain short codes (`MECH`, `POW`, `BATT`, `E&E`, `SOFT`, `DOCS`).
  5. **Assigned (Execute) (`MyWorkbenchTab.tsx`):** Features 4 personal KPI tiles, personal search and domain/priority filters, status tabs, and cards strictly scoped to the logged-in user.
  6. **Desktop Invariant:** All changes are strictly scoped to mobile breakpoints (`md:hidden`). Desktop screens (`hidden md:block`) retain the full 4-column drag-and-drop Kanban board, top `DashboardTabBar`, and existing layout with zero regression.
- **Consequences:**
  - High signal-to-noise ratio on mobile with no repeated KPIs or duplicate tab bars.
  - Native mobile app feel on small viewports while preserving complete desktop operations tooling.

---

## ADR-013: Build Log Mobile Rework & 5-Status Engineering Workflow
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:** User requested redesign of the `/log` page on mobile matching mockup `media_1794510271459_0a6999fe.jpg`, requiring one prominent "+ Add Build Log" button, 5 simple work statuses (`In Progress`, `Testing`, `Completed`, `On Hold`, `Needs Review`), single team dropdown, search and status filters together, chronological activity feed with video previews, compact cards, zero Deliverables terminology, and live backend data.
- **Decision:**
  1. Extended `WorkLog` type with `LogWorkStatus` and added resilient status inference for existing logs via `getLogWorkStatus`.
  2. Implemented mobile layout (`md:hidden`) with hero banner, prominent dark action button, 5 live KPI metric tiles, recent logs header with single team dropdown, search bar, status chips, timeline guide with video thumbnails, and slide-up detail drawer.
  3. Preserved desktop engineering logbook layout completely (`hidden md:block`).
- **Consequences:**
  - Fast, intuitive build logging workflow for workshop members on mobile.
  - Zero disruption to desktop operations or database records.

---

## 🏛️ ADR-014: Strict Domain-Scoped Task Isolation & 4-Tile Status Uniformity
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - Members viewing "Team Tasks" and "My Tasks / Assigned" on mobile previously saw tasks across irrelevant domains or could pick foreign squads from dropdowns.
  - Furthermore, Team Tasks only had 3 KPI summary tiles (`Total`, `In Progress`, `Completed`), missing the `Under Review` metric, while My Tasks had 4 tiles labeled with inconsistent nomenclature ("Review" vs "Under Review").
- **Decisions:**
  1. **Strict Assigned Domain Scoping:**
     - Both `filteredTasks` (Team Tasks) and `myAssignedTasks` (Assigned Tasks) are strictly scoped to the active member's assigned domains (`memberDomainIds = [user.teamId, ...(user.secondaryTeams || [])]`), verified against the canonical 23-member roster.
     - Squad and domain dropdown filters in both tabs only display the member's assigned squads (`availableSquads`), eliminating cross-domain leakage.
  2. **4-Tile KPI Summary Grid Unification:**
     - Both `TeamTasksTab` and `MyWorkbenchTab` now feature an identical 4-tile summary row: `Total`, `In Progress`, `Under Review`, and `Completed`.
     - Tiles use identical container styling (`w-7 h-7` pastel vector icons, `text-base font-black` counts, `text-[10px]` labels, and active selection highlight rings).
     - Clicking any KPI tile switches the active single-status list view dynamically.
- **Consequences:**
  - Complete privacy and relevance for domain members; zero distraction from other squads' workloads.
  - 100% visual and interactive parity between Team Tasks and Personal Tasks on mobile.

---

## 🏛️ ADR-015: Hierarchy-Gated Task Completion & Review Observation Protocol
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - In a high-stakes engineering project (SIEP Season 7.0), technical tasks cannot be finalized or signed off without observation and quality verification by technical leads or project leadership.
  - Previously, any authenticated member could transition a task directly from "Under Review" (or in progress) to "Completed", bypassing managerial and engineering review.
- **Decisions:**
  1. **Hierarchy Authority Gate:**
     - Only Squad Leads (`isLead: true`), Core Leadership (`isCore: true` / `teamId === 'core'`), or Administrators have authority to approve and mark tasks as `Completed` (`status === 'done'`).
     - Regular team members can progress work through `todo` &rarr; `in_progress` &rarr; `review` ("Submit for Review &rarr;").
  2. **Full Entry-Point Enforcement:**
     - **API Route Authority (`/api/tasks`):** In both `POST` and `PATCH`, transitioning or creating tasks with `status === 'done'` without verified Lead or Core status returns `403 Forbidden` (`Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.`).
     - **Task Card (`TaskCard.tsx`):** In the `review` column, the advance button is replaced with a `🔒 Awaiting Lead Approval` indicator for non-leads, while Leads see an emerald `Approve ✓` action.
     - **Move Status Menu (`TeamTasksTab.tsx`):** The "Move to Completed" action is disabled with `🔒 Lead only` for unauthorized members.
     - **Kanban Board (`page.tsx`):** Drag-and-drop into `done` or quick status advance is gated by `canApproveCompletion` with immediate user feedback.
     - **Task Detail Modal (`TaskDetailModal.tsx`):**
       - Dedicated "Under Observation & Review" banner with one-click "Approve & Complete ✓" for Leads/Core, and clear review notice for members.
       - Quick status button for `done` and edit form select option are disabled with lock indicators.
       - Progression button switches between "Submit for Review &rarr;" (for members in progress), "🔒 Awaiting Lead Approval" (in review), and "Complete & Attach Video" (for leads).
     - **Build Log Page (`log/page.tsx`):** Quick advance and "Done + Video" buttons respect `canApproveCompletion` and display `🔒 Awaiting Lead Approval` when tasks are under review.
     - **Task Complete Modal (`TaskCompleteModal.tsx`):** Backend & form submission verify `canApproveCompletion`.
- **Consequences:**
  - Strict organizational hierarchy preserved across all client touchpoints and server APIs.
  - Quality assurance and video evidence requirements enforced under lead observation.

---

## 🏛️ ADR-016: Modern Slide-Over Burger Menu & Navigation Parity
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - The previous mobile drawer was a legacy full-screen centered text menu that did not match the modern card aesthetic of the redesigned Dashboard, Team Tasks, and Build Log pages.
  - The user provided a reference visual (`media_1794516873830_735ab195.jpg`) specifying a sleek right-sliding card with rounded left borders, individual rounded navigation cards, pastel active states, and a styled soft red logout button.
- **Decisions:**
  1. **Slide-Over Panel Architecture:**
     - Drawer card slides in from right (`rounded-l-[32px] sm:rounded-l-[40px]`, `w-[85%] max-w-[360px] sm:max-w-[400px]`, `bg-white`, `shadow-2xl`) over a frosted glass backdrop (`bg-jet-black/50 backdrop-blur-sm`).
     - Includes top header with brand logo (`Riders Bay.`) and a rounded-2xl close button (`✕`).
  2. **Uniform Card Navigation Items:**
     - 4 core items matching reference:
       1. **Dashboard:** 4-square grid icon (`2x2` rounded rectangles).
       2. **Team Tasks:** Clipboard checkmark icon.
       3. **Build Log:** Plus in circle `⊕` icon.
       4. **Assigned:** Person silhouette outline `👤` icon.
       5. **Profile:** Settings gear / badge icon for credential & PIN management.
     - **Active State Parity:** Active tab/route displays a soft warm cream/amber card (`bg-amber-50/90 border border-amber-200/80`), amber icon container (`bg-amber-100/80 text-amber-500`), bold dark text, and amber chevron `>`.
     - **Log Out Card:** Styled in soft red (`bg-red-50/80 border border-red-100 text-red-600`), exit door arrow icon, and bold red typography.
  3. **Instant Tab Synchronization:**
     - URL query sync and custom `siep_tab_change` event listeners in `page.tsx` allow instant tab switching from the burger menu without page reloads.
- **Consequences:**
  - 100% visual parity with user's reference mockup and app-wide design system.
  - Flawless navigation on both mobile web browsers and standalone installed PWA.
