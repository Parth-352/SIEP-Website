# 🌐 RIDERS BAY LIVING CODEBASE CONTEXT
> **High-Level Project Context, Engineering Squads & Active Repository State**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0 (ISIEINDIA)*  
> *Institution: SNJB's KBJ College of Engineering, Chandwad, Nashik*  
> *Companion Documents:* [.context/ARCHITECTURE.md](file://.context/ARCHITECTURE.md) | [.context/DATABASE.md](file://.context/DATABASE.md) | [.context/DECISIONS.md](file://.context/DECISIONS.md) | [.context/HANDOVER.md](file://.context/HANDOVER.md)  
> *Last Synced:* 2026-11-13 (Daily Codebase Context Sync)

---

## 📌 1. PROJECT ESSENTIALS & MISSION
Riders Bay is an electric vehicle development team designing and fabricating an indigenous **Smart Scrambler Electric Motorcycle** for the **Student Innovation Electric Pursuit (SIEP Season 7.0)** organized by ISIEINDIA.

- **Vehicle Architecture:** High-strength Chromoly steel spaceframe, 72V 40Ah swappable Li-ion battery pack with smart BMS, 5 kW peak BLDC mid-drive powertrain, and an ESP32 CAN 2.0B telemetry unit.
- **3D Digital Twin:** Real-time 3D web inspection model with component explosion, stress-test overlays, and CAD download portal (`Electric_Scrambler_Exo.blend`, `web/public/moto.glb`, `web/public/chassis.glb`).
- **Web Application (`/web`):** Next.js 16.4.5, React 19.3.0, Tailwind CSS v4, Firebase Firestore & PIN auth. Features real-time Engineering Dashboard, unified Kanban sprint board, workshop daily build logs with Google Drive video streaming, dedicated Research & Materials repository, Master Role & Team Governance console, and dynamic public showcase.

---

## 👥 2. ENGINEERING SQUAD STRUCTURE (9 SQUADS + CORE)

| Squad / Domain | Technical Scope | Lead Area & Key Objectives |
| :--- | :--- | :--- |
| **Chassis** (`mechanical`) | Spaceframe, geometry, ergonomics | Chromoly 4130 tubular lattice, weight optimization, TIG welding |
| **Powertrain** (`mechanical`) | Motor, inverter, transmission | 5 kW peak BLDC mid-drive, reduction chain, sprocket ratios |
| **Battery** (`entc` / `research`) | Pack assembly, thermal, BMS | 72V 40Ah battery pack, cell balancing, safety disconnect |
| **Electronics** (`entc`) | Wiring harness, low-voltage power | 12V DC-DC converter, relays, lights, instrumentation, PDU |
| **Telemetry** (`software`) | IoT, CAN bus, sensor network | ESP32-S3, CAN 2.0B at 500 kbps, cloud telemetry, web portal |
| **Brakes** (`mechanical`) | Hydraulic stopping, regen | Dual disc brakes, regenerative braking integration, calipers |
| **Suspension** (`mechanical`) | Dynamics, damping, handling | Inverted front forks (USD), rear adjustable monoshock |
| **Safety** (`entc` / `core`) | HV interlocks, crash sensors | Inertia switch, insulation monitor, emergency kill switch |
| **Marketing** (`socialmedia` / `sponsorship`) | Sponsorships, social media, media | Brand identity, sponsor deck, competition documentation |
| **Core** (`core`) | Team Leadership & Governance | Technical compliance, rulebook adherence, sprint management |

---

## 📜 3. RECENT GIT COMMITS & REPOSITORY ACTIVITY
- `59f25d9` - `fix(roles): remove duplicate gray domain badges and remove single authority gate card`
- `f616bb7` - `feat(portal): resolve role editing data bug, eliminate primary/secondary domain hierarchy, enable password and PFP management, and sync dynamic roster across website`
- `cd0237c` - `docs(handover): record role management console implementation and deployment web-qipaowjaz`
- `18c4d41` - `feat(portal): add master role management console restricted exclusively to parthkshirsagrr@gmail.com with captain/vice captain appointment and permission revocation`
- `50d34dd` - `docs(handover): record materials repository implementation and deployment web-asd9mqyuc`
- `7f05e5f` - `feat(portal): add dedicated research and materials repository tab with direct Google Drive upload for all members`
- `6796f65` - `docs(handover): record mobile profile redesign matching reference design`
- `872dce4` - `feat(profile): rework mobile profile matching reference design, remove PWA banners, add collapsible domains & photo action sheet`
- `2f850bc` - `docs(handover): update production deployment confirmation and status`
- `af6266f` - `chore(pwa): bump service worker cache version to v2 to auto-purge stale client caches`
- `c864cfa` - `feat(profile): implement profile identity, inline name editor, photo upload, dual PIN security & team sync`
- `2115c7e` - `feat(dashboard): modularize dashboard architecture, implement actionable KPI ribbon & mobile Instagram dock`
- `1a7f4f4` - `fix(tasks): completely remove all mock/seed tasks from database and cache`

---

## 📁 4. WORKSPACE DIRECTORY STRUCTURE MAP
```
SIEP Website/
├── .context/                      # Living Agent Memory Hub
│   ├── ARCHITECTURE.md            # System architecture, stack & UI topology
│   ├── DATABASE.md                # Firestore database schemas & access models
│   ├── CONTEXT.md                 # Project mission, squads & git activity
│   ├── DECISIONS.md               # Architecture Decision Records (ADRs 001 - 021)
│   └── HANDOVER.md                # Active tasks & agent pickup points
├── web/                           # Next.js 16.4.5 + React 19 Web Application
│   ├── public/                    # 3D assets (moto.glb, chassis.glb), PWA sw.js, media
│   ├── src/
│   │   ├── app/                   # App Router pages:
│   │   │   ├── api/               # API routes:
│   │   │   │   ├── members/       # Public dynamic team members endpoint (GET)
│   │   │   │   ├── roles/         # Master role console endpoint (GET/POST - Parth only)
│   │   │   │   ├── materials/     # Research & Materials repo (GET/POST/DELETE)
│   │   │   │   ├── tasks/         # Kanban tasks query/mutation
│   │   │   │   ├── logs/          # Daily engineering build logs
│   │   │   │   ├── profile/       # Member profile sync
│   │   │   │   ├── passwords/     # Team & member PIN queries
│   │   │   │   ├── change-password/# Direct PIN change endpoint
│   │   │   │   ├── forgot-password/# OTP recovery relay via Apps Script
│   │   │   │   ├── upload/        # Direct file upload endpoint
│   │   │   │   └── contact/       # Public contact message relay
│   │   │   ├── dashboard/         # Command Center with 8 specialized tabs
│   │   │   ├── materials/         # Dedicated Research & Materials route
│   │   │   ├── roles/             # Master Role & Team Governance route (Parth only)
│   │   │   ├── tasks/             # Dedicated Tasks Workspace route
│   │   │   ├── teams/             # Dedicated Teams & Subsystems route
│   │   │   ├── reports/           # Dedicated Velocity & Progress Reports route
│   │   │   ├── build-log/         # Dedicated Build Log timeline route
│   │   │   ├── profile/           # Dedicated Member Profile route
│   │   │   ├── about/             # Dynamic team roster & history (/about#team)
│   │   │   ├── bike/              # Vehicle specifications & 3D showcase
│   │   │   ├── competition/       # SIEP 7.0 rulebook & milestone tracker
│   │   │   ├── log/               # Daily workshop engineering log archive
│   │   │   ├── login/             # PIN authentication portal
│   │   │   └── page.tsx           # Marketing Landing Page & Hero 3D Stage
│   │   ├── components/            # React 19 UI components & Three.js 3D viewers
│   │   │   ├── dashboard/         # MaterialsTab.tsx, RolesManagementTab.tsx, SubsystemsTab.tsx,
│   │   │   │                      # TeamTasksTab.tsx, VelocityMetricsTab.tsx, DashboardOverviewTab.tsx,
│   │   │   │                      # CredentialsVaultTab.tsx, MyWorkbenchTab.tsx
│   │   │   ├── profile/           # ProfileView.tsx, PinChangeForm.tsx
│   │   │   ├── navigation/        # BottomNav.tsx (Instagram dock), Navigation.tsx (Desktop top bar)
│   │   │   ├── shared/            # OperationsBanner.tsx, StatCard.tsx, CreateTaskModal.tsx
│   │   │   └── TeamSection.tsx    # Dynamic public roster section (hydrates from /api/members)
│   │   ├── context/               # AuthContext.tsx (PIN auth & multi-domain roles)
│   │   └── lib/                   # Persistence, types, and official directory baseline:
│   │       ├── firestoreService.ts# Cloud Firestore SDK connector with fallback
│   │       ├── members.ts         # 23-member baseline directory, getMemberDomains(), isParthMasterAdmin()
│   │       ├── store.ts           # In-memory store fallback with baseline merging
│   │       ├── session.ts         # Cookie session encoding/decoding
│   │       ├── teams.ts           # Domain metadata & squad configuration
│   │       └── types.ts           # TypeScript domain definitions
│   └── package.json               # Next.js 16.4.5, React 19.3.0, Tailwind v4
├── scripts/                       # Context validation & build helper scripts
│   └── context-check.sh           # Daily context verification script
├── Electric_Scrambler_Exo.blend   # Authoritative Blender 5.2.2 LTS 3D digital twin
├── AGENTS.md                      # Agent operating rules & protocols
├── context.md                     # Blender 3D scene & MCP documentation
└── EVERYTHINGUWANNAKNOW.MD         # Full technical vehicle specs & roster
```

---

## ⚡ 5. KEY RUNTIME CONSTRAINTS & CONVENTIONS
- **PIN Authentication:** Universal fallback PIN `935200`. Custom PINs stored per member in Firestore `member_passwords/{cleanEmail}` with automatic alias sync for Parth's email.
- **Master Role Authority:** Strictly guarded by `isParthMasterAdmin(email)` matching `parthkshirsagrr@gmail.com` and its alias. Non-authorized access to `/roles` or `/api/roles` is blocked.
- **Absolute Domain Equality:** All assigned squads exist in `domains: TeamId[]` with 100% equal prominence and badges. No primary/secondary hierarchy.
- **Bracket Shortcodes Restriction:** Square bracket squad tags (e.g. `[MECH] [DSGN] Meet Samdadiya`) are strictly isolated to the Master Roles table for fast admin scanning; clean names are rendered everywhere else.
- **Dynamic Public Roster Sync:** Public site (`TeamSection.tsx`) and internal directory (`SubsystemsTab.tsx`) fetch real-time data from `/api/members`.
- **Dedicated Materials Repository:** Centralized hub at `/materials` (`MaterialsTab.tsx`) with direct Google Drive resumable streaming up to 5 GB for all authenticated members.
- **Three.js WebGL:** All 3D canvases must use dynamic imports with `ssr: false` to avoid hydration mismatches.
- **Clean Type Safety:** Always verify with `cd web && npx tsc --noEmit`.
