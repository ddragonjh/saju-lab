/* ═══════════════════════════════════════════════════════════════
   운명연구소 숏츠 팩토리
   신경망 TTS(Edge ko-KR-SunHiNeural) + 장면별 프로시저럴 배경 +
   ffmpeg 인코딩 → 1080x1920 30fps MP4
   사용법:  node render.js ep01   |   node render.js all
   ═══════════════════════════════════════════════════════════════ */
const path = require('path'), fs = require('fs');
const { spawn, execFileSync } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const EPISODES = require('./episodes');

const FFDIR = 'C:/Users/User/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin';
const FFMPEG = FFDIR + '/ffmpeg.exe', FFPROBE = FFDIR + '/ffprobe.exe';
const OUT_DIR = path.join(__dirname, '..', 'output');
const TMP_DIR = path.join(__dirname, 'tmp');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

GlobalFonts.registerFromPath('C:/Windows/Fonts/batang.ttc', 'BatangKR');
GlobalFonts.registerFromPath('C:/Windows/Fonts/malgunbd.ttf', 'MalgunB');
GlobalFonts.registerFromPath('C:/Windows/Fonts/malgun.ttf', 'MalgunR');

const W = 1080, H = 1920, FPS = 30;
const GOLD = '#e8cf9a', GOLD_D = '#c9a86a', IVORY = '#efe9db', DIM = '#9a97a8';
const CTA_SCENE = { text: '내 사주, 10초 무료 해석\n▲ 프로필 링크 클릭', narr: '내 사주가 궁금하다면, 프로필 링크에서 무료로 확인해 보세요.' };

// ── 유틸 ──
const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const clamp01 = t => Math.min(1, Math.max(0, t));

// ── TTS ──
async function synth(text, file) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('ko-KR-SunHiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const res = await tts.toStream(text);
  const stream = res.audioStream || res;
  await new Promise((ok, bad) => {
    const w = fs.createWriteStream(file);
    stream.pipe(w); w.on('finish', ok); w.on('error', bad); stream.on('error', bad);
  });
  tts.close && tts.close();
  return parseFloat(execFileSync(FFPROBE, ['-v','quiet','-show_entries','format=duration','-of','csv=p=0', file]).toString());
}

// ── 배경 6종 ──
function bgBase(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function stars(ctx, seed, n, t) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, s = r() * 2.2 + .6, tw = r() * 6;
    ctx.fillStyle = `rgba(255,240,210,${.15 + .5 * Math.abs(Math.sin(t * 1.3 + tw))})`;
    ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
  }
}
function vignette(ctx) {
  const g = ctx.createRadialGradient(W/2, H/2, H*0.32, W/2, H/2, H*0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function glowCircle(ctx, x, y, r, inner, outer) {
  const g = ctx.createRadialGradient(x, y, r*0.05, x, y, r);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

const BGS = [
  function moonNight(ctx, t, seed) {                       // 달밤
    bgBase(ctx, '#131734', '#0a0710');
    stars(ctx, seed, 90, t);
    const my = 360 - t * 6;
    glowCircle(ctx, W-240, my, 320, 'rgba(232,207,154,.9)', 'rgba(232,207,154,0)');
    ctx.fillStyle = '#f3e3bb'; ctx.beginPath(); ctx.arc(W-240, my, 95, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(19,23,52,.55)';
    for (let i=0;i<3;i++){ const y=520+i*90+t*10; ctx.beginPath(); ctx.ellipse(200+i*300+t*14, y, 340, 34, 0, 0, 7); ctx.fill(); }
  },
  function duskFire(ctx, t, seed) {                        // 붉은 황혼
    bgBase(ctx, '#2a1016', '#0b0d17');
    stars(ctx, seed, 45, t);
    glowCircle(ctx, W/2, 1450, 560, 'rgba(224,113,90,.55)', 'rgba(224,113,90,0)');
    ctx.fillStyle = '#e08a5a'; ctx.beginPath(); ctx.arc(W/2, 1500 - t*8, 150, 0, 7); ctx.fill();
    ctx.fillStyle = '#120a10';
    ctx.beginPath(); ctx.moveTo(0, 1620);
    for (let x=0;x<=W;x+=40) ctx.lineTo(x, 1620 - Math.sin(x*.008+2)*90 - Math.sin(x*.02)*30);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  },
  function zodiacRing(ctx, t, seed) {                      // 12지신 링
    bgBase(ctx, '#101226', '#090711');
    stars(ctx, seed, 60, t);
    const cx = W/2, cy = H/2, R = 560;
    glowCircle(ctx, cx, cy, 640, 'rgba(201,168,106,.14)', 'rgba(201,168,106,0)');
    ctx.strokeStyle = 'rgba(201,168,106,.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R-70, 0, 7); ctx.stroke();
    const HANJA = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    ctx.font = '52px BatangKR'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    HANJA.forEach((h, i) => {
      const a = i/12*Math.PI*2 + t*0.10;
      ctx.fillStyle = 'rgba(232,207,154,.4)';
      ctx.fillText(h, cx + Math.cos(a)*(R-35), cy + Math.sin(a)*(R-35));
    });
  },
  function candle(ctx, t, seed) {                          // 촛불
    bgBase(ctx, '#150f0a', '#070508');
    const fx = W/2, fy = 1360, fl = Math.sin(t*13)*8 + Math.sin(t*29)*4;
    glowCircle(ctx, fx, fy-40, 480 + fl*3, 'rgba(240,170,80,.30)', 'rgba(240,170,80,0)');
    glowCircle(ctx, fx+fl*.6, fy-60, 120, 'rgba(255,220,150,.95)', 'rgba(255,160,60,0)');
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath(); ctx.ellipse(fx+fl*.5, fy-70, 22, 55 + fl, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a2019'; ctx.fillRect(fx-55, fy, 110, 260);
    ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(fx-55, fy, 24, 260);
    stars(ctx, seed, 25, t);
  },
  function inkMountains(ctx, t, seed) {                    // 수묵 산세
    bgBase(ctx, '#0f1524', '#080a14');
    stars(ctx, seed, 55, t);
    const layer = (base, amp, col, sp) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x=0;x<=W;x+=30) ctx.lineTo(x, base - Math.abs(Math.sin(x*.004+sp+t*.05))*amp);
      ctx.lineTo(W, H); ctx.fill();
    };
    layer(1300, 300, 'rgba(26,34,58,.9)', 1);
    layer(1470, 260, 'rgba(17,22,40,.95)', 3.2);
    layer(1640, 200, 'rgba(10,13,25,1)', 5.1);
    const g = ctx.createLinearGradient(0, 1200, 0, 1650);
    g.addColorStop(0,'rgba(200,210,235,0)'); g.addColorStop(1,'rgba(200,210,235,.12)');
    ctx.fillStyle = g; ctx.fillRect(0, 1200, W, 450);
  },
  function hanjaSpirit(ctx, t, seed) {                     // 한자 기운
    bgBase(ctx, '#141021', '#0a0812');
    glowCircle(ctx, W/2, H/2, 700, 'rgba(155,120,200,.16)', 'rgba(155,120,200,0)');
    ctx.font = '900px BatangKR'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle = 'rgba(232,207,154,.07)';
    ctx.fillText('命', W/2, H/2 + 20);
    const r = rng(seed);
    for (let i=0;i<26;i++){
      const x = r()*W, sp = r()*90+35, y = (H + 100 - ((t*sp + r()*H*2) % (H+200)));
      ctx.fillStyle = `rgba(232,207,154,${.12 + r()*.25})`;
      ctx.beginPath(); ctx.arc(x, y, r()*4+1.5, 0, 7); ctx.fill();
    }
    stars(ctx, seed+7, 40, t);
  }
];

// ── 텍스트 ──
function wrap(ctx, line, maxW) {
  const words = line.split(' '); const out = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { out.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) out.push(cur);
  return out;
}
const isGoldLine = s => /[①②③=→▲丙子午卯酉寅申巳亥甲戊辛癸命火]|재성|관성|인성|식상|무료/.test(s);

function drawScene(ctx, scene, localT, dur, sceneIdx, sceneCnt, isCta, epNum) {
  // Ken Burns
  const s = 1 + 0.045 * (localT / dur);
  ctx.save();
  ctx.translate(W/2, H/2); ctx.scale(s, s); ctx.translate(-W/2, -H/2);
  BGS[sceneIdx % BGS.length](ctx, localT + sceneIdx * 3.7, 1234 + sceneIdx * 77 + epNum * 991);
  ctx.restore();
  vignette(ctx);

  // 상단 브랜딩
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = GOLD_D; ctx.font = '42px BatangKR';
  ctx.fillText('命  운 명 연 구 소', W/2, 170);
  ctx.strokeStyle = 'rgba(201,168,106,.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W/2-140, 200); ctx.lineTo(W/2+140, 200); ctx.stroke();

  // 본문 (페이드 + 상승)
  const a = ease(localT / 0.45), rise = (1 - a) * 46;
  ctx.save(); ctx.globalAlpha = a;
  const rawLines = scene.text.split('\n');
  ctx.font = isCta ? 'bold 76px BatangKR' : 'bold 68px BatangKR';
  const lines = [];
  rawLines.forEach(l => wrap(ctx, l.trim(), 930).forEach(x => lines.push(x)));
  const lh = isCta ? 128 : 112;
  const y0 = H/2 - (lines.length-1)*lh/2 + rise + (isCta ? -60 : 0);
  lines.forEach((ln, i) => {
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.fillText(ln, W/2+3, y0 + i*lh + 3);
    ctx.fillStyle = isCta ? GOLD : (isGoldLine(ln) ? GOLD : IVORY);
    ctx.fillText(ln, W/2, y0 + i*lh);
  });
  if (isCta) {
    ctx.strokeStyle = GOLD_D; ctx.lineWidth = 3;
    const bw = 560, bh = 110, bx = W/2-bw/2, by = y0 + lines.length*lh + 40;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 55); ctx.stroke();
    ctx.fillStyle = IVORY; ctx.font = 'bold 46px MalgunB';
    ctx.fillText('무료 사주 해석 받기', W/2, by + 72);
  }
  ctx.restore();

  // 진행 바
  ctx.fillStyle = 'rgba(255,255,255,.13)'; ctx.fillRect(120, H-150, W-240, 6);
  ctx.fillStyle = GOLD_D;
  ctx.fillRect(120, H-150, (W-240) * clamp01((sceneIdx + clamp01(localT/dur)) / sceneCnt), 6);
}

// ── 에피소드 렌더 ──
async function renderEpisode(ep, epNum) {
  const scenes = [...ep.scenes, CTA_SCENE];
  console.log(`\n[${ep.id}] ${ep.title} — TTS ${scenes.length}장면 생성 중…`);

  const audio = [];
  for (let i = 0; i < scenes.length; i++) {
    const f = path.join(TMP_DIR, `${ep.id}_s${i}.mp3`);
    const d = await synth(scenes[i].narr, f);
    audio.push({ file: f, dur: d });
    process.stdout.write(`  음성 ${i+1}/${scenes.length} (${d.toFixed(1)}s)\r`);
  }

  const GAP = 0.55, LEAD = 0.30;
  const sceneDur = audio.map(a => a.dur + GAP);
  sceneDur[0] += LEAD;
  const starts = []; let acc = 0;
  sceneDur.forEach(d => { starts.push(acc); acc += d; });
  const total = acc + 0.4;
  console.log(`\n  총 길이 ${total.toFixed(1)}s → 인코딩 시작`);

  // ffmpeg
  const args = ['-y', '-f','image2pipe', '-framerate', String(FPS), '-c:v','mjpeg', '-i','pipe:0'];
  audio.forEach(a => args.push('-i', a.file));
  const delays = starts.map((st, i) => `[${i+1}:a]adelay=${Math.round((st + (i===0?LEAD:0) + 0.12)*1000)}[a${i}]`).join(';');
  const mixIn = audio.map((_, i) => `[a${i}]`).join('');
  args.push('-filter_complex', `${delays};${mixIn}amix=inputs=${audio.length}:normalize=0[aout]`,
    '-map','0:v','-map','[aout]', '-c:v','libx264','-pix_fmt','yuv420p','-preset','veryfast','-crf','20',
    '-c:a','aac','-b:a','128k', '-t', String(total),
    path.join(OUT_DIR, `${ep.id}_${ep.title.replace(/[\\/:*?"<>| ]/g,'')}.mp4`));
  const ff = spawn(FFMPEG, args, { stdio: ['pipe','ignore','pipe'] });
  let ffErr = ''; ff.stderr.on('data', d => { ffErr += d; if (ffErr.length > 8000) ffErr = ffErr.slice(-4000); });
  const ffDone = new Promise((ok, bad) => ff.on('close', c => c === 0 ? ok() : bad(new Error('ffmpeg exit '+c+'\n'+ffErr.slice(-1500)))));
  const push = buf => new Promise(res => ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res));

  const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
  const frames = Math.ceil(total * FPS);
  for (let f = 0; f < frames; f++) {
    const t = f / FPS;
    let si = 0; while (si < scenes.length-1 && t >= starts[si] + sceneDur[si]) si++;
    drawScene(ctx, scenes[si], t - starts[si], sceneDur[si], si, scenes.length, si === scenes.length-1, epNum);
    await push(canvas.toBuffer('image/jpeg', 87));
    if (f % 120 === 0) process.stdout.write(`  프레임 ${f}/${frames}\r`);
  }
  ff.stdin.end();
  await ffDone;
  console.log(`  ✅ 완성: output/${ep.id}_….mp4 (${total.toFixed(0)}초)`);
}

(async () => {
  const arg = process.argv[2] || 'ep01';
  const list = arg === 'all' ? EPISODES : EPISODES.filter(e => e.id === arg);
  if (!list.length) { console.error('에피소드 없음:', arg); process.exit(1); }
  for (let i = 0; i < list.length; i++) await renderEpisode(list[i], i);
  console.log('\n🎬 전체 완료');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
