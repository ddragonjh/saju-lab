/* ═══════════════════════════════════════════════════════
   운명연구소 — 만세력·명리 계산 엔진
   절기 기준 년주/월주, 율리우스일 기반 일주, 시주,
   지장간, 십성, 오행 분포, 대운, 세운, 신살
   ═══════════════════════════════════════════════════════ */

const SAJU = (() => {

  // ── 기초 테이블 ─────────────────────────────
  const STEMS   = ['갑','을','병','정','무','기','경','신','임','계'];
  const STEMS_H = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const STEM_ELEM = ['목','목','화','화','토','토','금','금','수','수'];
  const STEM_YANG = [1,0,1,0,1,0,1,0,1,0];

  const BRANCHES   = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const BRANCHES_H = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const BRANCH_ELEM = ['수','토','목','목','토','화','화','토','금','금','토','수'];
  const BRANCH_ANIMAL = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];

  // 지장간 (여기→본기 순, 마지막이 본기)
  const HIDDEN = {
    0:[8,9], 1:[9,7,5], 2:[4,2,0], 3:[0,1], 4:[1,9,4], 5:[4,6,2],
    6:[2,5,3], 7:[3,1,5], 8:[4,8,6], 9:[6,7], 10:[7,3,4], 11:[4,0,8]
  };

  const ELEMS = ['목','화','토','금','수'];
  // 생: idx→(idx+1)%5 를 생함 / 극: idx→(idx+2)%5 를 극함
  const ELEM_IDX = {목:0,화:1,토:2,금:3,수:4};

  // ── 절기 (월주 경계가 되는 12節) ────────────
  // 근사식: day = floor(Y*0.2422 + C) - L  (Y=연도 뒤 2자리)
  // 1·2월 절기는 L=floor((Y-1)/4), 그 외 L=floor(Y/4)
  const TERMS = [
    {name:'소한', month:1,  c20:6.11,   c21:5.4055},
    {name:'입춘', month:2,  c20:4.6295, c21:3.87},
    {name:'경칩', month:3,  c20:6.3826, c21:5.63},
    {name:'청명', month:4,  c20:5.59,   c21:4.81},
    {name:'입하', month:5,  c20:6.318,  c21:5.52},
    {name:'망종', month:6,  c20:6.5,    c21:5.678},
    {name:'소서', month:7,  c20:7.928,  c21:7.108},
    {name:'입추', month:8,  c20:8.35,   c21:7.5},
    {name:'백로', month:9,  c20:8.44,   c21:7.646},
    {name:'한로', month:10, c20:9.098,  c21:8.318},
    {name:'입동', month:11, c20:8.218,  c21:7.438},
    {name:'대설', month:12, c20:7.9,    c21:7.18}
  ];

  function termDate(year, termIdx){
    const t = TERMS[termIdx];
    const Y = year % 100;
    const C = year >= 2000 ? t.c21 : t.c20;
    const L = t.month <= 2 ? Math.floor((Y-1)/4) : Math.floor(Y/4);
    const day = Math.floor(Y*0.2422 + C) - L;
    return new Date(year, t.month-1, day);
  }

  // ── 율리우스일 → 일주 ────────────────────────
  function jdn(y,m,d){
    const a = Math.floor((14-m)/12), yy = y+4800-a, mm = m+12*a-3;
    return d + Math.floor((153*mm+2)/5) + 365*yy + Math.floor(yy/4)
           - Math.floor(yy/100) + Math.floor(yy/400) - 32045;
  }
  // 검증 앵커: 1900-01-01 = 갑술일(10), 2000-01-01 = 무오일(54), 2024-01-01 = 갑자일(0)
  function dayGanzhi(y,m,d){
    return ((jdn(y,m,d) - 2415021 + 10) % 60 + 60) % 60;
  }

  const gz = i => ({ stem: Math.floor(i%60/1)%10===undefined?0:(i%60)%10, branch:(i%60)%12 });
  function ganzhiOf(i){ i = ((i%60)+60)%60; return {stem:i%10, branch:i%12, idx:i}; }
  function gzName(g){ return STEMS[g.stem]+BRANCHES[g.branch]; }
  function gzHanja(g){ return STEMS_H[g.stem]+BRANCHES_H[g.branch]; }

  // ── 십성 ────────────────────────────────────
  const TEN_NAMES = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
  function tenGod(dayStem, otherStem){
    const de = ELEM_IDX[STEM_ELEM[dayStem]], oe = ELEM_IDX[STEM_ELEM[otherStem]];
    const same = STEM_YANG[dayStem] === STEM_YANG[otherStem];
    let group;
    if (oe === de) group = 0;                    // 비겁
    else if (oe === (de+1)%5) group = 1;         // 식상 (내가 생함)
    else if (oe === (de+2)%5) group = 2;         // 재성 (내가 극함)
    else if (de === (oe+2)%5) group = 3;         // 관성 (나를 극함)
    else group = 4;                              // 인성 (나를 생함)
    // 비견/식신/편재/편관/편인 = 같은 음양
    return TEN_NAMES[group*2 + (same?0:1)];
  }
  function tenGodOfBranch(dayStem, branch){
    const main = HIDDEN[branch][HIDDEN[branch].length-1];
    return tenGod(dayStem, main);
  }

  // ── 신살 ────────────────────────────────────
  // 삼합 그룹 기준: [신자진, 해묘미, 인오술, 사유축]
  const SAMHAP = { 8:0,0:0,4:0, 11:1,3:1,7:1, 2:2,6:2,10:2, 5:3,9:3,1:3 };
  const DOHWA  = [9,0,3,6];   // 그룹별 도화 지지
  const YEOKMA = [2,5,8,11];  // 역마
  const HWAGAE = [4,7,10,1];  // 화개
  const CHEONEUL = { 0:[1,7],4:[1,7],6:[1,7], 1:[0,8],5:[0,8], 2:[11,9],3:[11,9], 7:[2,6], 8:[5,3],9:[5,3] };
  const BAEKHO = new Set(['갑진','을미','병술','정축','무진','임술','계축']);
  const GOEGANG = new Set(['경진','경술','임진','임술','무술','무진']);

  function findSinsal(pillars, dayStem){
    const out = [];
    const branches = pillars.filter(p=>p).map(p=>p.branch);
    const dayBr = pillars[2].branch, yearBr = pillars[0].branch;
    const bases = [SAMHAP[dayBr], SAMHAP[yearBr]];
    const has = (targetArr) => branches.some(b => bases.some(g => targetArr[g]===b));
    if (has(DOHWA))  out.push('도화살');
    if (has(YEOKMA)) out.push('역마살');
    if (has(HWAGAE)) out.push('화개살');
    if (branches.some(b => (CHEONEUL[dayStem]||[]).includes(b))) out.push('천을귀인');
    pillars.forEach((p,i)=>{ if(p && BAEKHO.has(gzName(p))) out.push('백호살('+['년','월','일','시'][i]+'주)'); });
    if (GOEGANG.has(gzName(pillars[2]))) out.push('괴강살');
    return [...new Set(out)];
  }

  // ── 메인 계산 ────────────────────────────────
  /**
   * @param {Object} o {year,month,day,hour,minute,gender:'M'|'F',unknownTime,trueSolar}
   */
  function compute(o){
    // 진태양시 보정
    let dt = new Date(o.year, o.month-1, o.day, o.unknownTime?12:o.hour, o.unknownTime?0:o.minute);
    if (!o.unknownTime && o.trueSolar) dt = new Date(dt.getTime() - 30*60000);

    let y = dt.getFullYear(), m = dt.getMonth()+1, d = dt.getDate();
    const hh = dt.getHours(), mi = dt.getMinutes();

    // 년주: 입춘 기준
    const ipchun = termDate(y, 1);
    const dateOnly = new Date(y, m-1, d);
    const sajuYear = dateOnly >= new Date(ipchun.getFullYear(), ipchun.getMonth(), ipchun.getDate()) ? y : y-1;
    const yearP = ganzhiOf(((sajuYear - 4) % 60 + 60) % 60);

    // 월주: 절입 기준 — 입춘(sajuYear)부터 소한(sajuYear+1)까지 지난 절기 수
    const termSeq = [];
    for (let i=1;i<12;i++) termSeq.push(termDate(sajuYear, i));       // 입춘..대설
    termSeq.push(termDate(sajuYear+1, 0));                            // 소한(익년)
    let monthOffset = 0, boundary = false;
    for (let i=0;i<termSeq.length;i++){
      const td = termSeq[i];
      if (dateOnly >= td) monthOffset = i;
      if (Math.abs((dateOnly - td)/86400000) < 1) boundary = true;
    }
    const monthBranch = (2 + monthOffset) % 12;
    const monthStem = ((yearP.stem % 5) * 2 + 2 + monthOffset) % 10;
    const monthP = ganzhiOf(null); monthP.stem = monthStem; monthP.branch = monthBranch;
    monthP.idx = (()=>{ for(let i=0;i<60;i++){ if(i%10===monthStem && i%12===monthBranch) return i;} return 0; })();

    // 일주 (자시 23시 이후는 다음날로)
    let dy=y, dm=m, dd=d;
    if (!o.unknownTime && hh >= 23){
      const nx = new Date(y, m-1, d+1); dy=nx.getFullYear(); dm=nx.getMonth()+1; dd=nx.getDate();
    }
    const dayP = ganzhiOf(dayGanzhi(dy,dm,dd));

    // 시주
    let hourP = null;
    if (!o.unknownTime){
      const hb = Math.floor(((hh+1) % 24) / 2) % 12;  // 23~0시=자(0), 1~2시=축(1)...
      const hs = ((dayP.stem % 5) * 2 + hb) % 10;
      hourP = {stem:hs, branch:hb, idx:-1};
    }

    const pillars = [yearP, monthP, dayP, hourP];

    // 오행 분포 (천간 1.0 / 지지 본기 1.0 / 지장간 부기 0.3)
    const elemCount = {목:0,화:0,토:0,금:0,수:0};
    pillars.forEach(p=>{
      if(!p) return;
      elemCount[STEM_ELEM[p.stem]] += 1;
      const hid = HIDDEN[p.branch];
      hid.forEach((s,i)=>{
        elemCount[STEM_ELEM[s]] += (i===hid.length-1 ? 1 : 0.3);
      });
    });

    // 십성 분포 (일간 제외 천간 + 지지 본기)
    const tenCount = {};
    TEN_NAMES.forEach(n=>tenCount[n]=0);
    pillars.forEach((p,i)=>{
      if(!p) return;
      if(i!==2) tenCount[tenGod(dayP.stem, p.stem)] += 1;
      tenCount[tenGodOfBranch(dayP.stem, p.branch)] += 1;
    });
    const tenGroup = {
      비겁: tenCount['비견']+tenCount['겁재'],
      식상: tenCount['식신']+tenCount['상관'],
      재성: tenCount['편재']+tenCount['정재'],
      관성: tenCount['편관']+tenCount['정관'],
      인성: tenCount['편인']+tenCount['정인']
    };

    // ── 대운 ──
    const yangYear = STEM_YANG[yearP.stem] === 1;
    const forward = (o.gender==='M') === yangYear;   // 양남음녀 순행
    // 대운수: 출생~다음(이전) 절입일까지 일수 / 3
    const allTerms = [];
    for (let yy=sajuYear-1; yy<=sajuYear+1; yy++)
      for (let i=0;i<12;i++) allTerms.push(termDate(yy,i));
    allTerms.sort((a,b)=>a-b);
    let daysGap;
    if (forward){
      const next = allTerms.find(t=>t > dateOnly);
      daysGap = Math.round((next - dateOnly)/86400000);
    } else {
      const prevs = allTerms.filter(t=>t <= dateOnly);
      daysGap = Math.round((dateOnly - prevs[prevs.length-1])/86400000);
    }
    let daeunNum = Math.round(daysGap/3); if (daeunNum<1) daeunNum=1; if (daeunNum>10) daeunNum=10;

    const daeun = [];
    for (let k=1;k<=8;k++){
      const gi = ((monthP.idx + (forward?k:-k)) % 60 + 60) % 60;
      const g = ganzhiOf(gi);
      daeun.push({
        startAge: daeunNum + (k-1)*10,
        gz: g,
        stemGod: tenGod(dayP.stem, g.stem),
        branchGod: tenGodOfBranch(dayP.stem, g.branch)
      });
    }

    // ── 세운 (올해부터 6년) ──
    const nowYear = new Date().getFullYear();
    const seun = [];
    for (let yy=nowYear; yy<nowYear+6; yy++){
      const g = ganzhiOf(((yy-4)%60+60)%60);
      seun.push({ year:yy, gz:g, stemGod:tenGod(dayP.stem,g.stem), branchGod:tenGodOfBranch(dayP.stem,g.branch) });
    }

    // ── 결혼 인연 후보 연도 (만 20~45세 구간) ──
    const spouseGods = o.gender==='M' ? ['정재','편재'] : ['정관','편관'];
    const dayBr = dayP.branch;
    const YUKHAP = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
    const samhapGroup = SAMHAP[dayBr];
    const samhapMembers = Object.keys(SAMHAP).filter(k=>SAMHAP[k]===samhapGroup).map(Number);
    const marriageYears = [];
    for (let yy=Math.max(nowYear, o.year+20); yy<=o.year+45; yy++){
      const g = ganzhiOf(((yy-4)%60+60)%60);
      let score = 0; const why=[];
      if (spouseGods.includes(tenGod(dayP.stem,g.stem))) { score+=2; why.push('배우자성(천간)'); }
      if (spouseGods.includes(tenGodOfBranch(dayP.stem,g.branch))) { score+=2; why.push('배우자성(지지)'); }
      if (YUKHAP[dayBr]===g.branch) { score+=2; why.push('배우자궁 육합'); }
      else if (samhapMembers.includes(g.branch) && g.branch!==dayBr) { score+=1; why.push('배우자궁 삼합'); }
      if (DOHWA[SAMHAP[dayBr]]===g.branch) { score+=1; why.push('도화 발동'); }
      if (score>=3) marriageYears.push({year:yy, age:yy-o.year+1, why, score});
    }
    marriageYears.sort((a,b)=>b.score-a.score || a.year-b.year);

    const sinsal = findSinsal(pillars, dayP.stem);

    return {
      input:o, pillars, yearP, monthP, dayP, hourP,
      elemCount, tenCount, tenGroup,
      daeun, daeunNum, forward, seun,
      marriageYears: marriageYears.slice(0,5).sort((a,b)=>a.year-b.year),
      sinsal, boundary, sajuYear,
      dayMaster:{ stem:dayP.stem, name:STEMS[dayP.stem], hanja:STEMS_H[dayP.stem],
                  elem:STEM_ELEM[dayP.stem], yang:STEM_YANG[dayP.stem]===1 }
    };
  }

  return { compute, STEMS, STEMS_H, STEM_ELEM, STEM_YANG, BRANCHES, BRANCHES_H,
           BRANCH_ELEM, BRANCH_ANIMAL, HIDDEN, TEN_NAMES, tenGod, tenGodOfBranch,
           gzName, gzHanja, ELEMS };
})();
