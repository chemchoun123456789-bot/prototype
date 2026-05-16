/* ═══════════════════════════════════════════════════════
   mobile.js — LAST STAND: MACHINE WAR
   Link AFTER script.js, before </body>
   Touches NOTHING on desktop.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 0. MOBILE GATE — bail on desktop immediately ─── */
  const IS_MOBILE =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(max-width: 900px)').matches;

  if (!IS_MOBILE) return;

  /* ══════════════════════════════════════════════════════
     1.  LANDSCAPE LOCK
  ══════════════════════════════════════════════════════ */
  let $overlay   = null;
  let gameActive = false;

  function buildOverlay() {
    $overlay = document.createElement('div');
    $overlay.id = 'mob-landscape-overlay';
    $overlay.innerHTML = `
      <div class="mob-rotate-inner">
        <div class="mob-rotate-phone">📱</div>
        <div class="mob-rotate-title">ROTATE YOUR DEVICE</div>
        <div class="mob-rotate-sub">LANDSCAPE MODE REQUIRED</div>
        <div class="mob-rotate-arrow">↺</div>
      </div>`;
    document.body.appendChild($overlay);
  }

  function checkOrientation() {
    if (!$overlay) return;
    const portrait = window.innerHeight > window.innerWidth;
    $overlay.classList.toggle('mob-visible', gameActive && portrait);
  }

  function tryLockLandscape() {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      screen.orientation.lock('landscape').catch(checkOrientation);
    } else {
      checkOrientation();
    }
  }

  window.addEventListener('resize',            checkOrientation);
  window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 150));

  /* ══════════════════════════════════════════════════════
     2.  SUPPLY BUTTONS  — move to top-center + touch fix
  ══════════════════════════════════════════════════════ */

  function setupSupplyBar() {
    // Create our wrapper bar
    const $bar = document.createElement('div');
    $bar.id = 'mob-supply-bar';
    document.body.appendChild($bar);

    // Grab the three original supply buttons from the DOM
    const ids = ['btn-spawn-ammo', 'btn-spawn-shield', 'btn-spawn-heal'];
    const fns = ['spawnSupply', 'spawnSupply', 'spawnSupply'];
    const args = ['ammo', 'shield', 'heal'];

    ids.forEach((id, i) => {
      const $btn = document.getElementById(id);
      if (!$btn) return;

      // Re-parent into our bar
      $bar.appendChild($btn);

      // Guarantee touch works: touchstart → call the game function directly
      $btn.addEventListener('touchstart', (e) => {
        e.stopPropagation();  // don't let joystick/shoot intercept
        // call the game's function if available
        if (typeof window[fns[i]] === 'function') {
          window[fns[i]](args[i]);
        } else {
          // fallback: simulate click
          $btn.click();
        }
      }, { passive: true });
    });

    // Also hide the original empty wrapper that held them (bottom-left absolute div)
    // We find it by looking for the parent of btn-spawn-ammo before we moved it
    // (already moved, so the original parent is now empty — JS will tidy it)
  }

  /* ══════════════════════════════════════════════════════
     3.  MINIMAP — hide its parent wrapper
  ══════════════════════════════════════════════════════ */

  function hideMinimap() {
    const $mc = document.getElementById('minimap-canvas');
    if (!$mc) return;
    // Walk up to the absolute-positioned wrapper div (bottom:16px right:16px)
    let $parent = $mc.parentElement;
    while ($parent && $parent !== document.body) {
      const s = $parent.style;
      // The minimap wrapper has bottom:16px and right:16px in inline style
      if (s.bottom && s.right && s.position === 'absolute') {
        $parent.id = 'mob-minimap-parent'; // CSS will display:none this
        $parent.style.setProperty('display', 'none', 'important');
        break;
      }
      $parent = $parent.parentElement;
    }
  }

  /* ══════════════════════════════════════════════════════
     4.  VIRTUAL JOYSTICK
  ══════════════════════════════════════════════════════ */

  const JOY_RADIUS  = 44;  // max knob travel in px
  const DEADZONE    = 9;
  const AXIS_CUT    = 0.32; // diagonal threshold

  let joyTouchId = null;
  let joyOX = 0, joyOY = 0;
  let aimNX = 0, aimNY = 0;

  const held = { w: false, a: false, s: false, d: false };
  const KEYCODES = { w: 87, a: 65, s: 83, d: 68 };

  function pressKey(k) {
    if (held[k]) return;
    held[k] = true;
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: k.toUpperCase(), code: `Key${k.toUpperCase()}`,
      keyCode: KEYCODES[k], which: KEYCODES[k],
      bubbles: true, cancelable: true,
    }));
  }
  function releaseKey(k) {
    if (!held[k]) return;
    held[k] = false;
    document.dispatchEvent(new KeyboardEvent('keyup', {
      key: k.toUpperCase(), code: `Key${k.toUpperCase()}`,
      keyCode: KEYCODES[k], which: KEYCODES[k],
      bubbles: true, cancelable: true,
    }));
  }
  function releaseAll() { Object.keys(held).forEach(releaseKey); }

  function applyDelta(dx, dy) {
    const dist = Math.hypot(dx, dy);
    if (dist < DEADZONE) { releaseAll(); aimNX = 0; aimNY = 0; return; }
    aimNX = dx / dist;
    aimNY = dy / dist;

    if (aimNY < -AXIS_CUT) pressKey('w'); else releaseKey('w');
    if (aimNY >  AXIS_CUT) pressKey('s'); else releaseKey('s');
    if (aimNX < -AXIS_CUT) pressKey('a'); else releaseKey('a');
    if (aimNX >  AXIS_CUT) pressKey('d'); else releaseKey('d');

    simulateAim(aimNX, aimNY);
  }

  function simulateAim(nx, ny) {
    const $c = document.getElementById('c');
    if (!$c) return;
    const r  = $c.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const reach = Math.min(r.width, r.height) * 0.34;
    $c.dispatchEvent(new MouseEvent('mousemove', {
      clientX: cx + nx * reach,
      clientY: cy + ny * reach,
      bubbles: true, cancelable: true,
    }));
  }

  function buildJoystick() {
    const $wrap = document.createElement('div');
    $wrap.id = 'mob-joystick-wrap';
    $wrap.innerHTML = `
      <div id="mob-joystick-base">
        <div id="mob-joystick-knob"></div>
        <span id="mob-joy-label">MOVE</span>
      </div>`;
    document.body.appendChild($wrap);

    const $base = document.getElementById('mob-joystick-base');
    const $knob = document.getElementById('mob-joystick-knob');

    $wrap.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (joyTouchId !== null) return;
      const t = e.changedTouches[0];
      joyTouchId = t.identifier;
      const r = $base.getBoundingClientRect();
      joyOX = r.left + r.width  / 2;
      joyOY = r.top  + r.height / 2;
      $knob.classList.add('mob-active');
      moveKnob($knob, t.clientX - joyOX, t.clientY - joyOY);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (joyTouchId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier !== joyTouchId) continue;
        e.preventDefault();
        moveKnob($knob, t.clientX - joyOX, t.clientY - joyOY);
        break;
      }
    }, { passive: false });

    const endJoy = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== joyTouchId) continue;
        joyTouchId = null;
        $knob.classList.remove('mob-active');
        $knob.style.transform = 'translate(-50%, -50%)';
        releaseAll();
        break;
      }
    };
    document.addEventListener('touchend',    endJoy);
    document.addEventListener('touchcancel', endJoy);
  }

  function moveKnob($knob, rawDX, rawDY) {
    const dist  = Math.hypot(rawDX, rawDY);
    const ratio = Math.min(1, dist / JOY_RADIUS);
    const nx    = dist > 0 ? rawDX / dist : 0;
    const ny    = dist > 0 ? rawDY / dist : 0;
    const cdx   = nx * ratio * JOY_RADIUS;
    const cdy   = ny * ratio * JOY_RADIUS;
    $knob.style.transform = `translate(calc(-50% + ${cdx}px), calc(-50% + ${cdy}px))`;
    applyDelta(rawDX, rawDY);
  }

  /* ══════════════════════════════════════════════════════
     5.  RIGHT-SIDE ACTIONS  (Sprint + Shoot)
  ══════════════════════════════════════════════════════ */

  const CHARGE_MS  = 360;   // hold threshold for charge-shot
  let shootTouchId = null;
  let chargeTimer  = null;
  let isCharging   = false;
  let sprintTouchId = null;

  function aimPoint() {
    const $c = document.getElementById('c');
    if (!$c) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r  = $c.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const reach = Math.min(r.width, r.height) * 0.34;
    return { x: cx + aimNX * reach, y: cy + aimNY * reach };
  }

  function mouseDown() {
    const $c = document.getElementById('c');
    if (!$c) return;
    const { x, y } = aimPoint();
    $c.dispatchEvent(new MouseEvent('mousedown', {
      clientX: x, clientY: y, button: 0, buttons: 1,
      bubbles: true, cancelable: true,
    }));
  }

  function mouseUp() {
    const $c = document.getElementById('c');
    if (!$c) return;
    const { x, y } = aimPoint();
    $c.dispatchEvent(new MouseEvent('mouseup', {
      clientX: x, clientY: y, button: 0, buttons: 0,
      bubbles: true, cancelable: true,
    }));
    $c.dispatchEvent(new MouseEvent('click', {
      clientX: x, clientY: y, button: 0,
      bubbles: true, cancelable: true,
    }));
  }

  function buildActions() {
    const $wrap = document.createElement('div');
    $wrap.id = 'mob-actions-wrap';

    /* ── Sprint SVG ── */
    const sprintSVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3.5L5 13.5H12L11 20.5L19 10.5H12L13 3.5Z"
            fill="rgba(255,210,0,0.85)" stroke="rgba(255,215,0,0.6)" stroke-width="1"/>
    </svg>`;

    /* ── Crosshair / Shoot SVG ── */
    const shootSVG = `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="5" stroke="rgba(0,238,255,0.85)" stroke-width="1.5"/>
      <line x1="14" y1="2"  x2="14" y2="8"  stroke="rgba(0,238,255,0.7)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14" y1="20" x2="14" y2="26" stroke="rgba(0,238,255,0.7)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2"  y1="14" x2="8"  y2="14" stroke="rgba(0,238,255,0.7)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="20" y1="14" x2="26" y2="14" stroke="rgba(0,238,255,0.7)" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="14" cy="14" r="1.5" fill="rgba(0,238,255,0.9)"/>
    </svg>`;

    $wrap.innerHTML = `
      <div id="mob-sprint-btn">
        ${sprintSVG}
        <span id="mob-sprint-label">SPRINT</span>
      </div>
      <div id="mob-shoot-btn">
        <div id="mob-charge-ring"></div>
        ${shootSVG}
        <span id="mob-shoot-label">FIRE</span>
      </div>`;
    document.body.appendChild($wrap);

    const $sprint = document.getElementById('mob-sprint-btn');
    const $shoot  = document.getElementById('mob-shoot-btn');
    const $label  = document.getElementById('mob-shoot-label');

    /* ── SPRINT touch ── */
    $sprint.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (sprintTouchId !== null) return;
      sprintTouchId = e.changedTouches[0].identifier;
      $sprint.classList.add('mob-active');
      // Sprint = Shift key held
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16,
        bubbles: true, cancelable: true,
      }));
    }, { passive: false });

    const endSprint = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== sprintTouchId) continue;
        sprintTouchId = null;
        $sprint.classList.remove('mob-active');
        document.dispatchEvent(new KeyboardEvent('keyup', {
          key: 'Shift', code: 'ShiftLeft', keyCode: 16, which: 16,
          bubbles: true, cancelable: true,
        }));
        break;
      }
    };
    $sprint.addEventListener('touchend',    endSprint, { passive: false });
    $sprint.addEventListener('touchcancel', endSprint, { passive: false });

    /* ── SHOOT touch ── */
    $shoot.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (shootTouchId !== null) return;
      shootTouchId = e.changedTouches[0].identifier;
      isCharging   = false;
      $shoot.classList.add('mob-active');

      // Start charge timer — if held long enough, switch to charge mode
      chargeTimer = setTimeout(() => {
        isCharging = true;
        $shoot.classList.add('mob-charging');
        $label.textContent = 'CHARGE';
        mouseDown(); // hold mousedown = charge wind-up
      }, CHARGE_MS);

      // Immediate press — quick-tap will fire on release (mouseup triggers click)
      mouseDown();
    }, { passive: false });

    const endShoot = (e) => {
      let found = false;
      for (const t of e.changedTouches) {
        if (t.identifier === shootTouchId) { found = true; break; }
      }
      if (!found) return;

      e.preventDefault();
      clearTimeout(chargeTimer);
      shootTouchId = null;
      $shoot.classList.remove('mob-active', 'mob-charging');
      $label.textContent = 'FIRE';

      mouseUp(); // release → fires normal shot OR releases charge shot

      isCharging = false;
    };
    $shoot.addEventListener('touchend',    endShoot, { passive: false });
    $shoot.addEventListener('touchcancel', endShoot, { passive: false });
  }

  /* ══════════════════════════════════════════════════════
     6.  SHOW / HIDE CONTROLS
  ══════════════════════════════════════════════════════ */

  function showControls() {
    document.getElementById('mob-joystick-wrap').style.display  = 'flex';
    document.getElementById('mob-actions-wrap').style.display   = 'flex';
    document.getElementById('mob-supply-bar').style.display     = 'flex';
  }

  function hideControls() {
    document.getElementById('mob-joystick-wrap').style.display  = 'none';
    document.getElementById('mob-actions-wrap').style.display   = 'none';
    document.getElementById('mob-supply-bar').style.display     = 'none';
    releaseAll();
    // release sprint key too
    document.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Shift', code: 'ShiftLeft', keyCode: 16, bubbles: true,
    }));
  }

  /* ══════════════════════════════════════════════════════
     7.  GAME STATE DETECTION
  ══════════════════════════════════════════════════════ */

  // Screens that are visible in menus (not in gameplay)
  const MENU_IDS = ['s-login', 's-menu', 's-showcase', 's-complete-profile',
                    'game-loading-screen', 'mode-select-screen'];

  function isMenuVisible() {
    return MENU_IDS.some(id => {
      const el = document.getElementById(id);
      if (!el) return false;
      const cs = window.getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
    });
  }

  function evalGameState() {
    const $c = document.getElementById('c');
    const canvasUp = $c && window.getComputedStyle($c).display !== 'none';
    const nowActive = canvasUp && !isMenuVisible();

    if (nowActive && !gameActive) {
      gameActive = true;
      showControls();
      tryLockLandscape();
    } else if (!nowActive && gameActive) {
      gameActive = false;
      hideControls();
      checkOrientation();
    }
  }

  // Watch DOM for screen changes
  const observer = new MutationObserver(evalGameState);
  observer.observe(document.body, {
    attributes:      true,
    attributeFilter: ['class', 'style'],
    subtree:         true,
  });

  /* Patch known game functions for more reliable detection */
  function patch(name, before, after) {
    const tryPatch = () => {
      if (typeof window[name] !== 'function') {
        setTimeout(tryPatch, 300);
        return;
      }
      const orig = window[name];
      window[name] = function (...args) {
        if (before) before();
        const r = orig.apply(this, args);
        if (after)  after();
        return r;
      };
    };
    tryPatch();
  }

  // Game start
  patch('openGameFlow', null, () => setTimeout(() => { gameActive = true; showControls(); tryLockLandscape(); }, 900));

  // Game end / menu return
  ['exitGame', 'restartGame', 'goToMenu'].forEach(fn => {
    patch(fn, null, () => { gameActive = false; hideControls(); checkOrientation(); });
  });

  /* ══════════════════════════════════════════════════════
     8.  PREVENT UNWANTED BROWSER GESTURES IN-GAME
  ══════════════════════════════════════════════════════ */

  document.addEventListener('touchmove', (e) => {
    // Only preventDefault when the touch is NOT on a supply button
    if (gameActive) {
      const bar = document.getElementById('mob-supply-bar');
      if (bar && bar.contains(e.target)) return; // let supply bar handle itself
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('contextmenu', (e) => {
    if (gameActive) e.preventDefault();
  });

  // Disable pinch-zoom in-game
  let $vp = document.querySelector('meta[name="viewport"]');
  if (!$vp) {
    $vp = document.createElement('meta');
    $vp.name = 'viewport';
    document.head.appendChild($vp);
  }
  const vpDefault = 'width=device-width, initial-scale=1.0';
  const vpGame    = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

  const _origShow = showControls;
  showControls = function () { _origShow(); $vp.content = vpGame; };
  const _origHide = hideControls;
  hideControls = function () { _origHide(); $vp.content = vpDefault; };

  /* ══════════════════════════════════════════════════════
     9.  INIT
  ══════════════════════════════════════════════════════ */

  function init() {
    buildOverlay();
    buildJoystick();
    buildActions();
    setupSupplyBar();
    hideMinimap();

    // Start hidden
    document.getElementById('mob-joystick-wrap').style.display = 'none';
    document.getElementById('mob-actions-wrap').style.display  = 'none';
    document.getElementById('mob-supply-bar').style.display    = 'none';

    checkOrientation();
    setTimeout(evalGameState, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
