/* eslint-disable no-console */

/**
 * Assignment Formatter (v1)
 * - PASS: concept.routes 기반으로 선수별 1줄 문장 생성
 * - RUN : concept.template.roles + defaultBlock 기반으로 선수별 1줄 문장 생성
 *
 * 표준 라벨:
 * QB, RB, FB, X, Z, Y, H, LT, LG, C, RG, RT
 */

export type CoreLabel =
  | 'QB'
  | 'RB'
  | 'FB'
  | 'X'
  | 'Z'
  | 'Y'
  | 'H'
  | 'LT'
  | 'LG'
  | 'C'
  | 'RG'
  | 'RT';

export type FormationPreset = {
  id: string;
  name: string;
  structure: string; // shotgun / pistol / under_center 등
  personnel: string; // 10/11/12/21...
  tags?: string[];
  positions: Record<string, string>;
};

export type PassRoute = {
  type: string; // dig, post, corner, flat...
  depth?: number;
};

export type PassConcept = {
  id: string;
  name: string;
  family?: string;
  dropType?: '3_step' | '5_step' | '7_step';
  appliesTo?: string[];
  summary?: string;
  routes?: Record<string, PassRoute>;
  progression?: string;
};

export type RunRole = {
  roleName: string;
  appliesTo: string[];
  defaultBlock?: { scheme?: string; target?: string };
  notes?: string;
};

export type RunConcept = {
  id: string;
  name: string;
  conceptType?: 'run' | string;
  summary?: string;
  appliesTo?: string[];
  requirements?: {
    needsTE?: boolean;
    needsPuller?: 'none' | 'G' | 'GT' | 'T' | 'any';
  };
  template?: {
    roles?: RunRole[];
    buildPolicy?: { defaultSide?: 'strength' | 'weak' | 'either' };
  };
};

export type AssignmentMap = Partial<Record<CoreLabel, string>>;

const CORE_LABELS: CoreLabel[] = [
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
];

function isCoreLabel(x: string): x is CoreLabel {
  return (CORE_LABELS as string[]).includes(x);
}

function yd(depth?: number): string {
  if (typeof depth !== 'number') return '';
  return ` @${depth}yd`;
}

/* =========================
 * PASS Formatting
 * ========================= */

function defaultRelease(formation?: FormationPreset, label?: CoreLabel): string {
  const tags = formation?.tags ?? [];
  const pos = formation?.positions ?? {};

  // bunch/stack/reduced 등은 free release가 더 자연스럽다
  const isBunchish =
    tags.includes('pick') ||
    tags.includes('rub') ||
    formation?.name.toLowerCase().includes('bunch') ||
    formation?.name.toLowerCase().includes('stack');

  const alignment = label ? pos[label] : '';
  const isSlot =
    alignment?.includes('slot') ||
    alignment?.includes('inside') ||
    label === 'H' ||
    label === 'Y';

  if (isBunchish) return 'Free Release';
  if (isSlot) return 'Inside Release';
  return 'Outside Release';
}

function passIntentHint(routeType: string): string {
  // 괄호 속 "의도"는 너무 길면 망하니 짧은 키워드만
  switch (routeType) {
    case 'go':
    case 'seam':
      return '(Clear/Stress safety)';
    case 'post':
      return '(Attack MOF)';
    case 'dig':
    case 'over':
      return '(Win vs MOF)';
    case 'corner':
      return '(High vs Cover-2)';
    case 'flat':
      return '(Widen curl/flat)';
    case 'hitch':
    case 'curl':
    case 'spot':
      return '(Sit window)';
    case 'slant':
      return '(Win inside)';
    case 'cross':
      return '(Run away)';
    case 'whip':
    case 'pivot':
      return '(Beat man)';
    case 'check':
      return '';
    default:
      return '';
  }
}

function formatPassReceiverLine(
  label: CoreLabel,
  r: PassRoute,
  formation?: FormationPreset,
): string {
  const release = defaultRelease(formation, label);
  const intent = passIntentHint(r.type);

  // Stick은 type이 stick으로 들어올 수 있는데, styleguide에서 spot/option류처럼 취급
  const routeName = r.type === 'stick' ? 'Stick' : capitalize(r.type);

  return `${release} → ${routeName}${yd(r.depth)} ${intent}`.trim();
}

function formatPassRBLine(r: PassRoute | undefined): string {
  // RB는 protection-check가 기본
  if (!r) return 'Check A-gap → Release Checkdown @3yd';
  const routeName = r.type === 'check' ? 'Checkdown' : capitalize(r.type);
  const d = typeof r.depth === 'number' ? r.depth : 3;
  return `Check A-gap → ${routeName}${yd(d)} (Hot/Outlet)`.trim();
}

function formatPassQBLine(concept: PassConcept): string {
  const drop = concept.dropType ? concept.dropType.replace('_', '-') : 'Drop';
  const prog = concept.progression ? concept.progression : 'Progression: work hi→low';
  return `${drop} → ${prog}`;
}

export function formatPassAssignments(params: {
  concept: PassConcept;
  formation?: FormationPreset;
}): AssignmentMap {
  const { concept, formation } = params;
  const out: AssignmentMap = {};

  const routes = concept.routes ?? {};

  for (const [labelRaw, r] of Object.entries(routes)) {
    if (!isCoreLabel(labelRaw)) continue;
    const label = labelRaw;

    if (label === 'RB') out.RB = formatPassRBLine(r);
    else if (label === 'QB') out.QB = formatPassQBLine(concept);
    else if (label === 'LT' || label === 'LG' || label === 'C' || label === 'RG' || label === 'RT') {
      // PASS에서 OL assignment가 필요하면 따로 패스프로텍션 모듈에서 찍는 게 낫다
      continue;
    } else {
      out[label] = formatPassReceiverLine(label, r, formation);
    }
  }

  // concept.routes에 RB가 없으면 기본 outlet 하나 박아줌
  if (!out.RB && formation?.positions?.RB) out.RB = formatPassRBLine({ type: 'check', depth: 3 });

  // QB 라인이 없으면 넣기
  if (!out.QB) out.QB = formatPassQBLine(concept);

  return out;
}

/* =========================
 * RUN Formatting
 * ========================= */

function schemeText(scheme?: string): string {
  if (!scheme) return 'Base';
  // 프로젝트 내부 scheme 네이밍을 문장으로 보기 좋게 치환
  switch (scheme) {
    case 'zone_step':
      return 'Zone step';
    case 'reach':
      return 'Reach';
    case 'down':
      return 'Down';
    case 'combo':
      return 'Combo';
    case 'pull_kick':
      return 'Pull Kick';
    case 'pull_wrap':
      return 'Pull Wrap';
    case 'pull_lead':
      return 'Pull Lead';
    case 'trap':
      return 'Trap';
    case 'wham':
      return 'Wham';
    case 'insert':
      return 'Insert';
    case 'kick':
      return 'Kick';
    case 'pass_set':
      return 'Pass set';
    case 'lead':
      return 'Lead';
    case 'seal':
      return 'Seal';
    case 'crack':
      return 'Crack';
    default:
      return capitalize(scheme.replace(/_/g, ' '));
  }
}

function targetText(target?: string): string {
  if (!target) return '';
  // target은 너무 자유롭게 쓰면 지저분해지니, 짧게 유지
  return ` ${target}`;
}

function ruleHintForOL(scheme?: string): string {
  switch (scheme) {
    case 'reach':
      return '(Run feet, overtake)';
    case 'combo':
      return '(Double then climb)';
    case 'down':
      return '(Inside leverage)';
    case 'pull_kick':
      return '(Kick-out)';
    case 'pull_wrap':
      return '(Inside-out)';
    case 'zone_step':
      return '(Work playside)';
    case 'trap':
      return '(Quick hit)';
    case 'wham':
      return '(Trap)';
    default:
      return '';
  }
}

function ruleHintForSkill(scheme?: string): string {
  switch (scheme) {
    case 'kick':
      return '(Seal edge)';
    case 'insert':
      return '(Fit inside)';
    case 'lead':
      return '(Find PSLB)';
    case 'crack':
      return '(Crack force)';
    case 'seal':
      return '(Wall CB)';
    default:
      return '';
  }
}

function formatRunLine(label: CoreLabel, role: RunRole): string {
  const scheme = role.defaultBlock?.scheme;
  const target = role.defaultBlock?.target;
  const s = schemeText(scheme);
  const t = targetText(target);

  const hint =
    label === 'LT' || label === 'LG' || label === 'C' || label === 'RG' || label === 'RT'
      ? ruleHintForOL(scheme)
      : ruleHintForSkill(scheme);

  // notes가 있으면 뒤에 한 번만 붙이고 너무 길면 자른다
  const notes = role.notes ? ` — ${truncate(role.notes, 44)}` : '';

  return `${s}${t} ${hint}${notes}`.trim();
}

function defaultRunAiming(concept: RunConcept): Partial<AssignmentMap> {
  const name = concept.name.toLowerCase();

  if (name.includes('inside zone')) return { RB: 'Aim PS A-gap → Read first DL past C → One-cut' };
  if (name.includes('mid zone')) return { RB: 'Aim PS B/C-gap → Press then cut vertical' };
  if (name.includes('outside zone') || name.includes('stretch')) return { RB: 'Aim edge → Press wide → One-cut upfield' };
  if (name.includes('power')) return { RB: 'Aim PS B-gap → Read kick-out + wrap → Get vertical' };
  if (name.includes('counter')) return { RB: 'Counter step → Follow pullers → Hit inside-out' };
  if (name.includes('toss') || name.includes('pin-pull')) return { RB: 'Aim numbers → Press edge → Cut vertical' };
  if (name.includes('zone read')) return { QB: 'Read BSDE → Pull if crash → Get vertical' };
  if (name.includes('power read')) return { QB: 'Read PSDE → Keep if squeeze → Follow puller' };
  if (name.includes('qb draw')) return { QB: 'Sell pass → Delay → Hit inside vertical' };
  if (name.includes('qb power')) return { QB: 'Follow puller → Hit B-gap vertical' };
  return { RB: 'Aim landmark → Read key → Finish vertical' };
}

export function formatRunAssignments(params: {
  concept: RunConcept;
  formation?: FormationPreset;
}): AssignmentMap {
  const { concept } = params;
  const out: AssignmentMap = {};

  const roles = concept.template?.roles ?? [];

  // role 기반으로 라벨별 문장 생성
  for (const role of roles) {
    for (const labelRaw of role.appliesTo) {
      if (!isCoreLabel(labelRaw)) continue;
      const label = labelRaw;

      // 같은 라벨에 여러 role이 붙으면 " / "로 합친다(너무 길면 truncate)
      const line = formatRunLine(label, role);
      if (!out[label]) out[label] = line;
      else out[label] = truncate(`${out[label]} / ${line}`, 90);
    }
  }

  // RB/QB aiming은 role에서 안 잡히는 경우가 많으니 기본값 채움
  const defaults = defaultRunAiming(concept);
  if (!out.RB && defaults.RB) out.RB = defaults.RB;
  if (!out.QB && defaults.QB) out.QB = defaults.QB;

  return out;
}

/* =========================
 * Utilities
 * ========================= */

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1)}…`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* =========================
 * Unified entry (optional)
 * ========================= */

export function formatAssignments(params: {
  kind: 'pass' | 'run';
  concept: PassConcept | RunConcept;
  formation?: FormationPreset;
}): AssignmentMap {
  if (params.kind === 'pass') {
    return formatPassAssignments({ concept: params.concept as PassConcept, formation: params.formation });
  }
  return formatRunAssignments({ concept: params.concept as RunConcept, formation: params.formation });
}
