/**
 * Dynamic External Text Bundle Loader
 *
 * Allows clinicians and administrators to supply authorized item text
 * via JSON or CSV without modifying code.
 *
 * If textLoaded is false, the engine refuses execution and the UI presents
 * "Coming Soon / Licensing Pending".
 */

import { INSTRUMENT_LICENSES, LICENSING_STATUS } from '../config/licensing.config.js';

const STORAGE_KEY = 'neuronova_authorized_texts_v1';

// In-memory registry of dynamic text overlays
let customTextOverlays = {};

// Load persisted custom texts from localStorage if available
function initStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        customTextOverlays = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read persisted instrument texts:', e);
    }
  }
}

initStorage();

function persistStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customTextOverlays));
    } catch (e) {
      console.warn('Failed to persist instrument texts:', e);
    }
  }
}

/**
 * Parse CSV text into array of item objects
 * Expected header: instrumentId,itemId,number,text (or itemId,number,text)
 */
export function parseCSVItemBundle(csvString, defaultInstrumentId = null) {
  const lines = csvString.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one item row.');
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const instrumentCol = header.indexOf('instrumentid');
  const idCol = header.indexOf('itemid') !== -1 ? header.indexOf('itemid') : header.indexOf('id');
  const numCol = header.indexOf('number') !== -1 ? header.indexOf('number') : header.indexOf('num');
  const textCol = header.indexOf('text') !== -1 ? header.indexOf('text') : header.indexOf('question');

  if (textCol === -1) {
    throw new Error('CSV header must contain a "text" or "question" column.');
  }

  const bundles = {};

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV parser handling quoted strings
    const row = [];
    let inQuote = false;
    let currentField = '';
    const line = lines[i];

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"' && (charIdx === 0 || line[charIdx - 1] !== '\\')) {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        row.push(currentField.trim().replace(/^"|"$/g, ''));
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim().replace(/^"|"$/g, ''));

    const instId = (instrumentCol !== -1 && row[instrumentCol]) ? row[instrumentCol] : defaultInstrumentId;
    if (!instId) {
      throw new Error(`Row ${i + 1} does not specify an instrumentId.`);
    }

    if (!bundles[instId]) {
      bundles[instId] = [];
    }

    bundles[instId].push({
      id: idCol !== -1 && row[idCol] ? row[idCol] : undefined,
      number: numCol !== -1 && !isNaN(parseInt(row[numCol], 10)) ? parseInt(row[numCol], 10) : undefined,
      text: row[textCol],
    });
  }

  return bundles;
}

/**
 * Load external authorized text bundle from JSON or CSV.
 * @param {Object|string} payload - JSON object or CSV string
 * @param {string} [format='auto'] - 'auto', 'json', or 'csv'
 * @returns {Array<string>} list of updated instrumentIds
 */
export function loadInstrumentTextBundle(payload, format = 'auto') {
  let parsedBundles = {};

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (format === 'json' || (format === 'auto' && (trimmed.startsWith('{') || trimmed.startsWith('[')))) {
      const json = JSON.parse(trimmed);
      if (Array.isArray(json)) {
        throw new Error('Top-level JSON must be an object with instrumentId keys or an { instrumentId, items } envelope.');
      }
      if (json.instrumentId && Array.isArray(json.items)) {
        parsedBundles[json.instrumentId] = json.items;
      } else {
        parsedBundles = json;
      }
    } else {
      parsedBundles = parseCSVItemBundle(trimmed);
    }
  } else if (typeof payload === 'object' && payload !== null) {
    if (payload.instrumentId && Array.isArray(payload.items)) {
      parsedBundles[payload.instrumentId] = payload.items;
    } else {
      parsedBundles = payload;
    }
  }

  const updatedInstruments = [];

  for (const [instId, items] of Object.entries(parsedBundles)) {
    if (!INSTRUMENT_LICENSES[instId]) {
      console.warn(`Skipping unrecognized instrument ID: ${instId}`);
      continue;
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(`Instrument ${instId} must provide a non-empty array of items.`);
    }

    customTextOverlays[instId] = items;
    updatedInstruments.push(instId);
  }

  persistStorage();
  return updatedInstruments;
}

/**
 * Retrieve licensing status including any runtime dynamic text overlays.
 */
export function getInstrumentLicensing(instrumentId) {
  const baseConfig = INSTRUMENT_LICENSES[instrumentId];
  if (!baseConfig) {
    return {
      id: instrumentId,
      name: instrumentId,
      status: LICENSING_STATUS.PERMISSION_PENDING,
      requiredCopyright: 'Unregistered instrument.',
      permissionContact: 'Administrator',
      textLoaded: false,
      isPlaceholderOnly: true,
    };
  }

  // If baseConfig has textLoaded true, it is already verified
  if (baseConfig.textLoaded) {
    return { ...baseConfig };
  }

  // Check if runtime overlay exists
  const hasOverlay = Boolean(customTextOverlays[instrumentId] && customTextOverlays[instrumentId].length > 0);
  return {
    ...baseConfig,
    textLoaded: hasOverlay,
    isPlaceholderOnly: !hasOverlay,
  };
}

/**
 * Check if instrument can be run in the UI.
 * Refuses execution if textLoaded is false.
 */
export function isInstrumentRunnable(instrumentId) {
  const licensing = getInstrumentLicensing(instrumentId);
  return Boolean(licensing.textLoaded);
}

/**
 * Hydrate an instrument config with dynamic text overlays if available.
 */
export function applyInstrumentText(instrumentConfig) {
  if (!instrumentConfig || !instrumentConfig.id) return instrumentConfig;
  const overlay = customTextOverlays[instrumentConfig.id];
  if (!overlay || overlay.length === 0) {
    return instrumentConfig;
  }

  const cloned = { ...instrumentConfig };
  const updatedItems = cloned.items.map((item, idx) => {
    // Match by ID first, then by number, then by index
    const match =
      overlay.find(o => o.id && o.id === item.id) ||
      overlay.find(o => o.number && o.number === item.number) ||
      overlay[idx];

    if (match && match.text) {
      return { ...item, text: match.text };
    }
    return item;
  });

  cloned.items = updatedItems;
  return cloned;
}

/**
 * Reset all loaded texts for a given instrument or all instruments
 */
export function resetLoadedTexts(instrumentId = null) {
  if (instrumentId) {
    delete customTextOverlays[instrumentId];
  } else {
    customTextOverlays = {};
  }
  persistStorage();
}

/**
 * Export full licensing report for audit
 */
export function exportLicensingAudit() {
  return Object.keys(INSTRUMENT_LICENSES).map(id => getInstrumentLicensing(id));
}
