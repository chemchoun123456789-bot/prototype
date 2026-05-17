/* ═══════════════════════════════════════════════════════════
   mobile.js  —  LAST STAND: MACHINE WAR  (v4 twin-stick)
   AFTER script.js, before </body>.  Desktop exits instantly.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 0. GATE ──────────────────────────────────────────── */
  if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

  /* ═══════════════════════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════════════════════ */
  const JOY_R     = 44;   // joystick max travel (px)
  const DEADZONE  = 9;    // ignore micro-movements
  const AXIS      = 0.30; // diagonal threshold
  const CHARGE_MS = 380;  // hold → charge animation

  /* ═══════════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════════ */
  let gameOn    = false;
  let upgradeOn = false;

  /* move joystick */
  let jTid = null, jOx = 0, jOy = 0;
  /* aim joystick */
  let aTid = null, aOx = 0, aOy = 0;
  let aiming = false;     // mousedown currently held
  let chargeTimer = null;
  /* sprint */
  let sTid = null;

  /* aim direction (normalised, used for fireDown aim point) */
  let aimNx = 0, aimNy = 0;

  /* WASD */
  const held = { w:false, a:false, s:false, d:false };
  const KC   = { w:87, a:65, s:83, d:68 };

  /* ═══════════════════════════════════════════════════════
     SVG ICONS
  ═══════════════════════════════════════════════════════ */
  /* Move knob: compass cross arrows */
  const SVG_MOVE = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 5 L16.5 13 L20 10.5 L23.5 13 Z" fill="rgba(255,255,255,.75)"/>
    <path d="M20 35 L16.5 27 L20 29.5 L23.5 27 Z" fill="rgba(255,255,255,.75)"/>
    <path d="M5 20 L13 16.5 L10.5 20 L13 23.5 Z" fill="rgba(255,255,255,.75)"/>
    <path d="M35 20 L27 16.5 L29.5 20 L27 23.5 Z" fill="rgba(255,255,255,.75)"/>
    <circle cx="20" cy="20" r="2.2" fill="rgba(255,255,255,.50)"/>
  </svg>`;

  /* Aim knob: crosshair / target reticle */
  const SVG_AIM = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="8" stroke="rgba(0,238,255,.90)" stroke-width="1.6"/>
    <circle cx="20" cy="20" r="2" fill="rgba(0,238,255,1)"/>
    <line x1="20" y1="4"  x2="20" y2="11" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="20" y1="29" x2="20" y2="36" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="4"  y1="20" x2="11" y2="20" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="29" y1="20" x2="36" y2="20" stroke="rgba(0,238,255,.80)" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="5" stroke="rgba(0,238,255,.35)" stroke-width="1" fill="none"/>
  </svg>`;

  /* Sprint: lightning bolt */
  const SVG_SPRINT = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="13,2 4,14 11,14 11,22 20,10 13,10"
      fill="rgba(255,210,0,.88)" stroke="rgba(255,225,0,.55)"
      stroke-width="1" stroke-linejoin="round"/>
  </svg>`;

  /* ═══════════════════════════════════════════════════════
     1.  ROTATE OVERLAY
  ═══════════════════════════════════════════════════════ */
  const $rot = document.createElement('div');
  $rot.id = 'mob-rotate-overlay';
  $rot.innerHTML = `<div class="mob-rot-box">
    <div class="mob-rot-phone">📱</div>
    <div class="mob-rot-title">ROTATE YOUR DEVICE</div>
    <div class="mob-rot-sub">LANDSCAPE MODE REQUIRED</div>
    <div class="mob-rot-arrow">↺</div>
  </div>`;
  document.body.appendChild($rot);

  function checkRot() {
    $rot.classList.toggle('show', gameOn && window.innerHeight > window.innerWidth);
  }
  window.addEventListener('resize',            checkRot);
  window.addEventListener('orientationchange', () => setTimeout(checkRot, 150));

  function tryLock() {
    if (screen.orientation && screen.orientation.lock)
      screen.orientation.lock('landscape').catch(checkRot);
    else checkRot();
  }

  /* ═══════════════════════════════════════════════════════
     2.  LEFT-ZONE CAPTURE  (prevents canvas touch-ring)
  ═══════════════════════════════════════════════════════ */
  const $lz = document.createElement('div');
  $lz.id = 'mob-left-zone';
  document.body.appendChild($lz);

  /* Any touch on the left half routes to the move joystick */
  $lz.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (jTid !== null) return;
    const t = e.changedTouches[0];
    jTid = t.identifier;
    jOx  = t.clientX;      // dynamic origin = touch point
    jOy  = t.clientY;
    $jKnob.classList.add('active');
    applyJoy(0, 0);
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     3.  KEY HELPERS
  ═══════════════════════════════════════════════════════ */
  function press(k) {
    if (held[k]) return; held[k] = true;
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key:k.toUpperCase(), code:`Key${k.toUpperCase()}`,
      keyCode:KC[k], which:KC[k], bubbles:true, cancelable:true
    }));
  }
  function release(k) {
    if (!held[k]) return; held[k] = false;
    document.dispatchEvent(new KeyboardEvent('keyup', {
      key:k.toUpperCase(), code:`Key${k.toUpperCase()}`,
      keyCode:KC[k], which:KC[k], bubbles:true, cancelable:true
    }));
  }
  function releaseAll() { 'wasd'.split('').forEach(release); }

  function shiftKey(down) {
    document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
      key:'Shift', code:'ShiftLeft', keyCode:16, which:16, bubbles:true
    }));
  }

  /* ═══════════════════════════════════════════════════════
     4.  CANVAS REFERENCE
  ═══════════════════════════════════════════════════════ */
  function getCV() {
    return document.getElementById('game-canvas') || document.getElementById('c');
  }

  /* Send mousemove to canvas at aim direction */
  function sendMouseMove(nx, ny) {
    const $cv = getCV(); if (!$cv) return;
    const r = $cv.getBoundingClientRect();
    const reach = Math.min(r.width, r.height) * 0.38;
    $cv.dispatchEvent(new MouseEvent('mousemove', {
      clientX: r.left + r.width/2  + nx * reach,
      clientY: r.top  + r.height/2 + ny * reach,
      bubbles:true, cancelable:true
    }));
  }

  function aimPt() {
    const $cv = getCV();
    if (!$cv) return { x:window.innerWidth/2, y:window.innerHeight/2 };
    const r = $cv.getBoundingClientRect();
    const reach = Math.min(r.width, r.height) * 0.38;
    return {
      x: r.left + r.width/2  + aimNx * reach,
      y: r.top  + r.height/2 + aimNy * reach
    };
  }

  function fireDown() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mousedown', {
      clientX:x, clientY:y, button:0, buttons:1,
      bubbles:true, cancelable:true
    }));
  }

  function fireUp() {
    const $cv = getCV(); if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mouseup',  { clientX:x, clientY:y, button:0, buttons:0, bubbles:true, cancelable:true }));
    $cv.dispatchEvent(new MouseEvent('click',    { clientX:x, clientY:y, button:0, bubbles:true, cancelable:true }));
  }

  /* ═══════════════════════════════════════════════════════
     5.  LEFT CONTROLS  (move joystick + supply row)
  ═══════════════════════════════════════════════════════ */
  const $lControls = document.createElement('div');
  $lControls.id = 'mob-left-controls';
  $lControls.innerHTML = `
    <!-- supply row goes here via JS -->
    <div id="mob-supply-row"></div>
    <!-- move joystick -->
    <div id="mob-joy-wrap">
      <div id="mob-joy-base">
        <div id="mob-joy-knob">${SVG_MOVE}</div>
        <span id="mob-joy-label">MOVE</span>
      </div>
    </div>`;
  document.body.appendChild($lControls);

  const $jWrap = document.getElementById('mob-joy-wrap');
  const $jBase = document.getElementById('mob-joy-base');
  const $jKnob = document.getElementById('mob-joy-knob');

  function applyJoy(rawDx, rawDy) {
    const dist = Math.hypot(rawDx, rawDy);
    const clamp = Math.min(dist, JOY_R);
    const nx = dist > 0 ? rawDx/dist : 0;
    const ny = dist > 0 ? rawDy/dist : 0;
    $jKnob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;

    if (dist < DEADZONE) { releaseAll(); return; }
    if (ny < -AXIS) press('w'); else release('w');
    if (ny >  AXIS) press('s'); else release('s');
    if (nx < -AXIS) press('a'); else release('a');
    if (nx >  AXIS) press('d'); else release('d');
  }

  /* Move joystick touchstart (on the widget itself) */
  $jWrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (jTid !== null) return;
    const t = e.changedTouches[0];
    jTid = t.identifier;
    const br = $jBase.getBoundingClientRect();
    jOx = br.left + br.width  / 2;
    jOy = br.top  + br.height / 2;
    $jKnob.classList.add('active');
    applyJoy(t.clientX - jOx, t.clientY - jOy);
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     6.  RIGHT CONTROLS  (aim joystick + sprint)
  ═══════════════════════════════════════════════════════ */
  const $rControls = document.createElement('div');
  $rControls.id = 'mob-right-controls';
  $rControls.innerHTML = `
    <!-- sprint (above aim in DOM = visually on top) -->
    <div id="mob-sprint" role="button" aria-label="Sprint">
      ${SVG_SPRINT}
      <span id="mob-sprint-lbl">SPRINT</span>
    </div>
    <!-- aim joystick (below sprint in DOM = bottom of screen) -->
    <div id="mob-aim-wrap">
      <div id="mob-aim-base">
        <div id="mob-aim-knob">${SVG_AIM}</div>
        <span id="mob-aim-label">AIM + FIRE</span>
      </div>
    </div>`;
  document.body.appendChild($rControls);

  const $aBase   = document.getElementById('mob-aim-base');
  const $aKnob   = document.getElementById('mob-aim-knob');
  const $sprint  = document.getElementById('mob-sprint');

  function applyAim(rawDx, rawDy) {
    const dist = Math.hypot(rawDx, rawDy);
    const clamp = Math.min(dist, JOY_R);
    const nx = dist > 0 ? rawDx/dist : 0;
    const ny = dist > 0 ? rawDy/dist : 0;
    $aKnob.style.transform = `translate(calc(-50% + ${nx*clamp}px), calc(-50% + ${ny*clamp}px))`;

    if (dist < DEADZONE) {
      /* returned to centre — release fire */
      if (aiming) { fireUp(); aiming = false; }
      $aBase.classList.remove('aiming','charging');
      $aKnob.classList.remove('active','charging');
      clearTimeout(chargeTimer);
      aimNx = 0; aimNy = 0;
      return;
    }

    aimNx = nx; aimNy = ny;
    sendMouseMove(nx, ny);         // update aim on canvas

    if (!aiming) {
      aiming = true;
      $aBase.classList.add('aiming');
      $aKnob.classList.add('active');
      fireDown();                  // start shooting / charging

      /* After CHARGE_MS: show charge visual */
      chargeTimer = setTimeout(() => {
        $aBase.classList.add('charging');
        $aKnob.classList.add('charging');
      }, CHARGE_MS);
    }
  }

  /* Aim joystick touchstart */
  document.getElementById('mob-aim-wrap').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (aTid !== null) return;
    const t = e.changedTouches[0];
    aTid = t.identifier;
    const br = $aBase.getBoundingClientRect();
    aOx = br.left + br.width  / 2;
    aOy = br.top  + br.height / 2;
    applyAim(t.clientX - aOx, t.clientY - aOy);
  }, { passive:false });

  /* Sprint touchstart */
  $sprint.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (sTid !== null) return;
    sTid = e.changedTouches[0].identifier;
    $sprint.classList.add('active');
    shiftKey(true);
  }, { passive:false });

  /* ═══════════════════════════════════════════════════════
     7.  GLOBAL TOUCH ROUTER  — single handler for move+aim
         This is what enables simultaneous multi-touch.
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    let consumed = false;
    for (const t of e.changedTouches) {
      if (t.identifier === jTid) {
        applyJoy(t.clientX - jOx, t.clientY - jOy);
        consumed = true;
      }
      if (t.identifier === aTid) {
        applyAim(t.clientX - aOx, t.clientY - aOy);
        consumed = true;
      }
    }
    if (consumed) e.preventDefault();
  }, { passive:false });

  document.addEventListener('touchend',    onEnd);
  document.addEventListener('touchcancel', onEnd);

  function onEnd(e) {
    for (const t of e.changedTouches) {
      /* move joystick released */
      if (t.identifier === jTid) {
        jTid = null;
        $jKnob.classList.remove('active');
        $jKnob.style.transform = 'translate(-50%,-50%)';
        releaseAll();
      }
      /* aim joystick released → fire/release charge */
      if (t.identifier === aTid) {
        aTid = null;
        clearTimeout(chargeTimer);
        $aBase.classList.remove('aiming','charging');
        $aKnob.classList.remove('active','charging');
        $aKnob.style.transform = 'translate(-50%,-50%)';
        if (aiming) { fireUp(); aiming = false; }
        aimNx = 0; aimNy = 0;
      }
      /* sprint released */
      if (t.identifier === sTid) {
        sTid = null;
        $sprint.classList.remove('active');
        shiftKey(false);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     8.  SUPPLY BUTTONS  (moved into #mob-supply-row)
  ═══════════════════════════════════════════════════════ */
  const $supplyRow = document.getElementById('mob-supply-row');
  const $supplyBar = document.createElement('div');      // upgrade-screen variant
  $supplyBar.id    = 'mob-supply-bar';
  document.body.appendChild($supplyBar);

  const SUPPLY_MAP = [
    { id:'btn-spawn-ammo',   fn:'spawnSupply', arg:'ammo'   },
    { id:'btn-spawn-shield', fn:'spawnSupply', arg:'shield' },
    { id:'btn-spawn-heal',   fn:'spawnSupply', arg:'heal'   },
  ];
  const supplyEls = [];   // keep refs for moving between row ↔ bar

  function initSupply() {
    SUPPLY_MAP.forEach(({ id, fn, arg }) => {
      const $b = document.getElementById(id);
      if (!$b) return;
      supplyEls.push($b);
      $supplyRow.appendChild($b);    // default home = in-game row
      $b.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        if (typeof window[fn] === 'function') window[fn](arg); else $b.click();
      }, { passive:true });
    });
  }

  function moveSupplyTo(target) {
    supplyEls.forEach(el => target.appendChild(el));
  }

  /* ═══════════════════════════════════════════════════════
     9.  AMMO COUNTER  — reposition to top-left below stats
  ═══════════════════════════════════════════════════════ */
  function repositionAmmo() {
    const $a = document.getElementById('hud-ammo-big');
    if (!$a) return;
    const $p = $a.parentElement;
    if (!$p) return;
    /* Override the inline bottom:24px / left:50% styles */
    $p.style.position  = 'fixed';
    $p.style.top       = '56px';   /* below 3 HUD bars */
    $p.style.left      = '14px';
    $p.style.bottom    = 'auto';
    $p.style.transform = 'none';
    $p.style.textAlign = 'left';
    $a.style.fontSize  = '13px';
    $a.style.letterSpacing = '1px';
    /* shrink the "AMMO" sub-label */
    const $lbl = $a.nextElementSibling;
    if ($lbl) { $lbl.style.fontSize = '7px'; $lbl.style.letterSpacing = '2px'; }
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
      if (cs.position === 'absolute' || cs.position === 'fixed') {
        p.style.setProperty('display','none','important');
        break;
      }
      p = p.parentElement;
    }
  }

  /* ═══════════════════════════════════════════════════════
     11.  SHOW / HIDE  per game state
  ═══════════════════════════════════════════════════════ */
  function showGame() {
    $lControls.style.display = 'flex';
    $rControls.style.display = 'flex';
    $lz.style.display        = 'block';
    $supplyBar.style.display = 'none';
    moveSupplyTo($supplyRow);   // supply buttons back under joystick
  }

  function showUpgrade() {
    $lControls.style.display = 'none';
    $rControls.style.display = 'none';
    $lz.style.display        = 'none';
    $supplyBar.style.display = 'flex';
    moveSupplyTo($supplyBar);   // supply buttons in centre bar
    releaseAll(); shiftKey(false);
    if (aiming) { fireUp(); aiming = false; }
  }

  function hideAll() {
    $lControls.style.display = 'none';
    $rControls.style.display = 'none';
    $lz.style.display        = 'none';
    $supplyBar.style.display = 'none';
    releaseAll(); shiftKey(false);
    if (aiming) { fireUp(); aiming = false; }
  }

  /* ═══════════════════════════════════════════════════════
     12.  GAME STATE DETECTION
  ═══════════════════════════════════════════════════════ */
  function vis(el) { return el && window.getComputedStyle(el).display !== 'none'; }

  function evalState() {
    const $gs = document.getElementById('game-screen');
    const $us = document.getElementById('upgrade-screen');
    const gsOn = vis($gs);
    const usOn = vis($us);

    if (!gsOn) {
      if (gameOn || upgradeOn) { gameOn = false; upgradeOn = false; hideAll(); checkRot(); }
      return;
    }
    if (!gameOn) { gameOn = true; tryLock(); repositionAmmo(); hideMinimap(); }

    if (usOn && !upgradeOn) {
      upgradeOn = true; showUpgrade();
    } else if (!usOn && upgradeOn) {
      upgradeOn = false; showGame();
    } else if (!upgradeOn && $lControls.style.display === 'none') {
      showGame();   /* recovery: controls got hidden somehow */
    }
  }

  function attachObs() {
    const $gs = document.getElementById('game-screen');
    const $us = document.getElementById('upgrade-screen');
    if (!$gs) { setTimeout(attachObs, 300); return; }
    const obs = new MutationObserver(evalState);
    obs.observe($gs, { attributes:true, attributeFilter:['style','class'] });
    if ($us) obs.observe($us, { attributes:true, attributeFilter:['style','class'] });
    if ($gs.parentElement) obs.observe($gs.parentElement, { childList:true });
    evalState();
  }

  setInterval(evalState, 380);   // fallback poll

  /* ═══════════════════════════════════════════════════════
     13.  BROWSER GESTURE PREVENTION
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    if ($supplyBar.contains(e.target) || $supplyRow.contains(e.target)) return;
    if (e.cancelable) e.preventDefault();
  }, { passive:false });

  document.addEventListener('contextmenu', (e) => { if (gameOn) e.preventDefault(); });

  let $vp = document.querySelector('meta[name="viewport"]');
  if (!$vp) { $vp = document.createElement('meta'); $vp.name='viewport'; document.head.appendChild($vp); }
  const VP_N = 'width=device-width,initial-scale=1';
  const VP_G = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';
  $vp.content = VP_N;

  const _sG = showGame;
  showGame = () => { _sG(); $vp.content = VP_G; };
  const _sU = showUpgrade;
  showUpgrade = () => { _sU(); $vp.content = VP_G; };
  const _hA = hideAll;
  hideAll = () => { _hA(); $vp.content = VP_N; };

  /* ═══════════════════════════════════════════════════════
     14.  INIT
  ═══════════════════════════════════════════════════════ */
  function init() {
    hideAll();

    /* Supply buttons may not exist until game starts */
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

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();

})();
