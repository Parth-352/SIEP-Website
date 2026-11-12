# 📋 ACTIVE SESSION HANDOVER & STATE
> **Last Updated:** 2026-11-12 | **Branch:** `main`  
> **Production Live URLs:** `https://ridersbay.vercel.app` and `https://riders-bay.vercel.app`  
> *This document is the single source of truth for in-flight work across breaks. Agents and developers must read this before starting and update it before stopping.*

---

## 🚦 1. CURRENT WORKSPACE STATUS
- **Git Head:** ✅ `c524690` (`feat(navigation): limit bottom navigation dock strictly to standalone mobile web app`).
- **GitHub Remote:** ✅ Up to date with `origin/main`.
- **TypeScript Verification:** ✅ Clean (`cd web && npx tsc --noEmit` passes with 0 errors).
- **Production Build:** ✅ Next.js 16.4.5 Turbopack build (`npm run build`) compiles successfully (20/20 static pages generated, 0 errors).
- **Architecture Synchronization:** ✅ ADR-011 recorded in `.context/DECISIONS.md`.

---

## 🛠️ 2. RECENT ACCOMPLISHMENTS & TEST VERIFICATIONS

### A. Restrict Bottom Navigation Dock Strictly to Standalone Mobile Web App (PWA)
1. **Web Standard Display Mode Detection (`checkIsStandalone` in `PwaInstallProvider.tsx`):**
   - Implemented `checkIsStandalone()` combining:
     - W3C Standard: `window.matchMedia('(display-mode: standalone)').matches`, `fullscreen`, `minimal-ui`.
     - iOS Safari Home Screen PWA: `(window.navigator as any).standalone === true`.
     - Android TWA: `document.referrer.startsWith('android-app://')`.
     - Developer/QA Override: `?app=standalone` or `?standalone=true`.
   - Added reactive media query listener to `window.matchMedia('(display-mode: standalone)')` with automatic cleanup on unmount.
2. **Zero DOM Loading in Standard Browsers (`dashboard/page.tsx` & `Navigation.tsx`):**
   - Wrapped `<BottomNav>` on `/dashboard` with `{isStandalone && <BottomNav ... />}`.
   - Wrapped global bottom navigation in `Navigation.tsx` with `{isMounted && isStandalone && pathname !== '/dashboard' && pathname !== '/login' && ...}`.
   - On `/login`, suppressed bottom dock in browser mode so `/login` renders as a clean, focused login card.
3. **Dynamic Responsive Layout Clearance (`dashboard/page.tsx`):**
   - Adjusted `main` bottom padding: `isStandalone ? 'pb-32 sm:pb-24' : 'pb-12 sm:pb-16'`.
   - In standard browser mode (mobile Chrome or desktop), removes the empty 128px (`pb-32`) blank space at the bottom of the page.
   - Navigation in standard mobile Chrome smoothly relies on top `DashboardTabBar`, hamburger drawer, and header actions.

### B. Strict Single-PIN Invalidation (`passwords/route.ts` & `change-password/route.ts`)
1. **Eliminated Default PIN Fallback:**
   - Removed `(customPass && cleanPass === DEFAULT_MEMBER_PIN)` from authentication and PIN change validation.
   - For any member who has rotated their PIN to a custom 6-digit code, entering `935200` strictly fails with `valid: false` and error `Incorrect 6-digit PIN. Please enter your active PIN or use Forgot PIN.`
   - Unrotated accounts continue to accept `935200` until their first change.
2. **Current PIN Invalidation in Settings:**
   - In `/api/change-password`, attempting to update PIN using `935200` as current PIN when a custom PIN exists is rejected with HTTP 400.

### C. Subsystem Velocity & Domain Priority Sorting (`DashboardOverviewTab.tsx` & `SubsystemsTab.tsx`)
1. **User Squads at the Very Top:**
   - Filtered and sorted squads in `Engineering Subsystems Velocity` and the dedicated `Subsystems` tab via `prioritizedTeams = useMemo(...)` so that all domains assigned to the logged-in member (`memberDomainIds` / `[My Squad]`, e.g., Software, Sponsorship, Documentation) appear in the first row above all unassigned squads.
   - Remaining squads cleanly follow in subsequent rows.

### D. Minimal '+' Action Menu & Extravaganza Removal (`BottomNav.tsx` & `page.tsx`)
1. **Streamlined Action Sheet:**
   - Header simplified to `Create` with a clean close `✕` button.
   - Action 1: `Log Build Step` with concise subtitle `Upload video proof`.
   - Action 2: `New Deliverable` with concise subtitle `Add to subsystem board`.
   - Dismiss button standardized to `Cancel`.
2. **Operations Hub Removal:**
   - Removed `More Portals (Videos, Metrics, Sync)` button.
   - Excised `OperationsHubModal` and unused `isMobileQuickMenuOpen` states from dashboard page.

### E. Equal Domain Representation in Profile (`ProfileView.tsx`)
1. **Removed Primary vs. Secondary Classification:**
   - Eliminated the separate "Primary Domain" card and "Secondary Domains" section in the "My Domains" accordion.
   - Unified all user domains (`allAssignedDomains = Array.from(new Set([user.teamId, ...(user.secondaryTeams || [])]))`) into an equal, peer-level listing where every domain receives identical card styling, squad badge, and official engineering description.

---

## 📁 3. RECENTLY MODIFIED FILES IN HEAD
- `web/src/components/PwaInstallProvider.tsx` — Added `checkIsStandalone()` helper, display-mode listener, and standalone state updates.
- `web/src/app/dashboard/page.tsx` — Restricted `<BottomNav>` strictly to `isStandalone`, dynamically adjusted `pb-` bottom padding.
- `web/src/components/Navigation.tsx` — Restricted global bottom navigation dock strictly to `isStandalone`, cleaned `/login`.
- `web/src/components/navigation/BottomNav.tsx` — Updated architecture documentation comments.
- `.context/DECISIONS.md` — Added ADR-011.
- `.context/HANDOVER.md` — Updated session status.

---

## 🏁 4. VERIFICATION COMMANDS
```bash
# TypeScript type check (web/)
cd web && npx tsc --noEmit

# Production build check (web/)
cd web && npm run build
```

---

## 📋 5. IMMEDIATE NEXT STEPS CHECKLIST
- [x] Comprehensive standalone detection (`checkIsStandalone`) implemented.
- [x] Bottom dock unmounted and excluded from DOM in standard web browsers.
- [x] Dynamic container bottom padding adjusted on `/dashboard`.
- [x] TypeScript verification passed (0 errors).
- [x] Turbopack production build passed (20/20 pages).
- [ ] Commit changes and push to origin/main.
