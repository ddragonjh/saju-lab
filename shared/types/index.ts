export type Gender = 'M' | 'F';
export type DayBoundary = '23' | '0';
export type ElementName = '목' | '화' | '토' | '금' | '수';
export type TenGodName =
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인';
export type TenGroupName = '비겁' | '식상' | '재성' | '관성' | '인성';

export interface SajuInput {
  name?: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  unknownTime: boolean;
  trueSolar: boolean;
  dayBoundary: DayBoundary;
}

export interface Ganzhi {
  stem: number;
  branch: number;
  idx: number;
}

export interface DaeunItem {
  startAge: number;
  gz: Ganzhi;
  stemGod: TenGodName;
  branchGod: TenGodName;
}

export interface SeunItem {
  year: number;
  gz: Ganzhi;
  stemGod: TenGodName;
  branchGod: TenGodName;
}

export interface MarriageYear {
  year: number;
  age: number;
  why: string[];
  score: number;
}

export interface DayMaster {
  stem: number;
  name: string;
  hanja: string;
  elem: ElementName;
  yang: boolean;
}

export interface SajuResult {
  input: SajuInput;
  pillars: Array<Ganzhi | null>;
  yearP: Ganzhi;
  monthP: Ganzhi;
  dayP: Ganzhi;
  hourP: Ganzhi | null;
  elemCount: Record<ElementName, number>;
  tenCount: Record<TenGodName, number>;
  tenGroup: Record<TenGroupName, number>;
  daeun: DaeunItem[];
  daeunNum: number;
  forward: boolean;
  seun: SeunItem[];
  marriageYears: MarriageYear[];
  sinsal: string[];
  boundary: boolean;
  sajuYear: number;
  dayMaster: DayMaster;
}

export interface SavedRecord {
  id: string;
  kind: 'saju' | 'daily' | 'weekly' | 'monthly' | 'tarot' | 'oracle' | 'zodiac';
  title: string;
  summary: string;
  createdAt: string;
  payload?: unknown;
}

export interface IdentityResult {
  userId: string;
  authMode: 'anonymous-toss' | 'toss-login' | 'guest';
  source: 'toss' | 'local' | 'guest';
  message: string;
}
