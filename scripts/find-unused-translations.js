const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../packages/frontend/src/messages');
const SRC_DIR = path.join(__dirname, '../packages/frontend/src');

function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj || {})) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getUsedKeys() {
  const used = new Set();
  const patterns = [
    /t\(['"`]([^'"`]+)['"`]\)/g,
    /t\(['"`]([^'"`]+)['"`],\s*\)/g,
    /t\(`([^`]+)`\)/g,
    /useTranslations\(['"`]([^'"`]+)['"`]\)/g,
    /tc\(/g,
    /tp\(/g,
    /ts\(/g,
    /td\(/g,
    /tm\(/g,
    /tpr\(/g,
    /tsentinel\(/g,
    /tmarketplace\(/g,
    /tacus\(/g,
    /trl\(/g,
    /tCommon\(/g,
    /tFooter\(/g,
    /tScorecard\(/g,
    /tDevelopers\(/g,
    /tproviders\(/g,
  ];

  function searchFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        used.add(match[0]);
      }
    }
  }

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDir(fullPath);
        }
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        searchFile(fullPath);
      }
    }
  }

  walkDir(SRC_DIR);
  return used;
}

const locales = ['en', 'es', 'ca', 'ar'];
const usedKeys = getUsedKeys();

console.log('=== Unused Translation Keys ===\n');
console.log(`Keys used in code: ${usedKeys.size}\n`);

for (const locale of locales) {
  const filePath = path.join(MESSAGES_DIR, locale, 'index.json');
  if (!fs.existsSync(filePath)) continue;

  const messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const allKeys = extractKeys(messages);
  const unused = allKeys.filter(k => !usedKeys.has(k));

  console.log(`--- ${locale}: ${unused.length} unused keys ---`);
  if (unused.length > 0 && unused.length < 50) {
    unused.forEach(k => console.log(`  - ${k}`));
  } else if (unused.length > 0) {
    console.log(`  (too many to list - showing first 30)`);
    unused.slice(0, 30).forEach(k => console.log(`  - ${k}`));
    console.log(`  ... and ${unused.length - 30} more`);
  }
}
