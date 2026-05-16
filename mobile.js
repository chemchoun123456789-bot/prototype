/* ═══════════════════════════════════════════════════════════
   mobile.js  —  LAST STAND: MACHINE WAR
   Place AFTER script.js, before </body>.
   Leaves desktop 100% untouched.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── 0. GATE: desktop exits immediately ─────────────── */
  if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

  /* ═══════════════════════════════════════════════════════
     CONSTANTS & STATE
  ═══════════════════════════════════════════════════════ */
  const JOY_R      = 46;   // joystick max travel px
  const DEADZONE   = 8;
  const AXIS       = 0.30; // diagonal axis threshold
  const CHARGE_MS  = 350;  // hold → charge shot

  let gameOn      = false;

  /* joystick state */
  let jTid = null, jOx = 0, jOy = 0;
  let aimX = 0, aimY = 0;          // normalised aim direction (-1..1)

  /* fire state */
  let fTid  = null;
  let fTimer = null;
  let fCharge = false;

  /* sprint state */
  let sTid = null;

  /* held keys */
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
    const portrait = window.innerHeight > window.innerWidth;
    $rot.classList.toggle('show', gameOn && portrait);
  }
  window.addEventListener('resize',            checkRot);
  window.addEventListener('orientationchange', () => setTimeout(checkRot, 150));

  function tryLock() {
    if (screen.orientation && screen.orientation.lock)
      screen.orientation.lock('landscape').catch(checkRot);
    else checkRot();
  }

  /* ═══════════════════════════════════════════════════════
     2.  SUPPLY BAR  — re-parent original buttons top-centre
  ═══════════════════════════════════════════════════════ */
  const $supplyBar = document.createElement('div');
  $supplyBar.id = 'mob-supply-bar';
  document.body.appendChild($supplyBar);

  /* We defer reparenting until the original buttons exist in the DOM */
  function initSupplyButtons() {
    const ids = ['btn-spawn-ammo', 'btn-spawn-shield', 'btn-spawn-heal'];
    const fns = ['spawnSupply',    'spawnSupply',       'spawnSupply'   ];
    const arg = ['ammo',           'shield',            'heal'          ];

    ids.forEach((id, i) => {
      const $b = document.getElementById(id);
      if (!$b) return;

      /* move into our fixed bar */
      $supplyBar.appendChild($b);

      /* direct touchstart → game function, bypassing any event blocking */
      $b.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        if (typeof window[fns[i]] === 'function') window[fns[i]](arg[i]);
        else $b.click();
      }, { passive: true });
    });
  }

  /* ═══════════════════════════════════════════════════════
     3.  HIDE MINIMAP
  ═══════════════════════════════════════════════════════ */
  function hideMinimap() {
    const $mc = document.getElementById('minimap-canvas');
    if (!$mc) return;
    /* hide the canvas and its parent wrapper */
    $mc.style.setProperty('display', 'none', 'important');
    let p = $mc.parentElement;
    while (p && p !== document.body) {
      const s = window.getComputedStyle(p);
      if (s.position === 'absolute' || s.position === 'fixed') {
        p.style.setProperty('display', 'none', 'important');
        break;
      }
      p = p.parentElement;
    }
  }

  /* ═══════════════════════════════════════════════════════
     4.  KEY HELPERS  (WASD dispatch)
  ═══════════════════════════════════════════════════════ */
  function press(k) {
    if (held[k]) return;
    held[k] = true;
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: k.toUpperCase(), code: `Key${k.toUpperCase()}`,
      keyCode: KC[k], which: KC[k], bubbles: true, cancelable: true
    }));
  }
  function release(k) {
    if (!held[k]) return;
    held[k] = false;
    document.dispatchEvent(new KeyboardEvent('keyup', {
      key: k.toUpperCase(), code: `Key${k.toUpperCase()}`,
      keyCode: KC[k], which: KC[k], bubbles: true, cancelable: true
    }));
  }
  function releaseAll() { 'wasd'.split('').forEach(release); }

  function pressShift(down) {
    document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
      key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16, bubbles: true
    }));
  }

  /* ═══════════════════════════════════════════════════════
     5.  CANVAS AIM  (simulates mouse direction)
  ═══════════════════════════════════════════════════════ */
  function getCanvas() {
    /* prefer #game-canvas (inside game-screen); fall back to #c */
    return document.getElementById('game-canvas') || document.getElementById('c');
  }

  function aim(nx, ny) {
    aimX = nx; aimY = ny;
    const $cv = getCanvas();
    if (!$cv) return;
    const r  = $cv.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const reach = Math.min(r.width, r.height) * 0.36;
    $cv.dispatchEvent(new MouseEvent('mousemove', {
      clientX: cx + nx * reach, clientY: cy + ny * reach,
      bubbles: true, cancelable: true
    }));
  }

  function aimPt() {
    const $cv = getCanvas();
    if (!$cv) return { x: window.innerWidth/2, y: window.innerHeight/2 };
    const r  = $cv.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const reach = Math.min(r.width, r.height) * 0.36;
    return { x: cx + aimX * reach, y: cy + aimY * reach };
  }

  /* ═══════════════════════════════════════════════════════
     6.  JOYSTICK BUILD
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

  function setKnob(dx, dy) {
    const dist = Math.hypot(dx, dy);
    const r    = Math.min(dist, JOY_R);
    const nx   = dist > 0 ? dx / dist : 0;
    const ny   = dist > 0 ? dy / dist : 0;
    $jKnob.style.transform = `translate(calc(-50% + ${nx*r}px), calc(-50% + ${ny*r}px))`;

    /* WASD */
    if (ny < -AXIS) press('w'); else release('w');
    if (ny >  AXIS) press('s'); else release('s');
    if (nx < -AXIS) press('a'); else release('a');
    if (nx >  AXIS) press('d'); else release('d');

    aim(dist > DEADZONE ? nx : 0, dist > DEADZONE ? ny : 0);
  }

  /* ── Joystick touch events ── */
  /* touchstart only on the joystick */
  $jWrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (jTid !== null) return;
    const t = e.changedTouches[0];
    jTid = t.identifier;
    const br = $jBase.getBoundingClientRect();
    jOx = br.left + br.width  / 2;
    jOy = br.top  + br.height / 2;
    $jKnob.classList.add('active');
    setKnob(t.clientX - jOx, t.clientY - jOy);
  }, { passive: false });

  /* touchmove on document — joystick tracked by its own id */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    let found = false;
    for (const t of e.changedTouches) {
      if (t.identifier === jTid) {
        found = true;
        setKnob(t.clientX - jOx, t.clientY - jOy);
        break;
      }
    }
    if (!found && fTid === null) return; // not our touch
    if (gameOn) e.preventDefault();
  }, { passive: false });

  /* touchend / touchcancel on document — release whichever finger */
  document.addEventListener('touchend', handleTouchEnd);
  document.addEventListener('touchcancel', handleTouchEnd);

  function handleTouchEnd(e) {
    for (const t of e.changedTouches) {
      /* joystick released */
      if (t.identifier === jTid) {
        jTid = null;
        $jKnob.classList.remove('active');
        $jKnob.style.transform = 'translate(-50%,-50%)';
        releaseAll();
        aimX = 0; aimY = 0;
      }
      /* fire released */
      if (t.identifier === fTid) {
        fTid = null;
        clearTimeout(fTimer);
        fireUp();
        $fire.classList.remove('active', 'charging');
        $fireLbl.textContent = 'FIRE';
        fCharge = false;
      }
      /* sprint released */
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

  /* ── SVGs ── */
  const svgSprint = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="12,2 4,14 11,14 10,22 20,10 13,10" fill="rgba(255,210,0,.88)" stroke="rgba(255,220,0,.55)" stroke-width="1" stroke-linejoin="round"/>
    </svg>`;

  const svgFire = `
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="14" cy="14" r="5.5" stroke="rgba(0,238,255,.88)" stroke-width="1.6"/>
      <line x1="14" y1="1.5"  x2="14" y2="7"   stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="14" y1="21"  x2="14" y2="26.5" stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="1.5" y1="14" x2="7"  y2="14"   stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="21" y1="14" x2="26.5" y2="14"  stroke="rgba(0,238,255,.72)" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="14" cy="14" r="2" fill="rgba(0,238,255,.95)"/>
    </svg>`;

  $actions.innerHTML = `
    <div id="mob-sprint" role="button" aria-label="Sprint">
      ${svgSprint}
      <span id="mob-sprint-lbl">SPRINT</span>
    </div>
    <div id="mob-fire" role="button" aria-label="Fire">
      <div id="mob-charge-ring"></div>
      ${svgFire}
      <span id="mob-fire-lbl">FIRE</span>
    </div>`;
  document.body.appendChild($actions);

  const $sprint  = document.getElementById('mob-sprint');
  const $fire    = document.getElementById('mob-fire');
  const $fireLbl = document.getElementById('mob-fire-lbl');

  /* ── SPRINT touch ── */
  $sprint.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (sTid !== null) return;
    sTid = e.changedTouches[0].identifier;
    $sprint.classList.add('active');
    pressShift(true);
  }, { passive: false });

  /* ── FIRE touch ── */
  $fire.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (fTid !== null) return;
    const t = e.changedTouches[0];
    fTid    = t.identifier;
    fCharge = false;
    $fire.classList.add('active');

    /* Charge timer: if held > CHARGE_MS → charge mode */
    fTimer = setTimeout(() => {
      fCharge = true;
      $fire.classList.add('charging');
      $fireLbl.textContent = 'CHARGE';
      fireDown(); /* hold mousedown = charge wind-up */
    }, CHARGE_MS);

    /* Immediate press */
    fireDown();
  }, { passive: false });

  function fireDown() {
    const $cv = getCanvas();
    if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mousedown', {
      clientX: x, clientY: y, button: 0, buttons: 1,
      bubbles: true, cancelable: true
    }));
  }

  function fireUp() {
    const $cv = getCanvas();
    if (!$cv) return;
    const { x, y } = aimPt();
    $cv.dispatchEvent(new MouseEvent('mouseup', {
      clientX: x, clientY: y, button: 0, buttons: 0,
      bubbles: true, cancelable: true
    }));
    $cv.dispatchEvent(new MouseEvent('click', {
      clientX: x, clientY: y, button: 0,
      bubbles: true, cancelable: true
    }));
  }

  /* ═══════════════════════════════════════════════════════
     8.  SHOW / HIDE ALL CONTROLS
  ═══════════════════════════════════════════════════════ */
  const $allControls = [$jWrap, $actions, $supplyBar];

  function showControls() {
    $jWrap.style.display      = 'flex';
    $actions.style.display    = 'flex';
    $supplyBar.style.display  = 'flex';
  }
  function hideControls() {
    $jWrap.style.display      = 'none';
    $actions.style.display    = 'none';
    $supplyBar.style.display  = 'none';
    releaseAll();
    pressShift(false);
  }

  /* ═══════════════════════════════════════════════════════
     9.  GAME DETECTION — watch #game-screen display
         This is the only reliable signal.
  ═══════════════════════════════════════════════════════ */
  function checkGameScreen() {
    const $gs = document.getElementById('game-screen');
    if (!$gs) return;
    const visible = window.getComputedStyle($gs).display !== 'none';

    if (visible && !gameOn) {
      gameOn = true;
      showControls();
      hideMinimap();
      tryLock();
    } else if (!visible && gameOn) {
      gameOn = false;
      hideControls();
      checkRot();
    }
  }

  /* MutationObserver on #game-screen's style/class */
  function attachObserver() {
    const $gs = document.getElementById('game-screen');
    if (!$gs) { setTimeout(attachObserver, 300); return; }

    const obs = new MutationObserver(checkGameScreen);
    obs.observe($gs, { attributes: true, attributeFilter: ['style', 'class'] });

    /* also watch parent in case wrapper changes */
    if ($gs.parentElement)
      obs.observe($gs.parentElement, { childList: true });

    checkGameScreen(); /* initial state check */
  }

  /* Fallback poll every 400 ms — catches cases where mutation fires oddly */
  setInterval(checkGameScreen, 400);

  /* ═══════════════════════════════════════════════════════
     10.  PREVENT UNWANTED BROWSER GESTURES IN-GAME
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('touchmove', (e) => {
    if (!gameOn) return;
    /* Allow supply bar touches to scroll / press normally */
    if ($supplyBar.contains(e.target)) return;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('contextmenu', (e) => {
    if (gameOn) e.preventDefault();
  });

  /* Disable pinch-zoom during game */
  let $vp = document.querySelector('meta[name="viewport"]');
  if (!$vp) {
    $vp = document.createElement('meta');
    $vp.name = 'viewport';
    document.head.appendChild($vp);
  }
  const VP_NORMAL = 'width=device-width,initial-scale=1';
  const VP_GAME   = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';
  $vp.content = VP_NORMAL;

  const _show = showControls;
  showControls = function () { _show(); $vp.content = VP_GAME; };
  const _hide = hideControls;
  hideControls = function () { _hide(); $vp.content = VP_NORMAL; };

  /* ═══════════════════════════════════════════════════════
     11.  INIT
  ═══════════════════════════════════════════════════════ */
  function init() {
    /* start hidden */
    hideControls();
    /* reparent supply buttons (they might not exist yet) */
    if (document.getElementById('btn-spawn-ammo')) {
      initSupplyButtons();
    } else {
      /* wait for game-loading to finish */
      const wait = setInterval(() => {
        if (document.getElementById('btn-spawn-ammo')) {
          clearInterval(wait);
          initSupplyButtons();
        }
      }, 500);
    }
    attachObserver();
    checkRot();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();

})();
