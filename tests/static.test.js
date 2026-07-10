const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function loadSaju() {
  const context = { console, Date, Math, RangeError, Number, String, Object, Set };
  vm.createContext(context);
  vm.runInContext(read('js/engine.js') + '\nglobalThis.SAJU = SAJU;', context);
  return context.SAJU;
}

function testMetadata() {
  const pages = ['index.html','tarot.html','sinjeom.html','zodiac.html','privacy.html','terms.html','refund.html','business.html','404.html'];
  for (const page of pages) {
    const html = read(page);
    assert(html.includes('rel="icon"'), `${page} favicon missing`);
    assert(html.includes('rel="manifest"'), `${page} manifest missing`);
    assert(!html.includes('fonts.googleapis.com'), `${page} still loads Google Fonts`);
    assert(!html.includes('onclick='), `${page} has inline onclick`);
  }
  assert(read('robots.txt').includes('sitemap.xml'));
  assert(read('sitemap.xml').includes('privacy.html'));
}

function testLegalCopy() {
  const privacy = read('privacy.html');
  ['수집 항목','처리 목적','localStorage','보유 기간','제3자 제공','ddragonjh@gmail.com','Google Fonts'].forEach(term => {
    assert(privacy.includes(term), `privacy missing ${term}`);
  });
  const refund = read('refund.html');
  ['9,900원','이용권 코드','청약철회','만 14세'].forEach(term => assert(refund.includes(term), `refund missing ${term}`));
}

function testEngineBoundaries() {
  const SAJU = loadSaju();
  const base = { year:2024, month:1, day:1, hour:23, minute:30, gender:'M', unknownTime:false, trueSolar:false };
  const earlyZi = SAJU.compute({ ...base, dayBoundary:'23' });
  const midnight = SAJU.compute({ ...base, dayBoundary:'0' });
  assert.notStrictEqual(earlyZi.dayP.idx, midnight.dayP.idx, '23시/0시 자시 기준 should differ');
  assert.doesNotThrow(() => SAJU.compute({ year:2024, month:2, day:29, hour:0, minute:0, gender:'F', unknownTime:false, trueSolar:false, dayBoundary:'23' }));
  assert.strictEqual(SAJU.compute({ year:2024, month:5, day:1, hour:12, minute:0, gender:'F', unknownTime:true, trueSolar:false, dayBoundary:'23' }).hourP, null);
  assert.throws(() => SAJU.compute({ year:2023, month:2, day:29, hour:12, minute:0, gender:'M', unknownTime:false, trueSolar:false, dayBoundary:'23' }), /존재하지 않는 날짜/);
  assert.throws(() => SAJU.compute({ year:1929, month:12, day:31, hour:12, minute:0, gender:'M', unknownTime:false, trueSolar:false, dayBoundary:'23' }), /1930/);
  assert.throws(() => SAJU.compute({ year:2036, month:1, day:1, hour:12, minute:0, gender:'M', unknownTime:false, trueSolar:false, dayBoundary:'23' }), /2035/);
  const beforeIpchun = SAJU.compute({ year:2024, month:2, day:3, hour:12, minute:0, gender:'M', unknownTime:false, trueSolar:false, dayBoundary:'23' });
  const afterIpchun = SAJU.compute({ year:2024, month:2, day:5, hour:12, minute:0, gender:'M', unknownTime:false, trueSolar:false, dayBoundary:'23' });
  assert.notStrictEqual(beforeIpchun.sajuYear, afterIpchun.sajuYear, 'ipchun year boundary should change');
}

function testSecurityText() {
  const index = read('index.html');
  assert(index.includes('data-clear-local'), 'localStorage delete control missing');
  assert(index.includes('오락·자기이해용 참고 콘텐츠'), 'content notice missing');
  assert(read('js/auth.js').includes('로컬 계정'), 'local account copy missing');
  assert(read('js/legal.js').includes('localStorage'), 'localStorage clear helper missing');
  assert(!read('js/premium.js').includes('__lastPremiumResult'), 'premium result leaked to global');
}

testMetadata();
testLegalCopy();
testEngineBoundaries();
testSecurityText();
console.log('static tests passed');
