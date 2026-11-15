/**
 * 🏛️ DASHBOARD LAYOUT SUITE - AGENT INDEX MANIFEST
 * ================================================
 * High-level composition containers powering the 10 operational views and modal overlays.
 * All files strictly below 300 lines.
 *
 * 1. DashboardTabContent.tsx (~200 lines)
 *    - Switches between all 10 dashboard operational tabs (Overview, Kanban, Workbench, Teams, Videos, Metrics, Materials, Roles, Accounts, Profile)
 * 2. DashboardModalsHost.tsx (~180 lines)
 *    - Consolidated host for all 7 modal dialogs and slide-drawers (TaskDetail, CompleteProof, CreateTask, DeleteTask, BackupSync, ActivityDrawer, UndoToast) plus PWA BottomNav
 */

export { default as DashboardTabContent } from './DashboardTabContent';
export { default as DashboardModalsHost } from './DashboardModalsHost';
