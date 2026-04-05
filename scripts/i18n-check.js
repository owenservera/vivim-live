/**
 * i18n Validation & Coverage Checker
 * 
 * Usage:
 *   node scripts/i18n-check.js              # Full report
 *   node scripts/i18n-check.js --coverage  # Show coverage stats only
 *   node scripts/i18n-check.js --missing    # Show missing keys only
 *   node scripts/i18n-check.js --validate   # Validate all translations
 */

const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../packages/frontend/src/messages');
const LOCALES = ['en', 'es', 'ca', 'ar'];

// Load all translation files
function loadMessages() {
  const messages = {};
  for (const locale of LOCALES) {
    const filePath = path.join(MESSAGES_DIR, locale, 'index.json');
    if (fs.existsSync(filePath)) {
      messages[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  }
  return messages;
}

// Extract all keys from a nested object
function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Get coverage for a locale against English
function getCoverage(baseKeys, targetKeys) {
  const targetSet = new Set(targetKeys);
  const missing = baseKeys.filter(k => !targetSet.has(k));
  const extra = targetKeys.filter(k => !new Set(baseKeys).has(k));
  return { missing, extra, coverage: (targetKeys.length / baseKeys.length) * 100 };
}

// Check interpolation variables match
function checkInterpolation(base, target, baseKeys, locale) {
  const issues = [];
  for (const key of baseKeys) {
    const baseVal = getValue(base, key);
    const targetVal = getValue(target, key);
    if (typeof baseVal === 'string' && typeof targetVal === 'string') {
      const baseVars = baseVal.match(/\{(\w+)\}/g) || [];
      const targetVars = targetVal.match(/\{(\w+)\}/g) || [];
      if (baseVars.length !== targetVars.length) {
        issues.push(`${locale}:${key} - variable count mismatch (base: ${baseVars.length}, target: ${targetVars.length})`);
      }
    }
  }
  return issues;
}

function getValue(obj, key) {
  const keys = key.split('.');
  let value = obj;
  for (const k of keys) {
    value = value?.[k];
  }
  return value;
}

// Main
const args = process.argv.slice(2);
const messages = loadMessages();
const baseKeys = extractKeys(messages.en);

console.log('=== i18n Validation Report ===\n');
console.log(`Languages: ${LOCALES.join(', ')}`);
console.log(`Total English keys: ${baseKeys.length}\n`);

// Coverage report
console.log('--- Coverage ---');
for (const locale of LOCALES) {
  if (locale === 'en') continue;
  const targetKeys = extractKeys(messages[locale]);
  const { coverage, missing, extra } = getCoverage(baseKeys, targetKeys);
  const status = coverage >= 100 ? '✓' : coverage >= 90 ? '⚠' : '✗';
  console.log(`${locale}: ${coverage.toFixed(1)}% ${status} (missing: ${missing.length}, extra: ${extra.length})`);
  
  if (args.includes('--missing') && missing.length > 0) {
    console.log(`  Missing keys:`);
    for (const m of missing.slice(0, 20)) {
      console.log(`    - ${m}`);
    }
    if (missing.length > 20) console.log(`    ... and ${missing.length - 20} more`);
  }
}

// Interpolation check
console.log('\n--- Interpolation Variables ---');
for (const locale of LOCALES) {
  if (locale === 'en') continue;
  const issues = checkInterpolation(messages.en, messages[locale], baseKeys, locale);
  if (issues.length > 0) {
    console.log(`${locale} issues:`);
    for (const issue of issues.slice(0, 10)) {
      console.log(`  - ${issue}`);
    }
  } else {
    console.log(`${locale}: OK`);
  }
}

// Exit code
const allCoverage = LOCALES.every(l => l === 'en' || getCoverage(baseKeys, extractKeys(messages[l])).coverage >= 100);
process.exit(allCoverage ? 0 : 1);
