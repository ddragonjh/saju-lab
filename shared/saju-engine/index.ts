import type {
  DaeunItem,
  ElementName,
  Ganzhi,
  MarriageYear,
  SajuInput,
  SajuResult,
  SeunItem,
  TenGodName,
  TenGroupName,
} from '../types';

export const MIN_YEAR = 1930;
export const MAX_YEAR = 2035;

export const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const STEMS_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const STEM_ELEM: ElementName[] = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
export const STEM_YANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0] as const;

export const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export const BRANCHES_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const BRANCH_ELEM: ElementName[] = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];
export const BRANCH_ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'] as const;

export const HIDDEN: Record<number, number[]> = {
  0: [8, 9],
  1: [9, 7, 5],
  2: [4, 2, 0],
  3: [0, 1],
  4: [1, 9, 4],
  5: [4, 6, 2],
  6: [2, 5, 3],
  7: [3, 1, 5],
  8: [4, 8, 6],
  9: [6, 7],
  10: [7, 3, 4],
  11: [4, 0, 8],
};

export const ELEMS: ElementName[] = ['목', '화', '토', '금', '수'];
const ELEM_IDX: Record<ElementName, number> = { 목: 0, 화: 1, 토: 2, 금: 3, 수: 4 };

const TERMS = [
  { name: '소한', month: 1, c20: 6.11, c21: 5.4055 },
  { name: '입춘', month: 2, c20: 4.6295, c21: 3.87 },
  { name: '경칩', month: 3, c20: 6.3826, c21: 5.63 },
  { name: '청명', month: 4, c20: 5.59, c21: 4.81 },
  { name: '입하', month: 5, c20: 6.318, c21: 5.52 },
  { name: '망종', month: 6, c20: 6.5, c21: 5.678 },
  { name: '소서', month: 7, c20: 7.928, c21: 7.108 },
  { name: '입추', month: 8, c20: 8.35, c21: 7.5 },
  { name: '백로', month: 9, c20: 8.44, c21: 7.646 },
  { name: '한로', month: 10, c20: 9.098, c21: 8.318 },
  { name: '입동', month: 11, c20: 8.218, c21: 7.438 },
  { name: '대설', month: 12, c20: 7.9, c21: 7.18 },
] as const;

export function termDate(year: number, termIdx: number): Date {
  const t = TERMS[termIdx];
  const yy = year % 100;
  const c = year >= 2000 ? t.c21 : t.c20;
  const l = t.month <= 2 ? Math.floor((yy - 1) / 4) : Math.floor(yy / 4);
  const day = Math.floor(yy * 0.2422 + c) - l;
  return new Date(year, t.month - 1, day);
}

function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

export function dayGanzhi(y: number, m: number, d: number): number {
  return (((jdn(y, m, d) - 2415021 + 10) % 60) + 60) % 60;
}

export function ganzhiOf(i: number): Ganzhi {
  const idx = ((i % 60) + 60) % 60;
  return { stem: idx % 10, branch: idx % 12, idx };
}

export function gzName(g: Ganzhi): string {
  return `${STEMS[g.stem]}${BRANCHES[g.branch]}`;
}

export function gzHanja(g: Ganzhi): string {
  return `${STEMS_H[g.stem]}${BRANCHES_H[g.branch]}`;
}

export const TEN_NAMES: TenGodName[] = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];

export function tenGod(dayStem: number, otherStem: number): TenGodName {
  const de = ELEM_IDX[STEM_ELEM[dayStem]];
  const oe = ELEM_IDX[STEM_ELEM[otherStem]];
  const same = STEM_YANG[dayStem] === STEM_YANG[otherStem];
  let group: number;
  if (oe === de) group = 0;
  else if (oe === (de + 1) % 5) group = 1;
  else if (oe === (de + 2) % 5) group = 2;
  else if (de === (oe + 2) % 5) group = 3;
  else group = 4;
  return TEN_NAMES[group * 2 + (same ? 0 : 1)];
}

export function tenGodOfBranch(dayStem: number, branch: number): TenGodName {
  const hidden = HIDDEN[branch];
  const main = hidden[hidden.length - 1];
  return tenGod(dayStem, main);
}

const SAMHAP: Record<number, number> = { 8: 0, 0: 0, 4: 0, 11: 1, 3: 1, 7: 1, 2: 2, 6: 2, 10: 2, 5: 3, 9: 3, 1: 3 };
const DOHWA = [9, 0, 3, 6];
const YEOKMA = [2, 5, 8, 11];
const HWAGAE = [4, 7, 10, 1];
const CHEONEUL: Record<number, number[]> = { 0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 7: [2, 6], 8: [5, 3], 9: [5, 3] };
const BAEKHO = new Set(['갑진', '을미', '병술', '정축', '무진', '임술', '계축']);
const GOEGANG = new Set(['경진', '경술', '임진', '임술', '무술', '무진']);

function findSinsal(pillars: Array<Ganzhi | null>, dayStem: number): string[] {
  const out: string[] = [];
  const branches = pillars.filter(Boolean).map((p) => p!.branch);
  const dayP = pillars[2];
  const yearP = pillars[0];
  if (!dayP || !yearP) return out;
  const bases = [SAMHAP[dayP.branch], SAMHAP[yearP.branch]];
  const has = (targets: number[]) => branches.some((branch) => bases.some((g) => targets[g] === branch));
  if (has(DOHWA)) out.push('도화살');
  if (has(YEOKMA)) out.push('역마살');
  if (has(HWAGAE)) out.push('화개살');
  if (branches.some((branch) => (CHEONEUL[dayStem] || []).includes(branch))) out.push('천을귀인');
  pillars.forEach((p, i) => {
    if (p && BAEKHO.has(gzName(p))) out.push(`백호살(${'년월일시'[i]}주)`);
  });
  if (GOEGANG.has(gzName(dayP))) out.push('괴강살');
  return [...new Set(out)];
}

function validateInput(o: SajuInput): void {
  const { year, month, day, hour, minute } = o;
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) throw new RangeError('지원 범위는 1930년부터 2035년까지입니다.');
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError('월 입력값이 올바르지 않습니다.');
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new RangeError('일 입력값이 올바르지 않습니다.');
  if (!o.unknownTime && (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59)) {
    throw new RangeError('시간 입력값이 올바르지 않습니다.');
  }
  if (!['M', 'F'].includes(o.gender)) throw new RangeError('성별을 선택해 주세요.');
  const rawDate = new Date(year, month - 1, day);
  if (rawDate.getFullYear() !== year || rawDate.getMonth() !== month - 1 || rawDate.getDate() !== day) {
    throw new RangeError('존재하지 않는 날짜입니다.');
  }
}

function monthPillar(yearP: Ganzhi, sajuYear: number, dateOnly: Date): { pillar: Ganzhi; boundary: boolean } {
  const termSeq: Date[] = [];
  for (let i = 1; i < 12; i += 1) termSeq.push(termDate(sajuYear, i));
  termSeq.push(termDate(sajuYear + 1, 0));
  let monthOffset = 0;
  let boundary = false;
  for (let i = 0; i < termSeq.length; i += 1) {
    const td = termSeq[i];
    if (dateOnly >= td) monthOffset = i;
    if (Math.abs((dateOnly.getTime() - td.getTime()) / 86400000) < 1) boundary = true;
  }
  const branch = (2 + monthOffset) % 12;
  const stem = ((yearP.stem % 5) * 2 + 2 + monthOffset) % 10;
  let idx = 0;
  for (let i = 0; i < 60; i += 1) {
    if (i % 10 === stem && i % 12 === branch) {
      idx = i;
      break;
    }
  }
  return { pillar: { stem, branch, idx }, boundary };
}

export function computeSaju(input: SajuInput, options: { referenceDate?: Date } = {}): SajuResult {
  validateInput(input);
  const o: SajuInput = { ...input, name: input.name?.trim() };
  const hour = o.unknownTime ? 12 : Number(o.hour);
  const minute = o.unknownTime ? 0 : Number(o.minute);
  let dt = new Date(o.year, o.month - 1, o.day, hour, minute);
  if (!o.unknownTime && o.trueSolar) dt = new Date(dt.getTime() - 30 * 60000);

  const y = dt.getFullYear();
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const hh = dt.getHours();

  const ipchun = termDate(y, 1);
  const dateOnly = new Date(y, m - 1, d);
  const sajuYear = dateOnly >= new Date(ipchun.getFullYear(), ipchun.getMonth(), ipchun.getDate()) ? y : y - 1;
  const yearP = ganzhiOf(((sajuYear - 4) % 60 + 60) % 60);
  const { pillar: monthP, boundary } = monthPillar(yearP, sajuYear, dateOnly);

  let dy = y;
  let dm = m;
  let dd = d;
  if (!o.unknownTime && o.dayBoundary !== '0' && hh >= 23) {
    const next = new Date(y, m - 1, d + 1);
    dy = next.getFullYear();
    dm = next.getMonth() + 1;
    dd = next.getDate();
  }
  const dayP = ganzhiOf(dayGanzhi(dy, dm, dd));

  let hourP: Ganzhi | null = null;
  if (!o.unknownTime) {
    const branch = Math.floor(((hh + 1) % 24) / 2) % 12;
    const stem = ((dayP.stem % 5) * 2 + branch) % 10;
    hourP = { stem, branch, idx: -1 };
  }
  const pillars: Array<Ganzhi | null> = [yearP, monthP, dayP, hourP];

  const elemCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 } satisfies Record<ElementName, number>;
  pillars.forEach((p) => {
    if (!p) return;
    elemCount[STEM_ELEM[p.stem]] += 1;
    HIDDEN[p.branch].forEach((stem, i, arr) => {
      elemCount[STEM_ELEM[stem]] += i === arr.length - 1 ? 1 : 0.3;
    });
  });

  const tenCount = Object.fromEntries(TEN_NAMES.map((name) => [name, 0])) as Record<TenGodName, number>;
  pillars.forEach((p, i) => {
    if (!p) return;
    if (i !== 2) tenCount[tenGod(dayP.stem, p.stem)] += 1;
    tenCount[tenGodOfBranch(dayP.stem, p.branch)] += 1;
  });
  const tenGroup: Record<TenGroupName, number> = {
    비겁: tenCount.비견 + tenCount.겁재,
    식상: tenCount.식신 + tenCount.상관,
    재성: tenCount.편재 + tenCount.정재,
    관성: tenCount.편관 + tenCount.정관,
    인성: tenCount.편인 + tenCount.정인,
  };

  const yangYear = STEM_YANG[yearP.stem] === 1;
  const forward = (o.gender === 'M') === yangYear;
  const allTerms: Date[] = [];
  for (let yy = sajuYear - 1; yy <= sajuYear + 1; yy += 1) {
    for (let i = 0; i < 12; i += 1) allTerms.push(termDate(yy, i));
  }
  allTerms.sort((a, b) => a.getTime() - b.getTime());
  let daysGap: number;
  if (forward) {
    const next = allTerms.find((t) => t > dateOnly);
    daysGap = Math.round(((next || dateOnly).getTime() - dateOnly.getTime()) / 86400000);
  } else {
    const prevs = allTerms.filter((t) => t <= dateOnly);
    const prev = prevs[prevs.length - 1] || dateOnly;
    daysGap = Math.round((dateOnly.getTime() - prev.getTime()) / 86400000);
  }
  let daeunNum = Math.round(daysGap / 3);
  if (daeunNum < 1) daeunNum = 1;
  if (daeunNum > 10) daeunNum = 10;
  const daeun: DaeunItem[] = [];
  for (let k = 1; k <= 8; k += 1) {
    const gi = ((monthP.idx + (forward ? k : -k)) % 60 + 60) % 60;
    const gz = ganzhiOf(gi);
    daeun.push({ startAge: daeunNum + (k - 1) * 10, gz, stemGod: tenGod(dayP.stem, gz.stem), branchGod: tenGodOfBranch(dayP.stem, gz.branch) });
  }

  const ref = options.referenceDate || new Date();
  const nowYear = ref.getFullYear();
  const seun: SeunItem[] = [];
  for (let yy = nowYear; yy < nowYear + 6; yy += 1) {
    const gz = ganzhiOf(((yy - 4) % 60 + 60) % 60);
    seun.push({ year: yy, gz, stemGod: tenGod(dayP.stem, gz.stem), branchGod: tenGodOfBranch(dayP.stem, gz.branch) });
  }

  const spouseGods: TenGodName[] = o.gender === 'M' ? ['정재', '편재'] : ['정관', '편관'];
  const dayBr = dayP.branch;
  const yukhap: Record<number, number> = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
  const samhapMembers = Object.keys(SAMHAP)
    .filter((key) => SAMHAP[Number(key)] === SAMHAP[dayBr])
    .map(Number);
  const marriageYears: MarriageYear[] = [];
  for (let yy = Math.max(nowYear, o.year + 20); yy <= o.year + 45; yy += 1) {
    const gz = ganzhiOf(((yy - 4) % 60 + 60) % 60);
    let score = 0;
    const why: string[] = [];
    if (spouseGods.includes(tenGod(dayP.stem, gz.stem))) {
      score += 2;
      why.push('배우자성(천간)');
    }
    if (spouseGods.includes(tenGodOfBranch(dayP.stem, gz.branch))) {
      score += 2;
      why.push('배우자성(지지)');
    }
    if (yukhap[dayBr] === gz.branch) {
      score += 2;
      why.push('배우자궁 육합');
    } else if (samhapMembers.includes(gz.branch) && gz.branch !== dayBr) {
      score += 1;
      why.push('배우자궁 삼합');
    }
    if (DOHWA[SAMHAP[dayBr]] === gz.branch) {
      score += 1;
      why.push('도화 흐름');
    }
    if (score >= 3) marriageYears.push({ year: yy, age: yy - o.year + 1, why, score });
  }
  marriageYears.sort((a, b) => b.score - a.score || a.year - b.year);

  return {
    input: o,
    pillars,
    yearP,
    monthP,
    dayP,
    hourP,
    elemCount,
    tenCount,
    tenGroup,
    daeun,
    daeunNum,
    forward,
    seun,
    marriageYears: marriageYears.slice(0, 5).sort((a, b) => a.year - b.year),
    sinsal: findSinsal(pillars, dayP.stem),
    boundary,
    sajuYear,
    dayMaster: {
      stem: dayP.stem,
      name: STEMS[dayP.stem],
      hanja: STEMS_H[dayP.stem],
      elem: STEM_ELEM[dayP.stem],
      yang: STEM_YANG[dayP.stem] === 1,
    },
  };
}
