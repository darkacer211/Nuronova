import {
  loadInstrumentTextBundle,
  getInstrumentLicensing,
  isInstrumentRunnable,
  applyInstrumentText,
  resetLoadedTexts,
  parseCSVItemBundle,
} from './textLoader.js';

export function runTextLoaderUnitTests() {
  const results = [];
  const assert = (condition, name) => {
    if (condition) {
      results.push({ pass: true, name });
    } else {
      results.push({ pass: false, name });
      console.error(`FAIL: ${name}`);
    }
  };

  // Test 1: Check baseline unrunnable state for permission-pending instruments
  resetLoadedTexts();
  assert(isInstrumentRunnable('mchat') === false, 'M-CHAT is not runnable when textLoaded=false');
  assert(isInstrumentRunnable('asrs6') === true, 'ASRS-6 is runnable (public screener)');

  // Test 2: Parse CSV bundle
  const sampleCsv = `instrumentId,itemId,number,text
mchat,mc_1,1,"Does your child point to indicate interest?"
mchat,mc_2,2,"Have you ever wondered if your child is deaf?"`;

  const parsed = parseCSVItemBundle(sampleCsv);
  assert(parsed.mchat && parsed.mchat.length === 2, 'CSV parser extracted 2 items for mchat');
  assert(parsed.mchat[0].text === 'Does your child point to indicate interest?', 'Item 1 text matches');

  // Test 3: Load bundle via JSON and verify state transition
  const jsonBundle = JSON.stringify({
    mchat: [
      { id: 'mc_1', number: 1, text: 'Authorized text 1' },
      { id: 'mc_2', number: 2, text: 'Authorized text 2' },
    ],
  });

  loadInstrumentTextBundle(jsonBundle);
  assert(isInstrumentRunnable('mchat') === true, 'M-CHAT becomes runnable after loading authorized bundle');

  const dummyMchatConfig = {
    id: 'mchat',
    items: [
      { id: 'mc_1', number: 1, text: '[Placeholder 1]' },
      { id: 'mc_2', number: 2, text: '[Placeholder 2]' },
      { id: 'mc_3', number: 3, text: '[Placeholder 3]' },
    ],
  };

  const hydrated = applyInstrumentText(dummyMchatConfig);
  assert(hydrated.items[0].text === 'Authorized text 1', 'Hydrated Item 1 text replaces placeholder');
  assert(hydrated.items[1].text === 'Authorized text 2', 'Hydrated Item 2 text replaces placeholder');
  assert(hydrated.items[2].text === '[Placeholder 3]', 'Unmodified items retain placeholder');

  // Clean up
  resetLoadedTexts();
  assert(isInstrumentRunnable('mchat') === false, 'Reset cleans up dynamic overlays');

  console.log(`✅ TextLoader Tests: ${results.filter(r => r.pass).length}/${results.length} passed.`);
  return results;
}

// Auto-run if run directly with Node
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('textLoader.test.js')) {
  runTextLoaderUnitTests();
}
