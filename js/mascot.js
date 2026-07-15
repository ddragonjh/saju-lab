/* ═══════════════════════════════════════════════════════
   운명연구소 — 마스코트 "도담이" (SD 한복 무당)
   실제 일러스트(assets/mascot/*.png)를 페이지별로 배치.
   pose→이미지: point=사주 / cards=타로 / fan=신점 / crystal=별자리 / welcome=인사
   ═══════════════════════════════════════════════════════ */
const MASCOT = (() => {
  const IMG = {
    point:   'saju.png',
    cards:   'tarot.png',
    fan:     'sinjeom.png',
    crystal: 'zodiac.png',
    welcome: 'greet.png'
  };
  const esc = s => String(s == null ? '' : s);

  function figure(pose, speech) {
    const file = IMG[pose] || IMG.welcome;
    const bubble = speech ? `<span class="mascot-bubble">${speech}</span>` : '';
    return `<figure class="mascot mascot-${pose}">
      <img class="mascot-img" src="assets/mascot/${file}" alt="운명연구소 마스코트 도담이" decoding="async" width="264" height="264">
      ${bubble}
    </figure>`;
  }

  // 컨테이너 시작 부분에 삽입 → float:right 로 본문이 자연스럽게 감쌈(겹침 없음)
  function attach(selector, pose, speech) {
    const el = document.querySelector(selector);
    if (!el || el.dataset.mascot) return false;
    el.dataset.mascot = '1';
    el.insertAdjacentHTML('afterbegin', figure(pose, speech));
    el.classList.add('has-mascot');
    return true;
  }

  // 페이지별 자동 배치
  function mount() {
    const p = location.pathname.toLowerCase();
    if (p.includes('tarot')) {
      attach('.reader-copy', 'cards', '마음이 가는 카드를 골라봐.<br>흐름을 읽어줄게!');
    } else if (p.includes('sinjeom')) {
      attach('.reader-copy', 'fan', '생년월일 없이도<br>지금 필요한 한마디를 짚어줄게.');
    } else if (p.includes('zodiac')) {
      attach('.reader-copy', 'crystal', '네 별자리로 오늘·이주·이달<br>운을 봐줄게!');
    } else {
      // index (사주)
      attach('#reading', 'point', '생년월일만 알려주면<br>여덟 글자로 풀어줄게!');
      attach('#about', 'welcome', '차근차근<br>설명해 줄게 :)');
    }
  }
  document.addEventListener('DOMContentLoaded', mount);

  return { figure, attach, mount };
})();
