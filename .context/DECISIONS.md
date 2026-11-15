# 📜 ARCHITECTURE DECISION RECORDS (ADRs) - MASTER INDEX
> **Authoritative Register of Architectural Trade-offs, Standards & Invariant Constraints**  
> *Project: Riders Bay Smart Scrambler E-Bike | SIEP Season 7.0 (ISIEINDIA)*  
> *All detailed ADR entries are sharded into 3 volumes strictly below 300 lines each.*  
> *Companion Documents:* [.context/INDEX.md](file://.context/INDEX.md) | [.context/CODEBASE_MAP.md](file://.context/CODEBASE_MAP.md) | [.context/HANDOVER.md](file://.context/HANDOVER.md)  
> *Last Synced:* 2026-11-15 14:05 IST (Bifurcation Round 4)

---

## 📚 ADR VOLUMES QUICK DIRECTORY

| Volume | ADR Range | Scope & Focus Areas | Lines | Direct Link |
| :--- | :--- | :--- | :--- | :--- |
| **Volume 1** | **ADR-001 to ADR-015** | Next.js 16/React 19/Tailwind v4, PIN Auth, 3D Asset Pipeline, PWA Dock, Mobile UI, Hierarchy Gates | ~215 | [ADR_VOL1.md](file://.context/decisions/ADR_VOL1.md) |
| **Volume 2** | **ADR-016 to ADR-024** | Slide-Over Burger Drawer, Desktop Portal 5 Mockups, Materials Drive Hub, Roles Console, Hierarchy Lockdown | ~140 | [ADR_VOL2.md](file://.context/decisions/ADR_VOL2.md) |
| **Volume 3** | **ADR-025 to ADR-034** | Gemini Batch Materials, Rulebook AI Copilot, SPA Event Bus, Bike Staging, Round 3 & 4 Modular Bifurcations | ~120 | [ADR_VOL3.md](file://.context/decisions/ADR_VOL3.md) |

---

## 📑 MASTER ADR CATALOG (001 - 034)

| ADR | Title | Date | Status | Volume |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Next.js 16 App Router + React 19 + Tailwind CSS v4 | 2026-11-10 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-001) |
| **ADR-002** | Dual-Store Authentication & Session Engine (PIN + Firestore) | 2026-11-10 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-002) |
| **ADR-003** | Multi-Squad Member Assignment (`secondaryTeams`) | 2026-11-10 | Superseded (ADR-021) | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-003) |
| **ADR-004** | Direct Resumable Uploads for Large CAD Assets (5 GB Bypass) | 2026-11-10 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-004) |
| **ADR-005** | Decoupled 3D Asset Pipeline (Blender to Compressed WebGL) | 2026-11-10 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-005) |
| **ADR-006** | Version-Controlled Agent Context & Handover Standard | 2026-11-10 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-006) |
| **ADR-007** | Member Profile Customization, Canvas Image Compression & Roster Sync | 2026-11-11 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-007) |
| **ADR-008** | Mobile Profile UX Refinement, PWA Banner De-clutter & Native Photo Action Sheet | 2026-11-11 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-008) |
| **ADR-009** | Strict PIN Invalidation, Priority Squad Sorting & Minimal Bottom Action Sheet | 2026-11-12 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-009) |
| **ADR-010** | Equal Domain Representation in Member Profile | 2026-11-12 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-010) |
| **ADR-011** | Restrict Bottom Navigation Dock Strictly to Standalone Mobile Web App (PWA) | 2026-11-12 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-011) |
| **ADR-012** | Mobile UI Rework — Single Responsibility Operational Views | 2026-11-12 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-012) |
| **ADR-013** | Build Log Mobile Rework & 5-Status Engineering Workflow | 2026-11-13 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-013) |
| **ADR-014** | Strict Domain-Scoped Task Isolation & 4-Tile Status Uniformity | 2026-11-13 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-014) |
| **ADR-015** | Hierarchy-Gated Task Completion & Review Observation Protocol | 2026-11-13 | Accepted | [Vol 1](file://.context/decisions/ADR_VOL1.md#ad-015) |
| **ADR-016** | Modern Slide-Over Burger Menu & Navigation Parity | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-016) |
| **ADR-017** | Universal Build Log Access & Pure In-App Navigation Experience | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-017) |
| **ADR-018** | Desktop Portal Redesign (PRD v1.0 & 5 Reference Mockups) | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-018) |
| **ADR-019** | Dedicated Research & Materials Repository with Direct Google Drive Upload | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-019) |
| **ADR-020** | Master Role & Team Governance Console (Exclusively for Parth Kshirsagar) | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-020) |
| **ADR-021** | Role Editing Resilience, Absolute Domain Equality & Dynamic Public Roster Sync | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-021) |
| **ADR-022** | Roles Management Console UI Simplification & Authority Gate Streamlining | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-022) |
| **ADR-023** | Specific Domain Leadership, Public Hierarchy Protocol & Domain Lead Highlighting | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-023) |
| **ADR-024** | Mobile/Web Permission Parity, Build Log Hierarchy Lockdown & Zero Emojis | 2026-11-13 | Accepted | [Vol 2](file://.context/decisions/ADR_VOL2.md#ad-024) |
| **ADR-025** | Multi-Document Batch Upload, Gemini AI Auto-Bifurcation & Tag Indexing | 2026-11-13 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-025) |
| **ADR-026** | Official SIEP Season 7.0 Rulebook AI Copilot with Non-Overridable Citations | 2026-11-13 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-026) |
| **ADR-027** | AI Copilot Dual-Domain Grounding, Gemini 2.5 Flash Engine & Rich Markdown | 2026-11-14 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-027) |
| **ADR-028** | Seamless Event-Driven Notification Bus, SPA Navigation & Real-Time Deck Sync | 2026-11-15 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-028) |
| **ADR-029** | Modular Bifurcation of Monolithic Dashboard & Activity Log Engines | 2026-11-15 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-029) |
| **ADR-030** | Modular Bifurcation of Navigation Engine & Task Detail Modal | 2026-11-15 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-030) |
| **ADR-031** | Complete Rework of The Bike Page Architecture & 3D Model Staging Protocol | 2026-11-15 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-031) |
| **ADR-032** | Staging "The Bike" in Testing/Validation Phase & Detachment from Public Navigation | 2026-11-15 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-032) |
| **ADR-033** | Modular Bifurcation of Tasks Engine, Materials Repository & Public Team Showcase | 2026-11-15 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-033) |
| **ADR-034** | Universal 300-Line Upper Bound & Modular Bifurcation of Next.js Page Routes | 2026-11-15 | Accepted | [Vol 3](file://.context/decisions/ADR_VOL3.md#ad-034) |
