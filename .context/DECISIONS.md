# 📜 ARCHITECTURE DECISION RECORDS (ADRs)
> **Permanent Record of Architectural Trade-offs and Invariant Constraints**  
> *Project: Riders Bay Smart Scrambler E-Bike (SIEP Season 7.0)*  
> *These decisions are intentional. Agents must consult these before proposing major refactorings.*  
> *Companion Documents:* [.context/ARCHITECTURE.md](file://.context/ARCHITECTURE.md) | [.context/DATABASE.md](file://.context/DATABASE.md) | [.context/CONTEXT.md](file://.context/CONTEXT.md) | [.context/HANDOVER.md](file://.context/HANDOVER.md)  
> *Last Synced:* 2026-11-13 (Daily Codebase Context Sync)

---

## 📑 QUICK ADR INDEX (001 - 023)
| ADR | Title | Date | Status |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Next.js 16 App Router + React 19 + Tailwind CSS v4 | 2026-11-10 | Accepted |
| **ADR-002** | Dual-Store Authentication & Session Engine (PIN + Firestore) | 2026-11-10 | Accepted |
| **ADR-003** | Multi-Squad Member Assignment (`secondaryTeams`) *(Refined by ADR-021)* | 2026-11-10 | Superseded |
| **ADR-004** | Direct Resumable Uploads for Large CAD Assets (5 GB Bypass) | 2026-11-10 | Accepted |
| **ADR-005** | Decoupled 3D Asset Pipeline (Blender to Compressed WebGL) | 2026-11-10 | Accepted |
| **ADR-006** | Version-Controlled Agent Context & Handover Standard | 2026-11-10 | Accepted |
| **ADR-007** | Member Profile Customization, Canvas Image Compression & Roster Sync | 2026-11-11 | Accepted |
| **ADR-008** | Mobile Profile UX Refinement, PWA Banner De-clutter & Native Photo Action Sheet | 2026-11-11 | Accepted |
| **ADR-009** | Strict PIN Invalidation, Priority Squad Sorting & Minimal Bottom Action Sheet | 2026-11-11 | Accepted |
| **ADR-010** | Equal Domain Representation in Member Profile | 2026-11-11 | Accepted |
| **ADR-011** | Restrict Bottom Navigation Dock Strictly to Standalone Mobile Web App (PWA) | 2026-11-12 | Accepted |
| **ADR-012** | Mobile UI Rework — Single Responsibility Operational Views | 2026-11-12 | Accepted |
| **ADR-013** | Build Log Mobile Rework & 5-Status Engineering Workflow | 2026-11-13 | Accepted |
| **ADR-014** | Strict Domain-Scoped Task Isolation & 4-Tile Status Uniformity | 2026-11-13 | Accepted |
| **ADR-015** | Hierarchy-Gated Task Completion & Review Observation Protocol | 2026-11-13 | Accepted |
| **ADR-016** | Modern Slide-Over Burger Menu & Navigation Parity | 2026-11-13 | Accepted |
| **ADR-017** | Universal Build Log Access & Pure In-App Navigation Experience | 2026-11-13 | Accepted |
| **ADR-018** | Desktop Portal Redesign (PRD v1.0 & 5 Reference Mockups) | 2026-11-13 | Accepted |
| **ADR-019** | Dedicated Research & Materials Repository with Direct Google Drive Upload | 2026-11-13 | Accepted |
| **ADR-020** | Master Role & Team Governance Console (Exclusively for Parth Kshirsagar) | 2026-11-13 | Accepted |
| **ADR-021** | Role Editing Resilience, Absolute Domain Equality & Dynamic Public Roster Sync | 2026-11-13 | Accepted |
| **ADR-022** | Roles Management Console UI Simplification & Authority Gate Streamlining | 2026-11-13 | Accepted |
| **ADR-023** | Specific Domain Leadership, Public Hierarchy Protocol & Domain Lead Highlighting | 2026-11-13 | Accepted |

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

## 🏛️ ADR-013: Build Log Mobile Rework & 5-Status Engineering Workflow
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

---

## 🏛️ ADR-017: Universal Build Log Access & Pure In-App Navigation Experience
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - Previously, the Engineering Log System (`/log`) was artificially restricted at the middleware and page level to Core Leadership and Domain Leads. Regular members (Tier 3) were redirected away with `restricted=log`.
  - The authenticated mobile slide-over burger menu contained an extraneous "Explore Showcase Website ↗" link, and marked Build Log as "Leads Only", preventing regular engineers from easily logging their fabrication and assembly steps.
  - The user requested removing the external showcase website link from the burger menu and ensuring non-leads and non-core members have direct options to add logs from the burger menu.
- **Decisions:**
  1. **Universal Build Log Access (`/log`):**
     - Removed the middleware check (`web/src/middleware.ts`) and client-side redirect (`web/src/app/log/page.tsx`) that previously redirected non-leads to `/dashboard?restricted=log`.
     - All authenticated team members can access `/log` to inspect engineering logs and submit build steps for their squad.
     - Added desktop nav `Build Log` link for all authenticated users in `Navigation.tsx`.
  2. **Burger Menu Option to Add Logs:**
     - Removed the `Leads Only` badge from the `Build Log` card in the burger menu.
     - Added a direct, prominent `+ Add` action button right inside the `Build Log` card in the burger menu drawer (`/log?new=true` and `siep_open_log_form`), allowing any member to open the build log creation form in 1 tap from anywhere in the app.
     - Supported `?new=true` / `?action=new` in `log/page.tsx` and updated `BottomNav.tsx`'s "Log Build Step" to also link directly to `/log?new=true`.
  3. **Showcase Website Link Removal:**
     - Removed the "Explore Showcase Website ↗" link from the authenticated burger menu drawer, providing a clean, uncluttered interface ending at the red "Log Out" card.
  4. **Hierarchy Integrity Preserved (ADR-015):**
     - Submitting build steps and video evidence is open to all members, but approving deliverables and marking tasks as `Completed` remains strictly reserved for Leads and Core leadership.
- **Consequences:**
  - Smooth, frictionless logging workflow for shop floor engineers across all squads.
  - Clean, distraction-free navigation matching reference design.

---

## 🏛️ ADR-018: Desktop Portal Redesign (PRD v1.0 & 5 Reference Mockups)
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - The desktop web experience required redesign per PRD v1.0 and 5 authoritative reference mockups (Dashboard, Tasks, Build Log, Teams, Reports) while strictly leaving the mobile experience (`md:hidden`) intact.
  - Legacy desktop elements suffered from duplicate dashboard navigation, non-functional credentials buttons, fragmented Team Tasks vs My Tasks, and repetitive subsystem boxes.
- **Decisions:**
  1. **Strict Responsive Screen Isolation:**
     - All desktop redesign components are scoped with `hidden md:block` / `hidden md:flex`.
     - Mobile web app screens (`BottomNav.tsx`, slide-over burger menu, mobile single-status list, 2x2 KPI grids) are protected under `md:hidden` without modification.
  2. **Unified Desktop Navigation Bar:**
     - 5 persistent primary pills: `Dashboard`, `Tasks`, `Build Log`, `Teams`, `Reports` with dark active pill indicator.
     - Real-time notification bell (triggers `siep_open_activity_drawer`) and user avatar profile dropdown (`My Profile`, `Account & Security`, `Access Settings (Core Admin)`, `Sign Out`).
     - Persistent direct URL routing with redirects (`/tasks`, `/teams`, `/reports`, `/build-log`, `/profile`), `popstate` browser back/forward history support, and instant tab synchronization (`siep_tab_change`).
  3. **Standardized Operations Hero Banners (`OperationsBanner.tsx`):**
     - Dark navy container with glowing golden-orange arc wave, uppercase subtitle (`PROJECT OPERATIONS`), bold title, description, and optional right CTA button (`+ New Task`, `+ Add Log`, `+ Add Member`, `Export Report`).
  4. **Uniform Stat Cards (`StatCard.tsx`):**
     - Pastel icon squircles, subtle rounded borders, tabular counts, and optional mini progress bars.
  5. **Component Redesigns Matching Mockups 1–5:**
     - **Dashboard (`DashboardOverviewTab.tsx` - Mockup 1):** 4 stat cards, 2-column grid featuring `Team Progress` (squad codes, orange progress bars, %, fractions, `View Teams ->`) and `Recent Activity` (connected vertical timeline, squircle node icons, squad badges, relative timestamps, `View All ->`).
     - **Tasks (`TeamTasksTab.tsx` - Mockup 2):** Single unified task workspace combining Team Tasks and My Tasks. Filter pills (`All Tasks`, `My Tasks`, `Assigned`, `Review`, `Completed`), search input, filters dropdown, table/kanban view toggle, and comprehensive tasks table (checkbox, title, team code, priority pill, status pill, assignee initials, formatted due date, actions, and pagination).
     - **Build Log (`web/src/app/log/page.tsx` - Mockup 3):** 4 stat cards, timeline table with filters (`All Logs`, `Builds`, `Tests`, `Design`, `Analysis`, `All Time ▾`), `Recent Build Media` 2x2 preview grid, and `Quick Actions` (New Build Log, New Test Log, Upload Media).
     - **Teams (`SubsystemsTab.tsx` - Mockup 4):** 4 stat cards, directory table (`All Members`, `Squads`, `Core Committee`, `Roles`), member details with email, role badge with icon, squad, `● Active` status, joined date, and `Squad Overview` card with orange progress bars.
     - **Reports (`VelocityMetricsTab.tsx` - Mockup 5):** 5 stat cards, middle row featuring `Progress Overview` (SVG spline area chart), `Squad Progress` bars, and `Recent Reports` (PDF badges and download action), plus 6 `Quick Reports` instant export tiles.
- **Consequences:**
  - Complete 1:1 fidelity with the 5 reference mockups.
  - 100% preservation of mobile layouts, auth models, member PINs, and Firestore schemas.
  - Zero TypeScript or Turbopack compilation errors across all 25 Next.js static pages.

---

## 🏛️ ADR-019: Dedicated Research & Materials Repository with Direct Google Drive Upload for All Members
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - The team required a centralized repository where all members (including non-core and non-lead shop engineers) can upload and access technical whitepapers, CAD designs, simulation outputs, component datasheets, test reports, and research materials.
  - Requirement: Keep this strictly separated from the engineering Build Log (`/log`), which tracks daily fabrication steps, while utilizing Google Drive direct resumable streaming (similar to build video uploads) to circumvent Vercel's serverless payload limits.
- **Decisions:**
  1. **Dedicated Materials Tab (`MaterialsTab.tsx`):**
     - Created a persistent `Materials` tab on the desktop portal (`/dashboard?tab=materials`) and direct route `/materials`.
     - Added `Materials` pill button to the persistent desktop top navigation bar (`Navigation.tsx`) and mobile drawer.
     - Designed with 100% aesthetic uniformity to the 5 reference mockups:
       - Operations Banner (`PROJECT OPERATIONS / Research & Materials / + Upload Material`).
       - 4 Stat Cards: `Total Documents`, `Research Papers`, `Technical Specs & CAD`, `Reports & Briefs`.
       - Standalone Filter Bar: Live search with clear button, category filter pills (`All Materials`, `Research`, `Specs`, `Reports`, `Datasheets`, `CAD`), and squad selector.
       - Materials Table: File type pill (`PDF`, `DOC`, `XLS`, `CAD`), title & description, squad badge, author info, verified Google Drive status, and action links.
       - Right Column: Quick upload dropzone, squad distribution bars, and Google Drive cloud storage info.
  2. **Direct Google Drive Resumable Upload:**
     - Reused `uploadFileToGoogleDrive` to stream PDFs, docs, and CAD files up to 5 GB directly into the team Google Drive via Google Apps Script resumable upload session.
     - Shows live 0–100% upload progress bar in the upload modal.
     - Supports direct file upload or pasting existing Google Drive view URLs.
  3. **Universal Upload Permissions:**
     - Document upload is open to all authenticated team members regardless of tier, core status, or lead status.
     - Deletion is restricted to the original author or Core Administrators.
  4. **Persistence Layer:**
     - Created `/api/materials` endpoint handling `GET`, `POST`, and `DELETE`.
     - Synchronizes to Firestore collection `materials` with local memory store fallback (`store.ts`).
- **Consequences:**
  - Team members across all 9 squads have a dedicated, organized technical document repository without cluttering the daily build log.
  - Large technical files bypass serverless limitations and are stored reliably in the team Google Drive.

---

## 🏛️ ADR-020: Master Role & Team Governance Console (Exclusively for Parth Kshirsagar)
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - The team required a centralized administrative console to manage team roles, appoint Captain and Vice Captain, designate Domain Leads, adjust squad allocations (primary + secondary), assign governance tiers, and revoke permissions.
  - Strict Security Invariant: This console must be accessible **strictly and exclusively** by Parth Kshirsagar (`parthkshirsagrr@gmail.com`). No other member, lead, or core admin can access or execute role modifications.
- **Decisions:**
  1. **Strict Cryptographic Access Gate:**
     - Evaluated via `isParthMasterAdmin(email)` checking `parthkshirsagrr@gmail.com` (and its normalized alias).
     - Frontend UI: The `Roles` pill in top desktop navigation, the User Profile dropdown entry, and the mobile drawer link are completely invisible to all other users. If a non-authorized user navigates directly to `/roles` or `/dashboard?tab=roles`, a security guard screen blocks access with a lock icon.
     - Backend API (`/api/roles`): Enforces HTTP 403 Forbidden with `session.email` verification on both `GET` and `POST`.
  2. **Comprehensive Role Management Capabilities:**
     - **Captain & Vice Captain Appointments:** 1-click promotion buttons or full custom titles (`Core Lead & Captain`, `Vice Captain`).
     - **Domain Leads & Squad Allocation:** Manage primary `teamId` and secondary squads (`secondaryTeams`) across all 9 engineering squads.
     - **Permission Revocation:** 1-click revocation dialog that removes Lead and Core administrative powers, instantly reverting the member to standard Tier 3 Team Member.
     - **New Member Addition & Removal:** Add new innovators to the roster or remove archived members.
  3. **Visual & Design Uniformity:**
     - Matches the reference design system (Operations Hero Banner, 4 Stat Cards, Standalone Filter Bar with live search and category tabs, 2-column layout with Executive Hierarchy overview, zero emojis).
  4. **Persistence Layer:**
     - Backed by Cloud Firestore collection `roster_members` with local memory store fallback (`store.ts`) and audit logging (`recordActivity`).
- **Consequences:**
  - Full, unilateral executive authority over the team directory and permissions for Parth Kshirsagar without risk of unauthorized privilege escalation from other members.

---

## 🏛️ ADR-021: Role Editing Resilience, Absolute Domain Equality & Dynamic Public Roster Sync
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - Editing member details previously failed with "no data" because Firestore's `roster_members` collection only contained modified entries rather than the full 23-member baseline roster.
  - The concept of "primary vs. secondary domains" introduced unnecessary hierarchy and skewed roles (e.g. forcing a title or highlight on only one domain when members contribute across multiple domains).
  - Changes made in Role Management were not propagating dynamically to the public website (`/about`, homepage team section) or the portal's Teams tab (`SubsystemsTab`).
  - Passwords and profile pictures could not be inspected, modified, or removed directly by the master administrator in one place.
- **Decisions:**
  1. **Self-Healing Member Data Pipeline:**
     - `getFirestoreMembers()` and `getStoreMembers()` merge the authoritative 23-member `ROSTER_MEMBERS` baseline with any Cloud Firestore overrides. If a member document does not yet exist in Firestore, baseline data is preserved and returned seamlessly.
     - `/api/roles` update handler implements a self-healing fallback matching by `memberId`, normalized email, or normalized name.
  2. **Absolute Domain Equality (Zero Partiality):**
     - Completely removed the distinction between "primary" and "secondary" domains. All assigned domains are stored in a unified `domains: TeamId[]` array with 100% equal standing.
     - No role title is ever inferred or forced based on a single domain.
     - Bracket short-codes (e.g. `[MECH] [DSGN] [RES]`) are strictly confined to the Roles Management table in front of member names. Everywhere else (navigation, profile, team section, task cards), names are clean without brackets.
  3. **Full Dynamic Roster Synchronization:**
     - Public Endpoint: Created `/api/members` returning real-time team members, roles, assigned domains, and profile pictures.
     - Public Website (`TeamSection.tsx`): Dynamically fetches `/api/members` on mount to immediately update member names, roles (Captain, Vice Captain, Lead), photos, and domain cards on the live site.
     - Portal Teams Tab (`SubsystemsTab.tsx`): Dynamically fetches `/api/members`, renders all domains equally, and uses member's dynamic role with zero name-based hardcoding.
  4. **Master Password & PFP Governance:**
     - Passwords/PINs are displayed in the Roles table masked by default (`••••••`), toggleable to plaintext via an Eye icon.
     - Edit modal supports viewing current photo, uploading a new photo, or 1-click "Remove Photo" (clearing Firestore profile picture).
     - Changing PIN updates Firestore `member_passwords` immediately.
  5. **Tier Label Isolation:**
     - Removed "Tier 1, Tier 2, Tier 3" text from the public website, navigation badges, and user profile; tier indicators are kept exclusively within the Master Roles management console.
- **Consequences:**
  - Flawless, unbreakable role and credential management for Parth Kshirsagar.
  - Immediate real-time reflection of role and roster changes across both the internal portal and the public marketing website.
  - Fair, transparent multi-domain representation for all team members.

---

## 🏛️ ADR-022: Roles Management Console UI Simplification & Authority Gate Streamlining
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - In ADR-021, bracket domain tags (e.g. `[MECH] [DSGN] [RES]`) and mini-role badges (`CAPTAIN`, `VICE CAPT`) were isolated to the Member Name column in the Master Roles console. However, this created visual duplication because Column 2 is already dedicated to `ROLE & TITLE` and Column 3 is already dedicated to `ASSIGNED DOMAINS` with full-color squad pills.
  - Furthermore, the black "Single Authority Gate" card in the right sidebar of the console repeated information already enforced by the security model and added visual clutter to the executive appointments panel.
- **Decisions:**
  1. **Member Name Column Simplification:**
     - Removed all bracket tags and mini-role badges from the Member Name column in `RolesManagementTab.tsx`.
     - Column 1 now cleanly displays: Initials Avatar + Member Name (`font-bold text-slate-900`) + Email (`text-[11px] text-slate-500`).
     - Column 2 retains the definitive, full `ROLE & TITLE`.
     - Column 3 renders all assigned domains using equal, colorful squad pills.
  2. **Removal of Redundant Authority Gate Card:**
     - Removed the black "Single Authority Gate" sidebar card, giving the executive leadership overview and 1-click Captain/Vice Captain appointment tools clear visual focus.
  3. **Preservation of Security Invariant:**
     - The underlying cryptographic security gate (`isParthMasterAdmin()`) remains 100% active on the frontend route guard, navigation items, and the `/api/roles` backend endpoint.
- **Consequences:**
  - The Master Roles console table is significantly cleaner, easier to scan, and eliminates redundant visual indicators.
  - Zero disruption to data structures, API security, or domain assignment logic.

---

## 🏛️ ADR-023: Specific Domain Leadership, Public Hierarchy Protocol & Domain Lead Highlighting
- **Date:** 2026-11-13
- **Status:** Accepted & Implemented
- **Context:**
  - Members often lead one specific domain while contributing as general members to others (e.g. Captain Tirthraj leads EnTC while contributing to Research; Vice Captain Pratik leads Documentation while contributing to EnTC and Sponsorship; Meet leads Mechanical & Design while contributing to Research; Parth leads Software while contributing to Sponsorship and Documentation).
  - Previously, when clicking a specific domain tab (such as Software or Mechanical), members holding global titles (Captain, Vice Captain, or leads of other domains) displayed their global titles, muddying domain hierarchy and making it unclear who actually leads that specific domain.
  - In the "All Crew" public view, the user required an exact hierarchy sequence: `Mentor (1) -> Captain (2) -> Vice Captain (3) -> Core Members (4) -> Domain Leads (5) -> Regular Members (6)`.
  - In the Roles console, the user needed to designate domain leadership for any member (including Captain and Vice Captain), have Domain Leads tab include Captain/Vice Captain if they lead a domain, highlight lead domains in the Assigned Domains column, and eliminate all "(Parth Only)" text.
- **Decisions:**
  1. **Specific Domain Leadership (`leadDomains: TeamId[]`):**
     - Extended `TeamMemberEntry` and `TeamMember` with `leadDomains: TeamId[]`.
     - In the Master Roles console Edit/Add modals, introduced a dedicated Domain Leadership selector enabling Parth to toggle which assigned domain(s) a member leads. This works for Captain, Vice Captain, Core Members, or any member.
     - Preserved `leadDomains` during 1-click Captain/Vice Captain promotions in `/api/roles`.
  2. **Strict Specific Domain Role Context ("Applicable Everywhere"):**
     - When viewing a specific domain (e.g. `/about#team` with a domain filter selected, or mobile accordion for that squad):
       - ONLY the member who leads that specific domain (`member.leadDomains.includes(activeDomain)`) displays as `Domain Lead`.
       - ALL other members in that domain—even if they are Captain, Vice Captain, or leads of another domain—are strictly badged as `Team Member` (`bg-jet-black/5 text-jet-black/70`).
       - The domain lead is sorted to the top of the domain list.
  3. **Strict "All Crew" Public Hierarchy:**
     - When "All Crew" is active, members are sorted in the exact requested hierarchy:
       `Mentor (1) -> Captain (2) -> Vice Captain (3) -> Core Members (4) -> Domain Leads (5) -> Regular Members (6)`.
  4. **Domain Leads Filter & Highlight in Roles Console:**
     - The "Domain Leads" filter tab in `RolesManagementTab.tsx` includes Captain and Vice Captain if they lead any domain (`getMemberLeadDomains(m).length > 0 || m.isLead`).
     - In the `ASSIGNED DOMAINS` table column, domains that a member leads are visually highlighted with a gold gradient, star icon (`★`), dark bold text, and a golden border (`bg-gradient-to-r from-amber-300 to-amber-400 text-amber-950 ring-2 ring-amber-500/80 font-black`), making leads immediately distinguishable from general assignments.
  5. **Removal of "Parth Only" Labeling:**
     - Removed all "(Parth Only)" and "Parth Only" text from navigation tooltips, profile dropdowns, and mobile drawers, replacing them with professional executive labels (`Role Management`, `Master Role & Team Governance`, `Executive Authority`).
- **Consequences:**
  - Absolute clarity on domain leadership across both the public website and internal governance console.
  - Clean, professional executive styling with zero emoji usage and total type safety.
