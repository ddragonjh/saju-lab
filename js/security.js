/* Shared output encoding and small validation helpers. */
const MLSecurity = (() => {
  const ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ENTITIES[ch]);
  }

  function stripControl(value) {
    return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '');
  }

  function normalizeName(value) {
    return stripControl(value).trim().slice(0, 12);
  }

  function normalizeEmail(value) {
    return stripControl(value).trim().toLowerCase().slice(0, 254);
  }

  function normalizeSession(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const email = normalizeEmail(value.email);
    if (!email || !email.includes('@')) return null;
    return { email, name: normalizeName(value.name) };
  }

  function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function percent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function logError(scope, error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[${scope}]`, error);
    }
  }

  return { escapeHtml, normalizeName, normalizeEmail, normalizeSession, isPlainObject, percent, logError };
})();
