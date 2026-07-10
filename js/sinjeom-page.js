/* 운명연구소 — 신점 전용 리딩 */
(() => {
  const Sec = typeof MLSecurity !== 'undefined' ? MLSecurity : {
    escapeHtml: v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    logError: () => {}
  };
  const esc = Sec.escapeHtml;
  const $ = s => document.querySelector(s);

  const TOPICS = {
    today: {
      label: '오늘',
      messages: [
        ['먼저 묻지 말고 먼저 정리하면 길합니다.', '말을 아끼는 사람이 이기는 날입니다. 답답해도 한 박자 늦게 움직이면 손해가 줄어듭니다.'],
        ['오전보다 오후의 기운이 더 좋습니다.', '급한 연락은 짧게, 중요한 결정은 오후에 다시 확인하세요.'],
        ['기록이 액막이입니다.', '문서, 예약, 송금, 약속처럼 흔적이 남는 일은 두 번 확인하면 작은 사고를 막습니다.']
      ]
    },
    love: {
      label: '연애 · 재회',
      messages: [
        ['문은 닫힌 것이 아니라 조용해진 것입니다.', '다시 말문을 열려면 추궁보다 가벼운 안부가 먼저입니다.'],
        ['상대의 자존심을 건드리면 흐름이 꺾입니다.', '맞고 틀림을 따지기보다 편안했던 기억을 먼저 꺼내세요.'],
        ['재회운은 서두를수록 멀어집니다.', '지금은 내 생활을 회복하는 모습이 가장 강한 신호가 됩니다.']
      ]
    },
    money: {
      label: '일 · 돈',
      messages: [
        ['새 제안은 바로 거절하지 마세요.', '조건을 숫자로 따져보면 생각보다 남는 것이 있습니다.'],
        ['몸값을 올리는 말은 짧고 정확해야 합니다.', '성과를 감정이 아니라 기록으로 보여주면 흐름이 바뀝니다.'],
        ['큰돈보다 새는 돈을 막을 때입니다.', '구독, 약속, 미뤄둔 결제를 정리하면 금전운이 가벼워집니다.']
      ]
    },
    relation: {
      label: '관계',
      messages: [
        ['사람의 말보다 반복되는 행동을 보세요.', '같은 말이 반복된다면 그 말은 변명이 아니라 패턴입니다.'],
        ['가까운 사람일수록 선을 정해야 합니다.', '착한 태도와 무리한 양보는 다릅니다. 오늘은 부탁을 하나 줄이세요.'],
        ['오해는 짧게 풀어야 커지지 않습니다.', '긴 설명보다 확인 질문 하나가 관계를 살립니다.']
      ]
    },
    choice: {
      label: '선택',
      messages: [
        ['작게 손해 보는 선택이 크게 지키는 선택일 수 있습니다.', '지금은 체면보다 오래 남는 결과를 기준으로 보세요.'],
        ['새 길은 열려 있지만 조건표가 필요합니다.', '좋다 싫다보다 시간, 돈, 사람을 따로 계산하면 답이 보입니다.'],
        ['망설임은 나쁜 신호가 아닙니다.', '두려움 때문인지 정보가 부족해서인지 구분하면 마음이 정리됩니다.']
      ]
    }
  };

  const LUCK = ['말운', '문서운', '인연운', '금전운', '이동운', '회복운', '결정운'];
  const CAUTION = ['감정 섞인 답장', '늦은 밤 결정', '구두 약속', '충동 지출', '비교하는 말', '미뤄둔 확인'];

  function rand(max) {
    if (window.crypto && crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function activeTopic() {
    return document.querySelector('.intent-chip.active')?.dataset.topic || 'today';
  }

  function render(topicKey) {
    const topic = TOPICS[topicKey];
    const [headline, body] = topic.messages[rand(topic.messages.length)];
    const luck = LUCK[rand(LUCK.length)];
    const caution = CAUTION[rand(CAUTION.length)];
    const score = 55 + rand(42);
    const tone = score >= 84 ? '강한 상승운' : score >= 72 ? '열리는 운' : score >= 62 ? '조심스러운 안정운' : '정리운';
    $('#oracleResult').innerHTML = `
      <div class="r-block oracle-result-block">
        <h2 class="sec-title"><span>神</span>${esc(topic.label)} 신점</h2>
        <div class="oracle-message large">
          <span>${esc(tone)} · ${score}점</span>
          <strong>${esc(headline)}</strong>
          <p>${esc(body)}</p>
        </div>
        <div class="period-grid oracle-detail-grid">
          <div class="period-card"><strong>오늘 붙는 기운</strong><p>${esc(luck)}이 들어옵니다. 먼저 말하거나 먼저 정리하는 사람이 흐름을 가져갑니다.</p></div>
          <div class="period-card"><strong>조심할 것</strong><p>${esc(caution)}은 피하세요. 작은 확인이 큰 손해를 막습니다.</p></div>
          <div class="period-card"><strong>행동 한 가지</strong><p>오늘 안에 끝낼 수 있는 일 하나를 정해 마무리하면 다음 운이 빨라집니다.</p></div>
        </div>
        <div class="reader-link-row">
          <button class="btn-ghost" type="button" id="oracleAgain">다시 보기</button>
          <a class="btn-ghost" href="tarot.html">타로 3장 뽑기</a>
        </div>
      </div>`;
    $('#oracleResult').classList.remove('hidden');
    $('#oracleAgain').onclick = read;
  }

  function read() {
    try {
      const button = $('#readOracle');
      const gate = $('#oracleGate');
      const topic = activeTopic();
      button.disabled = true;
      $('#oracleResult').classList.add('hidden');
      gate.classList.remove('is-settled');
      gate.classList.add('is-reading');
      window.setTimeout(() => {
        gate.classList.remove('is-reading');
        gate.classList.add('is-settled');
        render(topic);
        button.disabled = false;
        $('#oracleResult').scrollIntoView({ behavior:'smooth', block:'start' });
      }, 950);
    } catch (err) {
      Sec.logError('oracle-read', err);
    }
  }

  document.querySelectorAll('.intent-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.intent-chip').forEach(item => item.classList.toggle('active', item === chip));
    });
  });

  $('#readOracle').addEventListener('click', read);
})();
