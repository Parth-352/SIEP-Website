# 🪲 RIDERS BAY CODEBASE BUG & DISCREPANCY TRACKER
> **Authoritative, Append-Only Register of Identified Defects, Permission Gaps & Platform Inconsistencies**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0*  
> *Strict Invariant Rule: This file is APPEND-ONLY. Existing entries must never be modified or deleted. Status can only be progressed from `[ ] Open` to `[x] Completed` with resolution timestamps.*  
> *Initialized:* 2026-11-13 18:35 IST

---

## 📋 1. FULFILLMENT AUDIT OF PREVIOUS REQUIREMENTS

| Requirement | Requested Scope | Live Status | Audit Finding |
| :--- | :--- | :--- | :--- |
| **Domain Leadership for Captain / Vice Captain** | Allow assigning domain leadership to Captain & Vice Captain | ✅ Fulfilled | Supported via `leadDomains: TeamId[]` in `/api/roles`, Firestore `roster_members`, and UI modal. |
| **About Page Public Hierarchy (All Crew)** | Mentor &rarr; Captain &rarr; Vice Captain &rarr; Core &rarr; Leads &rarr; Members | ✅ Fulfilled | `filteredMembers` in `TeamSection.tsx` strictly applies 6-tier ranking in All Crew tab. |
| **Specific Domain Lead Context** | Only specific domain lead is shown as Lead; everyone else (even Captain) is Member | ✅ Fulfilled | Implemented across desktop `MemberCard` and mobile `MobilePlayerCard`. |
| **Highlight Lead Domains in Roles Console** | Gold badge & star icon on lead domains in Assigned Domains column | ✅ Fulfilled | Implemented with amber gradient, star vector icon (`★`), and border. |
| **Domain Leads Filter in Roles Console** | Include Captain & Vice Captain if they lead any domain | ✅ Fulfilled | `filterTab === 'leads'` includes any member with `getMemberLeadDomains(m).length > 0`. |
| **Remove "Parth Only" Text** | Remove "(Parth Only)" from navigation tooltips, menus, and profile links | ✅ Fulfilled | Replaced with `Executive Authority` and `Master Role & Team Governance`. |
| **Universal Technical Materials Hub** | Non-core and non-leads can upload reports, PDFs, CAD docs to Google Drive | ✅ Fulfilled | Dedicated `/materials` tab and `/api/materials` open to all authenticated members. |

---

## 🪲 2. ACTIVE DEFECTS & PLATFORM DISCREPANCIES (PHONE VS. WEB APP)

---

### [BUG-001] Task Status "Under Review" Missing from Desktop Table & Kanban; Lead Approval Unenforced in Table View
- **Logged Date:** 2026-11-13 18:35 IST
- **Severity:** High (Core Operational Workflow Violation)
- **Affected Surface:** Desktop Web App (`web/src/components/dashboard/TeamTasksTab.tsx`, `web/src/app/dashboard/page.tsx`) vs. Mobile Web App (`TaskCard.tsx`, `TaskDetailModal.tsx`)
- **Problem Statement:**
  On the mobile web app / phone PWA, the engineering workflow permits regular team members to progress deliverables to "Under Review", reserving final approval and "Completed" status strictly for Squad Leads and Core Leadership (ADR-015). However, on the desktop website tasks table (`viewMode === 'table'`), the `Status` column is completely static:
  1. Regular members have no option or button to advance a task or submit it for review.
  2. In the Kanban view on desktop (`viewMode === 'kanban'`), cards lack quick advance buttons (`Advance →`, `Submit for Review`, `Approve ✓`).
  3. In the desktop table `Actions` column, there is only a generic three-dot button opening details, without a direct status transition action.
- **Root Cause:**
  `TeamTasksTab.tsx` did not integrate the status advance logic or interactive status dropdown from `TaskCard.tsx` into the desktop table row or Kanban cards.
- **Solution:**
  1. In `TeamTasksTab.tsx` Table view: Add an interactive status action control in the Status and Actions columns. For `in_progress` tasks assigned to regular members, provide an explicit "Submit for Review &rarr;" button transitioning status to `review`.
  2. For tasks in `review` status: Regular members see a locked badge `Under Review (Awaiting Lead Approval)`. Only Squad Leads and Core Leadership see an active "Approve & Complete ✓" button.
  3. In `TeamTasksTab.tsx` Kanban view: Provide quick advance buttons on each card matching hierarchy permissions, and prevent regular members from dragging tasks directly into `Completed`.
- **Status:** `[x] Completed (Resolved 2026-11-13)`

---

### [BUG-002] Build Log Creation Open to Non-Leads (Breaks Leadership Integrity Protocol)
- **Logged Date:** 2026-11-13 18:35 IST
- **Severity:** Critical (Security & Engineering Hierarchy Violation)
- **Affected Surface:** Desktop & Mobile Build Log (`web/src/app/log/page.tsx`, `web/src/app/api/logs/route.ts`)
- **Problem Statement:**
  Currently, any authenticated team member (including Tier 3 regular members) can create and publish build logs via `+ Add Log` on desktop, `+ Add Entry` on mobile, and `POST /api/logs`. The user strictly requires that: **Build logs must ONLY be built by Squad Leads and Core Members, none other.** Non-leads must contribute technical documentation exclusively through the Materials repository (`/materials`), never build logs.
- **Root Cause:**
  In `POST /api/logs/route.ts`, authorization only checks for an authenticated session and binds `teamId = session.teamId`, failing to assert `session.isCore || session.isLead || session.tier <= 2`. Similarly, in `web/src/app/log/page.tsx`, the `+ Add Log` CTA and Quick Action buttons ("New Build Log", "New Test Log", "Upload Media") are displayed to all authenticated members without role gating.
- **Solution:**
  1. In `POST /api/logs/route.ts`: Reject any submission where `!session.isCore && !session.isLead && session.tier !== 1 && session.tier !== 2` with HTTP 403 Forbidden: `"Hierarchy Rule: Build logs can only be created by Squad Leads and Core Leadership."`
  2. In `DELETE /api/logs` and `PATCH /api/logs`: Restrict deletion and modification of build logs to Squad Leads and Core Members.
  3. In `web/src/app/log/page.tsx`: Conditionally gate `+ Add Log` CTA in `OperationsBanner`, hide mobile `+ Add Entry` for non-leads, and disable or badge Quick Action tiles as "Leads & Core Only" with an informational banner directing regular members to the Materials repository.
- **Status:** `[x] Completed (Resolved 2026-11-13)`

---

### [BUG-003] Dynamic Role & Lead Permissions Overwritten by Static Baseline in Login & Session Decoding
- **Logged Date:** 2026-11-13 18:35 IST
- **Severity:** High (State Synchronization & Authorization Bypass)
- **Affected Surface:** Authentication & Session Pipeline (`web/src/app/api/passwords/route.ts`, `web/src/context/AuthContext.tsx`, `web/src/lib/session.ts`)
- **Problem Statement:**
  When a member logs in via `POST /api/passwords`, or restores their session in `AuthContext.tsx` via `getSavedUser()`, or when serverless routes decode the session cookie via `decodeSession()`, the codebase invokes `getMemberByEmail(email)` or `isMemberLead(email)` from `web/src/lib/members.ts`. These functions read strictly from the static array `ROSTER_MEMBERS` rather than the dynamic Firestore collection `roster_members`. Consequently, if Parth promotes a member to Lead or Captain in the Roles console:
  1. The member's login response and session cookie do not reflect their promoted `isLead` or `isCore` status.
  2. The server-side route guards in `decodeSession()` overwrite their active permissions back to the static baseline.
  3. Permissions revoked in Role Management are not immediately reflected on the member's session.
- **Root Cause:**
  `decodeSession()` and `POST /api/passwords` used static array lookups instead of merging dynamic Firestore member data or trusting cryptographically encoded session parameters.
- **Solution:**
  1. Update `POST /api/passwords` to query `getFirestoreMembers()` (with local store fallback) to return live `role`, `isLead`, `isCore`, `tier`, `domains`, and `leadDomains`.
  2. Update `decodeSession()` in `web/src/lib/session.ts` so it preserves the dynamically encoded `isLead`, `isCore`, and `tier` attributes rather than overwriting them with static baseline functions.
  3. Update `getSavedUser()` in `web/src/context/AuthContext.tsx` to preserve dynamic profile state and avoid clobbering promoted permissions.
- **Status:** `[x] Completed (Resolved 2026-11-13)`

---

### [BUG-004] Unauthenticated Session Bypass Fallback in Task Mutation API (`/api/tasks`)
- **Logged Date:** 2026-11-13 18:35 IST
- **Severity:** Medium (Access Control Boundary)
- **Affected Surface:** Task Mutation API (`web/src/app/api/tasks/route.ts` line 201)
- **Problem Statement:**
  Line 201 in `web/src/app/api/tasks/route.ts` defines `const isCoreAdmin = Boolean(!session || session.isCore ...);`. If a request is received without a valid session cookie (`!session`), `isCoreAdmin` evaluates to `true`, inadvertently allowing unauthenticated clients to bypass squad isolation guards during task mutations.
- **Root Cause:**
  Legacy fallback expression left behind from early offline development testing.
- **Solution:**
  Remove `!session` fallback. Require an authenticated session and return HTTP 401 Unauthorized if `!session`.
- **Status:** `[x] Completed (Resolved 2026-11-13)`

---

### [BUG-005] Task Complete Modal with Video Verification Missing from Desktop Table Row Action
- **Logged Date:** 2026-11-13 18:35 IST
- **Severity:** Medium (Functional Parity between Mobile and Desktop)
- **Affected Surface:** Desktop Tasks Table (`web/src/components/dashboard/TeamTasksTab.tsx`)
- **Problem Statement:**
  On mobile and in Kanban drag-and-drop, when an authorized Lead marks a task as `Completed`, `TaskCompleteModal` is invoked to attach fabrication video evidence and log completion hours. In the desktop Table view, there is no direct trigger to open `TaskCompleteModal` upon task approval.
- **Root Cause:**
  `onCompleteWithVideo` was only wired up inside `TaskDetailModal` and `handleDrop` in `page.tsx`, but not accessible as a 1-click action in the desktop table row.
- **Solution:**
  Wire `handleOpenCompleteModal` to the Lead "Approve & Complete" button in the desktop tasks table, ensuring seamless video verification across both mobile and desktop.
- **Status:** `[x] Completed (Resolved 2026-11-13)`

---

### [BUG-006] Residual Unicode Emojis in Task Detail Modal, Task Card, and Credentials Vault (Zero-Emoji Design Rule)
- **Logged Date:** 2026-11-13 18:38 IST
- **Severity:** Low (Design Uniformity & Visual Standard Violation)
- **Affected Surface:** `web/src/components/TaskDetailModal.tsx`, `web/src/components/shared/TaskCard.tsx`, `web/src/components/dashboard/CredentialsVaultTab.tsx`
- **Problem Statement:**
  Seven lines contain raw Unicode emojis (`🔒`, `👁️`, `💬`, `🗑️`) instead of crisp Lucide/Heroicon SVG vector icons or clean text, violating the project-wide "Zero Emojis Allowed" design constraint.
- **Root Cause:**
  Legacy inline emojis were left untouched in older modal and card subcomponents during earlier redesign passes.
- **Solution:**
  Replace all 7 emoji instances with clean, scalable SVG vector icons matching the rest of the application.
- **Status:** `[x] Completed (Resolved 2026-11-13)`

---

## 📝 3. RESOLUTION LOG (APPEND-ONLY)
*(Updates, verification results, and marked completions will be appended below without altering previous lines)*

### [RES-001] Resolution of BUG-001 & BUG-005: Desktop Tasks Table & Kanban Review Workflow Parity
- **Resolution Date:** 2026-11-13 18:45 IST
- **Files Modified:**
  - `web/src/components/dashboard/TeamTasksTab.tsx`
- **Actions Taken:**
  1. Updated Table view `Status` column with actionable controls:
     - For `todo` deliverables: "Start Work &rarr;" button advancing status to `in_progress`.
     - For `in_progress` deliverables: "Submit for Review &rarr;" button advancing status to `review`.
     - For `review` deliverables: Regular members see locked badge `Awaiting Lead Approval` with lock SVG icon; Squad Leads and Core Members see `Approve & Complete ✓` button.
  2. Updated Table view `Action` column with direct 1-click status advance and approval actions.
  3. Updated Kanban view cards with direct status transition buttons (`Start →`, `Review →`, `Approve ✓`) and locked lead approval badges.
  4. Wired `handleMoveStatus` directly to `TaskCompleteModal` so completing any task on desktop prompts for fabrication video evidence.

### [RES-002] Resolution of BUG-002: Build Log Hierarchy Lockdown to Leads & Core Only
- **Resolution Date:** 2026-11-13 18:41 IST
- **Files Modified:**
  - `web/src/app/api/logs/route.ts`
  - `web/src/app/log/page.tsx`
- **Actions Taken:**
  1. In `POST /api/logs`: Added strict authority gate checking `session.isCore || session.isLead || session.role === 'admin' || session.teamId === 'core' || session.tier <= 2`. Rejects non-leads with HTTP 403 Forbidden.
  2. In `PATCH /api/logs` and `DELETE /api/logs`: Enforced the same Lead/Core restriction with HTTP 403 Forbidden.
  3. In `web/src/app/log/page.tsx`:
     - Computed `canCreateBuildLog` based on role/tier/lead status.
     - In desktop `OperationsBanner`: Conditionally pass `action` only if `canCreateBuildLog` is true.
     - In desktop Quick Actions: Rendered informational banner directing non-leads to `/materials`.
     - In modal drawer: Guarded rendering with `isFormOpen && canCreateBuildLog`.

### [RES-003] Resolution of BUG-003: Dynamic Role & Lead Permissions Synchronization
- **Resolution Date:** 2026-11-13 18:42 IST
- **Files Modified:**
  - `web/src/app/api/passwords/route.ts`
  - `web/src/lib/session.ts`
  - `web/src/context/AuthContext.tsx`
- **Actions Taken:**
  1. In `POST /api/passwords`: Merged member lookup with `getFirestoreMembers()` so live roles, `isLead`, `isCore`, `tier`, `domains`, and `leadDomains` are returned dynamically on login.
  2. In `GET /api/passwords`: Merged `allMemberCredentials` with `getFirestoreMembers()`.
  3. In `web/src/lib/session.ts`: Updated `decodeSession()` to preserve dynamically encoded `isLead`, `isCore`, and `tier` attributes rather than overwriting with static baseline arrays.
  4. In `web/src/context/AuthContext.tsx`: Updated `getSavedUser()` and `onAuthStateChanged` to preserve dynamic leadership flags on profile restoration.

### [RES-004] Resolution of BUG-004: Removed Unauthenticated Bypass Fallback in Tasks API
- **Resolution Date:** 2026-11-13 18:43 IST
- **Files Modified:**
  - `web/src/app/api/tasks/route.ts`
- **Actions Taken:**
  1. Removed `!session` fallback from `isCoreAdmin` in `PATCH /api/tasks`.
  2. Added mandatory session check returning HTTP 401 Unauthorized if `!session`.

### [RES-005] Resolution of BUG-006: Zero-Emoji Standard Enforcement
- **Resolution Date:** 2026-11-13 18:47 IST
- **Files Modified:**
  - `web/src/components/shared/TaskCard.tsx`
  - `web/src/components/TaskDetailModal.tsx`
  - `web/src/components/dashboard/CredentialsVaultTab.tsx`
- **Actions Taken:**
  1. Replaced all 7 legacy Unicode emojis (`🔒`, `👁️`, `💬`, `🗑️`) with sleek Heroicon / Lucide SVG vector icons.
  2. Verified with automated Unicode scan script: `Zero emojis found in web/src!`.

### [VERIFICATION-LOG]
- **TypeScript Compilation:** `cd web && npx tsc --noEmit` &rarr; 0 errors (Exit Code 0).
- **Next.js Production Build:** `cd web && npm run build` &rarr; 30/30 static and dynamic routes compiled successfully in Turbopack.
- **Emoji Audit:** Python Unicode codepoint inspection confirmed 0 emojis across the entire `web/src` codebase.
- **Automated Live Endpoint Suite (16/16 Passed):** Automated Python test suite verified all 16 mission-critical API boundaries against `https://ridersbay.vercel.app`:
  1. `/api/members` dynamically reflects live roster appointments (Captain, Vice Captain, and equal multi-domain representation).
  2. Regular Member PIN login returns `isLead: false`, `isCore: false`, `tier: 3`.
  3. Squad Lead PIN login returns `isLead: true`, `tier: 2`.
  4. Captain PIN login returns `isCore: true`, `isLead: true`, `tier: 1`.
  5. Unauthenticated task PATCH, task POST, passwords GET rejected with HTTP 401.
  6. Regular member build log POST and DELETE rejected with HTTP 403 Forbidden.
  7. Regular member universal read access to build logs and materials hub verified (HTTP 200 OK).
  8. Master Roles console `/api/roles` rejects regular members and Captain with HTTP 403; authorizes Parth with HTTP 200.
  9. Regular member direct task creation with `done` status rejected with HTTP 403.
  10. DELETE handlers in `/api/logs` and `/api/tasks` support both URL query params and JSON request body payloads with early authorization checks.
