#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🧪 Starting Universal Bifurcation & 300-Line Upper Bound Verification...\n');

let failed = false;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed = true;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Verify all 5 Target Page Routes are strictly < 300 lines
const targetPages = [
  { file: 'web/src/app/dashboard/page.tsx', max: 300, name: 'Dashboard Page' },
  { file: 'web/src/app/login/page.tsx', max: 300, name: 'Login Page' },
  { file: 'web/src/app/contact/page.tsx', max: 300, name: 'Contact Page' },
  { file: 'web/src/app/log/page.tsx', max: 300, name: 'Build Log Page' },
  { file: 'web/src/app/copilot/page.tsx', max: 300, name: 'Copilot Page' },
];

for (const target of targetPages) {
  const content = fs.readFileSync(target.file, 'utf8');
  const lines = content.split('\n').length;
  assert(lines < target.max, `${target.name} is strictly under ${target.max} lines (actual: ${lines} lines)`);
}

// 2. Verify all page.tsx files across web/src/app/ are strictly < 300 lines
function findFiles(dir, matchName, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(full, matchName, acc);
    } else if (entry.name === matchName) {
      acc.push(full);
    }
  }
  return acc;
}

const allPages = findFiles('web/src/app', 'page.tsx');
for (const p of allPages) {
  const lines = fs.readFileSync(p, 'utf8').split('\n').length;
  assert(lines <= 300, `Page route ${p} is strictly <= 300 lines (actual: ${lines} lines)`);
}

// 3. Verify all .context/ markdown files are strictly < 300 lines
const contextFiles = [
  '.context/INDEX.md',
  '.context/CODEBASE_MAP.md',
  '.context/ARCHITECTURE.md',
  '.context/DATABASE.md',
  '.context/DECISIONS.md',
  '.context/HANDOVER.md',
  '.context/decisions/ADR_VOL1.md',
  '.context/decisions/ADR_VOL2.md',
  '.context/decisions/ADR_VOL3.md',
];

for (const cf of contextFiles) {
  assert(fs.existsSync(cf), `Context file ${cf} exists`);
  const lines = fs.readFileSync(cf, 'utf8').split('\n').length;
  assert(lines <= 300, `Context file ${cf} is strictly <= 300 lines (actual: ${lines} lines)`);
}

// 4. Verify all newly created sub-components exist and are strictly < 300 lines
const newComponents = [
  // Dashboard
  'web/src/components/dashboard/hooks/useDashboardData.ts',
  'web/src/components/dashboard/hooks/useDashboardNavigation.ts',
  'web/src/components/dashboard/hooks/useDashboardFilters.ts',
  'web/src/components/dashboard/hooks/useDashboardTaskActions.ts',
  'web/src/components/dashboard/hooks/useDashboardBackup.ts',
  'web/src/components/dashboard/hooks/index.ts',
  'web/src/components/dashboard/layout/DashboardTabContent.tsx',
  'web/src/components/dashboard/layout/DashboardModalsHost.tsx',
  'web/src/components/dashboard/layout/index.ts',
  // Login
  'web/src/components/login/LoginHeroHeader.tsx',
  'web/src/components/login/LoginFormCard.tsx',
  'web/src/components/login/ForgotPinModal.tsx',
  'web/src/components/login/index.ts',
  'web/src/components/login/forgot/ForgotEmailStep.tsx',
  'web/src/components/login/forgot/ForgotOtpStep.tsx',
  'web/src/components/login/forgot/ForgotNewPinStep.tsx',
  'web/src/components/login/forgot/ForgotSuccessStep.tsx',
  'web/src/components/login/forgot/index.ts',
  // Contact
  'web/src/components/contact/types.ts',
  'web/src/components/contact/SupportAreasGrid.tsx',
  'web/src/components/contact/InquiryForm.tsx',
  'web/src/components/contact/KeyTeamContacts.tsx',
  'web/src/components/contact/CampusLocationBanner.tsx',
  'web/src/components/contact/index.ts',
  // Log
  'web/src/components/log/useLogData.ts',
  'web/src/components/log/LogModalsHost.tsx',
  'web/src/components/log/index.ts',
  // Copilot
  'web/src/components/copilot/types.ts',
  'web/src/components/copilot/CopilotHeader.tsx',
  'web/src/components/copilot/CopilotMessageList.tsx',
  'web/src/components/copilot/CopilotPromptPills.tsx',
  'web/src/components/copilot/CopilotInputForm.tsx',
  'web/src/components/copilot/index.ts',
];

for (const comp of newComponents) {
  assert(fs.existsSync(comp), `Component/hook ${comp} exists`);
  const lines = fs.readFileSync(comp, 'utf8').split('\n').length;
  assert(lines <= 300, `Component ${comp} is strictly <= 300 lines (actual: ${lines} lines)`);
}

// 5. Invariant & behavioral preservation checks
const dashboardContent = fs.readFileSync('web/src/app/dashboard/page.tsx', 'utf8');
assert(dashboardContent.includes('useDashboardNavigation'), 'Dashboard page integrates useDashboardNavigation');
assert(dashboardContent.includes('useDashboardData'), 'Dashboard page integrates useDashboardData');
assert(dashboardContent.includes('useDashboardFilters'), 'Dashboard page integrates useDashboardFilters');
assert(dashboardContent.includes('useDashboardTaskActions'), 'Dashboard page integrates useDashboardTaskActions');
assert(dashboardContent.includes('DashboardTabContent'), 'Dashboard page mounts DashboardTabContent');
assert(dashboardContent.includes('DashboardModalsHost'), 'Dashboard page mounts DashboardModalsHost');

const loginContent = fs.readFileSync('web/src/app/login/page.tsx', 'utf8');
assert(loginContent.includes('LoginFormCard'), 'Login page mounts LoginFormCard');
assert(loginContent.includes('ForgotPinModal'), 'Login page mounts ForgotPinModal');

const contactContent = fs.readFileSync('web/src/app/contact/page.tsx', 'utf8');
assert(contactContent.includes('InquiryForm'), 'Contact page mounts InquiryForm');
assert(contactContent.includes('KeyTeamContacts'), 'Contact page mounts KeyTeamContacts');

console.log('\n----------------------------------------');
if (failed) {
  console.error('❌ Verification FAILED: Some invariants or limits were violated.');
  process.exit(1);
} else {
  console.log('🎉 ALL INVARIANTS & 300-LINE CONSTRAINTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
