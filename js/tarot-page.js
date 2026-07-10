/* 운명연구소 — 타로 전용 리딩 */
(() => {
  const Sec = typeof MLSecurity !== 'undefined' ? MLSecurity : {
    escapeHtml: v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    logError: () => {}
  };
  const esc = Sec.escapeHtml;
  const $ = s => document.querySelector(s);

  const CARDS = [
    { no:'0', name:'바보', keys:'새 출발 · 자유 · 충동', up:'익숙한 길을 벗어날수록 새 가능성이 열립니다. 가볍게 시작하되 약속과 비용은 확인하세요.', rev:'준비 없이 뛰어들면 손해가 커집니다. 오늘은 한 번 더 묻고 확인하는 쪽이 낫습니다.' },
    { no:'I', name:'마법사', keys:'시작 · 말문 · 능력', up:'말을 꺼내고 제안하기 좋은 카드입니다. 이미 가진 도구를 꺼내 쓰면 흐름이 빠르게 움직입니다.', rev:'말과 행동이 어긋나기 쉽습니다. 보여주기보다 실제로 끝낼 수 있는 것부터 잡으세요.' },
    { no:'II', name:'여사제', keys:'직감 · 비밀 · 침묵', up:'겉으로 드러난 말보다 분위기와 반복되는 신호를 보세요. 아직은 조용히 관찰할 때입니다.', rev:'직감과 불안이 섞여 있습니다. 확인되지 않은 추측으로 결론을 내리지 마세요.' },
    { no:'III', name:'여황제', keys:'애정 · 풍요 · 회복', up:'받아들이고 키우는 운입니다. 관계에서는 다정한 표현, 일에서는 결과물을 보여주는 방식이 좋습니다.', rev:'정이 지나치면 부담이 됩니다. 챙김과 간섭의 선을 조절해야 합니다.' },
    { no:'IV', name:'황제', keys:'질서 · 책임 · 주도권', up:'원칙을 세우면 상황이 안정됩니다. 애매한 관계나 일은 기준을 정해 말하는 것이 유리합니다.', rev:'고집이 강해지면 흐름이 막힙니다. 이기는 말보다 정리되는 말을 택하세요.' },
    { no:'V', name:'교황', keys:'조언 · 약속 · 전통', up:'믿을 만한 사람의 조언이 길합니다. 문서, 절차, 예의를 지키면 평판이 올라갑니다.', rev:'남의 기준에 맞추느라 내 뜻을 잃기 쉽습니다. 조언은 참고하되 선택은 직접 하세요.' },
    { no:'VI', name:'연인', keys:'선택 · 끌림 · 관계', up:'마음이 움직이는 카드입니다. 관계에서는 솔직함, 선택에서는 오래 남는 쪽이 답입니다.', rev:'끌림만으로 결정하면 후회가 남습니다. 감정과 조건을 따로 놓고 보세요.' },
    { no:'VII', name:'전차', keys:'전진 · 연락 · 승부', up:'움직여야 열립니다. 연락, 지원, 방문처럼 실제 행동이 운을 끌어옵니다.', rev:'속도는 빠르지만 방향이 흔들립니다. 먼저 목표를 하나로 좁히세요.' },
    { no:'VIII', name:'힘', keys:'인내 · 설득 · 회복력', up:'부드럽게 버티는 힘이 강합니다. 정면충돌보다 차분한 설득이 이깁니다.', rev:'참는 척하다가 한 번에 터질 수 있습니다. 쌓인 감정을 짧게 풀어내세요.' },
    { no:'IX', name:'은둔자', keys:'거리 · 통찰 · 정리', up:'혼자 정리해야 보입니다. 잠깐 물러나 생각하면 다음 수가 또렷해집니다.', rev:'혼자만의 해석에 갇히기 쉽습니다. 최소한의 사실 확인은 필요합니다.' },
    { no:'X', name:'운명의 수레바퀴', keys:'변화 · 타이밍 · 반전', up:'흐름이 바뀝니다. 우연처럼 온 제안을 가볍게 넘기지 마세요.', rev:'변화가 오지만 아직 완전히 잡히지 않았습니다. 성급한 확정보다 유연함이 필요합니다.' },
    { no:'XI', name:'정의', keys:'균형 · 계약 · 판단', up:'공정하게 따지면 손해가 줄어듭니다. 계약, 약속, 일정 확인에 강한 카드입니다.', rev:'감정적으로 판단하면 균형이 무너집니다. 숫자와 기록을 남기세요.' },
    { no:'XII', name:'매달린 사람', keys:'대기 · 관점 전환 · 희생', up:'기다림에도 의미가 있습니다. 지금은 뒤집어 보면 답이 보이는 시기입니다.', rev:'필요 이상의 희생은 멈춰야 합니다. 미루는 일과 기다리는 일을 구분하세요.' },
    { no:'XIII', name:'죽음', keys:'종료 · 정리 · 새 국면', up:'끝내야 새 문이 열립니다. 관계나 일에서 오래 붙든 것을 정리할수록 가벼워집니다.', rev:'끝난 것을 붙잡아 흐름이 막힐 수 있습니다. 미련보다 회복을 먼저 보세요.' },
    { no:'XIV', name:'절제', keys:'조율 · 회복 · 중간길', up:'서두르지 않는 조율이 길합니다. 천천히 섞고 맞추면 관계와 일이 안정됩니다.', rev:'중간을 찾으려다 결정을 미룰 수 있습니다. 최소 기준은 정해두세요.' },
    { no:'XV', name:'악마', keys:'집착 · 욕망 · 반복', up:'강한 끌림이 있지만 대가도 보아야 합니다. 반복되는 패턴을 끊는 것이 관건입니다.', rev:'묶였던 감정에서 빠져나올 기회입니다. 끊어야 할 습관을 오늘 하나 줄이세요.' },
    { no:'XVI', name:'탑', keys:'충격 · 해체 · 진실', up:'숨긴 문제가 드러날 수 있습니다. 당황스럽지만 정리의 속도는 빨라집니다.', rev:'무너짐을 피하려다 더 오래 끌 수 있습니다. 작은 균열부터 인정하세요.' },
    { no:'XVII', name:'별', keys:'희망 · 회복 · 신뢰', up:'회복과 기대의 카드입니다. 작은 약속 하나가 다시 희망을 만듭니다.', rev:'희망은 있지만 체력이 부족합니다. 큰 기대보다 작은 루틴부터 회복하세요.' },
    { no:'XVIII', name:'달', keys:'불안 · 꿈 · 착각', up:'감정이 먼저 올라옵니다. 확신이 들 때까지 하루만 더 관찰하세요.', rev:'불안의 안개가 걷히는 중입니다. 말보다 사실을 붙잡으면 안정됩니다.' },
    { no:'XIX', name:'태양', keys:'공개 · 기쁨 · 활력', up:'관계와 일이 밝게 드러납니다. 숨기기보다 솔직히 말할수록 길합니다.', rev:'좋은 운이지만 과장하면 신뢰가 줄어듭니다. 밝되 정확하게 표현하세요.' },
    { no:'XX', name:'심판', keys:'소식 · 재회 · 각성', up:'다시 연락하거나 결론을 듣기 좋은 카드입니다. 묵혀 둔 일이 답을 찾습니다.', rev:'아직 최종 답을 내리기 이릅니다. 같은 문제를 다른 방식으로 다시 보세요.' },
    { no:'XXI', name:'세계', keys:'완성 · 결과 · 다음 단계', up:'마무리와 완성의 카드입니다. 끝내야 다음 문이 열립니다.', rev:'거의 다 왔지만 마지막 정리가 남았습니다. 작은 누락을 확인하세요.' }
  ];

  const INTENTS = {
    today: { label:'오늘의 흐름', positions:['현재 기운', '숨은 흐름', '오늘의 조언'], guide:'오늘은 카드가 말하는 순서를 그대로 따라가면 흐름이 잘 보입니다.' },
    love: { label:'연애 · 재회', positions:['관계의 현재', '상대와의 거리', '다음 행동'], guide:'관계운은 감정보다 타이밍이 중요합니다. 세 번째 카드의 조언을 가장 무겁게 보세요.' },
    mind: { label:'상대 속마음', positions:['겉으로 보이는 태도', '속으로 남은 마음', '내가 취할 태도'], guide:'속마음 리딩은 확정이 아니라 분위기의 해석입니다. 확인된 행동과 함께 보세요.' },
    work: { label:'일 · 돈', positions:['현재 상황', '막힌 원인', '실행 포인트'], guide:'일과 돈은 카드의 감정보다 행동 지시가 중요합니다. 오늘 바로 처리할 수 있는 일을 하나 고르세요.' }
  };

  function rand(max) {
    if (window.crypto && crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function pickCards() {
    const pool = [...CARDS];
    const picked = [];
    for (let i = 0; i < 3; i++) {
      const idx = rand(pool.length);
      picked.push({ ...pool.splice(idx, 1)[0], reversed: rand(100) < 32 });
    }
    return picked;
  }

  function activeIntent() {
    return document.querySelector('.intent-chip.active')?.dataset.intent || 'today';
  }

  function resetSlots() {
    $('#tarotSlots').innerHTML = `
      <div class="tarot-slot empty"><span>현재</span></div>
      <div class="tarot-slot empty"><span>숨은 흐름</span></div>
      <div class="tarot-slot empty"><span>조언</span></div>`;
  }

  function setStageDrawing() {
    const stage = $('#tarotStage');
    stage.classList.remove('is-settled');
    stage.classList.add('is-drawing');
    stage.innerHTML = `
      <div class="deck-stack" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <i class="motion-card motion-one" aria-hidden="true"></i>
      <i class="motion-card motion-two" aria-hidden="true"></i>
      <i class="motion-card motion-three" aria-hidden="true"></i>
      <p class="table-hint">카드를 섞는 중입니다.</p>`;
  }

  function renderSlots(cards, intent) {
    const labels = INTENTS[intent].positions;
    $('#tarotSlots').innerHTML = cards.map((card, index) => `
      <article class="tarot-slot tarot-slot-card revealed">
        <span>${esc(labels[index])}</span>
        <div class="tarot-card-face ${card.reversed ? 'reversed' : ''}">
          <small>${esc(card.no)}</small>
          <strong>${esc(card.name)}</strong>
          <em>${card.reversed ? '역방향' : '정방향'}</em>
        </div>
      </article>`).join('');
  }

  function renderResult(cards, intent) {
    const info = INTENTS[intent];
    const score = 58 + rand(39);
    const summary = score >= 84 ? '강하게 움직여도 좋은 흐름입니다.' :
                    score >= 72 ? '기회가 있지만 속도 조절이 필요합니다.' :
                    score >= 62 ? '무난한 흐름 속에서 작은 선택이 중요합니다.' :
                                  '서두르기보다 감정과 사실을 분리해야 합니다.';
    $('#tarotResult').innerHTML = `
      <div class="r-block tarot-result-block">
        <h2 class="sec-title"><span>占</span>${esc(info.label)} 리딩</h2>
        <div class="fortune-hero">
          <div>
            <span class="fortune-kicker">3 CARD SPREAD</span>
            <h4>오늘의 타로 점수 ${score}점</h4>
            <p>${esc(summary)} ${esc(info.guide)}</p>
          </div>
          <button class="btn-ghost" type="button" id="drawAgain">다시 뽑기</button>
        </div>
        <div class="tarot-result-grid">
          ${cards.map((card, index) => {
            const text = card.reversed ? card.rev : card.up;
            return `<article class="tarot-result-card">
              <span>${esc(info.positions[index])}</span>
              <h3>${esc(card.name)} <small>${card.reversed ? '역방향' : '정방향'}</small></h3>
              <p class="tarot-keys">${esc(card.keys)}</p>
              <p>${esc(text)}</p>
            </article>`;
          }).join('')}
        </div>
      </div>`;
    $('#tarotResult').classList.remove('hidden');
    $('#drawAgain').onclick = draw;
  }

  function settleStage() {
    const stage = $('#tarotStage');
    stage.classList.remove('is-drawing');
    stage.classList.add('is-settled');
    stage.innerHTML = `
      <div class="deck-stack settled" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <p class="table-hint">카드가 펼쳐졌습니다.</p>`;
  }

  function draw() {
    try {
      const button = $('#drawTarot');
      const intent = activeIntent();
      const cards = pickCards();
      button.disabled = true;
      $('#tarotResult').classList.add('hidden');
      resetSlots();
      setStageDrawing();
      window.setTimeout(() => {
        settleStage();
        renderSlots(cards, intent);
        renderResult(cards, intent);
        button.disabled = false;
        $('#tarotResult').scrollIntoView({ behavior:'smooth', block:'start' });
      }, 1250);
    } catch (err) {
      Sec.logError('tarot-draw', err);
    }
  }

  document.querySelectorAll('.intent-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.intent-chip').forEach(item => item.classList.toggle('active', item === chip));
    });
  });

  $('#drawTarot').addEventListener('click', draw);
})();
