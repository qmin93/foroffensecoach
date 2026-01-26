/**
 * Export all concepts from src/data/concepts to JSON
 * Run: node scripts/export-concepts.js
 */

const fs = require('fs');
const path = require('path');

// Extract concepts with proper filtering
function extractConcepts(filePath, prefix) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Match concept blocks: start with id: 'pass_xxx' or id: 'run_xxx'
  // and extract key fields
  const conceptPattern = new RegExp(
    `\\{\\s*schemaVersion[\\s\\S]*?id: '(${prefix}_[^']+)'[\\s\\S]*?name: '([^']+)'[\\s\\S]*?conceptType: '(pass|run)'[\\s\\S]*?summary: ['"\`]([^'"\`]+)['"\`]`,
    'g'
  );

  const concepts = [];
  let match;

  while ((match = conceptPattern.exec(content)) !== null) {
    // Only add if ID starts with the correct prefix
    if (match[1].startsWith(prefix + '_')) {
      concepts.push({
        id: match[1],
        name: match[2],
        conceptType: match[3],
        summary: match[4],
      });
    }
  }

  return concepts;
}

// Main
const srcDir = path.join(__dirname, '..', 'src', 'data', 'concepts');
const outputDir = path.join(__dirname, '..', 'docs', 'audits');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Export Pass Concepts
const passConcepts = extractConcepts(path.join(srcDir, 'pass-concepts.ts'), 'pass');
console.log(`Found ${passConcepts.length} pass concepts`);

// Export Run Concepts
const runConcepts = extractConcepts(path.join(srcDir, 'run-concepts.ts'), 'run');
console.log(`Found ${runConcepts.length} run concepts`);

// Write combined JSON
const allConcepts = {
  pass: passConcepts,
  run: runConcepts,
  total: passConcepts.length + runConcepts.length
};

fs.writeFileSync(
  path.join(outputDir, 'all-concepts.json'),
  JSON.stringify(allConcepts, null, 2)
);

console.log(`\nExported to ${path.join(outputDir, 'all-concepts.json')}`);
console.log(`Total: ${allConcepts.total} concepts (Pass: ${passConcepts.length}, Run: ${runConcepts.length})`);
