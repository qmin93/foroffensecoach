/**
 * Concept Verification Script
 *
 * Run with: npx tsx scripts/verify-concepts.ts
 *
 * Verifies all 89 concepts generate valid routes and blocks
 */

import { PASS_CONCEPTS, RUN_CONCEPTS, ALL_CONCEPTS } from '../src/data/concepts';
import { buildConceptActions } from '../src/lib/concept-builder';
import { FORMATION_PRESETS } from '../src/store/editorStore';
import { v4 as uuidv4 } from 'uuid';

// Create player roster from formation
function createPlayersFromFormation(formationKey: string) {
  const formation = FORMATION_PRESETS[formationKey];
  if (!formation) return [];

  return formation.players
    .filter((p: any) => p.role !== 'BALL')
    .map((p: any) => ({
      id: uuidv4(),
      role: p.role,
      label: p.label,
      alignment: { x: p.x, y: p.y },
      appearance: p.appearance || {},
    }));
}

interface TestResult {
  conceptId: string;
  conceptName: string;
  type: 'pass' | 'run';
  formation: string;
  actionsCreated: number;
  routeCount: number;
  blockCount: number;
  otherCount: number;
  error?: string;
}

async function main() {
  console.log('='.repeat(70));
  console.log('CONCEPT VERIFICATION TEST - ROUTES & BLOCKS');
  console.log('='.repeat(70));
  console.log(`Total concepts: ${ALL_CONCEPTS.length} (${PASS_CONCEPTS.length} pass, ${RUN_CONCEPTS.length} run)\n`);

  const results: TestResult[] = [];
  const errors: TestResult[] = [];
  const zeroActions: TestResult[] = [];

  // Test each concept with spread formation (most common)
  const testFormation = 'spread';
  const players = createPlayersFromFormation(testFormation);

  console.log(`Testing with ${testFormation} formation (${players.length} players)\n`);

  // Test pass concepts
  console.log('\n--- PASS CONCEPTS ---\n');
  console.log('ID                        Name                 Routes  Blocks  Total');
  console.log('-'.repeat(70));

  for (const concept of PASS_CONCEPTS) {
    try {
      const result = buildConceptActions(concept, players as any);

      // Count routes vs blocks
      const routeCount = result.actions.filter((a: any) => a.actionType === 'route').length;
      const blockCount = result.actions.filter((a: any) => a.actionType === 'block').length;
      const otherCount = result.actions.length - routeCount - blockCount;

      const testResult: TestResult = {
        conceptId: concept.id,
        conceptName: concept.name,
        type: 'pass',
        formation: testFormation,
        actionsCreated: result.actionsCreated,
        routeCount,
        blockCount,
        otherCount,
      };
      results.push(testResult);

      const status = result.actionsCreated > 0 ? '✓' : '✗';
      console.log(`${status} ${concept.id.padEnd(24)} ${concept.name.padEnd(20)} ${String(routeCount).padStart(4)}    ${String(blockCount).padStart(4)}    ${String(result.actionsCreated).padStart(4)}`);

      if (result.actionsCreated === 0) {
        zeroActions.push(testResult);
      }
    } catch (err) {
      const testResult: TestResult = {
        conceptId: concept.id,
        conceptName: concept.name,
        type: 'pass',
        formation: testFormation,
        actionsCreated: 0,
        routeCount: 0,
        blockCount: 0,
        otherCount: 0,
        error: String(err),
      };
      results.push(testResult);
      errors.push(testResult);
      console.log(`✗ ${concept.id.padEnd(24)} ERROR: ${err}`);
    }
  }

  // Test run concepts
  console.log('\n--- RUN CONCEPTS ---\n');
  console.log('ID                        Name                 Routes  Blocks  Total');
  console.log('-'.repeat(70));

  for (const concept of RUN_CONCEPTS) {
    try {
      const result = buildConceptActions(concept, players as any);

      // Count routes vs blocks
      const routeCount = result.actions.filter((a: any) => a.actionType === 'route').length;
      const blockCount = result.actions.filter((a: any) => a.actionType === 'block').length;
      const otherCount = result.actions.length - routeCount - blockCount;

      const testResult: TestResult = {
        conceptId: concept.id,
        conceptName: concept.name,
        type: 'run',
        formation: testFormation,
        actionsCreated: result.actionsCreated,
        routeCount,
        blockCount,
        otherCount,
      };
      results.push(testResult);

      const status = result.actionsCreated > 0 ? '✓' : '✗';
      console.log(`${status} ${concept.id.padEnd(24)} ${concept.name.padEnd(20)} ${String(routeCount).padStart(4)}    ${String(blockCount).padStart(4)}    ${String(result.actionsCreated).padStart(4)}`);

      if (result.actionsCreated === 0) {
        zeroActions.push(testResult);
      }
    } catch (err) {
      const testResult: TestResult = {
        conceptId: concept.id,
        conceptName: concept.name,
        type: 'run',
        formation: testFormation,
        actionsCreated: 0,
        routeCount: 0,
        blockCount: 0,
        otherCount: 0,
        error: String(err),
      };
      results.push(testResult);
      errors.push(testResult);
      console.log(`✗ ${concept.id.padEnd(24)} ERROR: ${err}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));

  const passResults = results.filter(r => r.type === 'pass');
  const runResults = results.filter(r => r.type === 'run');

  const totalRoutes = results.reduce((sum, r) => sum + r.routeCount, 0);
  const totalBlocks = results.reduce((sum, r) => sum + r.blockCount, 0);
  const totalActions = results.reduce((sum, r) => sum + r.actionsCreated, 0);

  const passRoutes = passResults.reduce((sum, r) => sum + r.routeCount, 0);
  const passBlocks = passResults.reduce((sum, r) => sum + r.blockCount, 0);
  const runRoutes = runResults.reduce((sum, r) => sum + r.routeCount, 0);
  const runBlocks = runResults.reduce((sum, r) => sum + r.blockCount, 0);

  console.log(`\nTotal tested: ${results.length}`);
  console.log(`Successful (actions > 0): ${results.filter(r => r.actionsCreated > 0 && !r.error).length}`);
  console.log(`Zero actions: ${zeroActions.length}`);
  console.log(`Errors: ${errors.length}`);

  console.log('\n--- ACTION BREAKDOWN ---');
  console.log(`Total Actions: ${totalActions}`);
  console.log(`  - Routes: ${totalRoutes}`);
  console.log(`  - Blocks: ${totalBlocks}`);

  console.log('\n--- BY CONCEPT TYPE ---');
  console.log(`Pass Concepts (${passResults.length}):`);
  console.log(`  - Routes: ${passRoutes}`);
  console.log(`  - Blocks: ${passBlocks}`);
  console.log(`Run Concepts (${runResults.length}):`);
  console.log(`  - Routes: ${runRoutes}`);
  console.log(`  - Blocks: ${runBlocks}`);

  if (zeroActions.length > 0) {
    console.log('\n--- CONCEPTS WITH ZERO ACTIONS ---');
    zeroActions.forEach(r => {
      console.log(`  - ${r.conceptId} (${r.conceptName})`);
    });
  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS ---');
    errors.forEach(r => {
      console.log(`  - ${r.conceptId}: ${r.error}`);
    });
  }

  // Exit code
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
