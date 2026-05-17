/* ═══════════════════════════════════════════════════════════
   mobile.js  —  LAST STAND: MACHINE WAR  v5
   After script.js, before </body>.  Desktop exits instantly.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 0. GATE ─────────────────────────────────────────── */
  if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

  /* ═══════════════════════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════════════════════ */
  const JOY_R        = 44;    // joystick max travel px
  const DEADZONE     = 9;
  const AXIS         = 0.30;
  const AUTO_FIRE_MS = 140;   // continuous fire interval ms
  const CHARGE_MS    = 360;   // hold charge button → show charging

  /* ═══════════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════════ */
  let gameOn    = false;
  let upgradeOn = false;
  let gameOverOn = false;

  /* move joystick */
  let jTid = null, jOx = 0, jOy = 0;

  /* aim joystick */
  let aTid = null, aOx = 0, aOy = 0;
  let aimNx = 0, aimNy = 0;           // current aim direction
  let autoFireTimer = null;

  /* charge button */
  let cTid = null, chargeAnimTimer = null;
  let chargeRingEl = null, chargeRingTimer = null, chargeRingRAF = null;
  const CHARGE_RING_MS = 5000; // 5 seconds to fill charge ring

  /* sprint */
  let sTid = null;

  /* pause toggle */
  let isPaused = false;

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

  /* Charge: crosshair + lightning bolt overlay */
  const SVG_CHARGE = `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="9" stroke="rgba(155,48,255,.82)" stroke-width="1.5"/>
    <line x1="14" y1="2"  x2="14" y2="7"  stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="14" y1="21" x2="14" y2="26" stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="2"  y1="14" x2="7"  y2="14" stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="21" y1="14" x2="26" y2="14" stroke="rgba(155,48,255,.72)" stroke-width="1.5" stroke-linecap="round"/>
    <polygon points="15.5,7 10,15 14,15 12.5,21 18,13 14,13" fill="rgba(255,190,0,.90)" stroke="rgba(255,210,0,.55)" stroke-width=".5"/>
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
     2.  LEFT-ZONE CAPTURE  (kills canvas touch ring)
  ═══════════════════════════════════════════════════════ */
  const $lz = document.createElement('div');
  $lz.id = 'mob-left-zone';
  document.body.appendChild($lz);

  /* Left-zone: DISABLED — joystick only activates via $jWrap touchstart below */
  /* $lz kept in DOM for touch-ring prevention but does NOT start joystick */
  $lz.addEventListener('touchstart', (e) => {
    e.preventDefault(); /* block canvas touch ring only */
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     3.  KEY / MOUSE HELPERS
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

  /* Only send mousemove when ACTUALLY aiming (prevents aimbot spin) */
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

  /* Single shot (mousedown → mouseup in 40ms) */
  function sendShot() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mousedown', { clientX:x, clientY:y, button:0, buttons:1, bubbles:true, cancelable:true }));
    setTimeout(() => {
      $cv.dispatchEvent(new MouseEvent('mouseup',  { clientX:x, clientY:y, button:0, buttons:0, bubbles:true, cancelable:true }));
      $cv.dispatchEvent(new MouseEvent('click',    { clientX:x, clientY:y, button:0, bubbles:true, cancelable:true }));
    }, 40);
  }

  /* Start continuous auto-fire */
  function startFire() {
    if (autoFireTimer) return;
    sendShot();
    autoFireTimer = setInterval(sendShot, AUTO_FIRE_MS);
  }

  /* Stop continuous auto-fire */
  function stopFire() {
    if (autoFireTimer) { clearInterval(autoFireTimer); autoFireTimer = null; }
  }

  /* Charge shot helpers */
  function chargeDown() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mousedown', { clientX:x, clientY:y, button:0, buttons:1, bubbles:true, cancelable:true }));
  }
  function chargeRelease() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mouseup',  { clientX:x, clientY:y, button:0, buttons:0, bubbles:true, cancelable:true }));
    $cv.dispatchEvent(new MouseEvent('click',    { clientX:x, clientY:y, button:0, bubbles:true, cancelable:true }));
  }

  /* Charge ring overlay — appears around the player character while charging */
  function createChargeRing() {
    if (chargeRingEl) return;
    const $cv = getCV(); if (!$cv) return;
    const ring = document.createElement('div');
    ring.id = 'mob-charge-ring-overlay';
    ring.style.cssText = 'position:fixed;pointer-events:none;z-index:99990;';
    ring.innerHTML = `<svg id="mob-charge-ring-svg" viewBox="0 0 80 80" style="width:80px;height:80px;overflow:visible;">
      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(155,48,255,0.18)" stroke-width="4"/>
      <circle id="mob-charge-ring-arc" cx="40" cy="40" r="34" fill="none" stroke="rgba(155,48,255,0.90)"
        stroke-width="4" stroke-linecap="round"
        stroke-dasharray="213.6" stroke-dashoffset="213.6"
        transform="rotate(-90 40 40)"
        style="transition:stroke 0.2s;filter:drop-shadow(0 0 6px rgba(155,48,255,0.8));"/>
    </svg>`;
    document.body.appendChild(ring);
    chargeRingEl = ring;
  }

  function positionChargeRing() {
    if (!chargeRingEl) return;
    const $cv = getCV(); if (!$cv) return;
    const r = $cv.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    chargeRingEl.style.left = (cx - 40) + 'px';
    chargeRingEl.style.top  = (cy - 40) + 'px';
  }

  function startChargeRing() {
    createChargeRing();
    positionChargeRing();
    chargeRingEl.style.display = 'block';
    const arc = document.getElementById('mob-charge-ring-arc');
    if (!arc) return;
    const circumference = 213.6;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / CHARGE_RING_MS, 1);
      const offset = circumference * (1 - progress);
      arc.setAttribute('stroke-dashoffset', offset);
      // colour shift: purple → orange → red as it fills
      if (progress < 0.5) {
        arc.setAttribute('stroke', 'rgba(155,48,255,0.90)');
      } else if (progress < 0.85) {
        arc.setAttribute('stroke', 'rgba(255,130,0,0.95)');
      } else {
        arc.setAttribute('stroke', 'rgba(255,40,0,1.0)');
      }
      if (progress < 1) {
        chargeRingRAF = requestAnimationFrame(tick);
      }
    }
    chargeRingRAF = requestAnimationFrame(tick);
  }

  function stopChargeRing() {
    if (chargeRingRAF) { cancelAnimationFrame(chargeRingRAF); chargeRingRAF = null; }
    if (chargeRingEl) { chargeRingEl.style.display = 'none'; }
    const arc = document.getElementById('mob-charge-ring-arc');
    if (arc) arc.setAttribute('stroke-dashoffset', '213.6');
  }


  /* ═══════════════════════════════════════════════════════
     4.  LEFT CONTROLS  (move joystick only)
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
     5.  RIGHT CONTROLS  (top-row + aim + supply)
  ═══════════════════════════════════════════════════════ */
  const $rc = document.createElement('div');
  $rc.id = 'mob-right-controls';
  $rc.innerHTML = `
    <div id="mob-top-row">
      <div id="mob-sprint" role="button" aria-label="Sprint">
        ${SVG_SPRINT}<span id="mob-sprint-lbl">SPRINT</span>
      </div>
    </div>
    <div id="mob-aim-wrap">
      <div id="mob-aim-base">
        <div id="mob-aim-knob">${SVG_AIM}</div>
        <span id="mob-aim-label">AIM + FIRE</span>
      </div>
    </div>
    <div id="mob-supply-row"></div>`;
  document.body.appendChild($rc);

  const $aBase   = document.getElementById('mob-aim-base');
  const $aKnob   = document.getElementById('mob-aim-knob');
  const $sprint  = document.getElementById('mob-sprint');
  const $sRow    = document.getElementById('mob-supply-row');

  /* ── AIM JOYSTICK ── */
  function applyAim(rawDx, rawDy) {
    const dist  = Math.hypot(rawDx, rawDy);
    const clamp = Math.min(dist, JOY_R);
    const nx    = dist > 0 ? rawDx/dist : 0;
    const ny    = dist > 0 ? rawDy/dist : 0;
    $aKnob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;

    if (dist < DEADZONE) {
      /* Returned to centre — stop firing, clear aim direction */
      stopFire();
      aimNx = 0; aimNy = 0;
      $aBase.classList.remove('firing');
      $aKnob.classList.remove('active');
      return;
    }

    aimNx = nx; aimNy = ny;
    /* Only now do we move the mouse — prevents aimbot when at rest */
    sendAimMove(nx, ny);

    if (!autoFireTimer) {
      $aBase.classList.add('firing');
      $aKnob.classList.add('active');
      startFire();
    }
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

  /* ── SPRINT ── */
  $sprint.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (sTid !== null) return;
    sTid = e.changedTouches[0].identifier;
    $sprint.classList.add('active');
    shiftKey(true);
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     6.  GLOBAL TOUCH ROUTER  (enables simultaneous multi-touch)
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

  document.addEventListener('touchend',    onEnd);
  document.addEventListener('touchcancel', onEnd);

  function onEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === jTid) {
        jTid = null;
        $jKnob.classList.remove('active');
        $jKnob.style.transform = 'translate(-50%,-50%)';
        releaseAll();
      }
      if (t.identifier === aTid) {
        aTid = null;
        stopFire();
        aimNx = 0; aimNy = 0;
        $aBase.classList.remove('firing');
        $aKnob.classList.remove('active');
        $aKnob.style.transform = 'translate(-50%,-50%)';
      }
      if (t.identifier === sTid) {
        sTid = null;
        $sprint.classList.remove('active');
        shiftKey(false);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     7.  PAUSE BUTTON
  ═══════════════════════════════════════════════════════ */
  const $pause = document.createElement('div');
  $pause.id = 'mob-pause-btn';
  $pause.setAttribute('role','button');
  $pause.setAttribute('aria-label','Pause');
  $pause.innerHTML = SVG_PAUSE;
  document.body.appendChild($pause);

  $pause.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isPaused = !isPaused;
    $pause.innerHTML = isPaused ? SVG_PLAY : SVG_PAUSE;
    $pause.classList.add('pressed');
    setTimeout(() => $pause.classList.remove('pressed'), 150);

    /* Try game's own pause function, fall back to Escape key */
    if      (typeof window.pauseGame   === 'function') window.pauseGame();
    else if (typeof window.togglePause === 'function') window.togglePause();
    else document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', code:'Escape', keyCode:27, bubbles:true, cancelable:true }));
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     8.  SUPPLY BUTTONS  (live in $sRow; move to $supplyBar during upgrade)
  ═══════════════════════════════════════════════════════ */
  const $supplyBar = document.createElement('div');
  $supplyBar.id = 'mob-supply-bar';
  document.body.appendChild($supplyBar);

  const SUPPLY_MAP = [
    { id:'btn-spawn-ammo',   fn:'spawnSupply', arg:'ammo'   },
    { id:'btn-spawn-shield', fn:'spawnSupply', arg:'shield' },
    { id:'btn-spawn-heal',   fn:'spawnSupply', arg:'heal'   },
  ];
  const supplyEls = [];

  function initSupply() {
    SUPPLY_MAP.forEach(({ id, fn, arg }) => {
      const $b = document.getElementById(id);
      if (!$b) return;
      supplyEls.push($b);
      $sRow.appendChild($b);
      $b.addEventListener('touchstart', (ev) => {
        ev.stopPropagation();
        if (typeof window[fn] === 'function') window[fn](arg); else $b.click();
      }, { passive:true });
    });
  }

  function moveSupplyTo(target) { supplyEls.forEach(el => target.appendChild(el)); }

  /* ═══════════════════════════════════════════════════════
     9.  AMMO COUNTER  — reposition to top-left below stats
  ═══════════════════════════════════════════════════════ */
  function repositionAmmo() {
    /*── AMMO: top-center ── */
    const $a = document.getElementById('hud-ammo-big');
    if ($a) {
      const $p = $a.parentElement;
      if ($p) {
        $p.style.position  = 'fixed';
        $p.style.top       = '8px';
        $p.style.left      = '50%';
        $p.style.transform = 'translateX(-50%)';
        $p.style.bottom    = 'auto';
        $p.style.textAlign = 'center';
        $p.style.zIndex    = '9100';
        $a.style.fontSize  = '14px';
        $a.style.letterSpacing = '1px';
        const $lbl = $a.nextElementSibling;
        if ($lbl) { $lbl.style.fontSize = '6px'; $lbl.style.letterSpacing = '2px'; }
      }
    }
    /* ── STAMINA: move beside ammo (right of top-center) ── */
    const $st = document.getElementById('hud-stamina-wrap');
    if ($st) {
      $st.style.position  = 'fixed';
      $st.style.top       = '10px';
      $st.style.left      = 'calc(50% + 70px)';
      $st.style.transform = 'none';
      $st.style.bottom    = 'auto';
      $st.style.zIndex    = '9100';
      $st.style.background = 'rgba(4,0,18,0.55)';
      $st.style.padding    = '2px 6px';
      $st.style.borderRadius = '6px';
      /* shrink the bar width on mobile */
      const $bar = $st.querySelector('div > div:last-child') || $st.querySelector('[id="hud-stamina-bar"]')?.parentElement;
      if ($bar && $bar !== $st) $bar.style.width = '60px';
    }
  }

  /* ═══════════════════════════════════════════════════════
     10.  MINIMAP KILL
  ═══════════════════════════════════════════════════════ */
  function hideMinimap() {
    const $mc = document.getElementById('minimap-canvas');
    if (!$mc) return;
    $mc.style.setProperty('display','none','important');
    let p = $mc.parentElement;
    while (p && p !== document.body) {
      const cs = window.getComputedStyle(p);
      if (cs.position === 'absolute' || cs.position === 'fixed') { p.style.setProperty('display','none','important'); break; }
      p = p.parentElement;
    }
  }

  /* ═══════════════════════════════════════════════════════
     11.  SHOW / HIDE PER STATE
  ═══════════════════════════════════════════════════════ */
  function showGame() {
    $lc.style.display       = 'flex';
    $rc.style.display       = 'flex';
    $lz.style.display       = 'block';
    $pause.style.display    = 'flex';
    $supplyBar.style.display= 'none';
    moveSupplyTo($sRow);
    isPaused = false; $pause.innerHTML = SVG_PAUSE;
    /* reset any stuck joystick touch IDs so Continue/Play Again work cleanly */
    jTid = null; aTid = null; sTid = null; cTid = null;
    $jKnob.style.transform = 'translate(-50%,-50%)';
    $jKnob.classList.remove('active');
    $aKnob.style.transform = 'translate(-50%,-50%)';
    $aKnob.classList.remove('active');
    $aBase.classList.remove('firing');
  }

  function showUpgrade() {
    $lc.style.display       = 'none';
    $rc.style.display       = 'none';
    $lz.style.display       = 'none';
    $pause.style.display    = 'none';
    $supplyBar.style.display= 'none';  /* hide floating supply bar — upgrade screen shows rewards only */
    moveSupplyTo($supplyBar);
    stopFire(); releaseAll(); shiftKey(false);
  }

  function hideAll() {
    $lc.style.display       = 'none';
    $rc.style.display       = 'none';
    $lz.style.display       = 'none';
    $pause.style.display    = 'none';
    $supplyBar.style.display= 'none';
    stopFire(); releaseAll(); shiftKey(false);
    aimNx = 0; aimNy = 0;
  }

  /* ═══════════════════════════════════════════════════════
     12.  GAME STATE DETECTION
  ═══════════════════════════════════════════════════════ */
  function vis(id) { const el = document.getElementById(id); return el && window.getComputedStyle(el).display !== 'none'; }

  function evalState() {
    const gsOn = vis('game-screen');
    const usOn = vis('upgrade-screen');
    const goOn = vis('game-over-screen');

    /* Game Over → hide everything */
    if (goOn && !gameOverOn) { gameOverOn = true; hideAll(); return; }
    if (!goOn && gameOverOn) { gameOverOn = false; }

    /* Not in game */
    if (!gsOn) {
      if (gameOn || upgradeOn) { gameOn = false; upgradeOn = false; hideAll(); checkRot(); }
      return;
    }

    /* Game screen is up */
    if (!gameOn) {
      gameOn = true; tryLock(); repositionAmmo(); hideMinimap();
      showGame(); return;  /* show controls immediately on first detection */
    }

    if (usOn && !upgradeOn) {
      upgradeOn = true; showUpgrade();
    } else if (!usOn && upgradeOn) {
      upgradeOn = false; showGame();
    } else if (!upgradeOn && $lc.style.display !== 'flex') {
      showGame();   /* recovery */
    }
  }

  function attachObs() {
    const $gs = document.getElementById('game-screen');
    const $us = document.getElementById('upgrade-screen');
    const $go = document.getElementById('game-over-screen');
    if (!$gs) { setTimeout(attachObs, 300); return; }
    const obs = new MutationObserver(evalState);
    obs.observe($gs, { attributes:true, attributeFilter:['style','class'] });
    if ($us) obs.observe($us, { attributes:true, attributeFilter:['style','class'] });
    if ($go) obs.observe($go, { attributes:true, attributeFilter:['style','class'] });
    if ($gs.parentElement) obs.observe($gs.parentElement, { childList:true });

    /* Watch pause-menu: hide mobile controls while paused, restore on resume */
    const $pm = document.getElementById('pause-menu');
    if ($pm) {
      const pmObs = new MutationObserver(() => {
        const pmVisible = window.getComputedStyle($pm).display !== 'none';
        if (pmVisible) {
          $lc.style.display = 'none';
          $rc.style.display = 'none';
          $lz.style.display = 'none';
        } else if (gameOn && !upgradeOn) {
          showGame();
        }
      });
      pmObs.observe($pm, { attributes:true, attributeFilter:['style'] });
    }

    evalState();
  }

  setInterval(evalState, 380);

  /* ═══════════════════════════════════════════════════════
     13.  BROWSER GESTURE PREVENTION
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    if ($supplyBar.contains(e.target) || $sRow.contains(e.target)) return;
    /* allow touch on pause-menu and game-over overlays */
    const $pm2 = document.getElementById('pause-menu');
    const $go2 = document.getElementById('game-over-screen');
    if ($pm2 && $pm2.contains(e.target)) return;
    if ($go2 && $go2.contains(e.target)) return;
    if (e.cancelable) e.preventDefault();
  }, { passive:false });

  document.addEventListener('contextmenu', (e) => { if (gameOn) e.preventDefault(); });

  let $vp = document.querySelector('meta[name="viewport"]');
  if (!$vp) { $vp = document.createElement('meta'); $vp.name='viewport'; document.head.appendChild($vp); }
  const VP_N = 'width=device-width,initial-scale=1';
  const VP_G = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';
  $vp.content = VP_N;

  const _sG = showGame; showGame   = () => { _sG(); $vp.content = VP_G; };
  const _sU = showUpgrade; showUpgrade = () => { _sU(); $vp.content = VP_G; };
  const _hA = hideAll; hideAll     = () => { _hA(); $vp.content = VP_N; };

  /* ═══════════════════════════════════════════════════════
     14.  INIT
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
    patchOverlayButtons();
    /* retry until buttons are found and patched */
    const patchT = setInterval(() => { patchOverlayButtons(); }, 600);
    setTimeout(() => clearInterval(patchT), 12000);
  }

  function patchOverlayButtons() {
    /* ── CONTINUE button ── */
    const $pm = document.getElementById('pause-menu');
    if ($pm) {
      const $cont = $pm.querySelector('button[onclick*="resumeGame"]');
      if ($cont && !$cont._mobPatched) {
        $cont._mobPatched = true;
        $cont.style.touchAction = 'manipulation';
        $cont.style.pointerEvents = 'auto';
        $cont.style.cursor = 'pointer';
        $cont.addEventListener('touchstart', (ev) => { ev.stopPropagation(); }, { passive:true });
        $cont.addEventListener('touchend', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          jTid = null; aTid = null; sTid = null;
          releaseAll(); stopFire(); shiftKey(false);
          setTimeout(() => { if (typeof window.resumeGame === 'function') window.resumeGame(); }, 0);
        }, { passive:false });
      }
    }
    /* ── PLAY AGAIN button ── */
    const $go = document.getElementById('game-over-screen');
    if ($go) {
      const $again = $go.querySelector('button[onclick*="restartGame"]');
      if ($again && !$again._mobPatched) {
        $again._mobPatched = true;
        $again.style.touchAction = 'manipulation';
        $again.style.pointerEvents = 'auto';
        $again.style.cursor = 'pointer';
        $again.addEventListener('touchstart', (ev) => { ev.stopPropagation(); }, { passive:true });
        $again.addEventListener('touchend', (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          jTid = null; aTid = null; sTid = null;
          releaseAll(); stopFire(); shiftKey(false);
          setTimeout(() => { if (typeof window.restartGame === 'function') window.restartGame(); }, 0);
        }, { passive:false });
      }
    }
  }

})();
