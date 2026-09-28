#!/usr/bin/env node

/**
 * CI / Startup Licensing Compliance Verification Script
 *
 * Verifies that:
 * 1. Every registered clinical screening instrument has a registered licensing entry.
 * 2. Any instrument marked as 'permission-pending' has textLoaded === false.
 * 3. Any instrument without 'licensed' or 'free-with-conditions' status contains ONLY
 *    explicitly marked placeholder items, preventing accidental inclusion of copyrighted text.
 */

import { INSTRUMENT_LICENSES, LICENSING_STATUS } from '../frontend/src/features/screening/config/licensing.config.js';
import { SCREENER_REGISTRY } from '../frontend/src/features/screening/tests/index.js';

console.log('===========================================================');
console.log(' 🛡️  NeuroNova Clinical Licensing & Copyright Audit');
console.log('===========================================================\n');

let hasViolations = false;
const violations = [];
const auditRows = [];

for (const [instrumentId, instrumentConfig] of Object.entries(SCREENER_REGISTRY)) {
  const license = INSTRUMENT_LICENSES[instrumentId];

  if (!license) {
    hasViolations = true;
    violations.push(`[UNREGISTERED] Instrument '${instrumentId}' is registered in SCREENER_REGISTRY but missing from licensing.config.js.`);
    continue;
  }

  const isPermitted =
    license.status === LICENSING_STATUS.LICENSED ||
    license.status === LICENSING_STATUS.FREE_WITH_CONDITIONS;

  // Check 1: If status is not licensed/free, textLoaded must not be true in source config
  if (!isPermitted && license.textLoaded === true) {
    hasViolations = true;
    violations.push(
      `[ILLEGAL_STATE] Instrument '${instrumentId}' has status '${license.status}' but 'textLoaded: true'. Status must be 'licensed' or 'free-with-conditions' to bundle text.`
    );
  }

  // Check 2: Inspect items in instrument definition for copyrighted text leaks
  const items = instrumentConfig.items || [];
  let placeholderCount = 0;
  let nonPlaceholderCount = 0;

  for (const item of items) {
    const text = item.text || '';
    const isExplicitPlaceholder =
      text.startsWith('[') &&
      (text.includes('Placeholder') || text.includes('Licensed text required') || text.includes('pending') || text.includes('Pending'));

    if (isExplicitPlaceholder) {
      placeholderCount++;
    } else {
      nonPlaceholderCount++;
    }
  }

  if (!isPermitted && nonPlaceholderCount > 0) {
    hasViolations = true;
    violations.push(
      `[COPYRIGHT_VIOLATION] Instrument '${instrumentId}' has ${nonPlaceholderCount} item(s) with actual/unmarked wording, but its licensing status is '${license.status}'. Only placeholders starting with '[Item X Placeholder...' are permitted!`
    );
  }

  auditRows.push({
    Instrument: instrumentId,
    Status: license.status,
    TextLoaded: license.textLoaded ? 'YES' : 'NO',
    Items: items.length,
    Placeholders: placeholderCount,
    Compliant: (!isPermitted && nonPlaceholderCount > 0) || (!isPermitted && license.textLoaded) ? 'FAIL ❌' : 'PASS ✅',
  });
}

console.table(auditRows);

if (hasViolations) {
  console.error('\n❌ LICENSING AUDIT FAILED WITH VIOLATIONS:');
  violations.forEach((v) => console.error(`  - ${v}`));
  console.error('\nPlease resolve copyright compliance before committing or building.\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL INSTRUMENTS COMPLY WITH INTELLECTUAL PROPERTY & LICENSING CONSTRAINTS.\n');
  process.exit(0);
}
