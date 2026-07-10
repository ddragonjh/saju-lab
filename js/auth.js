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

  const TERMS_SERVICE = `제1조 (목적) 본 약관은 운명연구소(이하 "서비스")가 제공하는 사주 해석 콘텐츠 이용에 관한 조건과 절차를 규정합니다.
제2조 (서비스의 성격) 본 서비스의 모든 해석은 명리학 이론에 기반한 오락·자기이해 목적의 참고 콘텐츠이며, 의료·법률·투자 등 전문적 판단을 대체하지 않습니다. 해석 결과로 인한 의사결정의 책임은 이용자 본인에게 있습니다.
제3조 (계정) 이용자는 정확한 정보로 가입해야 하며, 계정 정보 관리 책임은 본인에게 있습니다. 타인의 정보 도용 시 서비스 이용이 제한될 수 있습니다.
제4조 (콘텐츠 이용) 서비스가 제공하는 해석 텍스트·디자인의 저작권은 서비스에 있으며, 개인적 이용 범위를 넘는 무단 복제·판매를 금합니다.
제5조 (서비스 변경) 서비스는 콘텐츠 개선을 위해 해석 알고리즘과 화면을 사전 고지 없이 변경할 수 있습니다.
제6조 (면책) 천문 근사 계산의 특성상 절기 경계 출생 등 일부 사례에서 만세력 결과가 달라질 수 있으며, 서비스는 이에 대한 참고 고지를 제공합니다.`;

  const TERMS_PRIVACY = `1. 수집 항목: 이름(선택), 이메일, 비밀번호(암호화 저장), 생년월일시·성별(사주 계산 목적).
2. 저장 방식: 모든 정보는 이용자의 브라우저(localStorage)에만 저장되며, 외부 서버로 전송·수집되지 않습니다. 서비스 운영자를 포함한 제3자는 이용자의 정보에 접근할 수 없습니다.
3. 비밀번호: SHA-256 단방향 암호화로 저장되어 원문을 알 수 없습니다.
4. 보유 기간: 이용자가 브라우저 데이터를 삭제하거나 회원 탈퇴 시 즉시 파기됩니다.
5. 제3자 제공: 없음. 광고·마케팅 목적의 외부 제공을 하지 않습니다.
6. 이용자 권리: 브라우저 설정(사이트 데이터 삭제)으로 언제든 모든 정보를 완전히 삭제할 수 있습니다.
7. 유의: 공용 PC에서는 로그아웃 및 브라우저 데이터 삭제를 권장합니다.`;

  // ── 모달 주입 ──
  function injectModal(){
    const wrap = document.createElement('div');
    wrap.id = 'authModal'; wrap.className = 'auth-overlay hidden';
    wrap.innerHTML = `
    <div class="auth-box">
      <button class="auth-close" aria-label="닫기">×</button>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">로그인</button>
        <button class="auth-tab" data-tab="signup">회원가입</button>
      </div>

      <form class="auth-pane" id="paneLogin">
        <label>이메일<input type="email" id="loginEmail" required placeholder="you@example.com"></label>
        <label>비밀번호<input type="password" id="loginPw" required minlength="6" placeholder="••••••"></label>
        <p class="auth-err" id="loginErr"></p>
        <button type="submit" class="btn-gold auth-submit">로그인</button>
      </form>

      <form class="auth-pane hidden" id="paneSignup">
        <label>이름 <small>(해석 결과에 표시)</small><input type="text" id="suName" maxlength="12" placeholder="홍길동"></label>
        <label>이메일<input type="email" id="suEmail" required placeholder="you@example.com"></label>
        <label>비밀번호 <small>(6자 이상)</small><input type="password" id="suPw" required minlength="6" placeholder="••••••"></label>
        <div class="terms-box">
          <label class="chk"><input type="checkbox" id="agreeAll"> <strong>전체 동의</strong></label>
          <hr>
          <label class="chk"><input type="checkbox" class="agree" id="agreeSvc" required> [필수] 이용약관 동의 <a href="#" data-terms="svc">전문 보기</a></label>
          <label class="chk"><input type="checkbox" class="agree" id="agreePriv" required> [필수] 개인정보 처리방침 동의 <a href="#" data-terms="priv">전문 보기</a></label>
          <label class="chk"><input type="checkbox" class="agree" id="agreeMkt"> [선택] 새 운세 콘텐츠 소식 받기</label>
          <div class="terms-full hidden" id="termsFull"><h4 id="termsTitle"></h4><pre id="termsBody"></pre></div>
        </div>
        <p class="auth-err" id="suErr"></p>
        <button type="submit" class="btn-gold auth-submit">가입하고 전체 해석 보기</button>
        <p class="auth-note">※ 모든 정보는 회원님의 브라우저에만 저장되며 서버로 전송되지 않습니다.</p>
      </form>
    </div>`;
    document.body.appendChild(wrap);

    const show = t => {
      wrap.querySelectorAll('.auth-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===t));
      wrap.querySelector('#paneLogin').classList.toggle('hidden', t!=='login');
      wrap.querySelector('#paneSignup').classList.toggle('hidden', t!=='signup');
    };
    wrap.querySelectorAll('.auth-tab').forEach(b=>b.onclick=()=>show(b.dataset.tab));
    wrap.querySelector('.auth-close').onclick = close;
    wrap.onclick = e => { if (e.target===wrap) close(); };

    // 약관 전문 토글
    wrap.querySelectorAll('[data-terms]').forEach(a=>a.onclick = e=>{
      e.preventDefault();
      const full = wrap.querySelector('#termsFull');
      wrap.querySelector('#termsTitle').textContent = a.dataset.terms==='svc' ? '이용약관' : '개인정보 처리방침';
      wrap.querySelector('#termsBody').textContent = a.dataset.terms==='svc' ? TERMS_SERVICE : TERMS_PRIVACY;
      full.classList.remove('hidden');
    });
    wrap.querySelector('#agreeAll').onchange = e =>
      wrap.querySelectorAll('.agree, #agreeMkt').forEach(c=>c.checked=e.target.checked);

    // 회원가입
    wrap.querySelector('#paneSignup').onsubmit = async e => {
      e.preventDefault();
      const err = wrap.querySelector('#suErr');
      err.textContent = '';
      if (!wrap.querySelector('#agreeSvc').checked || !wrap.querySelector('#agreePriv').checked)
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
        if (!Sec.isPlainObject(u)) return err.textContent = '가입 정보가 없습니다. 회원가입 탭을 이용해 주세요.';
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
  function open(tab){
    if (!modal) modal = injectModal();
    modal.classList.remove('hidden');
    // 뒤 배경 스크롤 잠금 — 모달 내부만 스크롤되도록
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (tab) modal.querySelector(`.auth-tab[data-tab=${tab}]`).click();
  }
  function close(){
    if (modal) modal.classList.add('hidden');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
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
      ? `<span class="auth-hello">${label}님</span> <a href="#" id="logoutBtn">로그아웃</a>`
      : `<a href="#" id="loginBtn" class="auth-cta">로그인 · 회원가입</a>`;
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
