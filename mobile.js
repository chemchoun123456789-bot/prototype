/* ═══════════════════════════════════════════════════════════
   mobile.js  —  LAST STAND: MACHINE WAR  v6
   After script.js, before </body>.  Desktop exits instantly.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 0. GATE ─────────────────────────────────────────── */
  if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

  /* ═══════════════════════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════════════════════ */
  const JOY_R        = 42;    // joystick max travel px
  const DEADZONE     = 9;
  const AXIS         = 0.30;
  const AUTO_FIRE_MS = 140;   // rapid-fire interval ms
  const CHARGE_SEC   = 5;     // charge shot duration in seconds
  const CHARGE_CIRC  = 144;   // stroke-dasharray of progress ring (2π×r, r≈22.9)

  /* ═══════════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════════ */
  let gameOn     = false;
  let gameOverOn = false;
  let upgradeOn  = false;
  let isPaused   = false;

  /* move joystick */
  let jTid = null, jOx = 0, jOy = 0;

  /* aim joystick */
  let aTid = null, aOx = 0, aOy = 0;
  let aimNx = 0, aimNy = 0;
  let autoFireTimer = null;

  /* charge button */
  let cTid = null;
  let chargeRafId = null;
  let chargeStartTime = 0;

  /* sprint */
  let sTid = null;

  /* WASD */
  const held = { w:false, a:false, s:false, d:false };
  const KC   = { w:87, a:65, s:83, d:68 };

  /* ═══════════════════════════════════════════════════════
     SVG ICONS
  ═══════════════════════════════════════════════════════ */
  const SVG_MOVE = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5 L16.5 13 L20 10.5 L23.5 13 Z" fill="rgba(255,255,255,.75)"/>
    <path d="M20 35 L16.5 27 L20 29.5 L23.5 27 Z" fill="rgba(255,255,255,.75)"/>
    <path d="M5 20 L13 16.5 L10.5 20 L13 23.5 Z" fill="rgba(255,255,255,.75)"/>
    <path d="M35 20 L27 16.5 L29.5 20 L27 23.5 Z" fill="rgba(255,255,255,.75)"/>
    <circle cx="20" cy="20" r="2.2" fill="rgba(255,255,255,.50)"/>
  </svg>`;

  const SVG_AIM = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="8" stroke="rgba(0,238,255,.90)" stroke-width="1.6"/>
    <circle cx="20" cy="20" r="2" fill="rgba(0,238,255,1)"/>
    <line x1="20" y1="4"  x2="20" y2="11" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="20" y1="29" x2="20" y2="36" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="4"  y1="20" x2="11" y2="20" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="29" y1="20" x2="36" y2="20" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="5" stroke="rgba(0,238,255,.30)" stroke-width="1" fill="none"/>
  </svg>`;

  /* Charge: crosshair + lightning — ID on SVG so we can rotate it */
  const SVG_CHARGE = `<svg id="mob-charge-icon" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="9" stroke="rgba(155,48,255,.82)" stroke-width="1.5"/>
    <line x1="14" y1="2"  x2="14" y2="5"  stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="14" y1="23" x2="14" y2="26" stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="2"  y1="14" x2="5"  y2="14" stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="23" y1="14" x2="26" y2="14" stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <polygon points="15.5,7 10,14 13.5,14 12.5,21 18,14 14.5,14" fill="rgba(255,190,0,.90)" stroke="rgba(255,210,0,.55)" stroke-width=".5"/>
  </svg>`;

  const SVG_SPRINT = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" fill="rgba(255,210,0,.88)" stroke="rgba(255,225,0,.55)" stroke-width="1" stroke-linejoin="round"/>
  </svg>`;

  const SVG_PAUSE = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="4.5" height="16" rx="1.5" fill="rgba(255,255,255,.82)"/>
    <rect x="14.5" y="4" width="4.5" height="16" rx="1.5" fill="rgba(255,255,255,.82)"/>
  </svg>`;

  const SVG_PLAY = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5,3 21,12 5,21" fill="rgba(255,255,255,.82)"/>
  </svg>`;

  /* ═══════════════════════════════════════════════════════
     1.  ROTATE OVERLAY
  ═══════════════════════════════════════════════════════ */
  const $rot = document.createElement('div');
  $rot.id = 'mob-rotate-overlay';
  $rot.innerHTML = `<div class="mob-rot-box"><div class="mob-rot-phone">📱</div><div class="mob-rot-title">ROTATE YOUR DEVICE</div><div class="mob-rot-sub">LANDSCAPE MODE REQUIRED</div><div class="mob-rot-arrow">↺</div></div>`;
  document.body.appendChild($rot);

  function checkRot() { $rot.classList.toggle('show', gameOn && window.innerHeight > window.innerWidth); }
  window.addEventListener('resize', checkRot);
  window.addEventListener('orientationchange', () => setTimeout(checkRot, 150));
  function tryLock() {
    if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(checkRot);
    else checkRot();
  }

  /* ═══════════════════════════════════════════════════════
     2.  KEY / MOUSE HELPERS
  ═══════════════════════════════════════════════════════ */
  function press(k) {
    if (held[k]) return; held[k] = true;
    document.dispatchEvent(new KeyboardEvent('keydown', { key:k.toUpperCase(), code:`Key${k.toUpperCase()}`, keyCode:KC[k], which:KC[k], bubbles:true, cancelable:true }));
  }
  function release(k) {
    if (!held[k]) return; held[k] = false;
    document.dispatchEvent(new KeyboardEvent('keyup',   { key:k.toUpperCase(), code:`Key${k.toUpperCase()}`, keyCode:KC[k], which:KC[k], bubbles:true, cancelable:true }));
  }
  function releaseAll() { 'wasd'.split('').forEach(release); }

  function shiftKey(dn) {
    document.dispatchEvent(new KeyboardEvent(dn ? 'keydown' : 'keyup', { key:'Shift', code:'ShiftLeft', keyCode:16, which:16, bubbles:true }));
  }

  function getCV() { return document.getElementById('game-canvas') || document.getElementById('c'); }

  function aimPt() {
    const $cv = getCV();
    if (!$cv) return { x:window.innerWidth/2, y:window.innerHeight/2 };
    const r = $cv.getBoundingClientRect();
    const reach = Math.min(r.width, r.height) * 0.40;
    return { x: r.left + r.width/2 + aimNx * reach, y: r.top + r.height/2 + aimNy * reach };
  }

  function sendAimMove(nx, ny) {
    const $cv = getCV(); if (!$cv) return;
    const r = $cv.getBoundingClientRect();
    const reach = Math.min(r.width, r.height) * 0.40;
    $cv.dispatchEvent(new MouseEvent('mousemove', {
      clientX: r.left + r.width/2 + nx * reach,
      clientY: r.top  + r.height/2 + ny * reach,
      bubbles:true, cancelable:true
    }));
  }

  function sendShot() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mousedown', { clientX:x, clientY:y, button:0, buttons:1, bubbles:true, cancelable:true }));
    setTimeout(() => {
      $cv.dispatchEvent(new MouseEvent('mouseup',  { clientX:x, clientY:y, button:0, buttons:0, bubbles:true, cancelable:true }));
      $cv.dispatchEvent(new MouseEvent('click',    { clientX:x, clientY:y, button:0, bubbles:true, cancelable:true }));
    }, 40);
  }

  function startFire()  { if (autoFireTimer) return; sendShot(); autoFireTimer = setInterval(sendShot, AUTO_FIRE_MS); }
  function stopFire()   { if (autoFireTimer) { clearInterval(autoFireTimer); autoFireTimer = null; } }

  function chargeMouseDown() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mousedown', { clientX:x, clientY:y, button:0, buttons:1, bubbles:true, cancelable:true }));
  }
  function chargeMouseUp() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mouseup',  { clientX:x, clientY:y, button:0, buttons:0, bubbles:true, cancelable:true }));
    $cv.dispatchEvent(new MouseEvent('click',    { clientX:x, clientY:y, button:0, bubbles:true, cancelable:true }));
  }

  /* ═══════════════════════════════════════════════════════
     3.  LEFT CONTROLS  — MOVE JOYSTICK only
         ★ NO left-zone capture — joystick reacts ONLY
           when the player touches the joystick itself ★
  ═══════════════════════════════════════════════════════ */
  const $lc = document.createElement('div');
  $lc.id = 'mob-left-controls';
  $lc.innerHTML = `
    <div id="mob-joy-wrap">
      <div id="mob-joy-base">
        <div id="mob-joy-knob">${SVG_MOVE}</div>
        <span id="mob-joy-label">MOVE</span>
      </div>
    </div>`;
  document.body.appendChild($lc);

  const $jWrap = document.getElementById('mob-joy-wrap');
  const $jBase = document.getElementById('mob-joy-base');
  const $jKnob = document.getElementById('mob-joy-knob');

  function applyJoy(rawDx, rawDy) {
    const dist  = Math.hypot(rawDx, rawDy);
    const clamp = Math.min(dist, JOY_R);
    const nx    = dist > 0 ? rawDx/dist : 0;
    const ny    = dist > 0 ? rawDy/dist : 0;
    $jKnob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;
    if (dist < DEADZONE) { releaseAll(); return; }
    if (ny < -AXIS) press('w'); else release('w');
    if (ny >  AXIS) press('s'); else release('s');
    if (nx < -AXIS) press('a'); else release('a');
    if (nx >  AXIS) press('d'); else release('d');
  }

  /* Touch ONLY on the joystick element — no zone capture */
  $jWrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (jTid !== null) return;
    const t = e.changedTouches[0];
    jTid = t.identifier;
    const br = $jBase.getBoundingClientRect();
    jOx = br.left + br.width/2; jOy = br.top + br.height/2;
    $jKnob.classList.add('active');
    applyJoy(t.clientX - jOx, t.clientY - jOy);
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     4.  RIGHT CONTROLS  — CHARGE → SPRINT → AIM → SUPPLY
  ═══════════════════════════════════════════════════════ */
  const $rc = document.createElement('div');
  $rc.id = 'mob-right-controls';
  $rc.innerHTML = `
    <!-- 1. CHARGE SHOT -->
    <div id="mob-charge" role="button" aria-label="Charge Shot">
      <svg id="mob-charge-ring-svg" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle id="mob-charge-progress" cx="25" cy="25" r="23"
          stroke="rgba(255,100,0,.88)" stroke-width="3" fill="none"
          stroke-linecap="round"
          stroke-dasharray="${CHARGE_CIRC}" stroke-dashoffset="${CHARGE_CIRC}"/>
      </svg>
      ${SVG_CHARGE}
      <span id="mob-charge-lbl">CHARGE</span>
    </div>

    <!-- 2. SPRINT -->
    <div id="mob-sprint" role="button" aria-label="Sprint">
      ${SVG_SPRINT}
      <span id="mob-sprint-lbl">SPRINT</span>
    </div>

    <!-- 3. AIM + FIRE -->
    <div id="mob-aim-wrap">
      <div id="mob-aim-base">
        <div id="mob-aim-knob">${SVG_AIM}</div>
        <span id="mob-aim-label">AIM + FIRE</span>
      </div>
    </div>

    <!-- 4. SUPPLY ROW -->
    <div id="mob-supply-row"></div>`;
  document.body.appendChild($rc);

  const $aBase    = document.getElementById('mob-aim-base');
  const $aKnob    = document.getElementById('mob-aim-knob');
  const $sprint   = document.getElementById('mob-sprint');
  const $charge   = document.getElementById('mob-charge');
  const $chargeLbl= document.getElementById('mob-charge-lbl');
  const $chargeRing = document.getElementById('mob-charge-progress');
  const $chargeIcon = document.getElementById('mob-charge-icon');
  const $sRow     = document.getElementById('mob-supply-row');

  /* ── AIM JOYSTICK ── */
  function applyAim(rawDx, rawDy) {
    const dist  = Math.hypot(rawDx, rawDy);
    const clamp = Math.min(dist, JOY_R);
    const nx    = dist > 0 ? rawDx/dist : 0;
    const ny    = dist > 0 ? rawDy/dist : 0;
    $aKnob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;

    if (dist < DEADZONE) {
      stopFire(); aimNx = 0; aimNy = 0;
      $aBase.classList.remove('firing'); $aKnob.classList.remove('active');
      return;
    }
    aimNx = nx; aimNy = ny;
    sendAimMove(nx, ny);                   /* only when actively aiming */
    rotateChargeIcon();                    /* rotate charge button to face aim */
    if (!autoFireTimer) {
      $aBase.classList.add('firing'); $aKnob.classList.add('active');
      startFire();
    }
  }

  function rotateChargeIcon() {
    if (!$chargeIcon || (aimNx === 0 && aimNy === 0)) return;
    const angle = Math.atan2(aimNy, aimNx) * 180 / Math.PI;
    $chargeIcon.style.transform = `rotate(${angle}deg)`;
  }

  document.getElementById('mob-aim-wrap').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (aTid !== null) return;
    const t = e.changedTouches[0];
    aTid = t.identifier;
    const br = $aBase.getBoundingClientRect();
    aOx = br.left + br.width/2; aOy = br.top + br.height/2;
    applyAim(t.clientX - aOx, t.clientY - aOy);
  }, { passive:false });

  /* ── CHARGE BUTTON — 5-second hold → auto-fire ── */
  $charge.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (cTid !== null) return;
    cTid = e.changedTouches[0].identifier;
    chargeStartTime = performance.now();
    $charge.classList.add('active');
    $chargeLbl.textContent = 'HOLD...';
    chargeMouseDown();            /* game starts charge animation */
    runChargeProgress();
  }, { passive:false });

  function runChargeProgress() {
    if (cTid === null) return;
    const elapsed = performance.now() - chargeStartTime;
    const progress = Math.min(elapsed / (CHARGE_SEC * 1000), 1);
    const offset   = CHARGE_CIRC * (1 - progress);

    $chargeRing.style.strokeDashoffset = offset.toFixed(2);

    if (progress > 0.15) $charge.classList.add('charging');

    if (progress >= 1) {
      /* COMPLETED — auto-fire */
      resetCharge(true);
      return;
    }
    chargeRafId = requestAnimationFrame(runChargeProgress);
  }

  function resetCharge(fire) {
    cancelAnimationFrame(chargeRafId);
    chargeRafId = null; cTid = null;
    $chargeRing.style.strokeDashoffset = CHARGE_CIRC;
    $charge.classList.remove('active','charging');
    $chargeLbl.textContent = 'CHARGE';
    if (fire) chargeMouseUp();   /* fire the charge shot */
    else      chargeMouseUp();   /* early release also fires (partial) */
  }

  /* Charge touchend/cancel — early release also fires */
  function onChargeEnd(e) {
    let found = false;
    for (const t of e.changedTouches) { if (t.identifier === cTid) { found = true; break; } }
    if (!found) return;
    e.preventDefault();
    resetCharge(true);
  }
  $charge.addEventListener('touchend',    onChargeEnd, { passive:false });
  $charge.addEventListener('touchcancel', onChargeEnd, { passive:false });

  /* ── SPRINT ── */
  $sprint.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (sTid !== null) return;
    sTid = e.changedTouches[0].identifier;
    $sprint.classList.add('active');
    shiftKey(true);
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     5.  GLOBAL TOUCH ROUTER  (multi-touch: move + aim + sprint + charge)
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    let consumed = false;
    for (const t of e.changedTouches) {
      if (t.identifier === jTid) { applyJoy(t.clientX - jOx, t.clientY - jOy); consumed = true; }
      if (t.identifier === aTid) { applyAim(t.clientX - aOx, t.clientY - aOy); consumed = true; }
    }
    if (consumed) e.preventDefault();
  }, { passive:false });

  document.addEventListener('touchend',    onGlobalEnd);
  document.addEventListener('touchcancel', onGlobalEnd);

  function onGlobalEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === jTid) {
        jTid = null;
        $jKnob.classList.remove('active');
        $jKnob.style.transform = 'translate(-50%,-50%)';
        releaseAll();
      }
      if (t.identifier === aTid) {
        aTid = null; stopFire(); aimNx = 0; aimNy = 0;
        $aBase.classList.remove('firing'); $aKnob.classList.remove('active');
        $aKnob.style.transform = 'translate(-50%,-50%)';
      }
      if (t.identifier === sTid) {
        sTid = null; $sprint.classList.remove('active'); shiftKey(false);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     6.  PAUSE BUTTON
  ═══════════════════════════════════════════════════════ */
  const $pb = document.createElement('div');
  $pb.id = 'mob-pause-btn';
  $pb.innerHTML = SVG_PAUSE;
  document.body.appendChild($pb);

  $pb.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isPaused = !isPaused;
    $pb.innerHTML = isPaused ? SVG_PLAY : SVG_PAUSE;
    $pb.classList.add('pressed'); setTimeout(() => $pb.classList.remove('pressed'), 150);
    if      (typeof window.pauseGame   === 'function') window.pauseGame();
    else if (typeof window.togglePause === 'function') window.togglePause();
    else document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', code:'Escape', keyCode:27, bubbles:true, cancelable:true }));
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     7.  SUPPLY BUTTONS
  ═══════════════════════════════════════════════════════ */
  const SUPPLY_MAP = [
    { id:'btn-spawn-ammo',   fn:'spawnSupply', arg:'ammo'   },
    { id:'btn-spawn-shield', fn:'spawnSupply', arg:'shield' },
    { id:'btn-spawn-heal',   fn:'spawnSupply', arg:'heal'   },
  ];

  function initSupply() {
    SUPPLY_MAP.forEach(({ id, fn, arg }) => {
      const $b = document.getElementById(id);
      if (!$b) return;
      $sRow.appendChild($b);
      $b.addEventListener('touchstart', (ev) => {
        ev.stopPropagation();
        if (typeof window[fn] === 'function') window[fn](arg); else $b.click();
      }, { passive:true });
    });
  }

  /* ═══════════════════════════════════════════════════════
     8.  AMMO COUNTER — move to top-left below stat bars
  ═══════════════════════════════════════════════════════ */
  function repositionAmmo() {
    const $a = document.getElementById('hud-ammo-big');
    if (!$a) return;
    const $p = $a.parentElement; if (!$p) return;
    $p.style.position  = 'fixed';
    $p.style.top       = '56px';
    $p.style.left      = '14px';
    $p.style.bottom    = 'auto';
    $p.style.transform = 'none';
    $p.style.textAlign = 'left';
    $a.style.fontSize  = '13px';
    $a.style.letterSpacing = '1px';
    const $lbl = $a.nextElementSibling;
    if ($lbl) { $lbl.style.fontSize = '7px'; $lbl.style.letterSpacing = '2px'; }
  }

  /* ═══════════════════════════════════════════════════════
     9.  MINIMAP KILL
  ═══════════════════════════════════════════════════════ */
  function hideMinimap() {
    const $mc = document.getElementById('minimap-canvas'); if (!$mc) return;
    $mc.style.setProperty('display','none','important');
    let p = $mc.parentElement;
    while (p && p !== document.body) {
      const cs = window.getComputedStyle(p);
      if (cs.position === 'absolute' || cs.position === 'fixed') { p.style.setProperty('display','none','important'); break; }
      p = p.parentElement;
    }
  }

  /* ═══════════════════════════════════════════════════════
     10.  SHOW / HIDE
  ═══════════════════════════════════════════════════════ */
  function showGame() {
    $lc.style.display  = 'flex';
    $rc.style.display  = 'flex';
    $pb.style.display  = 'flex';
    isPaused = false; $pb.innerHTML = SVG_PAUSE;
  }

  function hideAll() {
    $lc.style.display  = 'none';
    $rc.style.display  = 'none';
    $pb.style.display  = 'none';
    stopFire(); releaseAll(); shiftKey(false);
    aimNx = 0; aimNy = 0;
    /* abort any running charge */
    if (cTid !== null) { cancelAnimationFrame(chargeRafId); chargeRafId = null; cTid = null; $chargeRing.style.strokeDashoffset = CHARGE_CIRC; $charge.classList.remove('active','charging'); $chargeLbl.textContent = 'CHARGE'; chargeMouseUp(); }
  }

  /* ═══════════════════════════════════════════════════════
     11.  GAME STATE DETECTION
          pause-menu / game-over / upgrade → hideAll()
          game active (none of above) → showGame()
  ═══════════════════════════════════════════════════════ */
  function vis(id) { const el = document.getElementById(id); return el && window.getComputedStyle(el).display !== 'none'; }

  function evalState() {
    const gsOn = vis('game-screen');
    const pmOn = vis('pause-menu');
    const goOn = vis('game-over-screen');
    const usOn = vis('upgrade-screen');

    /* Any overlay → hide everything (allows buttons to be tapped freely) */
    if (pmOn || goOn || usOn) {
      if ($lc.style.display !== 'none') hideAll();
      return;
    }

    /* Not in a game screen at all */
    if (!gsOn) {
      if (gameOn) { gameOn = false; hideAll(); checkRot(); }
      return;
    }

    /* Normal gameplay */
    if (!gameOn) {
      gameOn = true; tryLock(); repositionAmmo(); hideMinimap();
    }
    if ($lc.style.display === 'none') showGame();  /* recovery */
  }

  function attachObs() {
    const $gs = document.getElementById('game-screen');
    if (!$gs) { setTimeout(attachObs, 300); return; }
    const targets = ['game-screen','pause-menu','game-over-screen','upgrade-screen']
      .map(id => document.getElementById(id)).filter(Boolean);
    const obs = new MutationObserver(evalState);
    targets.forEach(el => obs.observe(el, { attributes:true, attributeFilter:['style','class'] }));
    if ($gs.parentElement) obs.observe($gs.parentElement, { childList:true });
    evalState();
  }

  setInterval(evalState, 350);

  /* ═══════════════════════════════════════════════════════
     12.  BROWSER GESTURE PREVENTION
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn || vis('pause-menu') || vis('game-over-screen') || vis('upgrade-screen')) return;
    if ($sRow.contains(e.target)) return;
    if (e.cancelable) e.preventDefault();
  }, { passive:false });

  document.addEventListener('contextmenu', (e) => { if (gameOn) e.preventDefault(); });

  let $vp = document.querySelector('meta[name="viewport"]');
  if (!$vp) { $vp = document.createElement('meta'); $vp.name='viewport'; document.head.appendChild($vp); }
  const VP_N = 'width=device-width,initial-scale=1';
  const VP_G = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';
  $vp.content = VP_N;

  const _sG = showGame; showGame = () => { _sG(); $vp.content = VP_G; };
  const _hA = hideAll;  hideAll  = () => { _hA(); $vp.content = VP_N; };

  /* ═══════════════════════════════════════════════════════
     13.  INIT
  ═══════════════════════════════════════════════════════ */
  function init() {
    hideAll();
    if (document.getElementById('btn-spawn-ammo')) {
      initSupply();
    } else {
      const t = setInterval(() => {
        if (document.getElementById('btn-spawn-ammo')) { clearInterval(t); initSupply(); }
      }, 400);
    }
    hideMinimap();
    attachObs();
    checkRot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
