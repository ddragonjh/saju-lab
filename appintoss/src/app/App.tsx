import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BRANCHES, BRANCHES_H, ELEMS, MAX_YEAR, MIN_YEAR, STEMS, STEMS_H, computeSaju, gzName } from '@shared/saju-engine';
import { CONTENT_NOTICE, DAEUN_LINE, DAY_MASTER_TEXT, ELEMENT_TEXT, LUCKY, SINSAL_TEXT, SPOUSE_PALACE, TEN_GOD_DESC, TEN_GROUP_TEXT, TEN_LACK_TEXT } from '@shared/texts';
import { dailyFortune, getZodiacByBirth, monthlyFortune, weeklyFortune, zodiacFortune, ZODIAC_SIGNS } from '@shared/fortune-engine';
import { TAROT_INTENTS, seededDeck } from '@shared/tarot-data';
import type { TarotCard } from '@shared/tarot-data';
import { ORACLE_TOPICS, oracleReading } from '@shared/oracle-data';
import type { Gender, SavedRecord, SajuInput, SajuResult } from '@shared/types';
import { formatDateKey, isValidBirthDate, makeId, normalizeName } from '@shared/utils';
import { createIdentityProvider } from '../features/identity/providers';
import type { IdentityProvider } from '../features/identity/types';
import { addRecord, clearRecords, deleteRecord, loadRecords } from '../features/storage/appStorage';
import { shareSafeSummary } from '../features/share/share';
import { registerBackHandler } from '../features/appintoss/backEvent';
import { trackEvent } from '../features/analytics/events';

type View = 'home' | 'saju' | 'tarot' | 'fortune' | 'records' | 'settings';
type SajuFormState = {
  name: string;
  gender: '' | Gender;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  unknownTime: boolean;
  trueSolar: boolean;
  dayBoundary: '23' | '0';
};

const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const DISCLAIMER_SHORT = '오락·자기이해용 참고 콘텐츠이며 의료·법률·투자·진로 판단을 대체하지 않습니다.';

const initialForm: SajuFormState = {
  name: '',
  gender: '',
  year: 1995,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  unknownTime: false,
  trueSolar: false,
  dayBoundary: '23',
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function scoreTone(value: number): string {
  if (value >= 85) return '상승';
  if (value >= 72) return '좋음';
  if (value >= 60) return '보통';
  return '정리';
}

function Pill({ children }: { children: string }) {
  return <span className="pill">{children}</span>;
}

function Notice({ compact = false }: { compact?: boolean }) {
  return <p className={compact ? 'notice compact' : 'notice'}>{compact ? DISCLAIMER_SHORT : CONTENT_NOTICE}</p>;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="scoreBar" aria-label={`${label} ${value}점`}>
      <div className="scoreTop">
        <span>{label}</span>
        <strong>{value}점</strong>
      </div>
      <div className="track">
        <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <small>{scoreTone(value)}</small>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="panelBlock">
      <div className="sectionHead">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AppChrome({
  view,
  setView,
  children,
  identityMessage,
}: {
  view: View;
  setView: (view: View) => void;
  children: ReactNode;
  identityMessage: string;
}) {
  const nav: Array<[View, string, string]> = [
    ['home', '홈', '⌂'],
    ['saju', '사주', '四'],
    ['tarot', '타로', 'T'],
    ['fortune', '운세', '星'],
    ['records', '기록', '⌁'],
  ];
  return (
    <div className="appShell">
      <header className="appTop">
        <button type="button" className="brandButton" onClick={() => setView('home')} aria-label="홈으로 이동">
          <span>運命</span>
          <strong>운명연구소</strong>
        </button>
        <button type="button" className="iconButton" onClick={() => setView('settings')} aria-label="설정 열기">
          ⚙
        </button>
      </header>
      <div className="identityStrip">{identityMessage}</div>
      <main className="screen" aria-live="polite">
        {children}
      </main>
      <nav className="tabbar" aria-label="주요 메뉴">
        {nav.map(([id, label, icon]) => (
          <button key={id} type="button" className={view === id ? 'active' : ''} onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined}>
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function HomeScreen({ setView, records, latestSaju }: { setView: (view: View) => void; records: SavedRecord[]; latestSaju: SajuResult | null }) {
  const today = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(new Date());
  const quickDaily = latestSaju ? dailyFortune(latestSaju) : null;
  useEffect(() => trackEvent('home_view'), []);
  return (
    <div className="stack">
      <section className="heroCard">
        <div className="heroAura" aria-hidden="true" />
        <p>{today}</p>
        <h1>오늘의 흐름을 조용히 펼쳐볼 시간</h1>
        <span>사주 · 타로 · 신점 메시지 · 별자리 · 오늘/이주/이달 운세</span>
      </section>
      <div className="quickGrid">
        <button type="button" onClick={() => setView('saju')}>
          <b>사주 보기</b>
          <span>원국, 오행, 십성, 대운, 세운</span>
        </button>
        <button type="button" onClick={() => setView('tarot')}>
          <b>오늘의 타로</b>
          <span>직접 3장을 선택</span>
        </button>
        <button type="button" onClick={() => setView('fortune')}>
          <b>운세관</b>
          <span>별자리와 신점 메시지</span>
        </button>
        <button type="button" onClick={() => setView('records')}>
          <b>내 결과</b>
          <span>저장한 리딩 확인</span>
        </button>
      </div>
      {quickDaily ? (
        <Section title="마지막 사주 기준 오늘의 운세">
          <div className="resultHero small">
            <strong>{quickDaily.today}점</strong>
            <p>{quickDaily.headline}</p>
          </div>
          <button type="button" className="primaryButton" onClick={() => setView('fortune')}>
            오늘 운세 자세히 보기
          </button>
        </Section>
      ) : (
        <Section title="먼저 사주를 입력하면">
          <p className="muted">오늘·이주·이달 운세가 같은 입력값 기준으로 안정적으로 계산됩니다.</p>
          <button type="button" className="primaryButton" onClick={() => setView('saju')}>
            사주 입력하기
          </button>
        </Section>
      )}
      <Section title="최근 확인한 결과">
        {records.length ? (
          <div className="recordMiniList">
            {records.slice(0, 3).map((record) => (
              <article key={record.id}>
                <b>{record.title}</b>
                <span>{record.summary}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">저장한 결과가 아직 없습니다. 저장하지 않아도 모든 기능을 이용할 수 있어요.</p>
        )}
      </Section>
      <Section title="데이터 처리 안내">
        <ul className="plainList">
          <li>입력 정보는 앱 안에서 계산되며 URL에 저장하지 않습니다.</li>
          <li>저장은 사용자가 직접 선택한 결과만 기기 저장소에 남깁니다.</li>
          <li>별도 회원가입 없이 이용할 수 있고, 식별 실패 시에도 게스트 모드로 계속 사용할 수 있습니다.</li>
        </ul>
      </Section>
    </div>
  );
}

function SajuForm({
  form,
  setForm,
  onSubmit,
  error,
}: {
  form: SajuFormState;
  setForm: (form: SajuFormState) => void;
  onSubmit: () => void;
  error: string;
}) {
  const dayCount = daysInMonth(form.year, form.month);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  function patch(next: Partial<SajuFormState>) {
    const merged = { ...form, ...next };
    if (merged.day > daysInMonth(merged.year, merged.month)) merged.day = daysInMonth(merged.year, merged.month);
    setForm(merged);
  }
  return (
    <form
      className="formPanel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label>
        이름 또는 표시 이름 <small>선택</small>
        <input value={form.name} maxLength={12} onChange={(event) => patch({ name: event.target.value })} placeholder="이름 없이도 가능" />
      </label>

      <fieldset>
        <legend>성별</legend>
        <div className="segmented">
          <label>
            <input type="radio" name="gender" value="M" checked={form.gender === 'M'} onChange={() => patch({ gender: 'M' })} />
            남자
          </label>
          <label>
            <input type="radio" name="gender" value="F" checked={form.gender === 'F'} onChange={() => patch({ gender: 'F' })} />
            여자
          </label>
        </div>
      </fieldset>

      <div className="threeCols">
        <label>
          태어난 해
          <select value={form.year} onChange={(event) => patch({ year: Number(event.target.value) })}>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </label>
        <label>
          월
          <select value={form.month} onChange={(event) => patch({ month: Number(event.target.value) })}>
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>
        </label>
        <label>
          일
          <select value={form.day} onChange={(event) => patch({ day: Number(event.target.value) })}>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}일
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="twoCols">
        <label>
          태어난 시간
          <select value={form.hour} disabled={form.unknownTime} onChange={(event) => patch({ hour: Number(event.target.value) })}>
            {HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, '0')}시
              </option>
            ))}
          </select>
        </label>
        <label>
          분
          <select value={form.minute} disabled={form.unknownTime} onChange={(event) => patch({ minute: Number(event.target.value) })}>
            {MINUTES.map((minute) => (
              <option key={minute} value={minute}>
                {String(minute).padStart(2, '0')}분
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend>시간 옵션</legend>
        <label className="checkRow">
          <input type="checkbox" checked={form.unknownTime} onChange={(event) => patch({ unknownTime: event.target.checked })} />
          태어난 시간을 몰라요
        </label>
        <label className="checkRow">
          <input type="checkbox" checked={form.trueSolar} disabled={form.unknownTime} onChange={(event) => patch({ trueSolar: event.target.checked })} />
          간이 시각 보정
        </label>
        <p className="fieldHelp">모든 출생자에게 30분을 빼는 단순 옵션입니다. 정밀 진태양시 계산이 아니며 출생지 경도, 균시차, 서머타임을 반영하지 않습니다.</p>
      </fieldset>

      <fieldset>
        <legend>자시 날짜 기준</legend>
        <div className="segmented">
          <label>
            <input type="radio" name="dayBoundary" value="23" checked={form.dayBoundary === '23'} onChange={() => patch({ dayBoundary: '23' })} />
            23시 기준
          </label>
          <label>
            <input type="radio" name="dayBoundary" value="0" checked={form.dayBoundary === '0'} onChange={() => patch({ dayBoundary: '0' })} />
            0시 기준
          </label>
        </div>
        <p className="fieldHelp">자시 날짜 변경 기준은 해석 방식에 따라 다를 수 있으며, 선택에 따라 일주가 달라질 수 있습니다.</p>
      </fieldset>

      <div className="formNote">
        <p>입력 정보는 앱 안에서 계산되며, 저장 버튼을 누르기 전에는 내 기록에 저장하지 않습니다.</p>
        <p>{DISCLAIMER_SHORT}</p>
      </div>
      <p className="errorText" aria-live="assertive">
        {error}
      </p>
      <button type="submit" className="primaryButton">
        나의 운세 확인하기
      </button>
    </form>
  );
}

function PillarGrid({ r }: { r: SajuResult }) {
  const pillars = [
    ['시주', r.hourP],
    ['일주', r.dayP],
    ['월주', r.monthP],
    ['년주', r.yearP],
  ] as const;
  return (
    <div className="pillarGrid">
      {pillars.map(([label, p]) => (
        <article key={label} className={!p ? 'empty' : ''}>
          <span>{label}</span>
          {p ? (
            <>
              <strong>
                {STEMS_H[p.stem]}
                {BRANCHES_H[p.branch]}
              </strong>
              <b>
                {STEMS[p.stem]}
                {BRANCHES[p.branch]}
              </b>
              <small>
                {label === '일주' ? '일간(나)' : `${STEMS[p.stem]}${BRANCHES[p.branch]}`}
              </small>
            </>
          ) : (
            <p>시간 미상</p>
          )}
        </article>
      ))}
    </div>
  );
}

function SajuResultView({
  r,
  onSave,
  onShare,
}: {
  r: SajuResult;
  onSave: (record: SavedRecord) => void;
  onShare: (path: string, message: string) => void;
}) {
  const dm = r.dayMaster;
  const dayText = DAY_MASTER_TEXT[dm.name];
  const total = Object.values(r.elemCount).reduce((sum, value) => sum + value, 0);
  const sortedElems = Object.entries(r.elemCount).sort((a, b) => b[1] - a[1]) as Array<[keyof typeof r.elemCount, number]>;
  const strongest = sortedElems[0][0];
  const weakest = sortedElems[sortedElems.length - 1][0];
  const sortedGroups = Object.entries(r.tenGroup).sort((a, b) => b[1] - a[1]) as Array<[keyof typeof r.tenGroup, number]>;
  const dominant = sortedGroups[0][0];
  const lacking = sortedGroups[sortedGroups.length - 1][0];
  const daily = dailyFortune(r);
  const weekly = weeklyFortune(r);
  const monthly = monthlyFortune(r);
  const zodiac = getZodiacByBirth(r.input.month, r.input.day);
  const correction = useMemo(() => {
    if (!r.input.trueSolar || r.input.unknownTime) return '';
    try {
      const without = computeSaju({ ...r.input, trueSolar: false });
      const beforeHour = without.hourP ? gzName(without.hourP) : '시주 없음';
      const afterHour = r.hourP ? gzName(r.hourP) : '시주 없음';
      const beforeDay = gzName(without.dayP);
      const afterDay = gzName(r.dayP);
      if (beforeHour !== afterHour || beforeDay !== afterDay) return `간이 시각 보정 전 ${beforeDay}/${beforeHour}, 적용 후 ${afterDay}/${afterHour}로 달라졌습니다.`;
      return '간이 시각 보정을 적용했지만 경계 시간이 아니라 주요 기둥 차이는 없습니다.';
    } catch {
      return '';
    }
  }, [r]);
  const saveSaju = () => {
    onSave({
      id: makeId('saju'),
      kind: 'saju',
      title: '사주 결과',
      summary: `${dm.name}${dm.elem} 일간 · 강한 오행 ${strongest} · 오늘 ${daily.today}점`,
      createdAt: new Date().toISOString(),
      payload: {
        input: { ...r.input, name: normalizeName(r.input.name) },
        dayMaster: r.dayMaster,
        elemCount: r.elemCount,
        tenGroup: r.tenGroup,
      },
    });
  };
  return (
    <div className="stack resultStack">
      <section className="resultHero">
        <span>사주 결과</span>
        <h1>
          {normalizeName(r.input.name) || '나'}의 일간은 {dm.hanja}({dm.name})입니다
        </h1>
        <p>
          {r.input.year}년 {r.input.month}월 {r.input.day}일 · {r.input.unknownTime ? '태어난 시간 모름' : `${String(r.input.hour).padStart(2, '0')}:${String(r.input.minute).padStart(2, '0')}`} · 자시 {r.input.dayBoundary === '23' ? '23시' : '0시'} 기준
        </p>
        <Notice compact />
      </section>
      {correction && <p className="inlineWarn">{correction}</p>}
      {r.boundary && <p className="inlineWarn">절기 경계 부근으로 월주가 달라질 수 있어 독립 만세력과 대조해 보세요.</p>}
      <Section title="사주 원국">
        <PillarGrid r={r} />
        {r.input.unknownTime && <p className="fieldHelp">태어난 시간을 몰라 시주는 임의 생성하지 않았습니다. 시주가 필요한 말년·자녀·세부 타이밍 해석은 제한됩니다.</p>}
      </Section>
      <Section title="나의 본질">
        <h3>{dayText.title}</h3>
        <p>{dayText.core}</p>
        <div className="miniGrid">
          <article>
            <b>강점</b>
            <span>{dayText.strength}</span>
          </article>
          <article>
            <b>주의 패턴</b>
            <span>{dayText.weakness}</span>
          </article>
          <article>
            <b>어울리는 무대</b>
            <span>{dayText.fit}</span>
          </article>
          <article>
            <b>행동 제안</b>
            <span>{dayText.tip}</span>
          </article>
        </div>
      </Section>
      <Section title="오행 분석">
        <div className="scoreGrid">
          {ELEMS.map((el) => (
            <ScoreBar key={el} label={el} value={Math.round((r.elemCount[el] / total) * 100)} />
          ))}
        </div>
        <p>
          가장 강한 오행은 <b>{strongest}</b>입니다. {ELEMENT_TEXT[strongest].over}
        </p>
        <p>
          가장 약한 오행은 <b>{weakest}</b>입니다. {ELEMENT_TEXT[weakest].lack} {ELEMENT_TEXT[weakest].action}
        </p>
      </Section>
      <Section title="십성 분석">
        <div className="badgeWrap">
          {Object.entries(r.tenGroup).map(([name, value]) => (
            <Pill key={name}>{`${name} ${value.toFixed(1)}`}</Pill>
          ))}
        </div>
        <p>{TEN_GROUP_TEXT[dominant]}</p>
        <p>{TEN_LACK_TEXT[lacking]}</p>
        <div className="miniGrid">
          {Object.entries(r.tenCount)
            .filter(([, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name]) => (
              <article key={name}>
                <b>{name}</b>
                <span>{TEN_GOD_DESC[name as keyof typeof TEN_GOD_DESC]}</span>
              </article>
            ))}
        </div>
      </Section>
      <Section title="연애와 인연 후보">
        <Notice compact />
        <p>{dayText.love}</p>
        <p>{SPOUSE_PALACE[r.dayP.branch]}</p>
        {r.marriageYears.length ? (
          <div className="timeline">
            {r.marriageYears.map((item) => (
              <article key={item.year}>
                <b>
                  {item.year}년 · {item.age}세
                </b>
                <span>{item.why.join(' · ')}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">가까운 구간에 특별히 강한 신호는 적지만, 천천히 깊어지는 흐름으로 참고할 수 있습니다.</p>
        )}
        <p className="fieldHelp">후보 연도는 확정된 결혼 연도가 아니라 인연 기운이 강해지는 참고 시기입니다.</p>
      </Section>
      <Section title="대운">
        <p>
          대운은 {r.daeunNum}세에 시작해 {r.forward ? '순행' : '역행'}합니다. 출생시간이 없으면 세부 타이밍 해석은 제한됩니다.
        </p>
        <div className="daeunRow">
          {r.daeun.map((item) => (
            <article key={`${item.startAge}-${item.gz.idx}`}>
              <b>{item.startAge}세~</b>
              <strong>
                {STEMS[item.gz.stem]}
                {BRANCHES[item.gz.branch]}
              </strong>
              <span>
                {item.stemGod} · {item.branchGod}
              </span>
            </article>
          ))}
        </div>
      </Section>
      <Section title="가까운 세운">
        <div className="timeline">
          {r.seun.map((item) => (
            <article key={item.year}>
              <b>
                {item.year}년 {STEMS[item.gz.stem]}
                {BRANCHES[item.gz.branch]}
              </b>
              <span>{DAEUN_LINE[item.stemGod]}</span>
            </article>
          ))}
        </div>
      </Section>
      <Section title="신살">
        <Notice compact />
        {r.sinsal.length ? (
          <div className="miniGrid">
            {r.sinsal.map((name) => {
              const key = name.startsWith('백호살') ? '백호살' : name;
              return (
                <article key={name}>
                  <b>{name}</b>
                  <span>{SINSAL_TEXT[key] || '원국 전체와 함께 참고하는 보조 지표입니다.'}</span>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">두드러진 신살이 적은 담백한 원국입니다. 원국의 기본 균형을 중심으로 보세요.</p>
        )}
      </Section>
      <Section title="학업 · 업무 · 재물 · 건강 참고">
        <Notice compact />
        <div className="miniGrid">
          <article>
            <b>학업·시험</b>
            <span>{r.tenGroup.인성 >= 2.5 ? '문서와 자격을 쌓는 공부가 잘 맞습니다.' : r.tenGroup.식상 >= 2.5 ? '말로 설명하고 문제를 응용하는 공부가 잘 맞습니다.' : '환경과 루틴을 고정하면 성과가 올라갈 수 있습니다.'}</span>
          </article>
          <article>
            <b>업무 방식</b>
            <span>{TEN_GROUP_TEXT[dominant]}</span>
          </article>
          <article>
            <b>재물</b>
            <span>{dayText.money}</span>
          </article>
          <article>
            <b>건강 참고</b>
            <span>
              약한 {weakest} 기운은 먼저 지치는 생활 패턴으로만 참고하세요. 색 {LUCKY[weakest].color}, 음식 {LUCKY[weakest].food}, 습관 {LUCKY[weakest].habit}.
            </span>
          </article>
        </div>
      </Section>
      <Section title="오늘 · 이주 · 이달 운세">
        <div className="resultHero small">
          <strong>오늘 {daily.today}점</strong>
          <p>{daily.headline}</p>
        </div>
        <div className="scoreGrid">
          <ScoreBar label="연애운" value={daily.scores.love} />
          <ScoreBar label="인간관계운" value={daily.scores.relation} />
          <ScoreBar label="업무·학업운" value={daily.scores.work} />
          <ScoreBar label="재물운" value={daily.scores.money} />
        </div>
        <div className="miniGrid">
          <article>
            <b>주의할 점</b>
            <span>{daily.caution}</span>
          </article>
          <article>
            <b>오늘의 한 문장</b>
            <span>{daily.sentence}</span>
          </article>
          <article>
            <b>이주의 운세 {weekly.score}점</b>
            <span>
              {weekly.flow} 좋은 흐름: {weekly.goodDay}요일, 조심할 흐름: {weekly.carefulDay}요일.
            </span>
          </article>
          <article>
            <b>이달의 운세 {monthly.score}점</b>
            <span>
              {monthly.flow} {monthly.action}
            </span>
          </article>
          <article>
            <b>{zodiac.name} 별자리</b>
            <span>{zodiac.trait}의 성향과 함께 오늘 운세를 구분해 참고할 수 있습니다.</span>
          </article>
        </div>
      </Section>
      <div className="actionRow">
        <button type="button" className="primaryButton" onClick={saveSaju}>
          내 결과에 저장
        </button>
        <button type="button" className="ghostButton" onClick={() => onShare('/saju', `운명연구소 사주 요약: ${dm.name}${dm.elem} 일간, 오늘 운세 ${daily.today}점`)}>
          공유
        </button>
      </div>
    </div>
  );
}

function SajuScreen({ latestSaju, setLatestSaju, saveRecord, shareSummary }: { latestSaju: SajuResult | null; setLatestSaju: (r: SajuResult) => void; saveRecord: (record: SavedRecord) => void; shareSummary: (path: string, message: string) => void }) {
  const [form, setForm] = useState<SajuFormState>(initialForm);
  const [error, setError] = useState('');
  function submit() {
    setError('');
    if (!form.gender) {
      setError('성별을 선택해 주세요.');
      return;
    }
    if (!isValidBirthDate(form.year, form.month, form.day)) {
      setError('존재하지 않는 날짜입니다.');
      return;
    }
    if (new Date(form.year, form.month - 1, form.day) > new Date()) {
      setError('미래 생년월일은 입력할 수 없습니다.');
      return;
    }
    try {
      trackEvent('saju_start');
      const input: SajuInput = {
        name: normalizeName(form.name),
        year: form.year,
        month: form.month,
        day: form.day,
        hour: form.hour,
        minute: form.minute,
        gender: form.gender,
        unknownTime: form.unknownTime,
        trueSolar: form.trueSolar,
        dayBoundary: form.dayBoundary,
      };
      const result = computeSaju(input);
      setLatestSaju(result);
      trackEvent('saju_complete');
      trackEvent('saju_result_view');
    } catch (err) {
      setError(err instanceof Error ? err.message : '사주 계산 중 오류가 발생했습니다.');
      trackEvent('error');
    }
  }
  return (
    <div className="stack">
      <section className="screenTitle">
        <span>四柱</span>
        <h1>사주 입력</h1>
        <p>양력 생년월일 기준입니다. 음력 입력은 지원한다고 표시하지 않습니다.</p>
      </section>
      <SajuForm form={form} setForm={setForm} onSubmit={submit} error={error} />
      {latestSaju && <SajuResultView r={latestSaju} onSave={saveRecord} onShare={shareSummary} />}
    </div>
  );
}

function TarotScreen({ saveRecord, shareSummary }: { saveRecord: (record: SavedRecord) => void; shareSummary: (path: string, message: string) => void }) {
  const [intent, setIntent] = useState<keyof typeof TAROT_INTENTS>('today');
  const [seed, setSeed] = useState(() => `${formatDateKey()}-${Date.now()}`);
  const [selected, setSelected] = useState<number[]>([]);
  const deck = useMemo(() => seededDeck(seed), [seed]);
  const selectedCards = selected.map((index) => deck[index]).filter(Boolean) as Array<TarotCard & { reversed: boolean; originalIndex: number }>;
  const info = TAROT_INTENTS[intent];
  const complete = selectedCards.length === 3;
  function reset() {
    setSeed(`${formatDateKey()}-${Date.now()}-${Math.random()}`);
    setSelected([]);
    trackEvent('tarot_start');
  }
  function pick(index: number) {
    if (selected.includes(index) || selected.length >= 3) return;
    setSelected([...selected, index]);
    trackEvent('tarot_card_select');
  }
  function score() {
    return Math.min(96, 58 + (selectedCards.reduce((sum, card) => sum + card.name.charCodeAt(0), 0) % 39));
  }
  function saveTarot() {
    if (!complete) return;
    const value = score();
    saveRecord({
      id: makeId('tarot'),
      kind: 'tarot',
      title: `${info.label} 타로`,
      summary: `${selectedCards.map((card) => card.name).join(' · ')} · ${value}점`,
      createdAt: new Date().toISOString(),
      payload: { intent, cards: selectedCards.map((card) => ({ name: card.name, reversed: card.reversed })) },
    });
  }
  useEffect(() => {
    trackEvent('tarot_start');
  }, []);
  return (
    <div className="stack">
      <section className="screenTitle">
        <span>TAROT</span>
        <h1>직접 고르는 3장 타로</h1>
        <p>생년월일 없이, 펼쳐진 덱에서 마음이 가는 순서대로 3장을 골라보세요.</p>
      </section>
      <div className="intentRow" aria-label="타로 질문 주제">
        {Object.entries(TAROT_INTENTS).map(([key, item]) => (
          <button key={key} type="button" className={intent === key ? 'active' : ''} onClick={() => { setIntent(key as keyof typeof TAROT_INTENTS); setSelected([]); }}>
            {item.label}
          </button>
        ))}
      </div>
      <section className="tarotTable">
        <div className="deckMotion" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <p className="pickStatus">선택한 카드 {selected.length} / 3</p>
        <div className="tarotSpread" aria-label="펼쳐진 타로 카드">
          {deck.map((card, index) => (
            <button key={`${card.no}-${index}`} type="button" className={selected.includes(index) ? 'tarotBack selected' : 'tarotBack'} onClick={() => pick(index)} disabled={selected.includes(index) || selected.length >= 3} aria-label={`타로 카드 ${index + 1} 선택`}>
              <span className="corner">{card.sign}</span>
              <b>{selected.includes(index) ? selected.indexOf(index) + 1 : card.sign}</b>
              <span className="constellation" />
            </button>
          ))}
        </div>
        <div className="tarotSlots">
          {info.positions.map((position, index) => {
            const card = selectedCards[index];
            return (
              <article key={position} className={card ? 'filled' : ''}>
                <span>{position}</span>
                {card ? (
                  <>
                    <b>{card.name}</b>
                    <small>{card.reversed ? '역방향' : '정방향'}</small>
                  </>
                ) : (
                  <small>선택 대기</small>
                )}
              </article>
            );
          })}
        </div>
      </section>
      {complete && (
        <Section title={`${info.label} 리딩`}>
          <Notice compact />
          <div className="resultHero small">
            <strong>오늘의 타로 {score()}점</strong>
            <p>{info.guide}</p>
          </div>
          <div className="miniGrid">
            {selectedCards.map((card, index) => (
              <article key={`${card.no}-${index}`}>
                <b>
                  {info.positions[index]} · {card.name} {card.reversed ? '역방향' : '정방향'}
                </b>
                <span>{card.keys}</span>
                <p>{card.reversed ? card.rev : card.up}</p>
              </article>
            ))}
          </div>
          <div className="actionRow">
            <button type="button" className="primaryButton" onClick={saveTarot}>
              결과 저장
            </button>
            <button type="button" className="ghostButton" onClick={() => shareSummary('/tarot', `운명연구소 타로 요약: ${info.label}, ${score()}점`)}>
              공유
            </button>
            <button type="button" className="ghostButton" onClick={reset}>
              다시 뽑기
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}

function FortuneScreen({ latestSaju, saveRecord, shareSummary }: { latestSaju: SajuResult | null; saveRecord: (record: SavedRecord) => void; shareSummary: (path: string, message: string) => void }) {
  const [signId, setSignId] = useState(() => (latestSaju ? getZodiacByBirth(latestSaju.input.month, latestSaju.input.day).id : 'aries'));
  const [topic, setTopic] = useState<keyof typeof ORACLE_TOPICS>('today');
  const [oracle, setOracle] = useState<ReturnType<typeof oracleReading> | null>(null);
  const zodiac = zodiacFortune(signId);
  const daily = latestSaju ? dailyFortune(latestSaju) : null;
  const weekly = latestSaju ? weeklyFortune(latestSaju) : null;
  const monthly = latestSaju ? monthlyFortune(latestSaju) : null;
  function readOracle() {
    const result = oracleReading(topic);
    setOracle(result);
    trackEvent('oracle_result_view');
  }
  function saveZodiac() {
    saveRecord({
      id: makeId('zodiac'),
      kind: 'zodiac',
      title: `${zodiac.sign.name} 별자리`,
      summary: `오늘 ${zodiac.today}점 · 이주 ${zodiac.weekly}점 · 이달 ${zodiac.monthly}점`,
      createdAt: new Date().toISOString(),
      payload: { signId, today: zodiac.today, weekly: zodiac.weekly, monthly: zodiac.monthly },
    });
  }
  function saveOracle() {
    if (!oracle) return;
    saveRecord({
      id: makeId('oracle'),
      kind: 'oracle',
      title: `${oracle.topic.label} 신점 메시지`,
      summary: `${oracle.headline} · ${oracle.score}점`,
      createdAt: new Date().toISOString(),
      payload: oracle,
    });
  }
  useEffect(() => trackEvent('zodiac_view'), [signId]);
  return (
    <div className="stack">
      <section className="screenTitle">
        <span>星</span>
        <h1>운세관</h1>
        <p>사주 기반 오늘·이주·이달 운세, 별자리, 신점 메시지를 구분해서 확인합니다.</p>
      </section>
      {latestSaju ? (
        <Section title="사주 기반 운세">
          <Notice compact />
          <div className="resultHero small">
            <strong>오늘 {daily!.today}점</strong>
            <p>{daily!.headline}</p>
          </div>
          <div className="scoreGrid">
            <ScoreBar label="연애운" value={daily!.scores.love} />
            <ScoreBar label="관계운" value={daily!.scores.relation} />
            <ScoreBar label="업무·학업운" value={daily!.scores.work} />
            <ScoreBar label="재물운" value={daily!.scores.money} />
          </div>
          <div className="miniGrid">
            <article>
              <b>오늘의 조언</b>
              <span>{daily!.action}</span>
            </article>
            <article>
              <b>이주의 운세 {weekly!.score}점</b>
              <span>{weekly!.flow}</span>
            </article>
            <article>
              <b>이달의 운세 {monthly!.score}점</b>
              <span>{monthly!.flow}</span>
            </article>
          </div>
          <div className="actionRow">
            <button
              type="button"
              className="primaryButton"
              onClick={() =>
                saveRecord({
                  id: makeId('daily'),
                  kind: 'daily',
                  title: '오늘의 운세',
                  summary: `${daily!.today}점 · ${daily!.headline}`,
                  createdAt: new Date().toISOString(),
                  payload: daily,
                })
              }
            >
              오늘 운세 저장
            </button>
            <button type="button" className="ghostButton" onClick={() => shareSummary('/fortune', `운명연구소 오늘의 운세 ${daily!.today}점: ${daily!.headline}`)}>
              공유
            </button>
          </div>
        </Section>
      ) : (
        <Section title="사주 기반 운세">
          <p className="muted">사주 입력 후 오늘·이주·이달 운세를 볼 수 있습니다. 별자리와 신점 메시지는 생년월일 없이도 이용할 수 있어요.</p>
        </Section>
      )}
      <Section title="별자리 운세">
        <div className="zodiacGrid">
          {ZODIAC_SIGNS.map((sign) => (
            <button key={sign.id} type="button" className={signId === sign.id ? 'active' : ''} onClick={() => setSignId(sign.id)}>
              <b>{sign.symbol}</b>
              <span>{sign.name}</span>
              <small>
                {sign.from[0]}.{sign.from[1]} - {sign.to[0]}.{sign.to[1]}
              </small>
            </button>
          ))}
        </div>
        <div className="resultHero small">
          <strong>
            {zodiac.sign.symbol} {zodiac.sign.name} 오늘 {zodiac.today}점
          </strong>
          <p>{zodiac.advice}</p>
        </div>
        <div className="scoreGrid">
          <ScoreBar label="연애운" value={zodiac.scores.love} />
          <ScoreBar label="금전운" value={zodiac.scores.money} />
          <ScoreBar label="일운" value={zodiac.scores.work} />
          <ScoreBar label="컨디션" value={zodiac.scores.condition} />
        </div>
        <div className="miniGrid">
          <article>
            <b>이주의 별자리 운세 {zodiac.weekly}점</b>
            <span>{zodiac.weekText}</span>
          </article>
          <article>
            <b>이달의 별자리 운세 {zodiac.monthly}점</b>
            <span>{zodiac.monthText}</span>
          </article>
        </div>
        <div className="actionRow">
          <button type="button" className="primaryButton" onClick={saveZodiac}>
            별자리 저장
          </button>
          <button type="button" className="ghostButton" onClick={() => shareSummary('/zodiac', `운명연구소 ${zodiac.sign.name} 별자리 운세: 오늘 ${zodiac.today}점`)}>
            공유
          </button>
        </div>
      </Section>
      <Section title="신점 메시지">
        <Notice compact />
        <p className="muted">실제 무속 상담이나 신적 계시가 아니라, 주제와 날짜 기준으로 제공되는 자동 참고 메시지입니다.</p>
        <div className="intentRow">
          {Object.entries(ORACLE_TOPICS).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={topic === key ? 'active' : ''}
              onClick={() => {
                setTopic(key as keyof typeof ORACLE_TOPICS);
                trackEvent('oracle_topic_select');
              }}
            >
              {value.label}
            </button>
          ))}
        </div>
        <button type="button" className="primaryButton" onClick={readOracle}>
          오늘의 신점 메시지 보기
        </button>
        {oracle && (
          <div className="oracleResult">
            <span>
              {oracle.tone} · {oracle.score}점
            </span>
            <h3>{oracle.headline}</h3>
            <p>{oracle.body}</p>
            <div className="miniGrid">
              <article>
                <b>붙는 기운</b>
                <span>{oracle.luck}</span>
              </article>
              <article>
                <b>조심할 것</b>
                <span>{oracle.caution}</span>
              </article>
              <article>
                <b>행동 조언</b>
                <span>{oracle.action}</span>
              </article>
            </div>
            <div className="actionRow">
              <button type="button" className="primaryButton" onClick={saveOracle}>
                메시지 저장
              </button>
              <button type="button" className="ghostButton" onClick={() => shareSummary('/oracle', `운명연구소 신점 메시지: ${oracle.headline}`)}>
                공유
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function RecordsScreen({ records, onDelete, onClear }: { records: SavedRecord[]; onDelete: (id: string) => void; onClear: () => void }) {
  return (
    <div className="stack">
      <section className="screenTitle">
        <span>⌁</span>
        <h1>내 기록</h1>
        <p>사용자가 저장한 결과만 이 기기 저장소에 남습니다.</p>
      </section>
      {records.length ? (
        <>
          <div className="recordList">
            {records.map((record) => (
              <article key={record.id}>
                <span>{new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.createdAt))}</span>
                <h2>{record.title}</h2>
                <p>{record.summary}</p>
                <button type="button" className="ghostButton" onClick={() => onDelete(record.id)}>
                  삭제
                </button>
              </article>
            ))}
          </div>
          <button type="button" className="dangerButton" onClick={onClear}>
            저장된 결과 전체 삭제
          </button>
        </>
      ) : (
        <Section title="저장된 결과 없음">
          <p className="muted">사주, 타로, 별자리, 신점 메시지 결과 화면에서 저장을 선택하면 이곳에 표시됩니다.</p>
        </Section>
      )}
    </div>
  );
}

function SettingsScreen({ identity, onReset }: { identity: IdentityProvider | null; onReset: () => void }) {
  const [legal, setLegal] = useState<'privacy' | 'terms' | 'disclaimer' | 'contact'>('privacy');
  useEffect(() => trackEvent('settings_view'), []);
  return (
    <div className="stack">
      <section className="screenTitle">
        <span>설정</span>
        <h1>서비스 안내</h1>
        <p>로컬 저장, 약관, 개인정보 안내를 확인하고 데이터를 삭제할 수 있습니다.</p>
      </section>
      <Section title="사용자 식별">
        <ul className="plainList">
          <li>토스에서 안전하게 이어서 보기: 앱인토스 비게임 익명 식별을 우선 사용합니다.</li>
          <li>지원하지 않는 환경에서는 이 기기에만 저장되는 게스트 ID를 사용합니다.</li>
          <li>실제 토스 로그인, 토큰 발급, 사용자 프로필 조회는 현재 버전에서 사용하지 않습니다.</li>
        </ul>
        <button
          type="button"
          className="dangerButton"
          onClick={async () => {
            await identity?.deleteLocalData();
            onReset();
          }}
        >
          앱 데이터 초기화
        </button>
      </Section>
      <div className="intentRow legalTabs" aria-label="법적 안내">
        <button type="button" className={legal === 'privacy' ? 'active' : ''} onClick={() => setLegal('privacy')}>
          개인정보
        </button>
        <button type="button" className={legal === 'terms' ? 'active' : ''} onClick={() => setLegal('terms')}>
          이용약관
        </button>
        <button type="button" className={legal === 'disclaimer' ? 'active' : ''} onClick={() => setLegal('disclaimer')}>
          면책
        </button>
        <button type="button" className={legal === 'contact' ? 'active' : ''} onClick={() => setLegal('contact')}>
          문의
        </button>
      </div>
      <Section title={legal === 'privacy' ? '개인정보처리방침' : legal === 'terms' ? '이용약관' : legal === 'disclaimer' ? '서비스 면책 안내' : '문의하기'}>
        {legal === 'privacy' && (
          <div className="legalText">
            <p>운영자: 이지훈 · 문의: ddragonjh@gmail.com · 시행일: 2026-07-11</p>
            <p>입력 정보는 사주 계산과 결과 저장을 위해 앱 안에서 처리합니다. 사용자가 저장을 선택한 경우에만 이름 또는 표시 이름, 생년월일, 성별, 출생시간, 옵션, 결과 요약이 기기 저장소에 저장됩니다.</p>
            <p>앱인토스 실행환경에서는 비게임 익명 식별 hash를 내부 사용자 구분에만 사용합니다. 이는 토스 로그인이나 서버 API 호출용 키가 아닙니다.</p>
            <p>현재 버전은 자체 서버 데이터베이스를 사용하지 않습니다. 외부 SDK는 앱인토스 WebView SDK를 사용하며, 확인되지 않은 추가 전송 항목은 [확인 필요]로 유지합니다.</p>
            <p>저장 정보는 사용자가 삭제할 때까지 보관되며, 설정 또는 내 기록 화면에서 삭제할 수 있습니다. 제3자 제공과 국외 이전은 하지 않습니다.</p>
          </div>
        )}
        {legal === 'terms' && (
          <div className="legalText">
            <p>운명연구소 앱인토스 버전은 모든 화면을 열람 제한 없이 제공합니다. 잠금형 결과나 외부 유도 화면은 제공하지 않습니다.</p>
            <p>이용자는 타인의 개인정보를 무단 입력하거나 서비스 결과를 확정적 사실로 유포해서는 안 됩니다.</p>
            <p>서비스는 사주, 타로, 신점 메시지, 별자리 해석을 자동 계산한 참고 콘텐츠로 제공합니다. 서비스 변경 또는 중단이 필요할 수 있으며, 지식재산권은 운영자 또는 정당한 권리자에게 있습니다.</p>
            <p>준거법은 대한민국 법령을 따릅니다. 문의는 ddragonjh@gmail.com으로 보내 주세요.</p>
          </div>
        )}
        {legal === 'disclaimer' && (
          <div className="legalText">
            <p>{CONTENT_NOTICE}</p>
            <p>신점 메시지는 실제 무속인이 직접 상담하거나 신적 사실을 전달하는 기능이 아닙니다. 자동화된 주제별 메시지를 자기성찰용으로 제공합니다.</p>
            <p>질병, 사망, 사고, 범죄, 임신, 투자 결과, 합격, 취업, 결혼 여부를 단정하지 않습니다.</p>
          </div>
        )}
        {legal === 'contact' && (
          <div className="legalText">
            <p>고객센터 이메일: ddragonjh@gmail.com</p>
            <p>오류 제보 시 이름, 생년월일, 출생시간 같은 개인정보는 보내지 않는 것을 권장합니다.</p>
          </div>
        )}
      </Section>
    </div>
  );
}

export function App() {
  const [view, setView] = useState<View>('home');
  const [identity, setIdentity] = useState<IdentityProvider | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [identityMessage, setIdentityMessage] = useState('별도 회원가입 없이 이용할 수 있어요.');
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [latestSaju, setLatestSaju] = useState<SajuResult | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let alive = true;
    const provider = createIdentityProvider();
    setIdentity(provider);
    provider.initialize().then(async (result) => {
      if (!alive) return;
      setUserId(result.userId);
      setIdentityMessage(result.message);
      setRecords(await loadRecords(result.userId));
    });
    trackEvent('app_open');
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const unregister = registerBackHandler(() => {
      if (view !== 'home') setView('home');
    });
    return unregister;
  }, [view]);

  async function saveRecord(record: SavedRecord) {
    if (!userId) {
      setToast('저장소 준비 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    const next = await addRecord(userId, record);
    setRecords(next);
    setToast('내 결과에 저장했습니다.');
    trackEvent('result_save');
  }

  async function removeRecord(id: string) {
    if (!userId) return;
    const next = await deleteRecord(userId, id);
    setRecords(next);
    setToast('삭제했습니다.');
    trackEvent('result_delete');
  }

  async function removeAll() {
    if (!userId) return;
    await clearRecords(userId);
    setRecords([]);
    setToast('저장된 결과를 모두 삭제했습니다.');
  }

  async function shareSummary(path: string, message: string) {
    try {
      await shareSafeSummary(path, message);
      setToast('공유를 요청했습니다.');
      trackEvent('result_share');
    } catch {
      setToast('공유를 완료하지 못했습니다.');
      trackEvent('error');
    }
  }

  function resetLocal() {
    setRecords([]);
    setLatestSaju(null);
    setToast('앱 데이터를 초기화했습니다.');
  }

  const screen =
    view === 'home' ? (
      <HomeScreen setView={setView} records={records} latestSaju={latestSaju} />
    ) : view === 'saju' ? (
      <SajuScreen latestSaju={latestSaju} setLatestSaju={setLatestSaju} saveRecord={saveRecord} shareSummary={shareSummary} />
    ) : view === 'tarot' ? (
      <TarotScreen saveRecord={saveRecord} shareSummary={shareSummary} />
    ) : view === 'fortune' ? (
      <FortuneScreen latestSaju={latestSaju} saveRecord={saveRecord} shareSummary={shareSummary} />
    ) : view === 'records' ? (
      <RecordsScreen records={records} onDelete={removeRecord} onClear={removeAll} />
    ) : (
      <SettingsScreen identity={identity} onReset={resetLocal} />
    );

  return (
    <AppChrome view={view} setView={setView} identityMessage={identityMessage}>
      {screen}
      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </AppChrome>
  );
}
