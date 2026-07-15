/* ═══════════════════════════════════════════════════════
   운명연구소 — 프리미엄 모듈
   프리미엄 질문 리딩 · 속궁합 · 관계/커리어 타이밍 + 이용권 잠금
   ═══════════════════════════════════════════════════════ */
const PREMIUM = (() => {
  const S = SAJU.STEMS, SH = SAJU.STEMS_H, B = SAJU.BRANCHES, BH = SAJU.BRANCHES_H;
  const SE = SAJU.STEM_ELEM;
  const Sec = typeof MLSecurity !== 'undefined' ? MLSecurity : {
    escapeHtml: v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    normalizeName: v => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 12),
    logError: () => {}
  };
  const esc = Sec.escapeHtml;

  // ── 지지 관계 테이블 ──
  const YUKHAP = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
  const SAMHAP = {8:0,0:0,4:0, 11:1,3:1,7:1, 2:2,6:2,10:2, 5:3,9:3,1:3};
  const WONJIN = {0:7,7:0, 1:6,6:1, 2:9,9:2, 3:8,8:3, 4:11,11:4, 5:10,10:5};
  const isChung = (a,b) => (a+6)%12 === b;
  const ELEM_GEN = {목:'화',화:'토',토:'금',금:'수',수:'목'};   // 생
  const ELEM_OVR = {목:'토',토:'수',수:'화',화:'금',금:'목'};   // 극

  // ═══════════ 궁합 엔진 ═══════════
  function compat(rA, rB, nameA, nameB) {
    const dmA = rA.dayMaster, dmB = rB.dayMaster;
    const godAB = SAJU.tenGod(rA.dayP.stem, rB.dayP.stem);  // 나에게 상대는
    const godBA = SAJU.tenGod(rB.dayP.stem, rA.dayP.stem);
    let score = 52; const parts = [];

    // ① 일간 관계 (두 사람의 본질 궁합)
    const grp = g => g[0]==='비'||g[0]==='겁' ? '비겁' : g[0]==='식'||g[0]==='상' ? '식상' : g.includes('재') ? '재성' : g.includes('관') ? '관성' : '인성';
    const gA = grp(godAB);
    const CORE = {
      비겁:{ s:6, t:`서로가 서로의 거울인 <strong>닮은꼴 궁합</strong>입니다. 말하지 않아도 통하는 편안함이 최대 장점이지만, 기질이 닮은 만큼 주도권 다툼이 생기면 둘 다 물러서지 않습니다. 역할 분담(각자의 영역)을 정해두면 최고의 동반자가 됩니다.` },
      식상:{ s:12, t:`한쪽이 다른 쪽을 낳고 기르는 <strong>돌봄의 궁합</strong>입니다. 함께 있으면 아이디어와 웃음이 늘어나는 생산적인 조합으로, 챙겨주는 쪽이 지치지 않도록 받는 쪽의 표현(고마움)이 관계의 연료가 됩니다.` },
      재성:{ s:14, t:`내가 다듬고 가꾸고 싶어지는 <strong>끌림의 궁합</strong>입니다. 이성 궁합에서 가장 자주 보이는 강한 인력의 조합으로, 초반 몰입이 큽니다. 다만 끌림이 소유욕이 되지 않도록 상대의 자유를 존중하는 것이 관건입니다.` },
      관성:{ s:13, t:`상대가 나를 단정하게 만드는 <strong>존중의 궁합</strong>입니다. 곁에 있으면 흐트러지기 어려운, 서로를 성장시키는 조합입니다. 존경이 부담으로 변하지 않게, 잘한 것을 소리 내어 인정해 주는 습관이 필요합니다.` },
      인성:{ s:11, t:`한쪽이 다른 쪽의 뿌리가 되어주는 <strong>의지의 궁합</strong>입니다. 함께 있으면 마음이 안정되고 배울 것이 많은 조합으로, 기대는 쪽과 받쳐주는 쪽의 균형이 오래가는 비결입니다.` }
    };
    score += CORE[gA].s;
    parts.push({ title:`두 사람의 본질 — ${dmA.hanja}(${nameA}) ↔ ${dmB.hanja}(${nameB})`,
      text: `${nameA}에게 ${nameB}는 <strong>${godAB}</strong>, ${nameB}에게 ${nameA}는 <strong>${godBA}</strong>의 존재입니다. ` + CORE[gA].t });

    // ② 배우자궁(일지) 관계
    const bA = rA.dayP.branch, bB = rB.dayP.branch;
    let palTxt, palScore = 0;
    if (YUKHAP[bA] === bB) { palScore = 22; palTxt = `두 사람의 배우자궁이 <strong>육합(六合)</strong> — 서로를 끌어안는 가장 강한 결합의 신호입니다. 함께 살수록 정이 깊어지는 조합으로, 전통 궁합에서 최상급으로 치는 배치입니다.`; }
    else if (isChung(bA, bB)) { palScore = -16; palTxt = `배우자궁끼리 <strong>충(沖)</strong>으로 마주 봅니다. 부딪히는 에너지라 다툼이 잦을 수 있지만, 서로를 깨우는 자극이기도 합니다. "싸움의 규칙"(잠들기 전 화해, 인신공격 금지)을 정해두면 오히려 역동적인 부부가 됩니다.`; }
    else if (WONJIN[bA] === bB) { palScore = -12; palTxt = `배우자궁끼리 <strong>원진(怨嗔)</strong> — 이유 없이 서운해지기 쉬운 기류입니다. 다만 원진은 "미워하면서 끌리는" 애증의 별이기도 해서, 서운함을 그날 말로 푸는 습관 하나로 충분히 다스려집니다.`; }
    else if (SAMHAP[bA] === SAMHAP[bB] && bA !== bB) { palScore = 15; palTxt = `배우자궁이 같은 <strong>삼합(三合)</strong> 팀입니다. 인생의 방향성이 비슷해 자연스럽게 같은 곳을 바라보는 조합 — 목표를 공유할 때 가장 단단해집니다.`; }
    else if (bA === bB) { palScore = 7; palTxt = `배우자궁이 <strong>같은 글자</strong>입니다. 생활 리듬과 취향이 비슷해 편안하지만, 단점까지 닮아 있어 서로의 거울을 보며 배우는 관계입니다.`; }
    else { palScore = 3; palTxt = `배우자궁이 서로 무해한 중립 관계입니다. 극적인 끌림도 극적인 충돌도 아닌, <strong>노력이 그대로 반영되는</strong> 담백한 조합입니다.`; }
    score += palScore;
    parts.push({ title:`배우자궁 궁합 — ${BH[bA]} ↔ ${BH[bB]}`, text: palTxt });

    // ③ 오행 상호보완
    const sortE = r => Object.entries(r.elemCount).sort((a,b)=>b[1]-a[1]);
    const weakA = sortE(rA)[4][0], strongB = sortE(rB)[0][0];
    const weakB = sortE(rB)[4][0], strongA = sortE(rA)[0][0];
    let comp = 0; const compLines = [];
    if (weakA === strongB) { comp += 12; compLines.push(`${nameA}에게 부족한 <strong>${weakA}</strong> 기운을 ${nameB}가 가득 채워줍니다.`); }
    if (weakB === strongA) { comp += 12; compLines.push(`${nameB}에게 부족한 <strong>${weakB}</strong> 기운을 ${nameA}가 채워줍니다.`); }
    if (ELEM_GEN[SE[rA.dayP.stem]] === SE[rB.dayP.stem]) compLines.push(`${nameA}의 기운이 ${nameB}를 생(生)하는 흐름 — 함께 있으면 ${nameB}가 힘을 얻습니다.`);
    else if (ELEM_GEN[SE[rB.dayP.stem]] === SE[rA.dayP.stem]) compLines.push(`${nameB}의 기운이 ${nameA}를 생(生)하는 흐름 — 함께 있으면 ${nameA}가 힘을 얻습니다.`);
    if (!compLines.length) compLines.push('서로의 오행이 크게 채워주지도 빼앗지도 않는 독립적 균형입니다. 각자의 색이 뚜렷한 커플입니다.');
    score += comp;
    parts.push({ title:'오행 상호보완', text: compLines.join(' ') });

    // ④ 띠(년지) 관계
    const yA = rA.yearP.branch, yB = rB.yearP.branch;
    let ddi;
    if (YUKHAP[yA] === yB) { score += 6; ddi = '띠끼리도 육합 — 집안 어른들이 보기에도 좋은 인연입니다.'; }
    else if (isChung(yA, yB)) { score -= 5; ddi = '띠끼리는 충 — 자란 환경·가풍이 달라 초반 문화 차이를 느낄 수 있으나, 핵심 궁합(일주)이 더 중요합니다.'; }
    else if (SAMHAP[yA] === SAMHAP[yB]) { score += 4; ddi = '띠가 같은 삼합 팀 — 세대 기운이 잘 맞아 함께 어울리는 자리가 편안합니다.'; }
    else ddi = '띠 관계는 무난 — 겉궁합에 걸리는 것이 없습니다.';
    parts.push({ title:`띠 궁합 — ${SAJU.BRANCH_ANIMAL[yA]}띠 ↔ ${SAJU.BRANCH_ANIMAL[yB]}띠`, text: ddi });

    score = Math.max(38, Math.min(97, Math.round(score)));
    const headline = score >= 85 ? '전통 해석상 강하게 끌리는 궁합' :
                     score >= 72 ? '노력이 아깝지 않은 좋은 궁합' :
                     score >= 58 ? '서로를 알아갈수록 좋아지는 궁합' :
                                   '다름을 인정하는 것이 숙제인 궁합';
    return { score, headline, parts,
      advice: score >= 72
        ? '궁합이 좋다는 건 "덜 노력해도 된다"가 아니라 "노력의 효율이 높다"는 뜻입니다. 지금의 온도를 아끼지 말고 표현하세요.'
        : '궁합 점수는 참고 지표이지 판결이 아닙니다. 위에 적힌 마찰 지점을 미리 아는 커플은, 모르는 좋은 궁합 커플보다 오래갑니다.' };
  }

  // ═══════════ 월별 운세 (올해 12개월) ═══════════
  function monthly(r) {
    const year = new Date().getFullYear();
    const ys = ((year - 4) % 10 + 10) % 10;
    const first = (ys % 5) * 2 + 2;
    const GRADE = {
      정재:['길',' 착실히 들어오는 재물의 달 — 계약·저축에 좋습니다.'], 편재:['활',' 돈이 크게 도는 달 — 기회도 지출도 커지니 배분이 관건.'],
      정관:['길',' 인정과 승진의 기운 — 윗사람 앞에 서는 일을 피하지 마세요.'], 편관:['주의',' 책임과 압박이 커지는 달 — 무리한 약속은 금물.'],
      정인:['길',' 문서·계약·합격의 기운 — 미뤄둔 서류를 처리할 최적기.'], 편인:['활',' 배움과 재정비의 달 — 새 공부를 시작하기 좋습니다.'],
      식신:['길',' 의식주가 풍성해지는 달 — 즐기는 일에서 성과가 납니다.'], 상관:['활',' 표현력이 폭발하는 달 — 말이 복도 되고 화도 되니 한 박자 쉬고 말하기.'],
      비견:['보통',' 내 힘으로 밀어붙이는 달 — 협업보다 단독 작업이 잘 풀립니다.'], 겁재:['주의',' 경쟁과 지출의 달 — 돈거래·보증은 피하세요.']
    };
    const out = [];
    const MONTH_LABEL = ['2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월','1월'];
    for (let i = 0; i < 12; i++) {
      const stem = (first + i) % 10, br = (2 + i) % 12;
      const god = SAJU.tenGod(r.dayP.stem, stem);
      const [grade, txt] = GRADE[god];
      out.push({ label: `${MONTH_LABEL[i]}${i===11?'(내년)':''}`, gz: SH[stem]+BH[br], god, grade, txt });
    }
    return { year, months: out };
  }

  // ═══════════ 인생 타이밍 (10년 스캔) ═══════════
  function timing(r) {
    const nowY = new Date().getFullYear();
    const move = [], money = [], doc = [];
    const YEOKMA = {0:2,4:2,8:2, 3:5,7:5,11:5, 2:8,6:8,10:8, 1:11,5:11,9:11};
    for (let y = nowY; y < nowY + 10; y++) {
      const g = { stem: ((y-4)%10+10)%10, branch: ((y-4)%12+12)%12 };
      const sg = SAJU.tenGod(r.dayP.stem, g.stem);
      const bg = SAJU.tenGodOfBranch(r.dayP.stem, g.branch);
      const name = `${y}년(${S[g.stem]}${B[g.branch]})`;
      if (YEOKMA[r.dayP.branch] === g.branch || isChung(r.dayP.branch, g.branch)) move.push(name);
      if (sg.includes('재') || bg.includes('재')) money.push(name);
      if (sg.includes('인') || bg.includes('인')) doc.push(name);
    }
    return { move: move.slice(0,3), money: money.slice(0,3), doc: doc.slice(0,3) };
  }

  function pct(seed, min = 42, max = 96) {
    return typeof FORTUNE !== 'undefined' ? FORTUNE.score(seed, min, max) : min + (Math.abs(String(seed).split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % (max-min+1));
  }

  function premiumQuestions(r) {
    const key = `${r.input.year}-${r.input.month}-${r.input.day}-${r.dayP.stem}-${r.dayP.branch}`;
    const love = pct(`${key}-reunion`, 45, 96);
    const mind = pct(`${key}-mind`, 48, 94);
    const rebound = pct(`${key}-rebound`, 35, 90);
    const job = pct(`${key}-job`, 42, 96);
    const pass = pct(`${key}-pass`, 42, 96);
    const promo = pct(`${key}-promo`, 42, 96);
    return [
      ['재회 시기', love, love >= 78 ? '가까운 3개월 안에 다시 말문이 열릴 수 있습니다. 다만 먼저 감정 확인보다 가벼운 안부가 유리합니다.' : '지금은 바로 붙잡기보다 상대의 생활 리듬이 안정될 때까지 거리를 두는 편이 낫습니다.'],
      ['상대 속마음', mind, mind >= 76 ? '상대는 완전히 끊었다기보다 마음을 정리하는 중입니다. 자존심을 건드리지 않는 표현이 중요합니다.' : '상대 마음은 아직 방어적입니다. 설득보다 신뢰 회복의 증거가 먼저 필요합니다.'],
      ['환승이별 흐름', rebound, rebound >= 72 ? '새 관계의 속도는 빠르지만 기반은 흔들릴 수 있습니다. 비교와 추궁은 금물, 본인의 회복을 먼저 잡으세요.' : '상대의 새 흐름에 휘말릴수록 손해입니다. 지금은 내 생활권을 되찾는 것이 운을 돌립니다.'],
      ['이직운', job, job >= 76 ? '새 조직·새 역할로 이동하는 운이 열립니다. 지원서와 포트폴리오를 바로 갱신하세요.' : '충동 이직보다 조건 비교가 먼저입니다. 현재 자리에서 협상 여지가 남아 있습니다.'],
      ['합격운', pass, pass >= 76 ? '문서운과 집중운이 받쳐줍니다. 기출 반복과 접수 일정 확인이 점수를 지킵니다.' : '실력보다 실수 관리가 관건입니다. 원서, 날짜, 준비물 체크리스트가 필요합니다.'],
      ['승진운', promo, promo >= 76 ? '윗사람에게 보이는 일이 성과로 이어집니다. 조용한 공보다 보고되는 결과가 중요합니다.' : '승진운은 준비 단계입니다. 지금은 평판 관리와 업무 기록을 쌓아둘 때입니다.']
    ];
  }

  function questionCards(r) {
    return premiumQuestions(r).map(([title, value, text]) => `
      <div class="premium-question-card">
        <div class="score-top"><span>${title}</span><strong>${value}</strong></div>
        <div class="score-track"><i style="width:${value}%"></i></div>
        <p>${text}</p>
      </div>`).join('');
  }

  // ═══════════ UI ═══════════
  // 2026-07 정책 변경: 기존 프리미엄(궁합·질문리딩·타이밍)은 전면 무료화.
  // 유료화는 별도 '스타·캐릭터 사주'(STAR 모듈)로 이동.
  function sectionHtml(isPrem, r) {
    return `
      <div class="r-block prem-open" id="premCompat">
        <h3><span class="ico">💞</span> 겉궁합 · 속궁합 <span class="free-tag">무료</span></h3>
        <p class="content-notice small">오락·자기이해용 참고 콘텐츠이며 의료·법률·투자·진로 판단을 대체하지 않습니다.</p>
        <p class="sec-desc">상대방의 양력 생년월일을 입력하면 띠로 보는 겉궁합과 일주/오행으로 보는 속궁합을 나눠 분석합니다.</p>
        <div class="compat-form">
          <input type="text" id="cName" aria-label="상대 이름 선택 입력" placeholder="상대 이름(선택)" maxlength="12">
          <select id="cYear" aria-label="상대 태어난 해"></select><select id="cMonth" aria-label="상대 태어난 월"></select><select id="cDay" aria-label="상대 태어난 일"></select>
          <select id="cGender" aria-label="상대 성별" required><option value="" selected disabled>성별</option><option value="M">남자</option><option value="F">여자</option></select>
          <button class="btn-gold" id="cBtn">궁합 보기</button>
        </div>
        <div id="compatResult" aria-live="polite"></div>
      </div>
      <div class="r-block prem-open" id="premQuestions">
        <h3><span class="ico">🔎</span> 질문 리딩 — 재회·속마음·이직·합격 <span class="free-tag">무료</span></h3>
        <p class="content-notice small">오락·자기이해용 참고 콘텐츠이며 의료·법률·투자·진로 판단을 대체하지 않습니다.</p>
        <p class="sec-desc">재회, 속마음, 환승이별, 이직, 합격, 승진처럼 실제로 많이 묻는 질문을 점수화했습니다.</p>
        <div class="premium-question-grid">${questionCards(r)}</div>
      </div>
      <div class="r-block prem-open" id="premTiming">
        <h3><span class="ico">⏳</span> 인생 타이밍 캘린더 <span class="free-tag">무료</span></h3>
        <p class="content-notice small">오락·자기이해용 참고 콘텐츠이며 의료·법률·투자·진로 판단을 대체하지 않습니다.</p>
        <div id="timingBody"></div>
      </div>`;
  }

  function bind(r) {
    // 이용권 등록
    const pb = document.getElementById('premBtn');
    if (pb) pb.onclick = async () => {
      const err = document.getElementById('premErr');
      err.textContent = '';
      if (!MLAuth.isLoggedIn()) { MLAuth.open('signup'); return; }
      try {
        pb.disabled = true;
        const code = document.getElementById('premCode').value.trim().toUpperCase();
        const ok = await MLAuth.redeem(code);
        if (!ok) err.textContent = '유효하지 않은 코드입니다. 코드를 다시 확인해 주세요.';
      } catch (error) {
        Sec.logError('premium-redeem', error);
        err.textContent = '이용권 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      } finally {
        pb.disabled = false;
      }
    };

    // 궁합 폼
    const cy = document.getElementById('cYear');
    if (!cy) return;
    for (let y = 2035; y >= 1930; y--) cy.add(new Option(y + '년', y));
    cy.value = 1995;
    const cm = document.getElementById('cMonth'), cd = document.getElementById('cDay');
    for (let m = 1; m <= 12; m++) cm.add(new Option(m + '월', m));
    const fill = () => { const last = new Date(+cy.value, +cm.value, 0).getDate(); const cur = +cd.value || 1; cd.innerHTML=''; for (let d=1; d<=last; d++) cd.add(new Option(d+'일', d)); cd.value = Math.min(cur, last); };
    cy.onchange = cm.onchange = fill; fill();

    document.getElementById('cBtn').onclick = () => {
      const gender = document.getElementById('cGender').value;
      if (!gender) {
        document.getElementById('compatResult').innerHTML = '<p class="auth-err">상대 성별을 선택해 주세요.</p>';
        return;
      }
      const rB = SAJU.compute({ year:+cy.value, month:+cm.value, day:+cd.value, hour:12, minute:0,
        gender, unknownTime:true, trueSolar:false, dayBoundary:'23' });
      const nameA = esc(Sec.normalizeName(r.input.name) || '나');
      const nameB = esc(Sec.normalizeName(document.getElementById('cName').value) || '상대');
      const c = compat(r, rB, nameA, nameB);
      const outerScore = pct(`${r.yearP.branch}-${rB.yearP.branch}-outer`, 42, 96);
      const innerScore = Math.round((c.score + pct(`${r.dayP.stem}-${rB.dayP.stem}-inner`, 45, 96)) / 2);
      document.getElementById('compatResult').innerHTML = `
        <div class="compat-duo">
          <div class="compat-score"><div class="num">${outerScore}<small>점</small></div><div class="head">겉궁합: 띠와 생활 리듬</div></div>
          <div class="compat-score"><div class="num">${innerScore}<small>점</small></div><div class="head">속궁합: 일주와 오행 보완</div></div>
        </div>
        <div class="hl"><strong>종합 ${c.score}점</strong> — ${c.headline}</div>
        ${c.parts.map(p=>`<h4>◈ ${p.title}</h4><p>${p.text}</p>`).join('')}
        <div class="hl">${c.advice}</div>
        <p class="tag-note">* 상대의 태어난 시간까지 알면 더 정밀해집니다. 본 궁합은 삼주(년월일) 기준입니다.</p>`;
    };

    // 타이밍
    const tb = document.getElementById('timingBody');
    if (tb) {
      const t = timing(r);
      const li = a => a.length ? a.join(' · ') : '가까운 10년 안에는 뚜렷한 신호가 없습니다 (안정 유지 흐름)';
      tb.innerHTML = `
        <h4>◈ 이직 · 이사 · 변화에 좋은 해</h4><p>${li(t.move)} — 역마와 충이 배우자궁을 흔드는 해로, 자발적으로 움직이면 운이 되고 버티면 스트레스가 됩니다.</p>
        <h4>◈ 재물이 도는 해</h4><p>${li(t.money)} — 재성이 들어오는 해입니다. 몸값 협상·사업 확장·투자 공부의 적기입니다.</p>
        <h4>◈ 시험 · 계약 · 문서에 좋은 해</h4><p>${li(t.doc)} — 인성이 들어오는 해로 합격·승인·계약운이 뒷받침됩니다.</p>`;
    }
  }

  return { sectionHtml, bind };
})();
