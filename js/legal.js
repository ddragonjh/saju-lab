/* 운명연구소 — 법적 고지와 로컬 저장소 관리 */
const MLLegal = (() => {
  const SUPPORT_EMAIL = 'ddragonjh@gmail.com';
  const STORAGE_KEYS = [
    'ml_users_v1',
    'ml_session_v1'
  ];

  function clearLocalData() {
    try {
      STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
      Object.keys(localStorage)
        .filter(key => key.startsWith('ml_daily_'))
        .forEach(key => localStorage.removeItem(key));
      document.dispatchEvent(new CustomEvent('auth-changed'));
      return true;
    } catch (err) {
      if (typeof MLSecurity !== 'undefined') MLSecurity.logError('clear-local-data', err);
      return false;
    }
  }

  function bindClearButtons() {
    document.querySelectorAll('[data-clear-local]').forEach(button => {
      if (button.dataset.clearBound) return;
      button.dataset.clearBound = '1';
      button.addEventListener('click', event => {
        event.preventDefault();
        const ok = clearLocalData();
        button.textContent = ok ? '저장 정보 삭제 완료' : '삭제 실패: 브라우저 설정 확인';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', bindClearButtons);
  document.addEventListener('auth-changed', bindClearButtons);

  return { SUPPORT_EMAIL, clearLocalData, bindClearButtons };
})();
