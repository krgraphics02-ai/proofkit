import { useState, useEffect, useRef } from "react";

/* ──────────────────────────────────────────────
   ProofKit — Landing / Site vitrine
   Direction : "la preuve comme pièce à conviction"
   Isolé du reste de l'app (toutes les classes en pk-)
   ────────────────────────────────────────────── */

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inconsolata:wght@300;400;500;600&display=swap');

  .pk-landing *, .pk-landing *::before, .pk-landing *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pk-landing {
    --bg: #07090f;
    --bg2: #0a0d15;
    --ink: rgba(255,255,255,0.92);
    --muted: rgba(255,255,255,0.46);
    --faint: rgba(255,255,255,0.26);
    --line: rgba(255,255,255,0.08);
    --line2: rgba(255,255,255,0.14);
    --green: #00C27C;
    --green-bright: #00e676;
    --red: #ff3b5c;
    --glass: rgba(255,255,255,0.035);

    background: var(--bg);
    color: var(--ink);
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    position: relative;
  }

  /* ambient background */
  .pk-landing::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(48vw 48vw at 78% -6%, rgba(0,194,124,0.10), transparent 60%),
      radial-gradient(40vw 40vw at 8% 18%, rgba(255,59,92,0.06), transparent 55%),
      radial-gradient(60vw 60vw at 50% 120%, rgba(0,194,124,0.07), transparent 60%);
    pointer-events: none; z-index: 0;
    animation: pk-drift 22s ease-in-out infinite alternate;
  }
  @keyframes pk-drift { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-2%,1.5%,0) scale(1.06); } }

  .pk-landing::after {
    content: '';
    position: fixed; inset: 0;
    background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
    background-size: 64px 64px;
    -webkit-mask-image: radial-gradient(70% 60% at 50% 30%, #000 0%, transparent 75%);
            mask-image: radial-gradient(70% 60% at 50% 30%, #000 0%, transparent 75%);
    opacity: 0.5; pointer-events: none; z-index: 0;
  }

  .pk-wrap { position: relative; z-index: 1; width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 24px; }

  /* eyebrow / mono labels */
  .pk-eyebrow { font-family: 'Inconsolata', monospace; font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--green); font-weight: 600; }
  .pk-eyebrow.red { color: var(--red); }
  .pk-eyebrow.dim { color: var(--faint); }

  /* HEADER */
  .pk-header {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
    backdrop-filter: blur(16px) saturate(160%); -webkit-backdrop-filter: blur(16px) saturate(160%);
    background: rgba(7,9,15,0.6);
    border-bottom: 1px solid var(--line);
  }
  .pk-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
  .pk-logo img { width: 30px; height: 30px; border-radius: 9px; object-fit: contain; background: #fff; }
  .pk-logo b { color: var(--green); font-weight: 800; }
  .pk-headnav { display: flex; align-items: center; gap: 10px; }
  .pk-ghost { background: transparent; border: 1px solid var(--line2); color: var(--ink); font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; padding: 9px 16px; border-radius: 11px; cursor: pointer; transition: all .2s; }
  .pk-ghost:hover { border-color: var(--green); color: var(--green-bright); }
  .pk-cta-sm { background: var(--green); border: none; color: #04130d; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; padding: 10px 18px; border-radius: 11px; cursor: pointer; transition: all .2s; box-shadow: 0 6px 22px rgba(0,194,124,0.35); }
  .pk-cta-sm:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(0,194,124,0.5); }

  /* HERO */
  .pk-hero { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; padding: clamp(56px, 9vw, 120px) 0 clamp(40px,6vw,80px); }
  .pk-hero-eyebrow { margin-bottom: 22px; display: inline-flex; align-items: center; gap: 10px; }
  .pk-hero-eyebrow .pk-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 12px var(--green); animation: pk-pulse 2s ease-in-out infinite; }
  @keyframes pk-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }
  .pk-h1 { font-size: clamp(2.5rem, 6.4vw, 4.9rem); font-weight: 800; line-height: 0.98; letter-spacing: -0.035em; margin-bottom: 22px; }
  .pk-h1 .strike { position: relative; color: var(--muted); white-space: nowrap; }
  .pk-h1 .strike::after { content: ''; position: absolute; left: -2%; right: -2%; top: 54%; height: 4px; background: var(--red); border-radius: 4px; transform: scaleX(0); transform-origin: left; animation: pk-strike .7s cubic-bezier(.7,0,.3,1) .6s forwards; }
  @keyframes pk-strike { to { transform: scaleX(1); } }
  .pk-h1 .ok { color: var(--green-bright); }
  .pk-sub { font-size: clamp(1rem, 1.5vw, 1.18rem); line-height: 1.62; color: var(--muted); max-width: 30em; margin-bottom: 32px; font-weight: 400; }
  .pk-cta-row { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .pk-cta { background: var(--green); border: none; color: #04130d; font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; padding: 16px 26px; border-radius: 14px; cursor: pointer; transition: all .22s; box-shadow: 0 10px 30px rgba(0,194,124,0.4); }
  .pk-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,194,124,0.55); }
  .pk-cta-link { background: transparent; border: none; color: var(--ink); font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; padding: 14px 6px; transition: color .2s; }
  .pk-cta-link:hover { color: var(--green-bright); }
  .pk-micro { font-family: 'Inconsolata', monospace; font-size: 13px; color: var(--faint); margin-top: 18px; letter-spacing: 0.02em; }

  /* EVIDENCE CARD */
  .pk-evidence {
    background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    border: 1px solid var(--line2); border-radius: 22px; padding: 18px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset, 0 0 60px rgba(0,194,124,0.08);
    backdrop-filter: blur(10px);
    transform: rotate(1.2deg);
  }
  .pk-ev-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding: 0 4px; }
  .pk-ev-tag { font-family: 'Inconsolata', monospace; font-size: 11px; letter-spacing: 0.22em; color: var(--faint); text-transform: uppercase; }
  .pk-ev-verified { display: inline-flex; align-items: center; gap: 6px; font-family: 'Inconsolata', monospace; font-size: 11px; letter-spacing: 0.14em; color: var(--green-bright); background: rgba(0,230,118,0.12); border: 1px solid rgba(0,230,118,0.25); padding: 4px 10px; border-radius: 20px; font-weight: 600; }
  .pk-ev-verified svg { width: 12px; height: 12px; }
  .pk-ev-photo { position: relative; aspect-ratio: 4/3; border-radius: 14px; overflow: hidden; background: radial-gradient(120% 120% at 30% 20%, #1a2230, #0c1018 70%); display: flex; align-items: center; justify-content: center; border: 1px solid var(--line); }
  .pk-ev-photo svg.pk-bag { width: 64px; height: 64px; color: rgba(255,255,255,0.16); }
  .pk-ev-plabel { position: absolute; left: 12px; bottom: 10px; font-family: 'Inconsolata', monospace; font-size: 10px; letter-spacing: 0.18em; color: var(--faint); text-transform: uppercase; }
  .pk-ev-scan { position: absolute; left: 0; right: 0; height: 38%; top: -38%; background: linear-gradient(180deg, transparent, rgba(0,230,118,0.18), transparent); animation: pk-scan 3.2s ease-in-out infinite; }
  @keyframes pk-scan { 0%{top:-38%} 55%{top:100%} 100%{top:100%} }
  .pk-ev-data { padding: 16px 6px 4px; }
  .pk-ev-row { display: flex; align-items: baseline; justify-content: space-between; padding: 9px 0; border-bottom: 1px dashed var(--line); }
  .pk-ev-k { font-family: 'Inconsolata', monospace; font-size: 11px; letter-spacing: 0.16em; color: var(--faint); text-transform: uppercase; }
  .pk-ev-code { font-family: 'Inconsolata', monospace; font-size: 28px; font-weight: 600; color: var(--green-bright); letter-spacing: 0.06em; }
  .pk-cursor { display: inline-block; width: 2px; height: 22px; background: var(--green-bright); margin-left: 3px; transform: translateY(3px); animation: pk-blink 1.1s steps(2) infinite; }
  @keyframes pk-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
  .pk-ev-time { font-family: 'Inconsolata', monospace; font-size: 16px; color: var(--ink); letter-spacing: 0.02em; }
  .pk-ev-exif { font-family: 'Inconsolata', monospace; font-size: 11px; color: var(--faint); padding-top: 11px; letter-spacing: 0.04em; }
  .pk-ev-exif b { color: var(--green); font-weight: 500; }

  /* SECTION SHELL */
  .pk-section { padding: clamp(56px, 8vw, 110px) 0; position: relative; }
  .pk-section-head { max-width: 36em; margin-bottom: 48px; }
  .pk-h2 { font-size: clamp(1.9rem, 3.6vw, 2.9rem); font-weight: 800; line-height: 1.04; letter-spacing: -0.03em; margin-top: 14px; }
  .pk-lead { font-size: clamp(1rem,1.4vw,1.12rem); color: var(--muted); line-height: 1.6; margin-top: 16px; font-weight: 400; }

  /* PROBLEM */
  .pk-problem { border-top: 1px solid var(--line); }
  .pk-claims { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
  .pk-claim { font-size: clamp(1.5rem, 3.4vw, 2.4rem); font-weight: 700; letter-spacing: -0.02em; color: var(--ink); line-height: 1.12; }
  .pk-claim .q { color: var(--red); font-family: 'Syne'; }
  .pk-claim.dim { color: var(--faint); }

  /* STEPS */
  .pk-steps { border-top: 1px solid var(--line); }
  .pk-steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .pk-step { border: 1px solid var(--line); border-radius: 18px; padding: 26px 24px; background: var(--glass); transition: all .3s; position: relative; overflow: hidden; }
  .pk-step:hover { border-color: rgba(0,194,124,0.3); transform: translateY(-3px); }
  .pk-step-n { font-family: 'Inconsolata', monospace; font-size: 12px; color: var(--green); letter-spacing: 0.2em; margin-bottom: 18px; }
  .pk-step-ic { width: 44px; height: 44px; border-radius: 12px; background: rgba(0,194,124,0.1); border: 1px solid rgba(0,194,124,0.22); display: flex; align-items: center; justify-content: center; color: var(--green-bright); margin-bottom: 18px; }
  .pk-step-ic svg { width: 22px; height: 22px; }
  .pk-step h3 { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 8px; }
  .pk-step p { font-size: 0.96rem; color: var(--muted); line-height: 1.55; font-weight: 400; }

  /* FEATURES */
  .pk-features { border-top: 1px solid var(--line); }
  .pk-feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .pk-feat { border: 1px solid var(--line); border-radius: 16px; padding: 24px; background: var(--glass); transition: all .25s; }
  .pk-feat:hover { border-color: var(--line2); background: rgba(255,255,255,0.05); transform: translateY(-2px); }
  .pk-feat-ic { width: 38px; height: 38px; color: var(--green-bright); margin-bottom: 16px; }
  .pk-feat-ic svg { width: 30px; height: 30px; }
  .pk-feat h4 { font-size: 1.05rem; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em; }
  .pk-feat p { font-size: 0.92rem; color: var(--muted); line-height: 1.5; font-weight: 400; }

  /* STATS */
  .pk-stats { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .pk-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
  .pk-stat { text-align: left; }
  .pk-stat-n { font-family: 'Inconsolata', monospace; font-size: clamp(2.4rem,4.6vw,3.4rem); font-weight: 600; color: var(--green-bright); letter-spacing: -0.02em; line-height: 1; }
  .pk-stat-l { font-size: 0.9rem; color: var(--muted); margin-top: 12px; line-height: 1.4; font-weight: 400; }

  /* ROI */
  .pk-roi { border-bottom: 1px solid var(--line); }
  .pk-roi-card { border: 1px solid rgba(0,194,124,0.2); border-radius: 20px; padding: clamp(28px,4vw,44px); background: linear-gradient(135deg, rgba(0,194,124,0.07), rgba(0,194,124,0.02)); }
  .pk-roi-tag { font-family: 'Inconsolata', monospace; font-size: 11px; letter-spacing: 0.22em; color: var(--green); text-transform: uppercase; margin-bottom: 16px; }
  .pk-roi-txt { font-size: clamp(1.25rem, 2.4vw, 1.7rem); font-weight: 600; line-height: 1.4; letter-spacing: -0.01em; }
  .pk-roi-txt b { color: var(--green-bright); font-weight: 700; }

  /* PRICING */
  .pk-pricing { border-bottom: 1px solid var(--line); }
  .pk-price-card { max-width: 480px; margin: 0 auto; border: 1px solid rgba(0,194,124,0.28); border-radius: 24px; padding: 40px; background: linear-gradient(165deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015)); position: relative; overflow: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.4), 0 0 50px rgba(0,194,124,0.1); }
  .pk-price-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background: linear-gradient(90deg, var(--green), #4da6ff, var(--green)); }
  .pk-price-free { display: inline-block; font-family: 'Inconsolata', monospace; font-size: 12px; letter-spacing: 0.12em; color: var(--green-bright); background: rgba(0,230,118,0.12); border: 1px solid rgba(0,230,118,0.25); padding: 6px 12px; border-radius: 20px; margin-bottom: 22px; }
  .pk-price-amt { font-size: 3.6rem; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
  .pk-price-amt span { font-size: 1.1rem; color: var(--muted); font-weight: 400; }
  .pk-price-desc { color: var(--muted); margin: 12px 0 26px; line-height: 1.5; font-size: 0.98rem; }
  .pk-price-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
  .pk-price-list li { display: flex; align-items: center; gap: 10px; font-size: 0.96rem; }
  .pk-tick { width: 20px; height: 20px; border-radius: 50%; background: rgba(0,194,124,0.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--green-bright); }
  .pk-tick svg { width: 12px; height: 12px; }
  .pk-price-card .pk-cta { width: 100%; }
  .pk-price-note { text-align: center; font-family: 'Inconsolata', monospace; font-size: 12px; color: var(--faint); margin-top: 16px; }

  /* FINAL CTA */
  .pk-final { text-align: center; padding: clamp(70px,10vw,130px) 0; }
  .pk-final .pk-h2 { margin: 14px auto 0; max-width: 16em; }
  .pk-final .pk-cta-row { justify-content: center; margin-top: 30px; }

  /* FOOTER */
  .pk-footer { border-top: 1px solid var(--line); padding: 40px 24px; text-align: center; color: var(--faint); }
  .pk-footer .pk-logo { justify-content: center; margin-bottom: 10px; font-size: 16px; }
  .pk-footer p { font-size: 0.9rem; color: var(--muted); margin-bottom: 14px; }
  .pk-footer small { font-family: 'Inconsolata', monospace; font-size: 12px; letter-spacing: 0.04em; }

  /* SCROLL REVEAL */
  .pk-reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.2,.6,.2,1), transform .7s cubic-bezier(.2,.6,.2,1); }
  .pk-reveal.pk-in { opacity: 1; transform: none; }
  .pk-reveal[data-d="1"]{ transition-delay: .08s } .pk-reveal[data-d="2"]{ transition-delay: .16s } .pk-reveal[data-d="3"]{ transition-delay: .24s } .pk-reveal[data-d="4"]{ transition-delay: .32s } .pk-reveal[data-d="5"]{ transition-delay: .4s }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .pk-hero { grid-template-columns: 1fr; gap: 40px; }
    .pk-evidence { transform: none; max-width: 420px; }
    .pk-steps-grid, .pk-feat-grid { grid-template-columns: 1fr 1fr; }
    .pk-stats-grid { grid-template-columns: 1fr 1fr; gap: 32px 24px; }
  }
  @media (max-width: 600px) {
    .pk-headnav .pk-ghost { display: none; }
    .pk-steps-grid, .pk-feat-grid { grid-template-columns: 1fr; }
    .pk-wrap { padding: 0 18px; }
    .pk-price-card { padding: 30px 24px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pk-landing::before { animation: none; }
    .pk-ev-scan, .pk-cursor, .pk-hero-eyebrow .pk-dot { animation: none; }
    .pk-h1 .strike::after { animation: none; transform: scaleX(1); }
    .pk-reveal { transition: none; opacity: 1; transform: none; }
  }
`;

/* ── inline icons (stroke style) ── */
const Ico = {
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  camera: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  hash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  sparkle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.7 1.8L21.5 18.5 19.7 19.2 19 21l-.7-1.8L16.5 18.5 18.3 17.8z"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  phone: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="12" y1="18" x2="12" y2="18"/></svg>,
  bag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
};

const fmtClock = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  const date = `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  return { date, time, full: `${date} · ${time}` };
};
const fmtExif = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}:${p(d.getMonth() + 1)}:${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export default function Landing({ onEnter }) {
  const [now, setNow] = useState(new Date());
  const rootRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".pk-reveal") || [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("pk-in"); io.unobserve(e.target); } }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const clock = fmtClock(now);
  const go = () => onEnter && onEnter();

  return (
    <div className="pk-landing" ref={rootRef}>
      <style>{styles}</style>

      <header className="pk-header">
        <div className="pk-logo"><img src="/logo.png" alt="ProofKit" />Proof<b>Kit</b></div>
        <nav className="pk-headnav">
          <button className="pk-ghost" onClick={go}>Se connecter</button>
          <button className="pk-cta-sm" onClick={go}>Créer mon espace</button>
        </nav>
      </header>

      <main className="pk-wrap">

        {/* HERO */}
        <section className="pk-hero">
          <div>
            <div className="pk-hero-eyebrow pk-eyebrow"><span className="pk-dot" />PREUVES HORODATÉES · LIVRAISON</div>
            <h1 className="pk-h1">
              Le <span className="strike">remboursement abusif</span><br />s'arrête <span className="ok">ici</span>.
            </h1>
            <p className="pk-sub">
              ProofKit horodate chaque commande au moment où elle quitte votre cuisine.
              Une preuve infalsifiable, prête à contester n'importe quelle réclamation Uber Eats ou Deliveroo.
            </p>
            <div className="pk-cta-row">
              <button className="pk-cta" onClick={go}>Créer mon espace gratuit</button>
              <button className="pk-cta-link" onClick={go}>J'ai déjà un compte →</button>
            </div>
            <div className="pk-micro">Sans engagement · résiliable à tout moment</div>
          </div>

          {/* evidence card */}
          <div className="pk-evidence pk-reveal">
            <div className="pk-ev-top">
              <span className="pk-ev-tag">PIÈCE · PROOFKIT</span>
              <span className="pk-ev-verified">{Ico.check} VÉRIFIÉ</span>
            </div>
            <div className="pk-ev-photo">
              <div className="pk-ev-scan" />
              <span className="pk-bag">{Ico.bag}</span>
              <span className="pk-ev-plabel">PHOTO · COMMANDE</span>
            </div>
            <div className="pk-ev-data">
              <div className="pk-ev-row">
                <span className="pk-ev-k">Commande</span>
                <span className="pk-ev-code">68F37<i className="pk-cursor" /></span>
              </div>
              <div className="pk-ev-row">
                <span className="pk-ev-k">Horodatage</span>
                <span className="pk-ev-time">{clock.full}</span>
              </div>
              <div className="pk-ev-exif">EXIF · <b>DateTimeOriginal</b> · {fmtExif(now)}</div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="pk-section pk-problem">
          <div className="pk-section-head pk-reveal">
            <span className="pk-eyebrow red">LE PROBLÈME</span>
          </div>
          <div className="pk-claims">
            <div className="pk-claim pk-reveal" data-d="1"><span className="q">«</span> Il manquait un article. <span className="q">»</span></div>
            <div className="pk-claim pk-reveal" data-d="2"><span className="q">«</span> La commande n'est jamais arrivée. <span className="q">»</span></div>
            <div className="pk-claim dim pk-reveal" data-d="3">Une réclamation suffit. Le remboursement est prélevé sur votre marge.</div>
          </div>
          <p className="pk-lead pk-reveal" data-d="3" style={{ maxWidth: "34em" }}>
            Sur les plateformes de livraison, sans preuve, c'est votre parole contre celle du client.
            ProofKit fait pencher la balance de votre côté.
          </p>
        </section>

        {/* STEPS */}
        <section className="pk-section pk-steps">
          <div className="pk-section-head pk-reveal">
            <span className="pk-eyebrow">COMMENT ÇA MARCHE</span>
            <h2 className="pk-h2">Trois gestes. Une preuve béton.</h2>
          </div>
          <div className="pk-steps-grid">
            <div className="pk-step pk-reveal" data-d="1">
              <div className="pk-step-n">ÉTAPE 01</div>
              <div className="pk-step-ic">{Ico.camera}</div>
              <h3>Photographiez</h3>
              <p>Avant que le livreur reparte, prenez la commande en photo directement depuis l'app.</p>
            </div>
            <div className="pk-step pk-reveal" data-d="2">
              <div className="pk-step-n">ÉTAPE 02</div>
              <div className="pk-step-ic">{Ico.clock}</div>
              <h3>Horodatez</h3>
              <p>ProofKit grave la date et l'heure exactes dans les métadonnées EXIF. Impossible à modifier.</p>
            </div>
            <div className="pk-step pk-reveal" data-d="3">
              <div className="pk-step-n">ÉTAPE 03</div>
              <div className="pk-step-ic">{Ico.shield}</div>
              <h3>Contestez</h3>
              <p>En cas de litige, exportez la preuve horodatée et transmettez-la à la plateforme.</p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="pk-section pk-features">
          <div className="pk-section-head pk-reveal">
            <span className="pk-eyebrow">FONCTIONNALITÉS</span>
            <h2 className="pk-h2">Pensé pour la cadence d'un restaurant.</h2>
          </div>
          <div className="pk-feat-grid">
            {[
              { i: "shield", t: "Horodatage infalsifiable", d: "Date et heure gravées dans les métadonnées EXIF de chaque photo." },
              { i: "hash", t: "Lecture du n° de commande", d: "L'IA lit automatiquement le code de la commande sur le ticket." },
              { i: "sparkle", t: "Détection d'anomalies", d: "L'IA repère les articles manquants et les incohérences." },
              { i: "bell", t: "Alertes en temps réel", d: "L'équipe est prévenue dès qu'une anomalie est détectée." },
              { i: "users", t: "Suivi de l'équipe", d: "Voyez qui photographie quoi, et à quel moment." },
              { i: "phone", t: "Multi-téléphones", d: "Accessible depuis n'importe quel téléphone, sans installation." },
            ].map((f, idx) => (
              <div className="pk-feat pk-reveal" data-d={(idx % 3) + 1} key={f.t}>
                <div className="pk-feat-ic">{Ico[f.i]}</div>
                <h4>{f.t}</h4>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="pk-section pk-stats">
          <div className="pk-stats-grid">
            <div className="pk-stat pk-reveal" data-d="1"><div className="pk-stat-n">&lt; 3 s</div><div className="pk-stat-l">pour horodater une commande</div></div>
            <div className="pk-stat pk-reveal" data-d="2"><div className="pk-stat-n">EXIF</div><div className="pk-stat-l">métadonnées infalsifiables</div></div>
            <div className="pk-stat pk-reveal" data-d="3"><div className="pk-stat-n">24/7</div><div className="pk-stat-l">accessible où que vous soyez</div></div>
            <div className="pk-stat pk-reveal" data-d="4"><div className="pk-stat-n">∞</div><div className="pk-stat-l">preuves illimitées (abonnés)</div></div>
          </div>
        </section>

        {/* ROI */}
        <section className="pk-section pk-roi">
          <div className="pk-roi-card pk-reveal">
            <div className="pk-roi-tag">EXEMPLE</div>
            <p className="pk-roi-txt">
              Une réclamation de <b>38 €</b> contestée avec preuve, c'est <b>38 €</b> qui restent dans votre caisse.
              Quelques litiges évités par mois, et ProofKit est déjà rentabilisé.
            </p>
          </div>
        </section>

        {/* PRICING */}
        <section className="pk-section pk-pricing">
          <div className="pk-section-head pk-reveal" style={{ textAlign: "center", margin: "0 auto 48px" }}>
            <span className="pk-eyebrow">TARIF</span>
            <h2 className="pk-h2">Un prix simple. Aucun engagement.</h2>
          </div>
          <div className="pk-price-card pk-reveal">
            <span className="pk-price-free">7 jours gratuits</span>
            <div className="pk-price-amt">14,99 €<span> / mois</span></div>
            <p className="pk-price-desc">Tout ProofKit, pour protéger votre restaurant des remboursements abusifs.</p>
            <ul className="pk-price-list">
              {["Photos horodatées infalsifiables", "Lecture automatique du n° de commande", "Détection d'anomalies par IA", "Alertes en temps réel", "Employés illimités", "Accès depuis tous les téléphones"].map((f) => (
                <li key={f}><span className="pk-tick">{Ico.check}</span>{f}</li>
              ))}
            </ul>
            <button className="pk-cta" onClick={go}>Créer mon espace gratuit</button>
            <div className="pk-price-note">Sans engagement · résiliable à tout moment</div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="pk-final">
          <span className="pk-eyebrow pk-reveal">PROOFKIT</span>
          <h2 className="pk-h2 pk-reveal" data-d="1">La prochaine réclamation, vous serez prêt.</h2>
          <div className="pk-cta-row pk-reveal" data-d="2">
            <button className="pk-cta" onClick={go}>Créer mon espace gratuit</button>
            <button className="pk-cta-link" onClick={go}>Se connecter →</button>
          </div>
        </section>
      </main>

      <footer className="pk-footer">
        <div className="pk-logo"><img src="/logo.png" alt="ProofKit" />Proof<b>Kit</b></div>
        <p>Preuves horodatées pour la livraison.</p>
        <small>© 2026 ProofKit · proofkit.fr</small>
      </footer>
    </div>
  );
}
