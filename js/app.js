/* ═══════════════════════════════════════════════════════
   운명연구소 — UI 컨트롤러 (v2: 심층 해석 + 회원 잠금)
   ═══════════════════════════════════════════════════════ */
(() => {
  const $ = s => document.querySelector(s);

  // ── 폼 초기화 ──
  const yearSel = $('#inYear'), monthSel = $('#inMonth'), daySel = $('#inDay');
  const hourSel = $('#inHour'), minSel = $('#inMin');
  for (let y=2025; y>=1930; y--) yearSel.add(new Option(y+'년', y));
  yearSel.value = 1995;
  for (let m=1; m<=12; m++) monthSel.add(new Option(m+'월', m));
  function fillDays(){
    const y=+yearSel.value, m=+monthSel.value, last=new Date(y,m,0).getDate(), cur=+daySel.value||1;
    daySel.innerHTML='';
    for (let d=1; d<=last; d++) daySel.add(new Option(d+'일', d));
    daySel.value = Math.min(cur,last);
  }
  yearSel.onchange = monthSel.onchange = fillDays; fillDays();
  for (let h=0; h<24; h++) hourSel.add(new Option(String(h).padStart(2,'0')+'시', h));
  hourSel.value = 12;
  for (let mi=0; mi<60; mi+=5) minSel.add(new Option(String(mi).padStart(2,'0')+'분', mi));
  $('#unknownTime').onchange = e => { hourSel.disabled = minSel.disabled = e.target.checked; };

  // ── 제출 ──
  let lastResult = null;
  $('#sajuForm').addEventListener('submit', e => {
    e.preventDefault();
    const o = {
      name: $('#inName').value.trim(),
      gender: document.querySelector('input[name=gender]:checked').value,
      year:+yearSel.value, month:+monthSel.value, day:+daySel.value,
      hour:+hourSel.value, minute:+minSel.value,
      unknownTime: $('#unknownTime').checked,
      trueSolar: $('#trueSolar').checked
    };
    lastResult = SAJU.compute(o);
    render(lastResult);
    $('#result').classList.remove('hidden');
    $('#result').scrollIntoView({behavior:'smooth'});
  });

  // 로그인/가입 완료 시 잠금 해제 재렌더링
  document.addEventListener('auth-changed', () => {
    if (lastResult){ render(lastResult); $('#result').classList.remove('hidden'); }
  });

  // ── 렌더 ──
  const S=SAJU.STEMS, SH=SAJU.STEMS_H, B=SAJU.BRANCHES, BH=SAJU.BRANCHES_H;
  const SE=SAJU.STEM_ELEM, BE=SAJU.BRANCH_ELEM;
  const ELEM_H = {목:'木',화:'火',토:'土',금:'金',수:'水'};

  function pillarCard(p, label, dayStem, isDay){
    if(!p) return `<div class="pillar"><div class="p-label">${label}</div><div class="p-char" style="opacity:.3"><span class="h">?</span></div><div class="p-ten">시간 미상</div></div>`;
    const se=SE[p.stem], be=BE[p.branch];
    const hid = SAJU.HIDDEN[p.branch].map(s=>S[s]).join('·');
    const stemGod = isDay ? '일간(나)' : SAJU.tenGod(dayStem,p.stem);
    const brGod = SAJU.tenGodOfBranch(dayStem,p.branch);
    return `<div class="pillar pc-${se}">
      <div class="p-label">${label}</div>
      <div class="p-char e-${se}"><span class="h">${SH[p.stem]}</span><span class="k">${S[p.stem]}·${se}</span></div>
      <div class="p-ten">${stemGod}</div>
      <div class="p-char e-${be}" style="margin-top:8px"><span class="h">${BH[p.branch]}</span><span class="k">${B[p.branch]}·${be}</span></div>
      <div class="p-ten">${brGod}</div>
      <div class="p-hidden">지장간 ${hid}</div>
    </div>`;
  }

  function render(r){
    const o=r.input, dm=r.dayMaster;
    const who = o.name ? o.name+'님' : '당신';
    const genderTxt = o.gender==='M'?'남자':'여자';
    const timeTxt = o.unknownTime?'시간 미상':`${String(o.hour).padStart(2,'0')}:${String(o.minute).padStart(2,'0')}`;
    const iljuName = S[r.dayP.stem]+B[r.dayP.branch];
    const yearName = S[r.yearP.stem]+B[r.yearP.branch];
    const animal = SAJU.BRANCH_ANIMAL[r.yearP.branch];
    const plus = TEXTS2.dayMasterPlus[dm.name];

    // 오행
    const total = Object.values(r.elemCount).reduce((a,b)=>a+b,0);
    const sorted = Object.entries(r.elemCount).sort((a,b)=>b[1]-a[1]);
    const strongest = sorted[0][0], weakest = sorted[4][0];
    const elemBars = SAJU.ELEMS.map(el=>{
      const v = r.elemCount[el], pct = Math.round(v/total*100);
      return `<div class="ebar"><span class="badge e-${el}">${el}</span><div class="track"><div class="fill f-${el}" style="width:${pct}%"></div></div><span class="cnt">${v.toFixed(1)}</span></div>`;
    }).join('');

    // 십성
    const tg = r.tenGroup;
    const tgSorted = Object.entries(tg).sort((a,b)=>b[1]-a[1]);
    const domGroup = tgSorted[0][0], lackGroup = tgSorted[4][0];
    const topTens = Object.entries(r.tenCount).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3);

    // 인생 4단계 (각 기둥 지지 십성 기반)
    const palacePillars = [r.yearP, r.monthP, r.dayP, r.hourP];
    const palaceHtml = palacePillars.map((p,i)=>{
      if(!p) return `<h4>◈ ${TEXTS2.palaceLabel[i]}</h4><p>태어난 시간을 알면 이 구간(자녀·말년)의 흐름까지 읽을 수 있습니다.</p>`;
      const god = SAJU.tenGodOfBranch(r.dayP.stem, p.branch);
      return `<h4>◈ ${TEXTS2.palaceLabel[i]} — ${god}의 자리</h4><p>${TEXTS2.palaceFrame[god]}</p>`;
    }).join('');

    // 대운
    const nowYear = new Date().getFullYear();
    const curAge = nowYear - o.year + 1;
    const daeunCells = r.daeun.map(d=>{
      const isNow = curAge >= d.startAge && curAge < d.startAge+10;
      return `<div class="daeun-cell${isNow?' now':''}">
        <div class="age">${d.startAge}세~</div>
        <div class="gz">${SH[d.gz.stem]}${BH[d.gz.branch]}</div>
        <div class="ds">${S[d.gz.stem]}${B[d.gz.branch]}</div>
        <div class="ds">${d.stemGod}·${d.branchGod}</div>
      </div>`;
    }).join('');
    const curDaeun = r.daeun.find(d=>curAge>=d.startAge && curAge<d.startAge+10);

    // 세운
    const seunCells = r.seun.map(s=>`<div class="yearcell">
      <div class="y">${s.year}년 ${S[s.gz.stem]}${B[s.gz.branch]}</div>
      <div class="d">${TEXTS.daeunLine[s.stemGod]||''}</div>
    </div>`).join('');

    // 결혼 후보
    const marryCells = r.marriageYears.length ? r.marriageYears.map(m=>`<div class="yearcell hot">
      <div class="y">${m.year}년 (${m.age}세)</div>
      <div class="d">${m.why.join(' · ')}</div>
    </div>`).join('') : '<p>가까운 구간에 특별히 강한 인연 신호는 없지만, 이는 "천천히 깊게 만나는" 흐름이라는 뜻이기도 합니다.</p>';

    // 신살
    const sinsalHtml = r.sinsal.length ? r.sinsal.map(s=>{
      const key = s.startsWith('백호살')?null:s;
      const desc = key ? (TEXTS.sinsal[key]||'') : TEXTS.sinsalBaekho;
      return `<h4>◈ ${s}</h4><p>${desc}</p>`;
    }).join('') : '<p>두드러진 신살이 없는 담백한 원국입니다. 신살의 굴곡 없이 원국 본연의 힘으로 승부하는 사주입니다.</p>';

    // 학업
    const inseong = tg['인성'], siksang = tg['식상'];
    let studyTxt;
    if (inseong>=2.5) studyTxt = `인성(학문의 별)이 ${inseong.toFixed(1)}로 튼튼해 <strong>배움이 곧 무기가 되는 사주</strong>입니다. 인성은 쉽게 말해 "지식이 내 몸에 저금되는 통장"인데, 이 통장이 큰 사람입니다. 시험·자격·학위처럼 "문서로 증명되는 공부"에서 강하고, 벼락치기보다 꾸준한 누적 학습이 압도적으로 유리합니다. 시험 전날에는 새 문제보다 틀린 문제 복습이 점수를 지킵니다.`;
    else if (siksang>=2.5) studyTxt = `식상(응용의 별)이 발달해 <strong>암기보다 이해와 응용으로 성적을 내는 유형</strong>입니다. 책상에 오래 앉아 있는 것보다, 배운 것을 말로 설명해 보는 공부(백지 복습·스터디·인강 따라 말하기)가 점수를 폭발시킵니다. 문제를 살짝 바꿔서 스스로 출제해 보는 습관은 이 사주에게 최고의 과외 선생님입니다.`;
    else studyTxt = `인성과 식상이 균형 잡혀 <strong>전략만 서면 성적이 오르는 구조</strong>입니다. 머리가 나빠서가 아니라 "공부가 되는 환경"을 못 만나서 헤매는 유형이니, 공부 장소와 시간대를 고정하는 것부터 시작하세요. 같은 시간, 같은 자리의 힘이 이 사주의 성적을 만듭니다.`;
    if (inseong<1) studyTxt += ' 다만 인성이 약해 "시험 직전 문서 실수(원서 접수·서류 누락)"를 조심해야 합니다. 접수는 마감 3일 전에 끝내는 습관을 들이세요.';

    // 건강
    const HEALTH = {목:'간·담·눈·근육', 화:'심장·혈관·혈압', 토:'위장·소화기·비장', 금:'폐·호흡기·피부·대장', 수:'신장·방광·생식기·귀'};
    const lucky = TEXTS2.lucky[weakest];

    const loggedIn = typeof MLAuth !== 'undefined' && MLAuth.isLoggedIn();
    const lock = html => loggedIn ? html : html.replace('class="r-block"','class="r-block locked"');

    $('#result').innerHTML = `
      <div class="r-head">
        <div class="r-name">${who}의 사주팔자</div>
        <div class="r-meta">${o.year}년 ${o.month}월 ${o.day}일 (양력) · ${timeTxt} · ${genderTxt}${o.trueSolar&&!o.unknownTime?' · 진태양시 보정':''}</div>
        <div class="r-ilju">${yearName}년 ${animal}띠 · 일주 ${SH[r.dayP.stem]}${BH[r.dayP.branch]} (${iljuName})</div>
        ${r.boundary?'<p class="tag-note">⚠ 절입일 경계 부근 출생으로 월주가 달라질 수 있습니다. 전문 만세력 대조를 권장합니다.</p>':''}
      </div>

      <div class="panel">
        <h3 style="font-family:var(--serif);color:var(--gold-bright);margin-bottom:6px">四柱 원국</h3>
        <p class="sec-desc" style="margin-bottom:14px">오른쪽부터 년주(뿌리·초년) → 월주(부모·사회) → 일주(나·배우자) → 시주(자녀·말년). 위 글자는 하늘의 기운(천간), 아래 글자는 땅의 기운(지지)입니다.</p>
        <div class="pillars">
          ${pillarCard(r.hourP,'時柱 · 시주',r.dayP.stem)}
          ${pillarCard(r.dayP,'日柱 · 일주',r.dayP.stem,true)}
          ${pillarCard(r.monthP,'月柱 · 월주',r.dayP.stem)}
          ${pillarCard(r.yearP,'年柱 · 년주',r.dayP.stem)}
        </div>
        <div class="elembars">${elemBars}</div>
        <p class="tag-note">* 지지 속에 숨은 기운(지장간)까지 가중 반영한 오행 세력값입니다.</p>
      </div>

      <div class="r-block">
        <h3><span class="ico">☀</span> 나의 본질 — ${TEXTS.dayMaster[dm.name].title}</h3>
        <p>${who}의 일간(태어난 날의 천간, 사주의 주인공)은 <strong>${dm.hanja}(${dm.name}${dm.elem})</strong>입니다. ${TEXTS.dayMaster[dm.name].core}</p>
        <h4>타고난 강점</h4><p>${TEXTS.dayMaster[dm.name].strength}</p>
        <h4>다듬어야 할 그림자</h4><p>${TEXTS.dayMaster[dm.name].weakness}</p>
        <div class="hl">어울리는 무대 — ${TEXTS.dayMaster[dm.name].fit}</div>
        <div class="hl" style="border-left-color:var(--water)">💡 ${plus.tip}</div>
      </div>

      <div class="r-block">
        <h3><span class="ico">⚖</span> 오행의 균형 — 내 안의 다섯 가지 기운</h3>
        <p>사주의 여덟 글자는 각각 목·화·토·금·수 다섯 기운 중 하나를 품고 있습니다. 이 균형이 곧 성격의 지형도입니다.</p>
        <p>이 사주에서 가장 왕성한 기운은 <strong>${strongest}(${ELEM_H[strongest]})</strong>입니다. ${TEXTS2.elemStory[strongest]}</p>
        <p>${TEXTS.elem[strongest].over}</p>
        <p>가장 목마른 기운은 <strong>${weakest}(${ELEM_H[weakest]})</strong>입니다. ${TEXTS2.elemStory[weakest]}</p>
        <p>${TEXTS.elem[weakest].lack}</p>
      </div>

      <div class="r-block">
        <h3><span class="ico">◆</span> 재물과 직업 — 십성이 알려주는 돈의 길</h3>
        <p style="font-size:.9rem;color:var(--dim)">십성(十星)은 여덟 글자가 "나"와 맺는 열 가지 관계입니다. 어떤 별이 강한지가 돈 버는 방식과 직업 적성을 결정합니다.</p>
        <div class="badge-row">${Object.entries(tg).map(([k,v])=>`<span class="badge" style="border:1px solid var(--panel-line);color:${k===domGroup?'var(--gold-bright)':'var(--dim)'}">${k} ${v.toFixed(1)}</span>`).join('')}</div>
        <p>${TEXTS.tenDominant[domGroup]}</p>
        <p>${TEXTS.tenLack[lackGroup]}</p>
        <h4>이 사주를 이끄는 별들</h4>
        ${topTens.map(([name])=>`<p>${TEXTS2.tenGodDesc[name]}</p>`).join('')}
        <div class="hl">💰 ${plus.money}</div>
      </div>

      ${lock(`<div class="r-block">
        <h3><span class="ico">♥</span> 연애 · 결혼 — 인연의 흐름</h3>
        <p>${plus.love}</p>
        <h4>배우자궁이 말해주는 나의 인연</h4>
        <p>${TEXTS.spousePalace[r.dayP.branch]}</p>
        <h4>인연의 기운이 강해지는 후보 연도</h4>
        <p style="font-size:.88rem;color:var(--dim)">배우자성(${o.gender==='M'?'재성':'관성'})이 들어오는 해, 배우자궁과 합(合)이 되는 해, 도화가 발동하는 해를 종합한 흐름입니다.</p>
        <div class="yearlist">${marryCells}</div>
        <p class="tag-note">* 확정이 아닌 "기운이 들어오는 해"입니다. 인연은 만나는 노력 위에서 열립니다.</p>
      </div>`)}

      ${lock(`<div class="r-block">
        <h3><span class="ico">✎</span> 학업 · 시험운</h3>
        <p>${studyTxt}</p>
      </div>`)}

      ${lock(`<div class="r-block">
        <h3><span class="ico">⌛</span> 인생 4막 — 초년부터 말년까지</h3>
        <p style="font-size:.9rem;color:var(--dim)">사주의 네 기둥은 인생의 네 계절이기도 합니다. 각 기둥에 앉은 별이 그 시기의 주제를 말해줍니다.</p>
        ${palaceHtml}
      </div>`)}

      ${lock(`<div class="r-block">
        <h3><span class="ico">✚</span> 건강 신호와 개운법</h3>
        <p>오행 중 <strong>${weakest}</strong> 기운이 가장 약해, 명리학적으로 <strong>${HEALTH[weakest]}</strong> 계통의 컨디션 관리가 평생의 과제로 읽힙니다. 큰 병의 예언이 아니라 "먼저 지치는 부위"라는 신호이니, 정기 검진과 생활 습관으로 충분히 다스릴 수 있습니다.</p>
        <h4>부족한 ${weakest} 기운을 채우는 개운법</h4>
        <p><strong>행운의 색</strong> ${lucky.color} · <strong>방위</strong> ${lucky.dir} · <strong>숫자</strong> ${lucky.num} · <strong>계절</strong> ${lucky.season}</p>
        <p><strong>가까이하면 좋은 것</strong> — ${lucky.items} / <strong>음식</strong> — ${lucky.food}</p>
        <div class="hl">${lucky.habit}</div>
      </div>`)}

      ${lock(`<div class="r-block">
        <h3><span class="ico">〰</span> 대운 — 10년 단위 인생의 계절</h3>
        <p>대운은 10년마다 바뀌는 인생의 큰 날씨입니다. ${who}의 대운은 <strong>${r.daeunNum}세</strong>에 시작해 ${r.forward?'순행(미래 방향으로 흐름)':'역행(계절을 거슬러 흐름)'}합니다.${curDaeun?` 지금은 <strong>${SH[curDaeun.gz.stem]}${BH[curDaeun.gz.branch]} 대운(${curDaeun.startAge}세~)</strong> — ${TEXTS.daeunLine[curDaeun.stemGod]}입니다.`:''}</p>
        <div class="daeun-scroll"><div class="daeun-row">${daeunCells}</div></div>
      </div>`)}

      ${lock(`<div class="r-block">
        <h3><span class="ico">📅</span> 가까운 해의 흐름 (세운)</h3>
        <p style="font-size:.9rem;color:var(--dim)">해마다 들어오는 기운(세운)이 내 사주와 만나 그 해의 주제를 만듭니다.</p>
        <div class="yearlist">${seunCells}</div>
      </div>`)}

      ${lock(`<div class="r-block">
        <h3><span class="ico">★</span> 신살 — 타고난 특수 기운</h3>
        ${sinsalHtml}
      </div>`)}

      ${PREMIUM.sectionHtml(typeof MLAuth !== 'undefined' && MLAuth.isPremium())}

      ${loggedIn ? '' : `<div class="lock-cta">
        <p><strong>여기서부터는 회원 전용 심층 해석입니다.</strong></p>
        <p class="lock-sub">결혼 시기 후보 연도 · 학업운 · 인생 4막 · 건강과 개운법 · 대운 · 세운 · 신살까지<br>10초 무료 가입으로 전부 열람하실 수 있습니다. (정보는 내 브라우저에만 저장)</p>
        <button class="btn-gold btn-lg" id="unlockBtn">무료 회원가입하고 전체 해석 보기</button>
      </div>`}

      <div class="r-actions">
        <button class="btn-ghost" onclick="window.print()">해석 결과 인쇄 · PDF 저장</button>
        <button class="btn-ghost" id="shareBtn">결과 공유하기</button>
        <button class="btn-ghost" onclick="document.getElementById('reading').scrollIntoView({behavior:'smooth'})">다른 사주 보기</button>
      </div>`;

    const unlock = $('#unlockBtn');
    if (unlock) unlock.onclick = () => MLAuth.open('signup');

    PREMIUM.bind(r);

    const share = $('#shareBtn');
    if (share) share.onclick = async () => {
      const txt = `${who}의 사주 — 일주 ${iljuName}, ${yearName}년 ${animal}띠. 운명연구소에서 심층 해석을 받아보세요.`;
      try {
        if (navigator.share) await navigator.share({title:'운명연구소 사주 해석', text:txt, url:location.href});
        else { await navigator.clipboard.writeText(txt+' '+location.href); share.textContent='링크 복사 완료!'; }
      } catch(_) {}
    };
  }
})();
