# 🌐 RIDERS BAY LIVING CODEBASE CONTEXT
> **High-Level Project Context, Engineering Squads & Active Repository State**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0 (ISIEINDIA)*  
> *Institution: SNJB's KBJ College of Engineering, Chandwad, Nashik*  
> *Companion Documents:* [.context/CODEBASE_MAP.md](file://.context/CODEBASE_MAP.md) *(Kya Cheez Kidhar Hai)* | [.context/ARCHITECTURE.md](file://.context/ARCHITECTURE.md) | [.context/DATABASE.md](file://.context/DATABASE.md) | [.context/DECISIONS.md](file://.context/DECISIONS.md) | [.context/HANDOVER.md](file://.context/HANDOVER.md)  
> *Last Synced:* 2026-11-15 13:20 IST (Codebase Map & Bifurcation Sync)

---

## 📌 1. PROJECT ESSENTIALS & MISSION
Riders Bay is an electric vehicle development team designing and fabricating an indigenous **Smart Scrambler Electric Motorcycle** for the **Student Innovation Electric Pursuit (SIEP Season 7.0)** organized by ISIEINDIA.

- **Vehicle Architecture:** High-strength Chromoly steel spaceframe, 72V 40Ah swappable Li-ion battery pack with smart BMS, 5 kW peak BLDC mid-drive powertrain, and an ESP32 CAN 2.0B telemetry unit.
- **3D Digital Twin Pipeline:** Real-time 3D web inspection model with component explosion and stress overlays (`Electric_Scrambler_Exo.blend`, `web/public/moto.glb`, `web/public/chassis.glb`). *Staged for physical unveiling per ADR-031.*
- **Web Application (`/web`):** Next.js 16.4.5, React 19.3.0, Tailwind CSS v4, Firebase Firestore & PIN auth. Features real-time Engineering Dashboard, unified Kanban sprint board, workshop daily build logs with Google Drive video streaming, dedicated Research & Materials repository, Master Role & Team Governance console, official SIEP 7.0 Rulebook AI Copilot with non-overridable citations, and dynamic public showcase.

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
- `6276bce` - `docs(handover): record The Bike rework production deployment`
- `1e209de` - `feat(bike): complete rework of The Bike page and 3D model staging protocol`
- `1d4acba` - `docs(handover): record contact page update deployment`
- `72f4301` - `feat(contact): dynamic leadership liaisons, clean inquiry form inputs, and campus badge cleanup`
- `0f87abf` - `docs(handover): record successful vercel production deployment`

> **Active Repository & Working Tree State:**  
> Clean working tree on `main`, up to date with `origin/main`. TypeScript compiles clean with 0 errors (`cd web && npx tsc --noEmit`). Production build compiles all 33 static & dynamic routes cleanly in ~2.1s under Turbopack (`npm run build`).

---

## 📁 4. WORKSPACE DIRECTORY STRUCTURE MAP
```
SIEP Website/
├── .context/                      # Living Agent Memory Hub
│   ├── CODEBASE_MAP.md            # Complete directory map (Kya cheez kidhar hai)
│   ├── ARCHITECTURE.md            # System architecture, stack & UI topology
│   ├── DATABASE.md                # Firestore database schemas & access models
│   ├── CONTEXT.md                 # Project mission, squads & git activity
│   ├── DECISIONS.md               # Architecture Decision Records (ADRs 001 - 033)
│   └── HANDOVER.md                # Active tasks & agent pickup points
├── web/                           # Next.js 16.4.5 + React 19 Web Application
│   ├── data/
│   │   └── siep_rulebook_index.json # 46-page Vision OCR index of official SIEP 7.0 Rulebook
│   ├── public/                    # 3D assets (moto.glb, chassis.glb), PWA sw.js, media
│   ├── src/
│   │   ├── app/                   # App Router pages:
│   │   │   ├── api/               # API routes:
│   │   │   │   ├── ai/copilot/    # Rulebook AI Copilot (GET redirect, POST query)
│   │   │   │   ├── members/       # Public dynamic team members endpoint (GET)
│   │   │   │   ├── roles/         # Master role console endpoint (GET/POST - Parth only)
│   │   │   │   ├── materials/     # Research & Materials repo (GET/POST/DELETE)
│   │   │   │   ├── materials/analyze/# Multi-file batch AI analysis & squad auto-bifurcation
│   │   │   │   ├── tasks/         # Kanban tasks query/mutation
│   │   │   │   ├── logs/          # Daily engineering build logs
│   │   │   │   ├── profile/       # Member profile sync
│   │   │   │   ├── passwords/     # Team & member PIN queries
│   │   │   │   ├── change-password/# Direct PIN change endpoint
│   │   │   │   ├── forgot-password/# OTP recovery relay via Apps Script
│   │   │   │   ├── upload/        # Direct file upload endpoint
│   │   │   │   └── contact/       # Public contact message relay
│   │   │   ├── copilot/           # Dedicated SIEP 7.0 Rulebook AI Copilot route
│   │   │   ├── dashboard/         # Command Center with 8 specialized tabs
│   │   │   ├── materials/         # Dedicated Research & Materials route
│   │   │   ├── roles/             # Master Role & Team Governance route (Parth only)
│   │   │   ├── tasks/             # Dedicated Tasks Workspace route
│   │   │   ├── teams/             # Dedicated Teams & Subsystems route
│   │   │   ├── reports/           # Dedicated Velocity & Progress Reports route
│   │   │   ├── build-log/         # Dedicated Build Log timeline route
│   │   │   ├── profile/           # Dedicated Member Profile route
│   │   │   ├── about/             # Dynamic team roster & history (/about#team)
│   │   │   ├── bike/              # Complete engineering showcase & CAD schematic blueprint viewer
│   │   │   ├── competition/       # SIEP 7.0 rulebook & milestone tracker
│   │   │   ├── contact/           # Team contact and partnership inquiry page
│   │   │   ├── log/               # Daily workshop engineering log archive
│   │   │   ├── login/             # PIN authentication portal
│   │   │   └── page.tsx           # Marketing Landing Page & Hero Stage
│   │   ├── components/            # React 19 UI components & Three.js 3D viewers
│   │   │   ├── bike/              # The Bike Engineering Showcase Suite (ADR-031):
│   │   │   │   ├── bikeSpecsData.ts        # Authoritative master dataset
│   │   │   │   ├── BikeHeroSection.tsx     # Display typography & 6-card telemetry ribbon
│   │   │   │   ├── BikeSchematicViewer.tsx # Interactive 2D vector blueprint & hotspots
│   │   │   │   ├── SubsystemsExplorer.tsx  # 8-subsystem deep-dive matrix
│   │   │   │   ├── TechSpecsTable.tsx      # Searchable & filtered tech specs table
│   │   │   │   ├── CaeValidationSection.tsx# Structural FEA & Thermal CFD validation
│   │   │   │   ├── ProvingGroundSection.tsx# SIEP Season 7.0 dynamic trials mapping
│   │   │   │   └── BikeCtaHub.tsx          # Technical cross-linking CTA hub
│   │   │   ├── copilot/           # RulebookCopilotDrawer.tsx, MarkdownMessage.tsx
│   │   │   ├── dashboard/         # MaterialsTab.tsx, RolesManagementTab.tsx, SubsystemsTab.tsx,
│   │   │   │                      # TeamTasksTab.tsx, VelocityMetricsTab.tsx, DashboardOverviewTab.tsx,
│   │   │   │                      # CredentialsVaultTab.tsx, MyWorkbenchTab.tsx
│   │   │   │   └── roles/         # Modular Roles Governance Suite (ADR-029)
│   │   │   ├── log/               # Modular Build Log Suite (ADR-029)
│   │   │   ├── navigation/        # Modular Navigation Engine (ADR-030)
│   │   │   ├── tasks/             # Modular Tasks Suite & modal/ (ADR-030)
│   │   │   ├── notifications/     # NotificationDrawer.tsx (Personal deck alerts)
│   │   │   ├── profile/           # ProfileView.tsx, PinChangeForm.tsx
│   │   │   ├── shared/            # OperationsBanner.tsx, StatCard.tsx, CreateTaskModal.tsx
│   │   │   └── TeamSection.tsx    # Dynamic public roster section (hydrates from /api/members)
│   │   ├── context/               # AuthContext.tsx (PIN auth & multi-domain roles)
│   │   └── lib/                   # Persistence, types, and official directory baseline:
│   │       ├── firestoreService.ts# Cloud Firestore SDK connector with fallback
│   │       ├── geminiService.ts   # Gemini 2.5 Flash client & heuristic auto-bifurcation
│   │       ├── rulebookService.ts # Dual-domain grounding, vehicle specs, citations & deterministic synthesis
│   │       ├── notifications.ts   # Personalized alerts & Web Push triggers
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
- **3D Model Staging Protocol (ADR-031):** The 3D model viewer on `/bike` and `/` background is staged/hidden from public view pending pre-competition scrutiny refinement; raw GLBs remain preserved in `web/public/`.
- **Modular Component Architecture (ADR-029, ADR-030):** Large functional blocks are bifurcated into modular directory suites (`roles/`, `log/`, `navigation/`, `tasks/modal/`).
- **Dual-Domain AI Copilot & Citations:** Immutable server-side enforcement. All competition and scrutiny answers must cite official Section and Page numbers; vehicle specifications are grounded directly in `EVERYTHINGUWANNAKNOW.MD` and `bikeSpecsData.ts`. Powered by Gemini 2.5 Flash with deterministic semantic synthesis fallback.
- **Batch Document AI Processing:** Staged review queue with Gemini 2.5 Flash auto-bifurcation and offline heuristic fallback.
- **Dynamic Public Roster Sync:** Public site (`TeamSection.tsx`) and internal directory (`SubsystemsTab.tsx`) fetch real-time data from `/api/members`.
- **Dedicated Materials Repository:** Centralized hub at `/materials` (`MaterialsTab.tsx`) with direct Google Drive resumable streaming up to 5 GB for all authenticated members.
- **Three.js WebGL:** All 3D canvases must use dynamic imports with `ssr: false` to avoid hydration mismatches.
- **Zero-Emoji Rule:** All UI elements in `web/src` must use SVG vector icons or text badges; zero emojis.
- **Clean Type Safety:** Always verify with `cd web && npx tsc --noEmit`.
