/* ═══════════════════════════════════════════════════════════
   mobile.js  —  LAST STAND: MACHINE WAR
   Place AFTER script.js, before </body>.
   Desktop untouched.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 0. GATE ──────────────────────────────────────────── */
  if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

  /* ═══════════════════════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════════════════════ */
  const JOY_R     = 44;
  const DEADZONE  = 8;
  const AXIS      = 0.30;
  const CHARGE_MS = 350;

  /* ═══════════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════════ */
  let gameOn    = false;
  let upgradeOn = false;

  /* joystick */
  let jTid = null, jOx = 0, jOy = 0;
  let aimX = 0, aimY = 0;

  /* fire */
  let fTid = null, fTimer = null, fCharge = false;

  /* sprint */
  let sTid = null;

  /* keys */
  const held = { w:false, a:false, s:false, d:false };
  const KC   = { w:87, a:65, s:83, d:68 };

  /* ═══════════════════════════════════════════════════════
     1.  ROTATE OVERLAY
  ═══════════════════════════════════════════════════════ */
  const $rot = document.createElement('div');
  $rot.id = 'mob-rotate-overlay';
  $rot.innerHTML = `
    <div class="mob-rot-box">
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
     2.  LEFT-ZONE CAPTURE
         Covers left 52% of screen — intercepts ALL touches
         on that side so the game canvas NEVER sees them.
         This kills the unwanted purple touch-ring.
  ═══════════════════════════════════════════════════════ */
  const $lz = document.createElement('div');
  $lz.id = 'mob-left-zone';
  document.body.appendChild($lz);

  /* Left-zone acts as a virtual joystick trigger zone.
     When player touches anywhere on the left side, it
     behaves like touching the joystick base.            */
  $lz.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (jTid !== null) return;          // only one joystick touch
    const t  = e.changedTouches[0];
    jTid     = t.identifier;
    /* use touch origin as the joystick centre */
    jOx      = t.clientX;
    jOy      = t.clientY;
    $jKnob.classList.add('active');
    moveKnob(0, 0);
  }, { passive: false });

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

  function pressShift(down) {
    document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
      key:'Shift', code:'ShiftLeft', keyCode:16, which:16, bubbles:true
    }));
  }

  /* ═══════════════════════════════════════════════════════
     4.  CANVAS AIM
  ═══════════════════════════════════════════════════════ */
  function getCV() {
    return document.getElementById('game-canvas') || document.getElementById('c');
  }
  function sendAim(nx, ny) {
    aimX = nx; aimY = ny;
    const $cv = getCV(); if (!$cv) return;
    const r = $cv.getBoundingClientRect();
    const reach = Math.min(r.width, r.height) * 0.36;
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
    const reach = Math.min(r.width, r.height) * 0.36;
    return { x: r.left + r.width/2  + aimX * reach,
             y: r.top  + r.height/2 + aimY * reach };
  }

  /* ═══════════════════════════════════════════════════════
     5.  JOYSTICK
  ═══════════════════════════════════════════════════════ */
  const $jWrap = document.createElement('div');
  $jWrap.id = 'mob-joy-wrap';
  $jWrap.innerHTML = `
    <div id="mob-joy-base">
      <div id="mob-joy-knob"></div>
      <span id="mob-joy-label">MOVE</span>
    </div>`;
  document.body.appendChild($jWrap);

  const $jBase = document.getElementById('mob-joy-base');
  const $jKnob = document.getElementById('mob-joy-knob');

  /* Joystick touchstart (on the actual joystick widget) */
  $jWrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (jTid !== null) return;
    const t = e.changedTouches[0];
    jTid = t.identifier;
    const br = $jBase.getBoundingClientRect();
    jOx  = br.left + br.width  / 2;
    jOy  = br.top  + br.height / 2;
    $jKnob.classList.add('active');
    moveKnob(t.clientX - jOx, t.clientY - jOy);
  }, { passive:false });

  function moveKnob(rawDX, rawDY) {
    const dist = Math.hypot(rawDX, rawDY);
    const r    = Math.min(dist, JOY_R);
    const nx   = dist > 0 ? rawDX / dist : 0;
    const ny   = dist > 0 ? rawDY / dist : 0;
    $jKnob.style.transform = `translate(calc(-50% + ${nx*r}px), calc(-50% + ${ny*r}px))`;

    if (dist < DEADZONE) { releaseAll(); sendAim(0,0); return; }
    if (ny < -AXIS) press('w'); else release('w');
    if (ny >  AXIS) press('s'); else release('s');
    if (nx < -AXIS) press('a'); else release('a');
    if (nx >  AXIS) press('d'); else release('d');
    sendAim(nx, ny);
  }

  /* ═══════════════════════════════════════════════════════
     6.  GLOBAL TOUCH ROUTER  (touchmove + touchend)
         Single document-level handler for all fingers.
         This is the key to multi-touch (move + shoot).
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    let handled = false;
    for (const t of e.changedTouches) {
      if (t.identifier === jTid) {
        // Route to joystick — use the INITIAL origin (fixed joystick or left-zone tap)
        moveKnob(t.clientX - jOx, t.clientY - jOy);
        handled = true;
      }
      // fTid and sTid don't need touchmove — they respond on start/end only
    }
    if (handled || fTid !== null || sTid !== null) e.preventDefault();
  }, { passive:false });

  document.addEventListener('touchend',    onTouchEnd);
  document.addEventListener('touchcancel', onTouchEnd);

  function onTouchEnd(e) {
    for (const t of e.changedTouches) {
      /* joystick finger lifted */
      if (t.identifier === jTid) {
        jTid = null;
        $jKnob.classList.remove('active');
        $jKnob.style.transform = 'translate(-50%,-50%)';
        releaseAll();
        aimX = 0; aimY = 0;
      }
      /* fire finger lifted */
      if (t.identifier === fTid) {
        fTid = null;
        clearTimeout(fTimer);
        fireUp();
        $fire.classList.remove('active','charging');
        $fireLbl.textContent = 'FIRE';
        fCharge = false;
      }
      /* sprint finger lifted */
      if (t.identifier === sTid) {
        sTid = null;
        $sprint.classList.remove('active');
        pressShift(false);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     7.  ACTION BUTTONS  (Sprint + Fire)
  ═══════════════════════════════════════════════════════ */
  const $actions = document.createElement('div');
  $actions.id = 'mob-actions';
  $actions.innerHTML = `
    <div id="mob-sprint" role="button" aria-label="Sprint">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polygon points="12,2 4,14 11,14 10,22 20,10 13,10"
          fill="rgba(255,210,0,.88)" stroke="rgba(255,220,0,.55)"
          stroke-width="1" stroke-linejoin="round"/>
      </svg>
      <span id="mob-sprint-lbl">SPRINT</span>
    </div>
    <div id="mob-fire" role="button" aria-label="Fire">
      <div id="mob-charge-ring"></div>
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="5.5" stroke="rgba(0,238,255,.88)" stroke-width="1.6"/>
        <line x1="14" y1="1.5"  x2="14" y2="7"    stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="14" y1="21"   x2="14" y2="26.5" stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="1.5" y1="14"  x2="7"  y2="14"   stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="21"  y1="14"  x2="26.5" y2="14" stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="14" cy="14" r="2" fill="rgba(0,238,255,.95)"/>
      </svg>
      <span id="mob-fire-lbl">FIRE</span>
    </div>`;
  document.body.appendChild($actions);

  const $sprint  = document.getElementById('mob-sprint');
  const $fire    = document.getElementById('mob-fire');
  const $fireLbl = document.getElementById('mob-fire-lbl');

  /* SPRINT */
  $sprint.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (sTid !== null) return;
    sTid = e.changedTouches[0].identifier;
    $sprint.classList.add('active');
    pressShift(true);
  }, { passive:false });

  /* FIRE */
  $fire.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (fTid !== null) return;
    fTid = e.changedTouches[0].identifier;
    fCharge = false;
    $fire.classList.add('active');

    fTimer = setTimeout(() => {
      fCharge = true;
      $fire.classList.add('charging');
      $fireLbl.textContent = 'CHARGE';
      fireDown();   // hold = charge wind-up
    }, CHARGE_MS);

    fireDown();     // immediate press
  }, { passive:false });

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
     8.  SUPPLY BAR
  ═══════════════════════════════════════════════════════ */
  const $sb = document.createElement('div');
  $sb.id = 'mob-supply-bar';
  document.body.appendChild($sb);

  function initSupply() {
    const map = [
      { id:'btn-spawn-ammo',   fn:'spawnSupply', arg:'ammo'   },
      { id:'btn-spawn-shield', fn:'spawnSupply', arg:'shield' },
      { id:'btn-spawn-heal',   fn:'spawnSupply', arg:'heal'   },
    ];
    map.forEach(({ id, fn, arg }) => {
      const $b = document.getElementById(id);
      if (!$b) return;
      $sb.appendChild($b);
      $b.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        if (typeof window[fn] === 'function') window[fn](arg); else $b.click();
      }, { passive:true });
    });
  }

  /* ═══════════════════════════════════════════════════════
     9.  SHOW / HIDE HELPERS
  ═══════════════════════════════════════════════════════ */
  /* Show everything for gameplay */
  function showGame() {
    $jWrap.style.display   = 'flex';
    $actions.style.display = 'flex';
    $lz.style.display      = 'block';
    $sb.style.display      = 'flex';
    $sb.className          = 'in-game';      // CSS positions to top
  }

  /* During upgrade selection: hide combat controls, keep supply bar */
  function showUpgrade() {
    $jWrap.style.display   = 'none';
    $actions.style.display = 'none';
    $lz.style.display      = 'none';
    $sb.style.display      = 'flex';
    $sb.className          = 'in-upgrade';   // CSS positions to bottom
    releaseAll();
    pressShift(false);
  }

  /* Hide everything (menus) */
  function hideAll() {
    $jWrap.style.display   = 'none';
    $actions.style.display = 'none';
    $lz.style.display      = 'none';
    $sb.style.display      = 'none';
    releaseAll();
    pressShift(false);
  }

  /* ═══════════════════════════════════════════════════════
     10.  GAME & UPGRADE STATE DETECTION
          #game-screen  → visible = game running
          #upgrade-screen → visible = upgrade selection
  ═══════════════════════════════════════════════════════ */
  function visible(el) {
    return el && window.getComputedStyle(el).display !== 'none';
  }

  function evalState() {
    const $gs = document.getElementById('game-screen');
    const $us = document.getElementById('upgrade-screen');

    const gsVisible = visible($gs);
    const usVisible = visible($us);

    if (!gsVisible) {
      /* Not in game at all */
      if (gameOn || upgradeOn) { gameOn = false; upgradeOn = false; hideAll(); checkRot(); }
      return;
    }

    /* Game screen is up */
    if (!gameOn) { gameOn = true; tryLock(); }

    if (usVisible && !upgradeOn) {
      upgradeOn = true;
      showUpgrade();
    } else if (!usVisible && upgradeOn) {
      upgradeOn = false;
      showGame();
    } else if (!upgradeOn) {
      /* Normal gameplay — make sure controls are visible */
      if ($jWrap.style.display === 'none') showGame();
    }
  }

  /* MutationObserver on both screens */
  function attachObs() {
    const $gs = document.getElementById('game-screen');
    const $us = document.getElementById('upgrade-screen');
    if (!$gs) { setTimeout(attachObs, 300); return; }

    const obs = new MutationObserver(evalState);
    obs.observe($gs, { attributes:true, attributeFilter:['style','class'] });
    if ($us) obs.observe($us, { attributes:true, attributeFilter:['style','class'] });
    /* Also watch parent for child-list changes */
    if ($gs.parentElement) obs.observe($gs.parentElement, { childList:true });

    evalState();
  }

  /* Fallback poll — runs every 350 ms to catch edge cases */
  setInterval(evalState, 350);

  /* ═══════════════════════════════════════════════════════
     11.  MINIMAP KILL
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
     12.  PREVENT BROWSER GESTURES IN-GAME
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    if ($sb.contains(e.target)) return;   // supply bar can scroll
    // prevent scroll / zoom / pull-to-refresh
    if (e.touches.length > 1 || e.cancelable) e.preventDefault();
  }, { passive:false });

  document.addEventListener('contextmenu', (e) => { if (gameOn) e.preventDefault(); });

  /* Strip pinch-zoom during game */
  let $vp = document.querySelector('meta[name="viewport"]');
  if (!$vp) { $vp = document.createElement('meta'); $vp.name='viewport'; document.head.appendChild($vp); }
  const VP_N = 'width=device-width,initial-scale=1';
  const VP_G = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';
  $vp.content = VP_N;

  const _sG = showGame;
  showGame = function() { _sG(); $vp.content = VP_G; };
  const _sU = showUpgrade;
  showUpgrade = function() { _sU(); $vp.content = VP_G; };
  const _hA = hideAll;
  hideAll = function() { _hA(); $vp.content = VP_N; };

  /* ═══════════════════════════════════════════════════════
     13.  INIT
  ═══════════════════════════════════════════════════════ */
  function init() {
    hideAll();   // start hidden

    /* Supply buttons might load async with game */
    if (document.getElementById('btn-spawn-ammo')) {
      initSupply();
    } else {
      const t = setInterval(() => {
        if (document.getElementById('btn-spawn-ammo')) {
          clearInterval(t); initSupply();
        }
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
