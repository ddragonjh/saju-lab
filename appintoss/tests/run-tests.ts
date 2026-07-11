import assert from 'node:assert/strict';
import { computeSaju, ELEMS, gzName, tenGod } from '../../shared/saju-engine';
import { dailyFortune, getZodiacByBirth, monthlyFortune, weeklyFortune, zodiacFortune } from '../../shared/fortune-engine';
import { seededDeck } from '../../shared/tarot-data';
import { oracleReading } from '../../shared/oracle-data';

const args = new Set(process.argv.slice(2));
const runAll = args.size === 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    process.stdout.write(`ok - ${name}\n`);
  } catch (error) {
    process.stderr.write(`not ok - ${name}\n`);
    throw error;
  }
}

function baseInput(overrides = {}) {
  return {
    year: 1995,
    month: 3,
    day: 21,
    hour: 23,
    minute: 10,
    gender: 'M' as const,
    unknownTime: false,
    trueSolar: false,
    dayBoundary: '23' as const,
    ...overrides,
  };
}

if (runAll || args.has('--saju')) {
  test('동일 입력의 사주 결과는 일관된다', () => {
    const a = computeSaju(baseInput());
    const b = computeSaju(baseInput());
    assert.equal(gzName(a.dayP), gzName(b.dayP));
    assert.deepEqual(a.elemCount, b.elemCount);
  });

  test('23시 기준과 0시 기준은 경계에서 일주가 달라질 수 있다', () => {
    const early = computeSaju(baseInput({ dayBoundary: '23' }));
    const midnight = computeSaju(baseInput({ dayBoundary: '0' }));
    assert.notEqual(gzName(early.dayP), gzName(midnight.dayP));
  });

  test('0시 직전과 직후 입력이 계산된다', () => {
    const before = computeSaju(baseInput({ hour: 23, minute: 55, dayBoundary: '0' }));
    const after = computeSaju(baseInput({ hour: 0, minute: 5, dayBoundary: '0' }));
    assert.ok(gzName(before.dayP));
    assert.ok(gzName(after.dayP));
  });

  test('입춘 전후 년주가 계산된다', () => {
    const before = computeSaju(baseInput({ year: 2024, month: 2, day: 3, hour: 12 }));
    const after = computeSaju(baseInput({ year: 2024, month: 2, day: 5, hour: 12 }));
    assert.notEqual(gzName(before.yearP), gzName(after.yearP));
  });

  test('월주 변경 절기 전후가 계산된다', () => {
    const before = computeSaju(baseInput({ year: 2024, month: 3, day: 4, hour: 12 }));
    const after = computeSaju(baseInput({ year: 2024, month: 3, day: 6, hour: 12 }));
    assert.notEqual(gzName(before.monthP), gzName(after.monthP));
  });

  test('윤년 2월 29일을 허용한다', () => {
    const r = computeSaju(baseInput({ year: 2024, month: 2, day: 29, hour: 12 }));
    assert.ok(gzName(r.dayP));
  });

  test('태어난 시간 모름은 시주를 생성하지 않는다', () => {
    const r = computeSaju(baseInput({ unknownTime: true }));
    assert.equal(r.hourP, null);
  });

  test('간이 시각 보정은 경계 시간에서 결과 차이를 만들 수 있다', () => {
    const raw = computeSaju(baseInput({ hour: 0, minute: 10, trueSolar: false, dayBoundary: '0' }));
    const adjusted = computeSaju(baseInput({ hour: 0, minute: 10, trueSolar: true, dayBoundary: '0' }));
    assert.notEqual(gzName(raw.dayP), gzName(adjusted.dayP));
  });

  test('지원 범위 경계 1930년과 2035년을 계산한다', () => {
    assert.ok(gzName(computeSaju(baseInput({ year: 1930, month: 1, day: 1, hour: 12 })).dayP));
    assert.ok(gzName(computeSaju(baseInput({ year: 2035, month: 12, day: 31, hour: 12 })).dayP));
  });

  test('잘못된 날짜는 거부한다', () => {
    assert.throws(() => computeSaju(baseInput({ year: 2023, month: 2, day: 29 })), /존재하지 않는 날짜/);
  });

  test('남녀 대운 방향이 계산된다', () => {
    const male = computeSaju(baseInput({ gender: 'M' }));
    const female = computeSaju(baseInput({ gender: 'F' }));
    assert.notEqual(male.forward, female.forward);
  });

  test('오행 합계와 십성 매핑이 유효하다', () => {
    const r = computeSaju(baseInput());
    const total = ELEMS.reduce((sum, el) => sum + r.elemCount[el], 0);
    assert.ok(total > 0);
    assert.ok(tenGod(r.dayP.stem, r.yearP.stem));
  });

  test('대운 배열과 세운 간지가 생성된다', () => {
    const r = computeSaju(baseInput());
    assert.equal(r.daeun.length, 8);
    assert.equal(r.seun.length, 6);
  });
}

if (runAll || args.has('--fortune')) {
  test('같은 날짜 운세 결과는 일관된다', () => {
    const r = computeSaju(baseInput());
    const date = new Date(2026, 6, 11);
    assert.deepEqual(dailyFortune(r, date), dailyFortune(r, date));
    assert.deepEqual(weeklyFortune(r, date), weeklyFortune(r, date));
    assert.deepEqual(monthlyFortune(r, date), monthlyFortune(r, date));
  });

  test('같은 날짜 신점 메시지는 일관된다', () => {
    const date = new Date(2026, 6, 11);
    assert.deepEqual(oracleReading('love', date), oracleReading('love', date));
  });

  test('별자리 경계일을 계산한다', () => {
    assert.equal(getZodiacByBirth(3, 20).name, '물고기자리');
    assert.equal(getZodiacByBirth(3, 21).name, '양자리');
    assert.equal(zodiacFortune('aries', new Date(2026, 6, 11)).sign.name, '양자리');
  });
}

if (runAll || args.has('--tarot')) {
  test('타로 덱은 22장이고 중복이 없다', () => {
    const deck = seededDeck('test-seed');
    assert.equal(deck.length, 22);
    assert.equal(new Set(deck.map((card) => card.no)).size, 22);
  });

  test('선택된 3장 카드가 중복되지 않는다', () => {
    const deck = seededDeck('another-seed');
    const picked = [deck[1], deck[7], deck[11]];
    assert.equal(new Set(picked.map((card) => card.no)).size, 3);
  });
}

if (runAll || args.has('--identity')) {
  test('출시 환경 변수 기본값은 익명 식별 모드다', () => {
    assert.equal(process.env.VITE_AUTH_MODE || 'anonymous-toss', 'anonymous-toss');
    assert.equal(process.env.VITE_TOSS_LOGIN_ENABLED || 'false', 'false');
  });
}
