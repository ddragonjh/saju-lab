/* 운명연구소 — 별자리 전용 운세 */
(() => {
  const Sec = typeof MLSecurity !== 'undefined' ? MLSecurity : {
    escapeHtml: v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))
  };
  const esc = Sec.escapeHtml;
  const $ = s => document.querySelector(s);

  const SIGNS = [
    { id:'aries', name:'양자리', symbol:'♈', range:'3.21 - 4.19', element:'불', trait:'시작과 결단' },
    { id:'taurus', name:'황소자리', symbol:'♉', range:'4.20 - 5.20', element:'흙', trait:'현실감과 지속력' },
    { id:'gemini', name:'쌍둥이자리', symbol:'♊', range:'5.21 - 6.21', element:'공기', trait:'소통과 전환' },
    { id:'cancer', name:'게자리', symbol:'♋', range:'6.22 - 7.22', element:'물', trait:'보호와 감정' },
    { id:'leo', name:'사자자리', symbol:'♌', range:'7.23 - 8.22', element:'불', trait:'표현과 존재감' },
    { id:'virgo', name:'처녀자리', symbol:'♍', range:'8.23 - 9.22', element:'흙', trait:'정리와 분석' },
    { id:'libra', name:'천칭자리', symbol:'♎', range:'9.23 - 10.22', element:'공기', trait:'균형과 관계' },
    { id:'scorpio', name:'전갈자리', symbol:'♏', range:'10.23 - 11.21', element:'물', trait:'집중과 회복' },
    { id:'sagittarius', name:'사수자리', symbol:'♐', range:'11.22 - 12.21', element:'불', trait:'확장과 탐험' },
    { id:'capricorn', name:'염소자리', symbol:'♑', range:'12.22 - 1.19', element:'흙', trait:'책임과 성취' },
    { id:'aquarius', name:'물병자리', symbol:'♒', range:'1.20 - 2.18', element:'공기', trait:'아이디어와 독립' },
    { id:'pisces', name:'물고기자리', symbol:'♓', range:'2.19 - 3.20', element:'물', trait:'공감과 직감' }
  ];

  const MESSAGE = {
    fire: ['움직임이 운을 엽니다. 먼저 제안하고 먼저 시작하는 쪽이 유리합니다.', '말보다 행동이 빠를 때 좋은 결과가 따라옵니다. 단, 약속은 짧게 확인하세요.'],
    earth: ['정리와 점검이 운을 올립니다. 미뤄둔 문서나 돈의 흐름을 확인하세요.', '느려 보여도 쌓이는 운입니다. 오늘 한 가지를 끝내면 다음 단계가 보입니다.'],
    air: ['연락, 대화, 아이디어에 운이 붙습니다. 짧고 정확한 표현이 좋은 반응을 만듭니다.', '사람을 통해 흐름이 바뀝니다. 새 제안은 바로 거절하지 말고 조건을 보세요.'],
    water: ['감정의 결을 읽으면 길합니다. 직감은 좋지만 확인된 사실과 함께 보세요.', '회복운이 들어옵니다. 무리한 관계보다 편안한 사람에게 기대는 것이 좋습니다.']
  };

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const week = Math.ceil((d.getDate() + new Date(y, d.getMonth(), 1).getDay()) / 7);
    return { day:`${y}-${m}-${day}`, week:`${y}-${m}-W${week}`, month:`${y}-${m}` };
  }

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

  function elementKey(element) {
    return element === '불' ? 'fire' : element === '흙' ? 'earth' : element === '공기' ? 'air' : 'water';
  }

  function renderButtons(activeId = 'aries') {
    $('#zodiacSelect').innerHTML = SIGNS.map(sign => `
      <button class="zodiac-button ${sign.id === activeId ? 'active' : ''}" type="button" data-sign="${esc(sign.id)}">
        <b>${esc(sign.symbol)}</b>
        <span>${esc(sign.name)}</span>
        <small>${esc(sign.range)}</small>
      </button>`).join('');
    document.querySelectorAll('.zodiac-button').forEach(btn => {
      btn.addEventListener('click', () => render(btn.dataset.sign));
    });
  }

  function scoreCard(label, value) {
    return `<div class="score-card">
      <div class="score-top"><span>${esc(label)}</span><strong>${value}</strong></div>
      <div class="score-track"><i style="width:${value}%"></i></div>
    </div>`;
  }

  function render(signId = 'aries') {
    const sign = SIGNS.find(item => item.id === signId) || SIGNS[0];
    const key = todayKey();
    const today = score(`${sign.id}-${key.day}-today`, 52, 96);
    const week = score(`${sign.id}-${key.week}-week`, 50, 94);
    const month = score(`${sign.id}-${key.month}-month`, 48, 95);
    const love = score(`${sign.id}-${key.day}-love`, 45, 96);
    const money = score(`${sign.id}-${key.day}-money`, 45, 96);
    const work = score(`${sign.id}-${key.day}-work`, 45, 96);
    const health = score(`${sign.id}-${key.day}-health`, 45, 96);
    const messages = MESSAGE[elementKey(sign.element)];
    const body = messages[hash(`${sign.id}-${key.day}-msg`) % messages.length];
    const tone = today >= 84 ? '강한 상승운' : today >= 72 ? '열리는 운' : today >= 62 ? '안정운' : '정리운';

    $('#zodiacHeroSign').textContent = sign.symbol;
    $('#zodiacHeroName').textContent = sign.name;
    renderButtons(sign.id);
    $('#zodiacResult').innerHTML = `
      <div class="r-block zodiac-result-block">
        <h2 class="sec-title"><span>${esc(sign.symbol)}</span>${esc(sign.name)} 운세</h2>
        <div class="fortune-hero">
          <div>
            <span class="fortune-kicker">${esc(sign.range)} · ${esc(sign.element)}의 별자리 · ${esc(sign.trait)}</span>
            <h4>오늘의 별자리 운세 ${today}점</h4>
            <p>${esc(tone)}입니다. ${esc(body)}</p>
          </div>
          <a class="btn-ghost" href="tarot.html">타로도 보기</a>
        </div>
        <div class="score-grid">
          ${scoreCard('연애운', love)}
          ${scoreCard('금전운', money)}
          ${scoreCard('일/사업운', work)}
          ${scoreCard('컨디션', health)}
        </div>
        <div class="period-grid">
          <div class="period-card"><strong>오늘의 운세 ${today}점</strong><p>오늘은 ${esc(sign.trait)}이 강해지는 날입니다. 먼저 정리하고 움직이면 흐름이 빨라집니다.</p></div>
          <div class="period-card"><strong>이주의 운세 ${week}점</strong><p>이번 주는 사람과 일정의 균형이 중요합니다. 약속을 줄이고 핵심 한 가지에 집중하세요.</p></div>
          <div class="period-card"><strong>이달의 운세 ${month}점</strong><p>이번 달은 ${month >= 76 ? '확장과 시도' : '정비와 회복'}에 무게를 두면 좋습니다. 무리한 결정보다 다음 단계를 위한 준비가 운을 만듭니다.</p></div>
        </div>
      </div>`;
  }

  render();
})();
