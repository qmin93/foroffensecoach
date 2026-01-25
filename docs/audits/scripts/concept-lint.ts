/* eslint-disable no-console */
/**
 * Concept / Formation Lint (Phase 6)
 * 목표:
 * 1) concept.appliesTo 라벨이 formation 라벨셋에서 충족 가능한지 검사
 * 2) PASS: dropType ↔ depth 범위 위반 검사 (대충이 아니라 "현실적 범위" 기준)
 * 3) RUN: scheme ↔ puller 구조/요구사항 모순 검사
 *
 * 사용:
 *   - tsx docs/audits/scripts/concept-lint.ts
 *   - 또는 npx ts-node docs/audits/scripts/concept-lint.ts
 */

type Side = 'strength' | 'weak' | 'either';

type FormationPreset = {
  id: string;
  name: string;
  structure: string;
  personnel: string;
  tags?: string[];
  positions: Record<string, string>; // keys = labels (QB,RB,X,Z,Y,H,FB,LT...)
};

type PassConcept = {
  id: string;
  name: string;
  family?: string;
  dropType?: '3_step' | '5_step' | '7_step';
  appliesTo?: string[];
  summary?: string;
  // routes: keyed by label; depth in yards if present
  routes?: Record<string, { type: string; depth?: number }>;
  progression?: string;
};

type RunConcept = {
  id: string;
  name: string;
  conceptType?: 'run' | string;
  appliesTo?: string[];
  summary?: string;
  requirements?: {
    needsTE?: boolean;
    needsPuller?: 'none' | 'G' | 'GT' | 'T' | 'any';
    boxTolerance?: string;
    preferredStructures?: string[];
    personnelHints?: string[];
  };
  template?: {
    roles?: Array<{
      roleName: string;
      appliesTo: string[];
      defaultBlock?: { scheme?: string; target?: string };
      notes?: string;
    }>;
    buildPolicy?: {
      defaultSide?: Side;
    };
  };
  suggestionHints?: unknown;
};

/**
 * Import audit files
 */
import { FORMATION_PRESETS_AUDIT } from '../formation-presets.audit';
import { PASS_CONCEPTS_AUDIT2 } from '../pass-concepts.audit2';
import { RUN_CONCEPTS_AUDIT2 } from '../run-concepts.audit2';

const formations = FORMATION_PRESETS_AUDIT as FormationPreset[];
const passConcepts = PASS_CONCEPTS_AUDIT2 as unknown as PassConcept[];
const runConcepts = RUN_CONCEPTS_AUDIT2 as unknown as RunConcept[];

/* -----------------------------
 * Helpers
 * ----------------------------- */

const CORE_LABELS = new Set([
  'QB',
  'RB',
  'FB',
  'X',
  'Z',
  'Y',
  'H',
  'LT',
  'LG',
  'C',
  'RG',
  'RT',
]);

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function err(msg: string) {
  console.error(`❌ ${msg}`);
}

function warn(msg: string) {
  console.warn(`⚠️  ${msg}`);
}

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function getFormationLabelSet(f: FormationPreset): Set<string> {
  return new Set(Object.keys(f.positions));
}

function anyFormationSatisfies(labelsNeeded: string[]): FormationPreset[] {
  const needed = labelsNeeded.filter(Boolean);
  return formations.filter((f) => {
    const labelSet = getFormationLabelSet(f);
    return needed.every((l) => labelSet.has(l));
  });
}

/* -----------------------------
 * PASS Depth Rules (realistic ranges)
 * ----------------------------- */

// "현실적인" 기본 범위 (너무 빡세게 잡으면 false positive 생김)
const PASS_DEPTH_RANGES: Record<
  string,
  { min: number; max: number; notes?: string }
> = {
  flat: { min: 0, max: 3 },
  out: { min: 3, max: 7 },
  hitch: { min: 4, max: 7 },
  curl: { min: 6, max: 12 },
  spot: { min: 4, max: 6 },
  slant: { min: 2, max: 5 },
  whip: { min: 4, max: 7 },
  pivot: { min: 4, max: 7 },
  angle: { min: 4, max: 7 },
  cross: { min: 2, max: 6 }, // shallow cross default
  dig: { min: 10, max: 18 },
  over: { min: 12, max: 20 },
  corner: { min: 10, max: 15 },
  post: { min: 14, max: 22 },
  go: { min: 15, max: 25 },
  seam: { min: 12, max: 22 },
  check: { min: 0, max: 5 },
};

// dropType별 "권장 depth 범위" (컨셉 전체에 적용하는 가벼운 sanity)
const DROPTYPE_MAX_DEPTH: Record<'3_step' | '5_step' | '7_step', number> = {
  '3_step': 10,
  '5_step': 16,
  '7_step': 25,
};

function lintPassConcept(c: PassConcept) {
  const issues: string[] = [];
  const warnings: string[] = [];

  const appliesTo = uniq(c.appliesTo ?? []);
  if (appliesTo.length === 0) {
    warnings.push(`[PASS:${c.id}] appliesTo가 비어있음 (추천/매칭 약해짐)`);
  }

  // appliesTo가 어떤 포메이션에서도 충족 안 되면 에러
  if (appliesTo.length > 0) {
    const satisfied = anyFormationSatisfies(appliesTo);
    if (satisfied.length === 0) {
      issues.push(
        `[PASS:${c.id}] appliesTo=${JSON.stringify(
          appliesTo,
        )} 충족 가능한 formation이 없음`,
      );
    }
  }

  // routes depth 검증
  const routes = c.routes ?? {};
  const dropType = c.dropType;

  // dropType이 있는데 깊이가 과하게 깊으면 경고/에러
  // 예외: 'go' route는 clear-out 역할이므로 depth 체크 제외
  if (dropType) {
    const maxAllowed = DROPTYPE_MAX_DEPTH[dropType];
    for (const [label, r] of Object.entries(routes)) {
      // Skip 'go' routes - they serve as clear-out and aren't primary reads
      if (r.type === 'go') continue;
      if (typeof r.depth === 'number' && r.depth > maxAllowed + 2) {
        warnings.push(
          `[PASS:${c.id}] ${label} route depth=${r.depth}yd is too deep for ${dropType} (max~${maxAllowed})`,
        );
      }
    }
  }

  // route type별 depth range 확인 (존나 과하면 경고)
  for (const [label, r] of Object.entries(routes)) {
    if (typeof r.depth !== 'number') continue;
    const rule = PASS_DEPTH_RANGES[r.type];
    if (!rule) continue;
    if (r.depth < rule.min || r.depth > rule.max) {
      warnings.push(
        `[PASS:${c.id}] ${label} route=${r.type} depth=${r.depth}yd out of range (${rule.min}-${rule.max})`,
      );
    }
  }

  return { issues, warnings };
}

/* -----------------------------
 * RUN Rules
 * ----------------------------- */

const RUN_PULL_SCHEMES = new Set([
  'pull_kick',
  'pull_wrap',
  'pull_lead',
  'trap',
]);

function lintRunConcept(c: RunConcept) {
  const issues: string[] = [];
  const warnings: string[] = [];

  const roles = c.template?.roles ?? [];
  const req = c.requirements ?? {};

  // needsTE=true인데 Y/H/FB 역할이 단 하나도 없으면 경고
  if (req.needsTE) {
    const hasTErole = roles.some((r) =>
      r.appliesTo.some((l) => l === 'Y' || l === 'H' || l === 'FB'),
    );
    if (!hasTErole) {
      warnings.push(
        `[RUN:${c.id}] needsTE=true인데 roles에 Y/H/FB 적용이 없음`,
      );
    }
  }

  // needsPuller 검사: pull 스킴 존재 여부
  const pullRoles = roles.filter((r) =>
    RUN_PULL_SCHEMES.has(r.defaultBlock?.scheme ?? ''),
  );

  const needsPuller = req.needsPuller ?? 'none';
  if (needsPuller === 'none' && pullRoles.length > 0) {
    warnings.push(
      `[RUN:${c.id}] needsPuller=none인데 pull/trap 스킴 role이 존재함 (${pullRoles
        .map((r) => r.roleName)
        .join(', ')})`,
    );
  }

  if (needsPuller !== 'none' && pullRoles.length === 0) {
    warnings.push(
      `[RUN:${c.id}] needsPuller=${needsPuller}인데 pull/trap 스킴 role이 없음`,
    );
  }

  // appliesTo 검사(있으면 formation 충족 여부)
  const appliesTo = uniq(c.appliesTo ?? []);
  if (appliesTo.length > 0) {
    const satisfied = anyFormationSatisfies(appliesTo);
    if (satisfied.length === 0) {
      issues.push(
        `[RUN:${c.id}] appliesTo=${JSON.stringify(
          appliesTo,
        )} 충족 가능한 formation이 없음`,
      );
    }
  }

  // role appliesTo에 "표준 라벨" 아닌 게 있으면 경고
  for (const r of roles) {
    for (const l of r.appliesTo) {
      if (!CORE_LABELS.has(l)) {
        warnings.push(
          `[RUN:${c.id}] role=${r.roleName} appliesTo에 비표준 라벨 "${l}" 사용`,
        );
      }
    }
  }

  return { issues, warnings };
}

/* -----------------------------
 * Formation Rules
 * ----------------------------- */

function lintFormations() {
  const issues: string[] = [];
  const warnings: string[] = [];

  for (const f of formations) {
    const labels = getFormationLabelSet(f);

    // 필수 라벨
    if (!labels.has('QB')) issues.push(`[FORM:${f.id}] QB 없음`);
    if (
      !labels.has('LT') ||
      !labels.has('LG') ||
      !labels.has('C') ||
      !labels.has('RG') ||
      !labels.has('RT')
    ) {
      warnings.push(
        `[FORM:${f.id}] OL 라벨(LT/LG/C/RG/RT) 일부 누락 (추천/블로킹 템플릿에 불리)`,
      );
    }

    // TE 라벨 금지(TE 대신 Y만)
    if (labels.has('TE')) {
      issues.push(`[FORM:${f.id}] 라벨 "TE" 발견 → "Y"로 통일해야 함`);
    }

    // 비표준 라벨 경고
    for (const l of labels) {
      if (!CORE_LABELS.has(l)) {
        warnings.push(`[FORM:${f.id}] 비표준 라벨 "${l}" 사용`);
      }
    }
  }

  return { issues, warnings };
}

/* -----------------------------
 * Run Lint
 * ----------------------------- */

function main() {
  console.log('=== Concept / Formation Lint 시작 ===\n');
  console.log(`Formations: ${formations.length}개`);
  console.log(`Pass Concepts: ${passConcepts.length}개`);
  console.log(`Run Concepts: ${runConcepts.length}개\n`);

  const allIssues: string[] = [];
  const allWarnings: string[] = [];

  // formations
  {
    const { issues, warnings } = lintFormations();
    allIssues.push(...issues);
    allWarnings.push(...warnings);
  }

  // pass
  for (const c of passConcepts) {
    const { issues, warnings } = lintPassConcept(c);
    allIssues.push(...issues);
    allWarnings.push(...warnings);
  }

  // run
  for (const c of runConcepts) {
    const { issues, warnings } = lintRunConcept(c);
    allIssues.push(...issues);
    allWarnings.push(...warnings);
  }

  // print warnings then issues
  if (allWarnings.length) {
    console.log('\n--- WARNINGS ---');
    for (const w of allWarnings) warn(w);
  }

  if (allIssues.length) {
    console.log('\n--- ERRORS ---');
    for (const e of allIssues) err(e);
    console.log(
      `\nFAIL: ${allIssues.length} error(s), ${allWarnings.length} warning(s)`,
    );
    process.exit(1);
  }

  ok(`PASS: 0 error(s), ${allWarnings.length} warning(s)`);
  process.exit(0);
}

main();
