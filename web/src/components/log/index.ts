/**
 * 📝 BUILD LOG SUITE - AGENT INDEX MANIFEST
 * =========================================
 * Daily workshop engineering logs, testing observations, and video proof archives.
 * All files strictly below 300 lines (or component modules).
 *
 * 1. logConfig.tsx (~160 lines) - Helper utilities, status icons, and loading skeleton
 * 2. useLogData.ts (~190 lines) - Custom hook for logs fetching, cache, and filters
 * 3. LogModalsHost.tsx (~120 lines) - Host container for all 5 modals and drawers
 * 4. LogMobileView.tsx (~280 lines) - Mobile card stream and quick action sheet
 * 5. LogDesktopView.tsx (~295 lines) - Desktop timeline with status chips and filter bar
 * 6. CreateLogModal.tsx (~290 lines) - Create daily build/test step modal
 * 7. EditLogModal.tsx (~260 lines) - Edit log step details
 * 8. DeleteConfirmModal.tsx (~75 lines) - Confirmation dialog for deleting logs
 * 9. MobileLogDetailDrawer.tsx (~130 lines) - Mobile slide-up drawer for inspecting logs
 */

export * from './logConfig';
export * from './useLogData';
export { default as LogModalsHost } from './LogModalsHost';
export { default as LogMobileView } from './LogMobileView';
export { default as LogDesktopView } from './LogDesktopView';
export { default as CreateLogModal } from './CreateLogModal';
export { default as EditLogModal } from './EditLogModal';
export { default as DeleteConfirmModal } from './DeleteConfirmModal';
export { default as MobileLogDetailDrawer } from './MobileLogDetailDrawer';
