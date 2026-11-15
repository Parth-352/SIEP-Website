/**
 * 🤝 CONTACT SUITE - AGENT INDEX MANIFEST
 * =====================================
 * This directory hosts the Public Outreach & Institutional Partnership architecture.
 * All files are strictly constrained below 300 lines.
 *
 * FILES IN THIS SUITE:
 * 1. types.ts (~35 lines)
 *    - Data interfaces: ContactPerson, SUPPORT_AREAS, KNOWN_PHONES, INITIAL_TEAM_CONTACTS
 * 2. SupportAreasGrid.tsx (~65 lines)
 *    - 6 areas of sponsorship/support cards + official email banner (ebikeclubcoe@snjb.org)
 * 3. InquiryForm.tsx (~165 lines)
 *    - Form submission with FormSubmit (primary), Web3Forms (fallback), and internal store backup
 * 4. KeyTeamContacts.tsx (~140 lines)
 *    - Live Firestore roster resolution for Mentor, Team Captain, Vice Captain with direct phone actions
 * 5. CampusLocationBanner.tsx (~30 lines)
 *    - SNJB Chandwad campus location and workshop card
 */

export * from './types';
export { default as SupportAreasGrid } from './SupportAreasGrid';
export { default as InquiryForm } from './InquiryForm';
export { default as KeyTeamContacts } from './KeyTeamContacts';
export { default as CampusLocationBanner } from './CampusLocationBanner';
