# 📜 ADR VOLUME 2 (ADR-016 to ADR-024)
> **Slide-Over Navigation, Desktop Portal Redesign, Materials Hub & Executive Governance**  
> *Parent Index:* [.context/DECISIONS.md](file://.context/DECISIONS.md)  
> *Scope: Slide-over burger drawer, desktop portal redesign (5 mockups), materials repository with direct Google Drive bypass, Master Roles console, domain leadership, and hierarchy lockdown.*

---

## 📑 VOLUME 2 INDEX
| ADR | Title | Date | Status |
| :--- | :--- | :--- | :--- |
| **ADR-016** | Modern Slide-Over Burger Menu & Navigation Parity | 2026-11-13 | Accepted |
| **ADR-017** | Universal Build Log Access & Pure In-App Navigation Experience | 2026-11-13 | Accepted |
| **ADR-018** | Desktop Portal Redesign (PRD v1.0 & 5 Reference Mockups) | 2026-11-13 | Accepted |
| **ADR-019** | Dedicated Research & Materials Repository with Direct Google Drive Upload | 2026-11-13 | Accepted |
| **ADR-020** | Master Role & Team Governance Console (Exclusively for Parth Kshirsagar) | 2026-11-13 | Accepted |
| **ADR-021** | Role Editing Resilience, Absolute Domain Equality & Dynamic Public Roster Sync | 2026-11-13 | Accepted |
| **ADR-022** | Roles Management Console UI Simplification & Authority Gate Streamlining | 2026-11-13 | Accepted |
| **ADR-023** | Specific Domain Leadership, Public Hierarchy Protocol & Domain Lead Highlighting | 2026-11-13 | Accepted |
| **ADR-024** | Mobile/Web Permission Parity, Build Log Hierarchy Lockdown, Desktop Task Review & Zero-Emoji Enforcement | 2026-11-13 | Accepted |

---

## 🏛️ ADR-016: Modern Slide-Over Burger Menu & Navigation Parity
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Mobile drawer required a modern right slide-over card matching reference mockup `media_1794516873830_735ab195.jpg`.
- **Decision:** Implemented slide-over drawer (`rounded-l-[32px]`, `w-[85%] max-w-[360px]`, `bg-white`) over frosted backdrop. Uniform card navigation items (Dashboard, Team Tasks, Build Log, Assigned, Profile), warm cream active states, and soft red logout button. Instant tab synchronization without page reload.

---

## 🏛️ ADR-017: Universal Build Log Access & Pure In-App Navigation Experience
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Build Log was restricted to Core/Leads, preventing engineers from viewing workshop fabrication logs.
- **Decision:** Removed artificial middleware restrictions from `/log`. Added prominent `+ Add` entry button in the burger menu. Removed external showcase link from authenticated drawer. Retained hierarchy requirement that approving tasks requires Lead/Core review.

---

## 🏛️ ADR-018: Desktop Portal Redesign (PRD v1.0 & 5 Reference Mockups)
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Desktop portal required full redesign based on 5 authoritative reference mockups while preserving mobile layouts under `md:hidden`.
- **Decision:** Strict responsive screen isolation (`hidden md:block`). Standardized `OperationsBanner.tsx` and uniform `StatCard.tsx`. Rebuilt Dashboard (Mockup 1), Tasks (Mockup 2), Build Log (Mockup 3), Teams (Mockup 4), and Reports (Mockup 5) with 100% fidelity.

---

## 🏛️ ADR-019: Dedicated Research & Materials Repository with Direct Google Drive Upload
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Needed a dedicated repository for technical whitepapers, CAD designs, simulation outputs, and datasheets, separated from daily fabrication logs.
- **Decision:** Created persistent `Materials` tab (`/dashboard?tab=materials`) and route `/materials`. Direct resumable chunked upload to Google Drive bypassing Vercel's 4.5 MB payload cap. Open upload access for all members; deletion restricted to authors or Core Admins.

---

## 🏛️ ADR-020: Master Role & Team Governance Console (Exclusively for Parth Kshirsagar)
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Centralized console needed to manage roles, appointments, and squad allocations, accessible strictly by Parth Kshirsagar.
- **Decision:** Cryptographic access gate `isParthMasterAdmin(email)` checking `parthkshirsagrr@gmail.com`. Invisible to all other users. 1-click promotions, domain lead designations, tier adjustments, and permission revocation backed by Firestore `roster_members`.

---

## 🏛️ ADR-021: Role Editing Resilience, Absolute Domain Equality & Dynamic Public Roster Sync
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Firestore only stored overrides causing "no data" errors; primary vs secondary domain inequality skewed roles.
- **Decision:** Self-healing data pipeline merging 23-member `ROSTER_MEMBERS` baseline with Firestore overrides. Absolute domain equality: all assigned squads stored in unified `domains: TeamId[]`. Public endpoint `/api/members` dynamically updating live site without hardcoding.

---

## 🏛️ ADR-022: Roles Management Console UI Simplification & Authority Gate Streamlining
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Bracket tags and mini-badges in Member Name duplicated adjacent Role and Domain columns; black authority card added visual noise.
- **Decision:** Removed bracket tags from Member Name column in `RolesManagementTab.tsx`. Removed redundant black authority card, giving visual focus to executive appointments while retaining underlying cryptographic checks.

---

## 🏛️ ADR-023: Specific Domain Leadership, Public Hierarchy Protocol & Domain Lead Highlighting
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Members lead one domain while contributing to others. When filtering by domain, global titles muddied local hierarchy.
- **Decision:** Extended schema with `leadDomains: TeamId[]`. When viewing a specific domain, ONLY the local domain lead displays as `Domain Lead`; all others badge as `Team Member`. In Roles console, lead domains are highlighted with gold gradient and star icon (`★`). Removed all "(Parth Only)" text.

---

## 🏛️ ADR-024: Mobile/Web Permission Parity, Build Log Hierarchy Lockdown, Desktop Task Review & Zero-Emoji Enforcement
- **Date:** 2026-11-13 | **Status:** Accepted & Implemented
- **Context:** Permission discrepancies between mobile and desktop; build log creation needed restriction to Leads/Core; residual emojis found.
- **Decision:** Initialized append-only `bugs.md` (BUG-001 to BUG-006). Restricted build log creation on `/api/logs` to Leads/Core (regular members contribute via `/materials`). Added interactive task progression on desktop. Replaced all legacy emojis with scalable SVG vectors.
