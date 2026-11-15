# 🗺️ RIDERS BAY CODEBASE MAP (KYA CHIZE KIDHAR HAI)
> **Authoritative Project Directory Map, Feature Location Guide & Codebase Index**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0 (ISIEINDIA)*  
> *Institution: SNJB's Late Sau. Kantabai Bhavarlalji Jain College of Engineering, Chandwad, Nashik*  
> *Companion Documents:* [.context/ARCHITECTURE.md](file://.context/ARCHITECTURE.md) | [.context/DATABASE.md](file://.context/DATABASE.md) | [.context/DECISIONS.md](file://.context/DECISIONS.md) | [.context/HANDOVER.md](file://.context/HANDOVER.md)  
> *Last Synced:* 2026-11-15 13:20 IST | **Branch:** `main`

---

## ⚡ 1. QUICK NAVIGATION CHEAT SHEET ("KYA DHOONDH RAHE HO?")

Agar aapko specific features ya code dhundhna hai, toh seedha yahan dekhein:

| Agar aapko yeh chahiye... | Toh yahan jao... | File / Directory Path |
| :--- | :--- | :--- |
| **Member Login & PIN Auth** | AuthContext + PIN check API | [AuthContext.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/context/AuthContext.tsx) & [api/passwords](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/api/passwords/route.ts) |
| **Default Fallback PIN** | Universal code for testing | `935200` |
| **Kanban Tasks Sprint Board** | TeamTasksTab + tasks suite | [TeamTasksTab.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/dashboard/TeamTasksTab.tsx) & [components/dashboard/tasks/](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/dashboard/tasks/) |
| **Task Detail & Edit Modal** | 9-submodule modal suite | [TaskDetailModal.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/TaskDetailModal.tsx) & [components/tasks/modal/](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/tasks/modal/) |
| **Research & Materials (Drive Upload)** | MaterialsTab + batch modal | [MaterialsTab.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/dashboard/MaterialsTab.tsx) & [components/dashboard/materials/](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/dashboard/materials/) |
| **Google Drive Upload (5 GB bypass)** | Resumable Drive streaming | [driveUpload.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/driveUpload.ts) |
| **Roles & Permissions Governance** | Parth Master Admin console | [roles/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/roles/page.tsx) & [components/dashboard/roles/](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/dashboard/roles/) |
| **Rulebook AI Copilot (Gemini)** | Vision OCR indexed assistant | [copilot/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/copilot/page.tsx) & [rulebookService.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/rulebookService.ts) |
| **Official 46-Page Rulebook JSON** | Grounded OCR knowledgebase | [siep_rulebook_index.json](file:///Users/parth/Desktop/SIEP%20Website/web/data/siep_rulebook_index.json) |
| **The Bike Technical Showcase** | CAD schematic & specs | [bike/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/bike/page.tsx) & [components/bike/](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/bike/) |
| **Vehicle Engineering Master Specs** | Detailed hardware numbers | [bikeSpecsData.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/bike/bikeSpecsData.ts) & [EVERYTHINGUWANNAKNOW.MD](file:///Users/parth/Desktop/SIEP%20Website/EVERYTHINGUWANNAKNOW.MD) |
| **Team Members & Roster** | 24-member roster & dynamic sync | [teamRosterData.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/team/teamRosterData.ts) & [api/members](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/api/members/route.ts) |
| **9 Engineering Squads Config** | Domain codes, colors, badges | [teams.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/teams.ts) |
| **Navigation Headers & Bottom Bar** | Desktop, Mobile Drawer, Dock | [components/navigation/](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/navigation/) |
| **Daily Build Log & Step Videos** | Timeline with video modals | [components/log/](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/log/) & [build-log/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/build-log/page.tsx) |
| **Blender 3D CAD Master Model** | 3D Digital Twin | [Electric_Scrambler_Exo.blend](file:///Users/parth/Desktop/SIEP%20Website/Electric_Scrambler_Exo.blend) |
| **Web 3D Assets (GLB)** | WebGL compressed models | [web/public/moto.glb](file:///Users/parth/Desktop/SIEP%20Website/web/public/moto.glb) & [web/public/chassis.glb](file:///Users/parth/Desktop/SIEP%20Website/web/public/chassis.glb) |
| **Firestore Database SDK & Store** | Cloud Firestore client | [firestoreService.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/firestoreService.ts) |
| **Agent Guidelines & Protocols** | Wake-up & handover rules | [AGENTS.md](file:///Users/parth/Desktop/SIEP%20Website/AGENTS.md) |
| **Recent Decisions & ADRs** | Architectural choices 001–033 | [.context/DECISIONS.md](file:///Users/parth/Desktop/SIEP%20Website/.context/DECISIONS.md) |

---

## 🏗️ 2. ROOT & WORKSPACE DIRECTORY MAP

```
/Users/parth/Desktop/SIEP Website/
├── .context/                         # 🧠 LIVING AGENT MEMORY HUB (Single source of truth)
│   ├── ARCHITECTURE.md               # System architecture, tech stack & UI component suites
│   ├── CODEBASE_MAP.md               # [THIS FILE] Complete directory map (Kya cheez kidhar hai)
│   ├── CONTEXT.md                    # Project mission, 9 squads, recent git activity & runtime rules
│   ├── DATABASE.md                   # Cloud Firestore schemas, security rules & collections
│   ├── DECISIONS.md                  # Architectural Decision Records (ADRs 001 - 033)
│   └── HANDOVER.md                   # Active session handover state & next agent pickup points
│
├── web/                              # 🌐 NEXT.JS 16.4.5 + REACT 19 WEB APPLICATION
│   ├── data/                         # Static datasets (SIEP 7.0 Rulebook Vision OCR index)
│   ├── public/                       # Static public assets (3D GLBs, icons, manifest, sw.js)
│   ├── src/                          # Application source code:
│   │   ├── app/                      # App Router: Pages & Backend API Routes
│   │   ├── components/               # Modular UI Components & Feature Suites
│   │   ├── constants/                # Global dashboard constants (columns, badges)
│   │   ├── context/                  # AuthContext.tsx (Global PIN session & role state)
│   │   ├── lib/                      # Core business logic, APIs, and Firestore connectors
│   │   ├── types/                    # Extended dashboard TypeScript interfaces
│   │   └── utils/                    # Shared pure helper utilities (dates, avatar monograms)
│   └── package.json                  # Next.js 16, React 19, Tailwind v4, Three.js
│
├── scripts/                          # 🛠️ AUTOMATED SCRIPTS & VERIFICATION TOOLS
│   ├── context-check.sh              # Quick context and codebase health script
│   └── verify-bifurcation-round3.mjs # Automated test script for modular refactoring
│
├── Electric_Scrambler_Exo.blend      # 🏍️ Blender 5.2.2 LTS 3D digital twin of the e-bike
├── 22-moto_simple/                   # Simple raw CAD reference exports (.obj, .3ds, .mtl)
├── context.md                        # Authoritative Blender 3D scene & MCP connector docs
├── EVERYTHINGUWANNAKNOW.MD            # Authoritative scrambler vehicle specifications & initial roster
└── AGENTS.md                         # Universal Agent Operating Playbook & Workspace Rules
```

---

## 🌐 3. WEB APP ROUTES MAP (`web/src/app/`)

Next.js 16 App Router handles 33 static and dynamic routes. Yahan har route ka location aur purpose hai:

### A. Public Website Routes (Kisi login ke bina khulte hain)
- **`/`** — [web/src/app/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/page.tsx)  
  *Homepage / Hero Showcase:* Hero typography, mission statement, stats, 3D model banner, and public CTAs.
- **`/about`** — [web/src/app/about/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/about/page.tsx)  
  *About Riders Bay:* College background (SNJB Chandwad), history, institutional advisors, and embeds `<TeamSection />`.
- **`/competition`** — [web/src/app/competition/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/competition/page.tsx)  
  *SIEP Season 7.0:* Scrambler category details, proving ground trials, schedule, and rulebook criteria.
- **`/contact`** — [web/src/app/contact/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/contact/page.tsx)  
  *Contact & Partnerships:* Leadership liaisons (Mentor, Captain, Vice Captain from `/api/members`) and inquiry message form.
- **`/bike`** — [web/src/app/bike/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/bike/page.tsx)  
  *Engineering Prototype (Testing Phase):* Staged for internal track scrutiny (ADR-031/ADR-032). Features CAD 2D blueprint viewer, 8-subsystem matrix, CAE validation, and full technical specifications. Detached from public nav.

### B. Authentication & Portal Access
- **`/login`** — [web/src/app/login/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/login/page.tsx)  
  *PIN Authentication Portal:* Allows members to sign in using their 6-digit PIN (default: `935200`), with email OTP recovery modal.

### C. Member Portal Standalone Routes (PIN Authentication Required)
- **`/dashboard`** — [web/src/app/dashboard/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/dashboard/page.tsx)  
  *Command Center Orchestrator:* Houses the full internal operating system with tab switcher (`tasks`, `materials`, `roles`, `overview`, `teams`, `reports`, `vault`, `workbench`).
- **`/tasks`** — [web/src/app/tasks/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/tasks/page.tsx)  
  *Dedicated Sprint Kanban:* Direct deep-link to the full tasks workspace.
- **`/materials`** — [web/src/app/materials/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/materials/page.tsx)  
  *Dedicated Materials Repo:* Direct deep-link to engineering papers, CAD, and Google Drive uploads.
- **`/roles`** — [web/src/app/roles/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/roles/page.tsx)  
  *Master Role Console:* Direct route strictly restricted to Parth Kshirsagar for team governance.
- **`/teams`** — [web/src/app/teams/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/teams/page.tsx)  
  *Subsystems & Directory:* Direct route to 9 squad details and member profiles.
- **`/reports`** — [web/src/app/reports/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/reports/page.tsx)  
  *Velocity & Analytics:* Sprint burn-up, squad task completion velocity, and stats.
- **`/build-log`** & **`/log`** — [web/src/app/build-log/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/build-log/page.tsx)  
  *Workshop Timeline:* Daily physical fabrication logs, video attachments, and scrutiny sign-offs.
- **`/profile`** — [web/src/app/profile/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/profile/page.tsx)  
  *Personal Member Deck:* Edit custom photo, display name, and change individual PIN.
- **`/copilot`** — [web/src/app/copilot/page.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/app/copilot/page.tsx)  
  *Rulebook AI Assistant:* Dedicated fullscreen chat with Gemini 2.5 Flash for rulebook questions.

---

## 🧩 4. COMPONENT ARCHITECTURE & SUITES MAP (`web/src/components/`)

Components are organized into clean, single-responsibility suites:

```
web/src/components/
├── navigation/                      # 🧭 NAVIGATION & APP SHELL SUITE (ADR-030)
│   ├── DesktopPublicNav.tsx         # Header for public visitors (Home, About, Comp, Contact, Login)
│   ├── DesktopPortalNav.tsx         # Header for logged-in members (Dashboard tabs, notifications, profile)
│   ├── MobileSlideDrawer.tsx        # Slide-over burger drawer menu on mobile
│   ├── GlobalMobileBottomBar.tsx    # Symmetrical 5-button bottom dock for mobile devices
│   ├── PwaBannerPrompt.tsx          # "Add to Home Screen" PWA install prompt banner
│   └── Navigation.tsx               # Slim root navigation shell (333 lines)
│
├── dashboard/                       # 📊 DASHBOARD & WORKSPACE SUITES
│   ├── tasks/                       # 📋 SQUAD KANBAN & TASKS SUITE (ADR-033)
│   │   ├── taskBadgeUtils.ts        # Pure domain badges, priority level colors, and date formatters
│   │   ├── MobileTeamTasksView.tsx  # Mobile view: 4 KPI summary tiles, search, status chips, cards
│   │   ├── DesktopTaskControls.tsx  # Desktop controls: filter pills (All/My/Review/Done), search, switcher
│   │   ├── DesktopTaskTable.tsx     # 8-column data table with checkboxes, inline status buttons, pagination
│   │   └── DesktopTaskKanban.tsx    # 4-column drag-and-drop Kanban board (Todo, In Prog, Review, Done)
│   ├── TeamTasksTab.tsx             # Slim root tasks orchestrator (230 lines)
│   │
│   ├── materials/                   # 📚 RESEARCH & MATERIALS SUITE (ADR-033)
│   │   ├── materialsConstants.tsx   # Categories (Research, Specs, CAD, Reports), size & format helpers
│   │   ├── MaterialsStatsSection.tsx# 4 KPI stat cards in responsive grid
│   │   ├── MaterialsFilterBar.tsx   # 6 Category tabs, search input, squad filter, AI tag index bar
│   │   ├── MaterialsTable.tsx       # Document data table with loading, empty state, and pagination
│   │   └── BatchUploadModal.tsx     # Multi-file drag & drop zone, AI review queue, Drive streaming bar
│   ├── MaterialsTab.tsx             # Slim root materials orchestrator (418 lines)
│   │
│   ├── roles/                       # 👑 ROLES & GOVERNANCE SUITE (ADR-029)
│   │   ├── RolesHeader.tsx          # Header banner with Master Admin indicator
│   │   ├── RolesSearchAndFilter.tsx # Member search and squad filter
│   │   ├── RolesMembersTable.tsx    # Member list with primary team, secondary teams, and edit buttons
│   │   ├── RoleEditModal.tsx        # Modal to change member squad assignments and roles
│   │   └── AuditLogDrawer.tsx       # Audit history drawer tracking who changed what
│   ├── RolesManagementTab.tsx       # Slim root roles orchestrator (Parth only)
│   │
│   ├── DashboardOverviewTab.tsx     # Command center overview: active sprint progress, quick links
│   ├── SubsystemsTab.tsx            # 9 Squad cards with subsystem specs and member lists
│   ├── VelocityMetricsTab.tsx       # Team velocity analytics and burn-up charts
│   ├── CredentialsVaultTab.tsx      # Secure PIN vault for authorized team leads
│   └── MyWorkbenchTab.tsx           # Personalized "My Assigned Work" workbench
│
├── tasks/modal/                     # 🔍 TASK DETAIL & EDIT MODAL SUITE (ADR-030)
│   ├── TaskModalHeader.tsx          # Squad badge, priority badge, task ID, title, and close
│   ├── TaskStatusSwitcher.tsx       # 4-status switcher tabs & Under Review approval gate
│   ├── TaskBlockerSection.tsx       # Blocker alert banner and flag blocker input
│   ├── TaskMetadataSection.tsx      # Scope, deliverables, assigned members card, due date, log time
│   ├── TaskSubtasksSection.tsx      # Subtasks checklist progress bar and items toggle
│   ├── TaskCommentsSection.tsx      # Discussion notes feed and comment input
│   ├── TaskModalActions.tsx         # Bottom action buttons (Delete, Edit, Log Work, Complete)
│   ├── TaskEditForm.tsx             # Complete edit form for title, team, priority, members, due date
│   ├── TaskDeleteConfirmModal.tsx   # Permanent deletion confirmation modal with spinner
│   └── TaskDetailModal.tsx          # Slim root modal orchestrator (606 lines)
│
├── log/                             # 🔨 BUILD LOG & STEP VIDEO SUITE (ADR-029)
│   ├── DailyLogModal.tsx            # Create/edit daily workshop log entry
│   ├── DailyLogEntryView.tsx        # Full view of a log entry with steps and signatures
│   ├── StepVideoModal.tsx           # Google Drive video stream player modal
│   └── buildLogConstants.ts         # 5 workflow status definitions and badges
│
├── bike/                            # 🏍️ THE BIKE SHOWCASE SUITE (ADR-031)
│   ├── bikeSpecsData.ts             # Master vehicle specs: telemetry, 8 subsystems, CAE, proving ground
│   ├── BikeHeroSection.tsx          # Editorial typography & 6-metric stat ribbon
│   ├── BikeSchematicViewer.tsx      # Interactive 2D CAD blueprint with vector silhouette & 6 hotspots
│   ├── SubsystemsExplorer.tsx       # 8-subsystem deep-dive matrix (Chassis, Powertrain, Battery, etc.)
│   ├── TechSpecsTable.tsx           # Searchable & filtered technical specifications table
│   ├── CaeValidationSection.tsx     # Structural FEA & Thermal CFD virtual validation cards
│   ├── ProvingGroundSection.tsx     # SIEP Season 7.0 dynamic trials compliance mapping
│   └── BikeCtaHub.tsx               # Technical cross-linking CTA hub
│
├── team/                            # 👥 PUBLIC TEAM SHOWCASE SUITE (ADR-033)
│   ├── teamTypes.ts                 # DomainId, TeamMember, normalizeDomainId, DOMAIN_LABELS
│   ├── teamRosterData.ts            # 24-member static fallback roster + 9 mobile squad groups
│   ├── MemberCard.tsx               # Desktop card with CAD watermark, monogram, and modal
│   ├── MobilePlayerCard.tsx         # Compact mobile card with initials and domain badges
│   └── MobileTeamAccordion.tsx      # 9-squad expandable mobile accordion
├── TeamSection.tsx                  # Slim root team showcase component (307 lines)
│
├── copilot/                         # 🤖 RULEBOOK AI COPILOT SUITE
│   ├── RulebookCopilotDrawer.tsx    # Slide-over chat drawer with quick prompt pills
│   └── MarkdownMessage.tsx          # Zero-dependency rich markdown renderer with citation tags
│
├── profile/                         # 👤 PROFILE SUITE
│   ├── ProfileView.tsx              # View member details, squads, and activity
│   └── PinChangeForm.tsx            # Form to update personalized PIN with validation
│
├── notifications/                   # 🔔 NOTIFICATIONS SUITE
│   └── NotificationDrawer.tsx       # Slide-over drawer showing assigned tasks & mentions
│
└── shared/                          # 📦 SHARED REUSABLE COMPONENTS
    ├── OperationsBanner.tsx         # Top hero banner matching Operations Design System
    ├── StatCard.tsx                 # Metric card with icon and trend badge
    ├── CreateTaskModal.tsx          # Quick new task creation modal dialog
    ├── PwaInstallProvider.tsx       # PWA service worker registration and install prompt bus
    ├── TeamGallerySlider.tsx        # Auto-scrolling photo gallery of team members
    └── Canvas3D.tsx                 # Three.js 3D WebGL canvas (staged with ssr: false)
```

---

## 🔌 5. BACKEND API ROUTES MAP (`web/src/app/api/`)

Serverless API routes running on Next.js 16. All routes return clean JSON:

| API Route | HTTP Methods | Responsibility | Security & Constraints |
| :--- | :--- | :--- | :--- |
| **`/api/members`** | `GET` | Fetches dynamic team roster with custom photos & roles | Publicly cached, falls back to `ROSTER_MEMBERS` |
| **`/api/passwords`** | `GET` | Returns valid member PINs for authentication | Protected PIN comparison, fallback PIN `935200` |
| **`/api/change-password`** | `POST` | Updates a member's custom PIN in Firestore | Validates current PIN before updating |
| **`/api/forgot-password`** | `POST` | Relays 6-digit OTP to user's college email | Integrates with Google Apps Script mailer relay |
| **`/api/roles`** | `GET`, `POST` | Reads and updates member squads and domain leads | **Strictly restricted to Parth Kshirsagar** |
| **`/api/materials`** | `GET`, `POST`, `DELETE`| Manages research docs and Google Drive links | Authenticated members; delete gated to owner/lead |
| **`/api/materials/analyze`**| `POST` | Gemini 2.5 Flash batch multi-doc squad classification| Auto-extracts tags, summary, and domain squad |
| **`/api/tasks`** | `GET`, `POST`, `PUT`, `DELETE`| Kanban sprint deliverables CRUD operations | Firestore `tasks` collection with in-memory fallback |
| **`/api/logs`** | `GET`, `POST`, `PUT`| Daily workshop build logs and step videos | Firestore `build_logs` collection |
| **`/api/profile`** | `GET`, `POST` | Reads & saves member custom photos (base64/CDN) | Firestore `user_profiles` collection |
| **`/api/ai/copilot`** | `POST` | Official Rulebook AI query assistant | Grounded in `siep_rulebook_index.json` + specs |
| **`/api/contact`** | `POST` | Relays public contact/sponsorship messages | Validates email and inputs; forwards to leadership |
| **`/api/upload`** | `POST` | Small file upload endpoint | For general files (< 5 MB) |
| **`/api/store/backup`** | `GET` | Exports complete database state snapshot | Used for disaster recovery and offline backup |

---

## 🧠 6. CORE LIBRARIES & UTILITIES (`web/src/lib/`, `constants/`, `utils/`)

Where shared business logic and data providers live:

- **[web/src/lib/types.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/types.ts):**  
  The single source of truth for all TypeScript types (`UserProfile`, `Task`, `TaskStatus`, `TeamId`, `ResearchMaterial`, `DailyLogEntry`, `MaterialCategory`).
- **[web/src/lib/teams.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/teams.ts):**  
  Defines all 9 engineering squads (`mechanical`, `powertrain`, `battery`, `electronics`, `telemetry`, `brakes`, `suspension`, `safety`, `marketing` + `core`), their short codes (`MECH`, `POW`, `BATT`, `E&E`, `SOFT`, `BRK`, `SUSP`, `SAFE`, `MKT`, `CORE`), colors, and badges.
- **[web/src/lib/members.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/members.ts):**  
  Static baseline directory of all 24 team members, initial squad mappings, `isParthMasterAdmin(email)`, and domain helpers.
- **[web/src/lib/firestoreService.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/firestoreService.ts):**  
  Client for Google Cloud Firestore with automatic in-memory fallback if Firebase credentials are unavailable.
- **[web/src/lib/driveUpload.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/driveUpload.ts):**  
  Client-side resumable upload directly to Google Drive via Google Apps Script web app URL. **Bypasses Vercel's 5MB payload ceiling** to allow large CAD and 4K videos up to 5 GB!
- **[web/src/lib/geminiService.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/geminiService.ts):**  
  Gemini 2.5 Flash API connector and offline heuristic classifier for documents and tasks.
- **[web/src/lib/rulebookService.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/rulebookService.ts):**  
  Dual-grounded AI knowledge engine. Grounded in `siep_rulebook_index.json` (Rulebook citations) and `EVERYTHINGUWANNAKNOW.MD` (Vehicle technical specifications).
- **[web/src/lib/session.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/session.ts):**  
  Cookie session serializer and deserializer for seamless persistent member login.
- **[web/src/lib/taskMatching.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/taskMatching.ts):**  
  Algorithm matching tasks to members using name variations, email, and ID.
- **[web/src/lib/notifications.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/notifications.ts):**  
  Notification dispatcher for task assignments, review requests, and approvals.
- **[web/src/lib/store.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/lib/store.ts):**  
  In-memory mock store fallback.
- **[web/src/utils/avatarUtils.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/utils/avatarUtils.ts):**  
  Initials generator (`getMemberInitials`) and deterministically colored avatar badges (`getAvatarColorClass`).
- **[web/src/utils/dateUtils.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/utils/dateUtils.ts):**  
  Relative date formatter (`formatRelativeDueDate`, e.g., "Overdue by 2d", "Due in 3d").
- **[web/src/constants/dashboard.ts](file:///Users/parth/Desktop/SIEP%20Website/web/src/constants/dashboard.ts):**  
  Status columns (`STATUS_COLUMNS`), priority badges (`PRIORITY_BADGES`), and tab IDs.

---

## 🔒 7. AUTHENTICATION & GOVERNANCE MODEL

```mermaid
flowchart TD
  User([Member Enters Portal]) --> Login[web/src/app/login/page.tsx]
  Login --> CheckPIN{Enter 6-Digit PIN}
  CheckPIN -->|Matches 935200 or Custom PIN| AuthSuccess[AuthContext Sets Session]
  CheckPIN -->|Forgot PIN| OTPRecovery[OTP Sent via Apps Script Relay]
  
  AuthSuccess --> RoleGate{Check Email & Role}
  RoleGate -->|parthkshirsagrr@gmail.com| MasterAdmin[Master Admin: Full Governance /roles]
  RoleGate -->|isCore or isLead| SquadLead[Lead Privileges: Approve Reviews, Delete Docs]
  RoleGate -->|Regular Member| StandardMember[Member Privileges: Start Work, Submit Review, Upload]
```

- **Universal Fallback PIN:** `935200` allows any verified member to sign in during offline/testing phases.
- **Custom PIN Storage:** Custom PINs are saved in Firestore collection `member_passwords/{cleanEmail}`.
- **Master Admin Rule:** Controlled by `isParthMasterAdmin()` in `web/src/lib/members.ts`. Only `parthkshirsagrr@gmail.com` (and its dot-aliases) can access `/roles` or mutate permissions.
- **Review Approval Gate:** Only Leads or Core members can approve deliverables from `review` $\rightarrow$ `done`.

---

## 🏍️ 8. 3D DIGITAL TWIN & CAD PIPELINE

- **Authoritative CAD Master:**  
  [Electric_Scrambler_Exo.blend](file:///Users/parth/Desktop/SIEP%20Website/Electric_Scrambler_Exo.blend) (Blender 5.2.2 LTS). Spaceframe geometry, mid-drive motor placement, and battery pack housing.
- **WebGL Compressed Assets:**  
  - [web/public/moto.glb](file:///Users/parth/Desktop/SIEP%20Website/web/public/moto.glb) (~896 KB compressed full vehicle)
  - [web/public/chassis.glb](file:///Users/parth/Desktop/SIEP%20Website/web/public/chassis.glb) (~125 KB tubular spaceframe)
- **3D Staging Protocol (ADR-031):**  
  Active WebGL canvas is hidden from the public production showcase pending final physical scrutineering. Raw GLB assets remain safely preserved in `web/public/`.
- **2D Vector Blueprint:**  
  [BikeSchematicViewer.tsx](file:///Users/parth/Desktop/SIEP%20Website/web/src/components/bike/BikeSchematicViewer.tsx) renders interactive vector geometry with real millimeter dimensions (1,340 mm wheelbase, 180 mm ground clearance).

---

## 📚 9. LIVING AGENT MEMORY HUB (`.context/`)

Whenever an agent or developer works on this codebase, these 5 documents maintain total continuity:

1. **[CODEBASE_MAP.md](file:///Users/parth/Desktop/SIEP%20Website/.context/CODEBASE_MAP.md) (This File):**  
   "Kya cheez kidhar hai" — complete index of files, directories, routes, and components.
2. **[ARCHITECTURE.md](file:///Users/parth/Desktop/SIEP%20Website/.context/ARCHITECTURE.md):**  
   Detailed system architecture, tech stack versions, modular component suites breakdown, and data flow.
3. **[DATABASE.md](file:///Users/parth/Desktop/SIEP%20Website/.context/DATABASE.md):**  
   Firestore database models (`tasks`, `materials`, `build_logs`, `user_profiles`, `member_passwords`, `team_roles`).
4. **[DECISIONS.md](file:///Users/parth/Desktop/SIEP%20Website/.context/DECISIONS.md):**  
   Architectural Decision Records index (ADR-001 through ADR-033) detailing why decisions were made.
5. **[HANDOVER.md](file:///Users/parth/Desktop/SIEP%20Website/.context/HANDOVER.md):**  
   In-flight session state, recent changes, verification commands, and immediate next steps.
6. **[CONTEXT.md](file:///Users/parth/Desktop/SIEP%20Website/.context/CONTEXT.md):**  
   High-level vehicle specs, 9 squads summary, and runtime invariants.
