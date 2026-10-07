# FINAL CHANGE INVENTORY

## FINAL CHANGE INVENTORY

FILE: src/app/layout.tsx
STATUS: MODIFIED
CHANGE: Updated site metadata (title and description) to match SIEP E-Bike / Riders Bay.
REASON: Branding consistency.
TESTED: YES
RELATED COMMIT: TBD

FILE: src/components/Navigation.tsx
STATUS: MODIFIED
CHANGE: Updated navigation links to (About, Competition, The Bike, Journey, Student Hub, Sponsors, Contact).
REASON: Requested minimal navigation architecture.
TESTED: YES
RELATED COMMIT: TBD

FILE: src/components/Experience.tsx
STATUS: REMOVED
CHANGE: Component archived to _DUMP.
REASON: Replaced expensive 3D scroll rendering with pre-rendered ScrollVideo infrastructure.
TESTED: YES
RELATED COMMIT: TBD
ARCHIVED TO: _DUMP/replaced-components/Experience.previous.tsx

FILE: src/components/ScrollOverlay.tsx
STATUS: MODIFIED
CHANGE: Rewritten to map a data-driven STAGES array (01 CHASSIS to 07 READY) using new EngineeringStage component.
REASON: Engineering Story Architecture requirements and technical editorial blocks.
TESTED: YES
RELATED COMMIT: TBD
ARCHIVED TO: _DUMP/replaced-components/ScrollOverlay.previous.tsx

FILE: src/components/TimelineIndicator.tsx
STATUS: MODIFIED
CHANGE: Updated from 5 hardcoded steps to 8 data-driven steps matching the Story Architecture. Updated scroll event listener to window.
REASON: Sync with new ScrollVideo and full engineering stages.
TESTED: YES
RELATED COMMIT: TBD
ARCHIVED TO: _DUMP/replaced-components/TimelineIndicator.previous.tsx

FILE: src/components/ScrollVideo.tsx
STATUS: CREATED
CHANGE: Implemented sticky video scroll synchronization via requestAnimationFrame.
REASON: Scroll-controlled cinematic sequence.
TESTED: YES
RELATED COMMIT: TBD

FILE: src/components/EngineeringStage.tsx
STATUS: CREATED
CHANGE: Implemented reusable technical editorial block for scroll stages.
REASON: Replacing generic cards with technical/editorial layout.
TESTED: YES
RELATED COMMIT: TBD

FILE: src/app/page.tsx
STATUS: MODIFIED
CHANGE: Updated to compose ScrollVideo and new ScrollOverlay. Removed hidden overflow constraints on body.
REASON: To support new scroll architecture.
TESTED: YES
RELATED COMMIT: TBD
ARCHIVED TO: _DUMP/replaced-components/page.previous.tsx

FILE: src/components/BikeExplorer.tsx
STATUS: CREATED
CHANGE: Three.js interactive explorer placeholder (rotates/zooms) for future asset.
REASON: Interactive exploration separated from primary scroll.
TESTED: YES
RELATED COMMIT: TBD

FILE: src/app/bike/page.tsx
STATUS: MODIFIED
CHANGE: Added Lazy loading for BikeExplorer and systems architecture content.
REASON: Performance optimization and detailed systems view.
TESTED: YES
RELATED COMMIT: TBD

FILE: src/app/journey/page.tsx
STATUS: CREATED
CHANGE: Implemented vertical timeline for project journey (01 RESEARCH to 08 COMPETITION).
REASON: Requested journey page requirement.
TESTED: YES
RELATED COMMIT: TBD

FILE: src/app/sponsorship/page.tsx
STATUS: MODIFIED
CHANGE: Implemented sponsorship form for resource requests (Cost Report not publicly exposed).
REASON: Support and sponsorship CTA integration.
TESTED: YES
RELATED COMMIT: TBD
