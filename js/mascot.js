/* ═══════════════════════════════════════════════════════
   운명연구소 — 마스코트 "도담이" (SD 한복 무당 캐릭터)
   순수 벡터(SVG) — 자세를 무제한 다양화, 로딩 즉시, CSP 안전.
   MASCOT.svg(pose) / MASCOT.mount(selector, pose, speech)
   pose: 'point' | 'cards' | 'fan' | 'star' | 'bell' | 'welcome'
   ═══════════════════════════════════════════════════════ */
const MASCOT = (() => {
  // 팔레트 (브랜드: 먹빛 남색 + 금)
  const C = {
    skin:'#ffe0c7', skinSh:'#f3c3a3', cheek:'#ff9db0',
    hair:'#1a1b2e', hairHi:'#33355a',
    jeogori:'#3f7d6e', jeogoriSh:'#2c5c50', collar:'#f6f1e6',
    chima:'#3a2a54', chimaSh:'#2a1d40', hem:'#d9b877',
    gold:'#e8cf9a', goldD:'#c9a86a', ribbon:'#c2504f',
    tarot:'#20233c', tarotEdge:'#e8cf9a', fan:'#c2504f', fanRib:'#e8cf9a',
    line:'#20222f'
  };

  // 머리 + 몸통(자세 공통). 팔/소품만 pose로 교체.
  function base(arms) {
    return `
    <!-- 그림자 -->
    <ellipse cx="100" cy="248" rx="46" ry="9" fill="#000" opacity=".18"/>
    <!-- 치마 -->
    <path d="M63 250 Q60 176 82 156 L118 156 Q140 176 137 250 Z" fill="${C.chima}"/>
    <path d="M100 156 L100 250" stroke="${C.chimaSh}" stroke-width="2" opacity=".5"/>
    <path d="M63 250 Q100 262 137 250 L136 240 Q100 250 64 240 Z" fill="${C.hem}"/>
    <!-- 저고리 -->
    <path d="M74 150 Q100 138 126 150 L131 176 Q100 186 69 176 Z" fill="${C.jeogori}"/>
    <path d="M74 150 Q100 162 126 150 L124 158 Q100 170 76 158 Z" fill="${C.collar}"/>
    <!-- 고름(리본) -->
    <path d="M100 162 q-9 8 -15 22 q9 -6 14 -10 q5 4 14 10 q-6 -14 -13 -22 z" fill="${C.ribbon}"/>
    <circle cx="100" cy="164" r="3.4" fill="${C.gold}"/>
    ${arms}
    <!-- 머리 -->
    <g>
      <!-- 쪽머리 뒤 -->
      <ellipse cx="100" cy="70" rx="60" ry="58" fill="${C.hair}"/>
      <!-- 얼굴 -->
      <circle cx="100" cy="78" r="50" fill="${C.skin}"/>
      <path d="M52 84 a48 48 0 0 0 96 0 a50 50 0 0 1 -96 0z" fill="${C.skinSh}" opacity=".25"/>
      <!-- 앞머리 -->
      <path d="M50 74 Q52 30 100 28 Q148 30 150 74 Q150 52 130 46 Q118 62 100 60 Q82 62 70 46 Q50 52 50 74 Z" fill="${C.hair}"/>
      <path d="M100 28 Q60 30 52 68 Q66 40 100 40 Q134 40 148 68 Q140 30 100 28Z" fill="${C.hairHi}" opacity=".5"/>
      <!-- 첩지/머리장식 -->
      <circle cx="100" cy="40" r="6" fill="${C.gold}"/><circle cx="100" cy="40" r="2.6" fill="${C.ribbon}"/>
      <circle cx="78" cy="46" r="3" fill="${C.gold}"/><circle cx="122" cy="46" r="3" fill="${C.gold}"/>
      <!-- 볼터치 -->
      <circle cx="72" cy="92" r="9" fill="${C.cheek}" opacity=".55"/>
      <circle cx="128" cy="92" r="9" fill="${C.cheek}" opacity=".55"/>
      <!-- 눈 (초승달 미소) -->
      <path d="M66 82 q8 -9 16 0" stroke="${C.line}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M118 82 q8 -9 16 0" stroke="${C.line}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- 입 -->
      <path d="M92 100 q8 8 16 0" stroke="${C.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>`;
  }

  const armSkin = C.skin;
  const POSES = {
    // 사주: 검지로 위를 가리키며 설명
    point: `<path d="M128 170 q26 -4 30 -34" stroke="${armSkin}" stroke-width="13" fill="none" stroke-linecap="round"/>
      <circle cx="160" cy="132" r="8" fill="${armSkin}"/>
      <rect x="157" y="112" width="6" height="16" rx="3" fill="${armSkin}"/>
      <path d="M72 170 q-16 -2 -18 14" stroke="${armSkin}" stroke-width="13" fill="none" stroke-linecap="round"/>`,
    // 타로: 카드 세 장 부채꼴
    cards: `<path d="M74 172 q-18 6 -14 30" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M126 172 q20 6 16 30" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <g transform="translate(100 210) rotate(-2)">
        <g transform="rotate(-18)"><rect x="-14" y="-34" width="26" height="42" rx="4" fill="${C.tarot}" stroke="${C.tarotEdge}" stroke-width="2"/><text x="-1" y="-9" font-size="14" fill="${C.gold}" text-anchor="middle">☾</text></g>
        <g transform="rotate(0)"><rect x="-13" y="-40" width="26" height="42" rx="4" fill="${C.tarot}" stroke="${C.tarotEdge}" stroke-width="2"/><text x="0" y="-14" font-size="14" fill="${C.gold}" text-anchor="middle">★</text></g>
        <g transform="rotate(18)"><rect x="-12" y="-34" width="26" height="42" rx="4" fill="${C.tarot}" stroke="${C.tarotEdge}" stroke-width="2"/><text x="1" y="-9" font-size="14" fill="${C.gold}" text-anchor="middle">☀</text></g>
      </g>`,
    // 신점: 무당 부채
    fan: `<path d="M74 172 q-16 4 -14 26" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M128 168 q22 -2 28 -20" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <g transform="translate(158 150) rotate(18)">
        <path d="M0 0 L-34 -46 A58 58 0 0 1 34 -46 Z" fill="${C.fan}" stroke="${C.fanRib}" stroke-width="2"/>
        <path d="M0 0 L0 -58 M0 0 L-20 -52 M0 0 L20 -52 M0 0 L-34 -46 M0 0 L34 -46" stroke="${C.fanRib}" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="4" fill="${C.gold}"/>
      </g>`,
    // 별자리: 별 지팡이
    star: `<path d="M72 172 q-16 4 -14 26" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M128 170 q22 -6 26 -30" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <line x1="156" y1="140" x2="150" y2="185" stroke="${C.goldD}" stroke-width="4" stroke-linecap="round"/>
      <path d="M156 118 l4.5 9.5 10.5 1.5 -7.6 7.4 1.8 10.4 -9.2 -4.9 -9.2 4.9 1.8 -10.4 -7.6 -7.4 10.5 -1.5z" fill="${C.gold}"/>`,
    // 방울(신점 대체)
    bell: `<path d="M72 172 q-16 4 -14 26" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M128 170 q22 -4 26 -26" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <line x1="156" y1="146" x2="156" y2="120" stroke="${C.goldD}" stroke-width="3"/>
      <circle cx="150" cy="120" r="6" fill="${C.gold}"/><circle cx="162" cy="120" r="6" fill="${C.gold}"/><circle cx="156" cy="112" r="6" fill="${C.gold}"/>`,
    // 인사: 두 손 모아 환영
    welcome: `<path d="M74 170 q-6 16 18 24" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M126 170 q6 16 -18 24" stroke="${armSkin}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="196" rx="13" ry="9" fill="${C.skin}"/>`
  };

  function svg(pose='welcome', size=110) {
    return `<svg class="mascot-svg" width="${size}" height="${Math.round(size*1.3)}" viewBox="0 0 200 260" role="img" aria-label="마스코트 도담이" xmlns="http://www.w3.org/2000/svg">${base(POSES[pose]||POSES.welcome)}</svg>`;
  }

  function figure(pose, speech, size) {
    const bubble = speech ? `<span class="mascot-bubble">${speech}</span>` : '';
    return `<div class="mascot mascot-${pose}">${svg(pose, size)}${bubble}</div>`;
  }

  // 섹션 제목 옆에 캐릭터 붙이기
  function attach(selector, pose, speech, size) {
    const el = document.querySelector(selector);
    if (!el || el.dataset.mascot) return;
    el.dataset.mascot = '1';
    el.insertAdjacentHTML('beforeend', figure(pose, speech, size));
    el.classList.add('has-mascot');
  }

  // index.html 자동 배치 (패널 우상단)
  function mountHome() {
    attach('#reading', 'point', '생년월일만 알려주면<br>여덟 글자로 풀어줄게!', 104);
    attach('#about', 'welcome', '차근차근<br>설명해 줄게 :)', 92);
  }
  document.addEventListener('DOMContentLoaded', mountHome);

  return { svg, figure, attach };
})();
