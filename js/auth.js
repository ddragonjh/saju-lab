/* ═══════════════════════════════════════════════════════
   운명연구소 — 회원 시스템 (서버리스 · localStorage)
   개인정보는 사용자 브라우저에만 저장되며 외부로 전송되지 않음
   ═══════════════════════════════════════════════════════ */
const MLAuth = (() => {
  const USERS_KEY = 'ml_users_v1', SESSION_KEY = 'ml_session_v1';
  const Sec = typeof MLSecurity !== 'undefined' ? MLSecurity : {
    escapeHtml: v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    normalizeName: v => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 12),
    normalizeEmail: v => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().toLowerCase().slice(0, 254),
    normalizeSession: v => v && typeof v === 'object' && !Array.isArray(v) ? { email:String(v.email ?? '').trim().toLowerCase(), name:String(v.name ?? '').trim().slice(0, 12) } : null,
    isPlainObject: v => !!v && typeof v === 'object' && !Array.isArray(v),
    logError: () => {}
  };

  const isEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const normalizeCode = code => String(code ?? '').trim().toUpperCase().replace(/\s+/g, '');

  const getUsers = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
      return Sec.isPlainObject(parsed) ? parsed : {};
    } catch(err) {
      Sec.logError('get-users', err);
      return {};
    }
  };
  const saveUsers = u => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(u));
      return true;
    } catch(err) {
      Sec.logError('save-users', err);
      return false;
    }
  };
  const session = () => {
    try {
      const s = Sec.normalizeSession(JSON.parse(localStorage.getItem(SESSION_KEY)));
      if (!s || !isEmail(s.email)) return null;
      return s;
    } catch(err) {
      Sec.logError('session', err);
      return null;
    }
  };
  const saveSession = s => {
    try {
      const normalized = Sec.normalizeSession(s);
      if (!normalized || !isEmail(normalized.email)) return false;
      localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
      return true;
    } catch(err) {
      Sec.logError('save-session', err);
      return false;
    }
  };

  async function hash(str){
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ml-salt::'+str));
      return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    let h = 5381; for (let i=0;i<str.length;i++) h = ((h<<5)+h+str.charCodeAt(i))|0;
    return 'x'+(h>>>0).toString(16);
  }

  const TERMS_SERVICE = `제1조 (목적) 본 약관은 운명연구소가 제공하는 사주·타로·신점·별자리 참고 콘텐츠 이용 조건을 정합니다.
제2조 (서비스의 성격) 모든 결과는 오락·자기이해용 참고 콘텐츠이며 의료·법률·투자·진로 판단을 대체하지 않습니다.
제3조 (로컬 계정) 현재 계정은 서버 회원가입이 아니라 이 기기 브라우저 localStorage에만 저장되는 로컬 계정입니다. 다른 기기나 브라우저에서는 계정이 공유되지 않습니다.
제4조 (연령 제한) 만 14세 미만 이용자는 로컬 계정 생성과 프리미엄 결제를 할 수 없습니다. 미성년자는 법정대리인 동의 없이 유료 이용권을 구매하지 않아야 합니다.
제5조 (유료 이용권) 프리미엄 이용권은 결제 전 제공 내용, 가격, 코드 발급 방식, 환불 조건, 고객센터 이메일을 고지한 뒤 발급합니다.
제6조 (콘텐츠 이용) 서비스의 텍스트·디자인·코드는 개인적 이용 범위를 넘는 무단 복제·판매를 금합니다.`;

  const TERMS_PRIVACY = `1. 수집 항목: 이름(선택), 이메일, 비밀번호 해시, 로컬 계정 상태, 프리미엄 등록 여부.
2. 처리 목적: 이 기기에서 심층 해석 잠금 해제, 프리미엄 이용권 상태 표시, 오늘의 운세 확인 상태 표시.
3. 저장 위치: 모든 저장 정보는 이용자의 브라우저 localStorage에만 저장되며 외부 서버로 전송되지 않습니다.
4. 보유 기간: 이용자가 이 기기의 사이트 데이터를 삭제하거나 저장 정보 삭제 기능을 실행할 때까지입니다.
5. 제3자 제공: 없습니다.
6. 외부 리소스: Google Fonts 외부 호출은 제거했으며 같은 도메인의 정적 파일을 사용합니다.
7. 문의: ddragonjh@gmail.com`;

  // ── 모달 주입 ──
  function injectModal(){
    const wrap = document.createElement('div');
    wrap.id = 'authModal'; wrap.className = 'auth-overlay hidden';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'authTitle');
    wrap.innerHTML = `
    <div class="auth-box">
      <button class="auth-close" aria-label="닫기">×</button>
      <h2 class="sec-title" id="authTitle"><span>鍵</span>로컬 계정</h2>
      <p class="auth-note">이 계정은 서버 회원가입이 아니라 이 기기에만 저장되는 로컬 계정입니다.</p>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">로그인</button>
        <button class="auth-tab" data-tab="signup">로컬 계정 만들기</button>
      </div>

      <form class="auth-pane" id="paneLogin">
        <label for="loginEmail">이메일</label><input type="email" id="loginEmail" required placeholder="you@example.com">
        <label for="loginPw">비밀번호</label><input type="password" id="loginPw" required minlength="6" placeholder="••••••">
        <p class="auth-err" id="loginErr" aria-live="polite"></p>
        <button type="submit" class="btn-gold auth-submit">이 기기 로컬 계정 로그인</button>
      </form>

      <form class="auth-pane hidden" id="paneSignup">
        <label for="suName">이름 <small>(해석 결과에 표시)</small></label><input type="text" id="suName" maxlength="12" placeholder="홍길동">
        <label for="suEmail">이메일</label><input type="email" id="suEmail" required placeholder="you@example.com">
        <label for="suPw">비밀번호 <small>(6자 이상)</small></label><input type="password" id="suPw" required minlength="6" placeholder="••••••">
        <div class="terms-box">
          <label class="chk"><input type="checkbox" class="agree" id="agreeSvc" required> <span>[필수] 이용약관 동의</span> <a class="terms-link" href="terms.html" target="_blank" rel="noopener">전문 보기</a></label>
          <label class="chk"><input type="checkbox" class="agree" id="agreePriv" required> <span>[필수] 개인정보 수집·이용 동의</span> <a class="terms-link" href="privacy.html" target="_blank" rel="noopener">전문 보기</a></label>
          <label class="chk"><input type="checkbox" class="agree" id="agreeAge" required> <span>[필수] 만 14세 이상이며, 미성년자는 유료 결제 전 법정대리인 동의가 필요함을 확인</span></label>
          <label class="chk"><input type="checkbox" class="agree" id="agreeMkt"> <span>[선택] 마케팅 정보 수신 동의</span></label>
        </div>
        <p class="auth-err" id="suErr" aria-live="polite"></p>
        <button type="submit" class="btn-gold auth-submit">이 기기에 로컬 계정 만들기</button>
        <p class="auth-note">이메일과 비밀번호 해시는 이 기기 localStorage에만 저장됩니다. 서버로 전송되지 않습니다.</p>
      </form>
    </div>`;
    document.body.appendChild(wrap);

    const show = t => {
      wrap.querySelectorAll('.auth-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===t));
      wrap.querySelector('#paneLogin').classList.toggle('hidden', t!=='login');
      wrap.querySelector('#paneSignup').classList.toggle('hidden', t!=='signup');
      window.setTimeout(focusFirst, 0);
    };
    wrap.querySelectorAll('.auth-tab').forEach(b=>b.onclick=()=>show(b.dataset.tab));
    wrap.querySelector('.auth-close').onclick = close;
    wrap.onclick = e => { if (e.target===wrap) close(); };
    wrap.addEventListener('keydown', trapFocus);

    // 회원가입
    wrap.querySelector('#paneSignup').onsubmit = async e => {
      e.preventDefault();
      const err = wrap.querySelector('#suErr');
      err.textContent = '';
      if (!wrap.querySelector('#agreeSvc').checked || !wrap.querySelector('#agreePriv').checked || !wrap.querySelector('#agreeAge').checked)
        return err.textContent = '필수 약관에 동의해 주세요.';
      try {
        const name = Sec.normalizeName(wrap.querySelector('#suName').value);
        const email = Sec.normalizeEmail(wrap.querySelector('#suEmail').value);
        const password = wrap.querySelector('#suPw').value;
        if (!isEmail(email)) return err.textContent = '이메일 형식을 확인해 주세요.';
        if (password.length < 6) return err.textContent = '비밀번호는 6자 이상 입력해 주세요.';
        const users = getUsers();
        if (users[email]) return err.textContent = '이미 가입된 이메일입니다. 로그인해 주세요.';
        users[email] = {
          name,
          pw: await hash(password),
          mkt: wrap.querySelector('#agreeMkt').checked,
          ageConfirmed: true,
          joined: new Date().toISOString()
        };
        if (!saveUsers(users) || !saveSession({email, name}))
          return err.textContent = '브라우저 저장 공간에 계정을 저장하지 못했습니다. 사이트 데이터/저장소 설정을 확인해 주세요.';
        close(); notify();
      } catch (error) {
        Sec.logError('signup', error);
        err.textContent = '가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      }
    };

    // 로그인
    wrap.querySelector('#paneLogin').onsubmit = async e => {
      e.preventDefault();
      const err = wrap.querySelector('#loginErr');
      err.textContent = '';
      try {
        const email = Sec.normalizeEmail(wrap.querySelector('#loginEmail').value);
        if (!isEmail(email)) return err.textContent = '이메일 형식을 확인해 주세요.';
        const users = getUsers();
        const u = users[email];
        if (!Sec.isPlainObject(u)) return err.textContent = '이 기기에 저장된 로컬 계정이 없습니다. 로컬 계정 만들기 탭을 이용해 주세요.';
        if (u.pw !== await hash(wrap.querySelector('#loginPw').value))
          return err.textContent = '비밀번호가 일치하지 않습니다.';
        if (!saveSession({email, name:Sec.normalizeName(u.name)}))
          return err.textContent = '브라우저 저장 공간에 로그인 정보를 저장하지 못했습니다.';
        close(); notify();
      } catch (error) {
        Sec.logError('login', error);
        err.textContent = '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      }
    };
    return wrap;
  }

  let modal = null;
  let lastFocus = null;
  function focusable(root) {
    return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.closest('.hidden') && el.offsetParent !== null);
  }
  function focusFirst() {
    if (!modal || modal.classList.contains('hidden')) return;
    const pane = modal.querySelector('.auth-pane:not(.hidden)');
    const target = pane?.querySelector('input:not([disabled])') || modal.querySelector('.auth-close');
    if (target) target.focus();
  }
  function trapFocus(event) {
    if (!modal || modal.classList.contains('hidden')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusable(modal);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function open(tab){
    if (!modal) modal = injectModal();
    lastFocus = document.activeElement;
    modal.classList.remove('hidden');
    // 뒤 배경 스크롤 잠금 — 모달 내부만 스크롤되도록
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (tab) modal.querySelector(`.auth-tab[data-tab=${tab}]`).click();
    window.setTimeout(focusFirst, 0);
  }
  function close(){
    if (modal) modal.classList.add('hidden');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  function logout(){ localStorage.removeItem(SESSION_KEY); notify(); }
  function notify(){ renderHeader(); document.dispatchEvent(new CustomEvent('auth-changed')); }

  // ── 헤더 버튼 ──
  function renderHeader(){
    let slot = document.getElementById('authSlot');
    if (!slot){
      slot = document.createElement('span'); slot.id = 'authSlot';
      document.querySelector('.topnav').appendChild(slot);
    }
    const s = session();
    const label = s ? Sec.escapeHtml(s.name || s.email.split('@')[0]) : '';
    slot.innerHTML = s
      ? `<span class="auth-hello">${label}님</span> <a href="#" id="logoutBtn">로컬 계정 로그아웃</a>`
      : `<a href="#" id="loginBtn" class="auth-cta">로컬 계정 로그인</a>`;
    const lb = document.getElementById('loginBtn'); if (lb) lb.onclick = e=>{e.preventDefault(); open('login');};
    const lo = document.getElementById('logoutBtn'); if (lo) lo.onclick = e=>{e.preventDefault(); logout();};
  }
  document.addEventListener('DOMContentLoaded', renderHeader);

  // ── 프리미엄 이용권 ──
  function isPremium(){
    const s = session(); if (!s) return false;
    const u = getUsers()[s.email];
    return !!(Sec.isPlainObject(u) && u.premium);
  }
  async function redeem(code){
    try {
      const s = session(); if (!s) return false;
      const normalized = normalizeCode(code);
      if (!/^UML-[A-F0-9]{24}$/.test(normalized)) return false;
      if (typeof PREMIUM_HASHES === 'undefined' || !Array.isArray(PREMIUM_HASHES)) return false;
      const h = await hash(normalized);
      if (!PREMIUM_HASHES.includes(h)) return false;
      const users = getUsers();
      if (!Sec.isPlainObject(users[s.email])) return false;
      users[s.email].premium = true;
      users[s.email].premiumAt = new Date().toISOString();
      if (!saveUsers(users)) return false;
      notify();
      return true;
    } catch (error) {
      Sec.logError('redeem', error);
      return false;
    }
  }

  return { open, close, logout, isLoggedIn:()=>!!session(), user:session, isPremium, redeem };
})();
