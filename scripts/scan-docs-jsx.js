/**
 * Scan all docs pages for TypeScript syntax accidentally left in JSX
 */
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../packages/frontend/src/app/[locale]/docs');
const patterns = [
  /{[a-zA-Z]+,\s*[a-zA-Z]+[,\s]*[a-zA-Z]*}/,   // {a, b} destructuring
  /{[a-zA-Z]+:\s*'[a-zA-Z| ]+'}/,                 // {type: 'value'}
  /{[a-zA-Z]+:\s*string}/,                         // {userId: string}
  /{[a-zA-Z]+:\s*number}/,                         // {count: number}
  /{[a-zA-Z]+:\s*boolean}/,                        // {active: boolean}
  /\|[^|]+\}/,                                     // union types like | 'disconnected'}
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    // Skip import lines, comments, const declarations
    if (line.trim().startsWith('import ') || line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('const ') || line.trim().startsWith('export ')) return;
    
    for (const pattern of patterns) {
      if (pattern.test(line)) {
        // Make sure it's actually in JSX, not in a string or config object
        if (!line.includes('className=') && !line.includes('"') && line.includes('<')) {
          issues.push({ line: lineNum, text: line.trim(), pattern: pattern.source });
          break;
        }
      }
    }
  });
  
  return issues;
}

function walkDir(dir) {
  let allIssues = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(allIssues, walkDir(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      const issues = scanFile(fullPath);
      if (issues.length > 0) {
        allIssues[path.relative(process.cwd(), fullPath)] = issues;
      }
    }
  }
  return allIssues;
}

const results = walkDir(DOCS_DIR);
const fileCount = Object.keys(results).length;

if (fileCount === 0) {
  console.log('\nNo TS-in-JSX issues found. All clean!\n');
} else {
  console.log(`\nFound potential TS-in-JSX issues in ${fileCount} files:\n`);
  for (const [file, issues] of Object.entries(results)) {
    console.log(`\n${file} (${issues.length} issues):`);
    for (const issue of issues) {
      console.log(`  L${issue.line}: ${issue.text.substring(0, 120)}`);
    }
  }
  console.log();
}

process.exit(fileCount > 0 ? 1 : 0);
