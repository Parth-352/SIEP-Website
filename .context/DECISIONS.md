# 📜 ARCHITECTURE DECISION RECORDS (ADRs)
> **Permanent Record of Architectural Trade-offs and Invariant Constraints**  
> *Project: Riders Bay Smart Scrambler E-Bike (SIEP Season 7.0)*  
> *These decisions are intentional. Agents must consult these before proposing major refactorings.*

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
  - Authentication checks Cloud Firestore first (`settings/passwords` & member subcollections), falling back to local memory store (`src/lib/store.ts`).
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
