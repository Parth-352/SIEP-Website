# 🌐 RIDERS BAY LIVING CODEBASE CONTEXT
> **High-Level Project Context, Engineering Squads & Active Repository State**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0 (ISIEINDIA)*  
> *Institution: SNJB's KBJ College of Engineering, Chandwad, Nashik*  
> *Last Synced:* 2026-11-12 (Daily Codebase Context Sync)

---

## 📌 1. PROJECT ESSENTIALS & MISSION
Riders Bay is an electric vehicle development initiative designing and fabricating an indigenous **Smart Scrambler Electric Motorcycle** for the **Student Innovation Electric Pursuit (SIEP Season 7.0)** organized by ISIEINDIA.

- **Vehicle Architecture:** High-strength Chromoly steel spaceframe, 72V 40Ah swappable Li-ion battery pack with smart BMS, 5 kW mid-drive powertrain, and an ESP32 CAN 2.0B telemetry unit.
- **Digital Twin:** Real-time 3D web inspection model with component explosion, stress-test overlays, and CAD download portal.
- **Web Application:** Real-time engineering dashboard, Kanban sprint board, workshop daily log tracking, dedicated member profile identity hub, and public showcase.

---

## 👥 2. ENGINEERING SQUAD STRUCTURE (9 SQUADS + CORE)

| Squad | Domain | Lead Area |
| :--- | :--- | :--- |
| **Chassis** | Frame, geometry, ergonomics | Chromoly 4130 tubular lattice, weight optimization |
| **Powertrain** | Motor, inverter, transmission | 5 kW peak BLDC, reduction ratios, chain drive |
| **Battery** | Pack assembly, thermal, BMS | 72V 40Ah battery pack, cell balancing, safety disconnect |
| **Electronics** | Wiring harness, low-voltage power | 12V DC-DC converter, relays, lights, instrumentation |
| **Telemetry** | IoT, CAN bus, sensor network | ESP32-S3, CAN 2.0B at 500 kbps, cloud telemetry |
| **Brakes** | Hydraulic stopping, regen | Dual disc brakes, regenerative braking integration |
| **Suspension** | Dynamics, damping, handling | Inverted front forks, rear adjustable monoshock |
| **Safety** | HV interlocks, crash sensors | Inertia switch, insulation monitor, emergency kill switch |
| **Marketing** | Sponsorships, social media, media | Brand identity, investor deck, partner relations |
| **Core** | Captaincy & Management | Technical compliance, rulebook adherence, sprint deadlines |

---

## 📜 3. RECENT GIT COMMITS & REPOSITORY ACTIVITY
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
│   ├── DECISIONS.md               # Architecture Decision Records (ADRs)
│   └── HANDOVER.md                # Active tasks & agent pickup points
├── web/                           # Next.js 16 + React 19 Web Application
│   ├── public/                    # 3D assets (moto.glb, chassis.glb), PWA sw.js, media
│   ├── src/
│   │   ├── app/                   # App Router pages (/dashboard, /about, /bike, /competition, /log)
│   │   │   └── api/               # API routes (profile, change-password, forgot-password, tasks, logs)
│   │   ├── components/            # React 19 UI components & Three.js 3D viewers
│   │   │   ├── profile/           # ProfileView.tsx, PinChangeForm.tsx
│   │   │   ├── dashboard/         # MyWorkbenchTab.tsx, VelocityMetricsTab.tsx, KanbanBoard.tsx
│   │   │   ├── navigation/        # BottomNav.tsx (Instagram dock), Navigation.tsx
│   │   │   └── shared/            # CreateTaskModal.tsx, TaskDetailModal.tsx
│   │   ├── context/               # AuthContext.tsx (PIN auth & multi-squad roles)
│   │   └── lib/                   # Firestore service, store, types, roster
│   └── package.json               # Dependencies & scripts
├── scripts/                       # Context validation & build helper scripts
├── Electric_Scrambler_Exo.blend   # Authoritative Blender 5.2.2 LTS 3D digital twin
├── AGENTS.md                      # Agent operating rules & protocols
├── context.md                     # Blender 3D scene & MCP documentation
└── EVERYTHINGUWANNAKNOW.MD         # Full technical vehicle specs & roster
```

---

## ⚡ 5. KEY RUNTIME CONSTRAINTS & CONVENTIONS
- **PIN Authentication:** Universal fallback PIN `935200`. Custom PINs stored per member in Firestore `member_passwords/{cleanEmail}`.
- **Member Profile Identity:** Names and compressed avatars persisted to Firestore `member_profiles` and dynamically synced across dashboard, navigation, and team pages.
- **PWA Service Worker:** Versioned as `siep-pwa-v2` with client-side cache auto-purge. Floating banners suppressed to prevent docking collision.
- **Three.js WebGL:** All 3D canvases must use dynamic imports with `ssr: false` to avoid hydration mismatches.
- **Large Uploads (>5MB):** Handled via Google Drive resumable sessions (`/api/drive/resumable-session`) to bypass serverless payload limits.
- **Compilation Check:** Always verify with `cd web && npx tsc --noEmit`.
