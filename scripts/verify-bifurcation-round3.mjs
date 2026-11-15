// scripts/verify-bifurcation-round3.mjs

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🚀 [VERIFY-ROUND3] Starting automated bifurcation verification...\n');

const ROOT = process.cwd();

// 1. Line Count Reduction Checks
const targetFiles = [
  { path: 'web/src/components/dashboard/TeamTasksTab.tsx', maxLines: 300, origLines: 1213 },
  { path: 'web/src/components/dashboard/MaterialsTab.tsx', maxLines: 450, origLines: 1169 },
  { path: 'web/src/components/TeamSection.tsx', maxLines: 350, origLines: 1072 },
];

console.log('📊 1. Checking Line Count Reductions:');
for (const target of targetFiles) {
  const fullPath = path.join(ROOT, target.path);
  assert(fs.existsSync(fullPath), `Target file does not exist: ${target.path}`);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lineCount = content.split('\n').length;
  console.log(`   ✓ ${target.path}: ${lineCount} lines (was ${target.origLines}, limit: < ${target.maxLines})`);
  assert(
    lineCount <= target.maxLines,
    `File ${target.path} has ${lineCount} lines, expected <= ${target.maxLines}`
  );
}

// 2. Sub-Modules Existence Checks
const expectedSubmodules = [
  // TeamTasks suite
  'web/src/components/dashboard/tasks/taskBadgeUtils.ts',
  'web/src/components/dashboard/tasks/MobileTeamTasksView.tsx',
  'web/src/components/dashboard/tasks/DesktopTaskControls.tsx',
  'web/src/components/dashboard/tasks/DesktopTaskTable.tsx',
  'web/src/components/dashboard/tasks/DesktopTaskKanban.tsx',
  // Materials suite
  'web/src/components/dashboard/materials/materialsConstants.tsx',
  'web/src/components/dashboard/materials/MaterialsStatsSection.tsx',
  'web/src/components/dashboard/materials/MaterialsFilterBar.tsx',
  'web/src/components/dashboard/materials/MaterialsTable.tsx',
  'web/src/components/dashboard/materials/BatchUploadModal.tsx',
  // TeamSection suite
  'web/src/components/team/teamTypes.ts',
  'web/src/components/team/teamRosterData.ts',
  'web/src/components/team/MemberCard.tsx',
  'web/src/components/team/MobilePlayerCard.tsx',
  'web/src/components/team/MobileTeamAccordion.tsx',
];

console.log('\n📦 2. Checking Sub-Modules Existence:');
for (const sub of expectedSubmodules) {
  const fullPath = path.join(ROOT, sub);
  assert(fs.existsSync(fullPath), `Sub-module missing: ${sub}`);
  const stats = fs.statSync(fullPath);
  assert(stats.size > 0, `Sub-module is empty: ${sub}`);
  console.log(`   ✓ ${sub} (${stats.size} bytes)`);
}

// 3. Functional Invariant Checks
console.log('\n🧪 3. Verifying Functional Logic Invariants:');

// Test normalizeDomainId logic
const domainMap = {
  software: 'software',
  telemetry: 'software',
  entc: 'entc',
  electronics: 'entc',
  battery: 'entc',
  mechanical: 'mechanical',
  chassis: 'mechanical',
  powertrain: 'mechanical',
  brakes: 'mechanical',
  suspension: 'mechanical',
  design: 'design',
  research: 'research',
  sponsorship: 'sponsorship',
  marketing: 'sponsorship',
  socialmedia: 'socialmedia',
  documentation: 'documentation',
  safety: 'documentation',
};

const teamTypesContent = fs.readFileSync(path.join(ROOT, 'web/src/components/team/teamTypes.ts'), 'utf8');
assert(teamTypesContent.includes('normalizeDomainId'), 'normalizeDomainId export missing');
for (const [input, expected] of Object.entries(domainMap)) {
  assert(teamTypesContent.includes(`${input}: '${expected}'`), `Domain mapping missing for ${input}`);
}
console.log('   ✓ Domain normalization maps all 17 domain aliases identically.');

// Test taskBadgeUtils logic
const badgeUtilsContent = fs.readFileSync(path.join(ROOT, 'web/src/components/dashboard/tasks/taskBadgeUtils.ts'), 'utf8');
assert(badgeUtilsContent.includes('getDomainBadge'), 'getDomainBadge missing');
assert(badgeUtilsContent.includes('getPriorityIndicator'), 'getPriorityIndicator missing');
assert(badgeUtilsContent.includes('formatMobileDueDate'), 'formatMobileDueDate missing');
console.log('   ✓ taskBadgeUtils exports getDomainBadge, getPriorityIndicator, and formatMobileDueDate.');

// Test materialsConstants logic
const materialsConstantsContent = fs.readFileSync(path.join(ROOT, 'web/src/components/dashboard/materials/materialsConstants.tsx'), 'utf8');
assert(materialsConstantsContent.includes('CATEGORY_CONFIG'), 'CATEGORY_CONFIG missing');
assert(materialsConstantsContent.includes('formatFileSize'), 'formatFileSize missing');
assert(materialsConstantsContent.includes('getFileExtensionBadge'), 'getFileExtensionBadge missing');
assert(materialsConstantsContent.includes('cleanTitleFromFilename'), 'cleanTitleFromFilename missing');
console.log('   ✓ materialsConstants exports CATEGORY_CONFIG, formatFileSize, getFileExtensionBadge, and cleanTitleFromFilename.');

// 4. Backwards Compatibility Re-Exports Check
console.log('\n🔄 4. Verifying Backwards Compatible Named Re-exports:');
const teamSectionContent = fs.readFileSync(path.join(ROOT, 'web/src/components/TeamSection.tsx'), 'utf8');
assert(teamSectionContent.includes('export type { DomainId, TeamMember }'), 'TeamSection named type re-exports missing');
assert(teamSectionContent.includes('export { normalizeDomainId, DOMAIN_LABELS, DOMAIN_FILTER_TABS }'), 'TeamSection named function re-exports missing');
assert(teamSectionContent.includes('export default function TeamSection()'), 'TeamSection default export missing');
console.log('   ✓ TeamSection maintains all original named and default exports.');

console.log('\n🎉 [VERIFY-ROUND3] All automated verification assertions passed successfully!\n');
