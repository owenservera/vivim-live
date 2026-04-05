#!/usr/bin/env node
import fs from 'fs';

const schemaPath = './prisma/schema.prisma';
let content = fs.readFileSync(schemaPath, 'utf8');

// Add @@schema("public") to all models and enums that don't already have it
content = content.replace(
  /^(model|enum) (\w+) \{/gm,
  (match, type, name) => {
    // Skip if already has @@schema
    const blockStart = match;
    const blockIndex = content.indexOf(match);
    const nextBlockIndex = content.indexOf(`\n${type} `, blockIndex + 1);
    const block = nextBlockIndex === -1
      ? content.slice(blockIndex)
      : content.slice(blockIndex, nextBlockIndex);

    if (block.includes('@@schema')) {
      return match;
    }

    return `${match}\n  @@schema("public")`;
  }
);

fs.writeFileSync(schemaPath, content);
console.log('Added @@schema("public") to all models and enums');