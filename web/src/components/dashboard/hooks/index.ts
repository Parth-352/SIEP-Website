/**
 * 🪝 DASHBOARD HOOKS SUITE - AGENT INDEX MANIFEST
 * ===============================================
 * Dedicated domain hooks decomposing the Next.js Dashboard operational state.
 * All files strictly below 300 lines.
 *
 * 1. useDashboardData.ts (~155 lines)
 *    - Tasks, logs, and activity state, offline cache hydration, 10s live sync engine, pending outbox count, and credential loading
 * 2. useDashboardNavigation.ts (~105 lines)
 *    - Active tab state, URL query sync (?tab=...), custom event buses, popstate listeners, and route security guards
 * 3. useDashboardFilters.ts (~160 lines)
 *    - Search querying, subsystem/priority/deadline filters, domain scopes, memberDomainIds, myAssignedTasks, and filteredTasks computation
 * 4. useDashboardTaskActions.ts (~235 lines)
 *    - Task status advancement with undo support, creation, quick assign, drag-and-drop, and delete confirmation
 * 5. useDashboardBackup.ts (~75 lines)
 *    - Database export and database reset operations for Core Leadership
 */

export * from './useDashboardData';
export * from './useDashboardNavigation';
export * from './useDashboardFilters';
export * from './useDashboardTaskActions';
export * from './useDashboardBackup';
