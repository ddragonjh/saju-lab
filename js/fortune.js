/* 운명연구소 — 사주 결과 안의 무료 운세 요약 */
const FORTUNE = (() => {
  const Sec = typeof MLSecurity !== 'undefined' ? MLSecurity : {
    escapeHtml: v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    logError: () => {}
  };
  const esc = Sec.escapeHtml;

  const ZODIAC = [
    ['염소자리', 1, 20], ['물병자리', 2, 19], ['물고기자리', 3, 20], ['양자리', 4, 20],
    ['황소자리', 5, 21], ['쌍둥이자리', 6, 22], ['게자리', 7, 23], ['사자자리', 8, 23],
    ['처녀자리', 9, 23], ['천칭자리', 10, 23], ['전갈자리', 11, 22], ['사수자리', 12, 22], ['염소자리', 12, 32]
  ];
  const TAROT = [
    ['태양', '관계와 일이 드러나는 날입니다. 숨기기보다 밝게 말할수록 길합니다.'],
    ['달', '감정이 먼저 올라옵니다. 확신이 들 때까지 하루만 더 관찰하세요.'],
    ['별', '회복과 기대의 카드입니다. 작은 약속 하나가 다시 희망을 만듭니다.'],
    ['연인', '선택의 카드입니다. 마음이 가는 쪽과 오래 남는 쪽을 구분하세요.'],
    ['전차', '밀고 나가야 열립니다. 연락, 지원, 제안처럼 움직임이 답입니다.'],
    ['은둔자', '혼자 정리해야 보입니다. 오늘의 침묵은 도망이 아니라 전략입니다.'],
    ['정의', '문서와 약속을 확인하세요. 균형을 맞추면 손해가 줄어듭니다.'],
    ['운명의 수레바퀴', '흐름이 바뀝니다. 우연처럼 온 제안을 가볍게 넘기지 마세요.'],
    ['힘', '부드럽게 버티는 힘이 강합니다. 정면충돌보다 설득이 이깁니다.'],
    ['세계', '마무리와 완성의 카드입니다. 끝내야 다음 문이 열립니다.']
  ];
  const ORACLE = [
    '오늘은 먼저 묻지 말고 먼저 정리하면 길합니다.',
    '사람의 말보다 반복되는 행동을 보세요.',
    '기다림이 답인 일과 먼저 움직여야 하는 일을 구분해야 합니다.',
    '작게 손해 보는 선택이 크게 지키는 선택일 수 있습니다.',
    '연락운은 열려 있으나, 감정 섞인 말은 한 박자 늦추세요.',
    '문서, 결제, 예약처럼 기록이 남는 일을 확인하면 액운이 줄어듭니다.',
    '새로운 제안은 바로 거절하지 말고 조건을 숫자로 따져보세요.'
  ];
  const SCORE_LABELS = [
    ['love', '연애운'], ['money', '재물운'], ['work', '일/사업운'], ['study', '합격운'], ['health', '컨디션']
  ];

  function hash(seed) {
    let h = 2166136261;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function score(seed, min = 48, max = 96) {
    return min + (hash(seed) % (max - min + 1));
  }

  function bucketDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const wy = weekStart.getFullYear();
    const wm = String(weekStart.getMonth() + 1).padStart(2, '0');
    const wd = String(weekStart.getDate()).padStart(2, '0');
    return { day: `${y}-${m}-${d}`, week: `${wy}-${wm}-${wd}`, month: `${y}-${m}` };
  }

  function getZodiac(month, day) {
    for (let i = 0; i < ZODIAC.length - 1; i++) {
      const [, nextMonth, nextDay] = ZODIAC[i];
      if (month < nextMonth || (month === nextMonth && day < nextDay)) return ZODIAC[i][0];
    }
    return '염소자리';
  }

  function stemKey(r) {
    return `${r.input.year}-${r.input.month}-${r.input.day}-${r.dayP.stem}-${r.dayP.branch}`;
  }

  function tone(scoreValue) {
    if (scoreValue >= 85) return '상승';
    if (scoreValue >= 72) return '좋음';
    if (scoreValue >= 60) return '보통';
    return '주의';
  }

  function daily(r) {
    const b = bucketDate();
    const key = stemKey(r);
    const zodiac = getZodiac(r.input.month, r.input.day);
    const scores = Object.fromEntries(SCORE_LABELS.map(([id]) => [id, score(`${key}-${b.day}-${id}`)]));
    const cards = [0, 1, 2].map(i => TAROT[hash(`${key}-${b.day}-tarot-${i}`) % TAROT.length]);
    const oracle = ORACLE[hash(`${key}-${b.day}-oracle`) % ORACLE.length];
    const weekScore = score(`${key}-${b.week}-week`, 50, 94);
    const monthScore = score(`${key}-${b.month}-month`, 48, 95);
    const today = Math.round(Object.values(scores).reduce((a, v) => a + v, 0) / Object.values(scores).length);
    const luckElem = SAJU.ELEMS[hash(`${key}-${b.day}-elem`) % SAJU.ELEMS.length];
    return {
      date: b.day,
      zodiac,
      today,
      weekScore,
      monthScore,
      scores,
      cards,
      oracle,
      luckElem,
      headline: today >= 82 ? '오늘은 먼저 움직일수록 운이 붙습니다.' :
                today >= 68 ? '무난하지만 선택 하나가 흐름을 바꿉니다.' :
                '서두르기보다 확인과 정리가 운을 지킵니다.',
      weekly: weekScore >= 78 ? '이번 주는 사람을 통해 기회가 들어옵니다. 약속, 연락, 제안에 답을 늦추지 마세요.' :
              '이번 주는 체력과 일정 관리가 관건입니다. 욕심낸 약속을 줄이면 결과가 좋아집니다.',
      monthly: monthScore >= 78 ? '이번 달은 확장운이 있습니다. 배우는 일, 홍보, 지원, 계약처럼 밖으로 나가는 일이 좋습니다.' :
               '이번 달은 정비운입니다. 미뤄둔 정리, 재점검, 관계의 거리 조절이 다음 운을 만듭니다.',
      zodiacText: today >= 75 ? `${zodiac} 기운은 표현력과 타이밍을 살릴 때 강해집니다. 오늘은 먼저 정리하고 짧게 제안해 보세요.` :
                  `${zodiac} 기운은 속도를 낮출수록 안정됩니다. 감정적인 답장보다 확인된 정보가 운을 지켜줍니다.`
    };
  }

  function scoreCard(label, value) {
    return `<div class="score-card">
      <div class="score-top"><span>${label}</span><strong>${value}</strong></div>
      <div class="score-track"><i style="width:${value}%"></i></div>
      <em>${tone(value)}</em>
    </div>`;
  }

  function sectionHtml(r) {
    const f = daily(r);
    const dayKey = `ml_daily_${r.input.year}_${r.input.month}_${r.input.day}`;
    let checked = false;
    try { checked = localStorage.getItem(dayKey) === f.date; } catch(_) {}
    return `
      <section class="oracle-hub" id="oracleHub">
        <div class="hub-head">
          <p class="hub-eyebrow">사주 무료 운세</p>
          <h3>오늘 · 이주 · 이달 흐름</h3>
          <p>입력한 사주를 기준으로 별자리와 기간별 운세를 점수로 정리합니다.</p>
        </div>

        <div class="fortune-hero">
          <div>
            <span class="fortune-kicker">${esc(f.zodiac)} · ${f.luckElem} 기운 보강일</span>
            <h4>오늘의 운세 ${f.today}점</h4>
            <p>${esc(f.headline)}</p>
          </div>
          <button class="btn-gold daily-check" data-day="${f.date}" data-key="${dayKey}">${checked ? '오늘 확인 완료' : '오늘의 운세 확인'}</button>
        </div>
        <div class="score-grid">
          ${SCORE_LABELS.map(([id, label]) => scoreCard(label, f.scores[id])).join('')}
        </div>
        <div class="period-grid">
          <div class="period-card"><strong>${esc(f.zodiac)} 별자리 운세</strong><p>${esc(f.zodiacText)}</p></div>
          <div class="period-card"><strong>이주의 운세 ${f.weekScore}점</strong><p>${esc(f.weekly)}</p></div>
          <div class="period-card"><strong>이달의 운세 ${f.monthScore}점</strong><p>${esc(f.monthly)}</p></div>
        </div>
        <div class="reader-link-row">
          <a class="btn-ghost" href="tarot.html">타로 리딩관</a>
          <a class="btn-ghost" href="sinjeom.html">신점 리딩관</a>
          <a class="btn-ghost" href="zodiac.html">별자리 리딩관</a>
        </div>
      </section>`;
  }

  function bind() {
    document.querySelectorAll('.daily-check').forEach(btn => {
      btn.onclick = () => {
        try { localStorage.setItem(btn.dataset.key, btn.dataset.day); } catch(err) { Sec.logError('daily-check', err); }
        btn.textContent = '오늘 확인 완료';
        btn.disabled = true;
      };
      try {
        if (localStorage.getItem(btn.dataset.key) === btn.dataset.day) btn.disabled = true;
      } catch(_) {}
    });
  }

  return { sectionHtml, bind, daily, score };
})();
