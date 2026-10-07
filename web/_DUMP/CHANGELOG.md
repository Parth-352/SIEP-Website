# CHANGELOG

## 2026-10-08 02:15 — Project Setup & Navigation

### Files Modified
- src/app/layout.tsx
- src/components/Navigation.tsx

### Change
Updated metadata in layout.tsx to "SIEP E-Bike | Riders Bay".
Updated navigation links to match requested structure: About, Competition, The Bike, Journey, Student Hub, Sponsors, Contact.

### Reason
Align project with core statement and requested minimal navigation.

## 2026-10-08 02:15 — Replace 3D Scroll with Video Architecture

### Files Modified
- src/app/page.tsx

### Files Created
- src/components/ScrollVideo.tsx

### Files Removed
- src/components/Experience.tsx (Moved/Renamed to BikeExplorer conceptually)

### Change
Introduced ScrollVideo infrastructure for scroll-controlled pre-rendered video.
Removed Experience.tsx 3D scroll logic from main page, as 3D asset should be lazy-loaded explorer later.

### Archived Material
- _DUMP/replaced-components/Experience.previous.tsx

## 2026-10-08 02:16 — Rewrite ScrollOverlay to Data-Driven Architecture

### Files Modified
- src/components/ScrollOverlay.tsx

### Files Created
- src/components/EngineeringStage.tsx

### Change
Rewrote ScrollOverlay.tsx to map through the 7 Engineering Stages using the new EngineeringStage.tsx block.
Replaced large generic cards with editorial technical blocks.

### Reason
Conform to requirement: Engineering Story Architecture (01 CHASSIS -> 07 READY) and editorial technical blocks.

### Archived Material
- _DUMP/replaced-components/ScrollOverlay.previous.tsx

## 2026-10-08 02:16 — Rewrite page.tsx for ScrollVideo

### Files Modified
- src/app/page.tsx

### Change
Rewrote page.tsx to use ScrollVideo in the background instead of Canvas/Experience.tsx.

### Reason
Video scroll architecture requested as primary cinematic sequence, replacing the heavy React 3D renders on scroll.

### Archived Material
- _DUMP/replaced-components/page.previous.tsx

## 2026-10-08 02:16 — Update TimelineIndicator for 7 Stages

### Files Modified
- src/components/TimelineIndicator.tsx

### Change
Updated TimelineIndicator to use the 7 engineering stages.
Changed scroll listener from .overflow-y-auto to window.

### Reason
Conform to requirement: Engineering Story Architecture (01 CHASSIS -> 07 READY) and new ScrollVideo window-scroll setup.

### Archived Material
- _DUMP/replaced-components/TimelineIndicator.previous.tsx

## 2026-10-08 02:17 — Add Bike, Journey, and Sponsorship Pages

### Files Modified
- src/app/bike/page.tsx
- src/app/sponsorship/page.tsx

### Files Created
- src/components/BikeExplorer.tsx
- src/app/journey/page.tsx

### Change
Implemented BikeExplorer as a lazy-loaded 3D WebGL component placeholder for the ebike-explorer.glb asset.
Implemented /bike page to showcase the architecture and digital twin status.
Implemented /journey page mapping the 01-08 project journey.
Implemented /sponsorship page with resource request flow (cost report NOT publicly exposed, controlled delivery).

### Reason
Fulfill Engineering Story requirements, Sponsorship architecture, and 3D Asset strategy.

