import type { SajuResult } from '../types';
import { formatDateKey, formatMonthKey, formatWeekKey, hashSeed, scoreFromSeed } from '../utils';

export const ZODIAC_SIGNS = [
  { id: 'aries', name: '양자리', symbol: '♈', from: [3, 21], to: [4, 19], element: '불', trait: '시작과 결단' },
  { id: 'taurus', name: '황소자리', symbol: '♉', from: [4, 20], to: [5, 20], element: '흙', trait: '현실감과 지속력' },
  { id: 'gemini', name: '쌍둥이자리', symbol: '♊', from: [5, 21], to: [6, 21], element: '공기', trait: '소통과 전환' },
  { id: 'cancer', name: '게자리', symbol: '♋', from: [6, 22], to: [7, 22], element: '물', trait: '보호와 감정' },
  { id: 'leo', name: '사자자리', symbol: '♌', from: [7, 23], to: [8, 22], element: '불', trait: '표현과 존재감' },
  { id: 'virgo', name: '처녀자리', symbol: '♍', from: [8, 23], to: [9, 22], element: '흙', trait: '정리와 분석' },
  { id: 'libra', name: '천칭자리', symbol: '♎', from: [9, 23], to: [10, 22], element: '공기', trait: '균형과 관계' },
  { id: 'scorpio', name: '전갈자리', symbol: '♏', from: [10, 23], to: [11, 21], element: '물', trait: '집중과 회복' },
  { id: 'sagittarius', name: '사수자리', symbol: '♐', from: [11, 22], to: [12, 21], element: '불', trait: '확장과 탐험' },
  { id: 'capricorn', name: '염소자리', symbol: '♑', from: [12, 22], to: [1, 19], element: '흙', trait: '책임과 성취' },
  { id: 'aquarius', name: '물병자리', symbol: '♒', from: [1, 20], to: [2, 18], element: '공기', trait: '아이디어와 독립' },
  { id: 'pisces', name: '물고기자리', symbol: '♓', from: [2, 19], to: [3, 20], element: '물', trait: '공감과 직감' },
] as const;

const SCORE_LABELS = ['love', 'relation', 'work', 'money', 'condition'] as const;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ORACLE_LINES = [
  '말보다 반복되는 행동을 보는 것이 도움이 됩니다.',
  '급한 결정은 한 박자 늦추면 손해가 줄어듭니다.',
  '기록과 확인이 오늘의 흐름을 안정시킵니다.',
  '작게 정리한 일이 다음 기회를 부릅니다.',
  '먼저 연락하기보다 짧고 분명한 제안이 좋습니다.',
];

function stemKey(r: SajuResult): string {
  return `${r.input.year}-${r.input.month}-${r.input.day}-${r.dayP.stem}-${r.dayP.branch}`;
}

export function getZodiacByBirth(month: number, day: number) {
  const md = month * 100 + day;
  if (md >= 1222 || md <= 119) return ZODIAC_SIGNS.find((s) => s.id === 'capricorn')!;
  return (
    ZODIAC_SIGNS.find((sign) => {
      const from = sign.from[0] * 100 + sign.from[1];
      const to = sign.to[0] * 100 + sign.to[1];
      return md >= from && md <= to;
    }) || ZODIAC_SIGNS[0]
  );
}

export function dailyFortune(r: SajuResult, date = new Date()) {
  const dayKey = formatDateKey(date);
  const key = stemKey(r);
  const scores = Object.fromEntries(SCORE_LABELS.map((id) => [id, scoreFromSeed(`${key}-${dayKey}-${id}`, 48, 96)])) as Record<(typeof SCORE_LABELS)[number], number>;
  const today = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length);
  const zodiac = getZodiacByBirth(r.input.month, r.input.day);
  const luckyElement = ['목', '화', '토', '금', '수'][hashSeed(`${key}-${dayKey}-elem`) % 5];
  const advice = ORACLE_LINES[hashSeed(`${key}-${dayKey}-advice`) % ORACLE_LINES.length];
  return {
    date: dayKey,
    today,
    scores,
    zodiac,
    luckyElement,
    headline: today >= 82 ? '먼저 움직일수록 흐름이 붙는 날입니다.' : today >= 68 ? '무난하지만 선택 하나가 분위기를 바꿀 수 있습니다.' : '서두르기보다 확인과 정리가 도움이 됩니다.',
    love: scores.love >= 75 ? '연애와 관계에서는 짧고 따뜻한 표현이 좋습니다.' : '관계에서는 기대보다 사실 확인을 우선해 보세요.',
    relation: scores.relation >= 75 ? '사람을 통해 작은 기회가 들어올 수 있습니다.' : '약속과 말의 온도를 조심하면 관계 피로가 줄어듭니다.',
    work: scores.work >= 75 ? '업무와 학업은 먼저 제안하고 정리할수록 힘이 붙습니다.' : '업무와 학업은 새 일보다 마무리에 집중하는 편이 좋습니다.',
    money: scores.money >= 75 ? '재물은 작은 기회를 숫자로 따져보면 흐름이 보입니다.' : '충동 지출보다 고정비 점검이 오늘의 재물운을 지킵니다.',
    caution: advice,
    action: '오늘 안에 끝낼 수 있는 일 하나를 정해 마무리해 보세요.',
    sentence: `${zodiac.name}의 ${luckyElement} 기운을 살리면 하루가 조금 더 선명해집니다.`,
  };
}

export function weeklyFortune(r: SajuResult, date = new Date()) {
  const key = `${stemKey(r)}-${formatWeekKey(date)}`;
  const score = scoreFromSeed(`${key}-week`, 50, 94);
  const goodDay = WEEKDAYS[hashSeed(`${key}-good`) % WEEKDAYS.length];
  const carefulDay = WEEKDAYS[hashSeed(`${key}-careful`) % WEEKDAYS.length];
  return {
    key: formatWeekKey(date),
    score,
    flow: score >= 78 ? '사람과 약속을 통해 기회가 들어오는 주간입니다.' : '체력과 일정 관리가 이번 주의 중심입니다.',
    relation: '관계에서는 말의 길이보다 답장의 타이밍이 중요합니다.',
    work: '업무와 학업은 핵심 한 가지를 먼저 끝내면 뒤가 가벼워집니다.',
    money: '재물은 들어오는 돈보다 새는 돈을 막는 쪽에서 성과가 납니다.',
    goodDay,
    carefulDay,
    action: `${goodDay}요일에는 제안과 연락을, ${carefulDay}요일에는 확인과 정리를 우선해 보세요.`,
  };
}

export function monthlyFortune(r: SajuResult, date = new Date()) {
  const key = `${stemKey(r)}-${formatMonthKey(date)}`;
  const score = scoreFromSeed(`${key}-month`, 48, 95);
  return {
    key: formatMonthKey(date),
    score,
    flow: score >= 78 ? '확장과 시도가 어울리는 달입니다.' : '정비와 회복에 무게를 둘수록 다음 흐름이 좋아지는 달입니다.',
    love: '연애는 관계의 속도를 맞추는 일이 중요합니다.',
    relation: '인간관계는 넓히기보다 정리하고 깊게 보는 쪽이 도움이 됩니다.',
    work: '업무와 학업은 기록과 증빙을 남겨야 성과가 선명해집니다.',
    money: '재물은 큰 약속보다 작은 반복 수입과 지출 관리가 핵심입니다.',
    change: score >= 75 ? '새 제안이나 이동 가능성을 검토해 볼 수 있습니다.' : '무리한 변화보다 기반을 고르는 것이 좋습니다.',
    caution: '중요한 결정은 하루 이상 시간을 두고 확인하세요.',
    action: '이번 달 목표를 세 가지 이하로 줄이면 실행력이 올라갑니다.',
  };
}

export function zodiacFortune(signId: string, date = new Date()) {
  const sign = ZODIAC_SIGNS.find((item) => item.id === signId) || ZODIAC_SIGNS[0];
  const day = formatDateKey(date);
  const week = formatWeekKey(date);
  const month = formatMonthKey(date);
  const today = scoreFromSeed(`${sign.id}-${day}-today`, 52, 96);
  const weekly = scoreFromSeed(`${sign.id}-${week}-week`, 50, 94);
  const monthly = scoreFromSeed(`${sign.id}-${month}-month`, 48, 95);
  const scores = {
    love: scoreFromSeed(`${sign.id}-${day}-love`, 45, 96),
    money: scoreFromSeed(`${sign.id}-${day}-money`, 45, 96),
    work: scoreFromSeed(`${sign.id}-${day}-work`, 45, 96),
    condition: scoreFromSeed(`${sign.id}-${day}-condition`, 45, 96),
  };
  return {
    sign,
    today,
    weekly,
    monthly,
    scores,
    advice: `${sign.trait}이 강해지는 날입니다. 먼저 정리하고 움직이면 흐름이 빨라질 수 있습니다.`,
    weekText: '이번 주는 사람과 일정의 균형을 맞추는 것이 중요합니다.',
    monthText: `이번 달은 ${monthly >= 76 ? '확장과 시도' : '정비와 회복'}에 무게를 두면 좋습니다.`,
  };
}
