/* ═══════════════════════════════════════════════════════
   mobile.js — LAST STAND: MACHINE WAR
   Mobile-only logic. Link AFTER script.js before </body>.
   ═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────
     0. MOBILE DETECTION — bail early on desktop
  ────────────────────────────────────────────────────── */
  const isMobile =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(max-width: 900px)").matches;

  if (!isMobile) return;

  /* ──────────────────────────────────────────────────────
     1. LANDSCAPE LOCK OVERLAY
  ────────────────────────────────────────────────────── */

  let $overlay = null;
  let gameIsActive = false;

  function buildLandscapeOverlay() {
    $overlay = document.createElement("div");
    $overlay.id = "mob-landscape-overlay";
    $overlay.innerHTML = `
      <div class="mob-rotate-inner">
        <div class="mob-rotate-phone">📱</div>
        <div class="mob-rotate-title">ROTATE YOUR DEVICE</div>
        <div class="mob-rotate-sub">LANDSCAPE MODE REQUIRED</div>
        <div class="mob-rotate-arrow">↺</div>
      </div>
    `;
    document.body.appendChild($overlay);
  }

  function isPortrait() {
    return window.innerHeight > window.innerWidth;
  }

  function evaluateOrientation() {
    if (!$overlay) return;
    if (gameIsActive && isPortrait()) {
      $overlay.classList.add("mob-visible");
    } else {
      $overlay.classList.remove("mob-visible");
    }
  }

  function tryLockLandscape() {
    if (screen.orientation && typeof screen.orientation.lock === "function") {
      screen.orientation.lock("landscape").catch(() => {
        // Device declined the lock — rely on the overlay instead
        evaluateOrientation();
      });
    } else {
      evaluateOrientation();
    }
  }

  window.addEventListener("resize", evaluateOrientation);
  window.addEventListener("orientationchange", () => {
    setTimeout(evaluateOrientation, 150); // small delay for dimension update
  });

  /* ──────────────────────────────────────────────────────
     2. VIRTUAL JOYSTICK
  ────────────────────────────────────────────────────── */

  const JOYSTICK_RADIUS = 50; // max knob travel in px
  const DEADZONE = 10; // minimum movement before registering
  const DIAGONAL_CUTOFF = 0.35; // axis threshold for 8-dir movement

  let joyTouchId = null;
  let joyOriginX = 0;
  let joyOriginY = 0;

  // Track which virtual keys are currently held
  const held = { w: false, a: false, s: false, d: false };

  // Current aim direction (normalised)
  let aimNX = 0;
  let aimNY = 0;

  function pressKey(k) {
    if (held[k]) return;
    held[k] = true;
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: k.toUpperCase(),
        code: `Key${k.toUpperCase()}`,
        keyCode: { w: 87, a: 65, s: 83, d: 68 }[k],
        which: { w: 87, a: 65, s: 83, d: 68 }[k],
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  function releaseKey(k) {
    if (!held[k]) return;
    held[k] = false;
    document.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: k.toUpperCase(),
        code: `Key${k.toUpperCase()}`,
        keyCode: { w: 87, a: 65, s: 83, d: 68 }[k],
        which: { w: 87, a: 65, s: 83, d: 68 }[k],
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  function releaseAllKeys() {
    ["w", "a", "s", "d"].forEach(releaseKey);
  }

  function applyJoystickDelta(dx, dy) {
    const dist = Math.hypot(dx, dy);

    if (dist < DEADZONE) {
      releaseAllKeys();
      aimNX = 0;
      aimNY = 0;
      return;
    }

    // Clamp
    const clampedDist = Math.min(dist, JOYSTICK_RADIUS);
    aimNX = dx / dist;
    aimNY = dy / dist;

    // 8-directional key mapping
    if (aimNY < -DIAGONAL_CUTOFF) pressKey("w");
    else releaseKey("w");
    if (aimNY > DIAGONAL_CUTOFF) pressKey("s");
    else releaseKey("s");
    if (aimNX < -DIAGONAL_CUTOFF) pressKey("a");
    else releaseKey("a");
    if (aimNX > DIAGONAL_CUTOFF) pressKey("d");
    else releaseKey("d");

    // Mirror movement direction as aim direction
    simulateMouseAim(aimNX, aimNY);
  }

  function simulateMouseAim(nx, ny) {
    const canvas = document.getElementById("c");
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const reach = Math.min(r.width, r.height) * 0.35;

    canvas.dispatchEvent(
      new MouseEvent("mousemove", {
        clientX: cx + nx * reach,
        clientY: cy + ny * reach,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  function buildJoystick() {
    const $wrap = document.createElement("div");
    $wrap.id = "mob-joystick-wrap";
    $wrap.innerHTML = `
      <div id="mob-joystick-base">
        <div id="mob-joystick-ring"></div>
        <div id="mob-joystick-knob"></div>
      </div>
    `;
    document.body.appendChild($wrap);

    const $base = document.getElementById("mob-joystick-base");
    const $knob = document.getElementById("mob-joystick-knob");

    // ── touchstart ──
    $wrap.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        if (joyTouchId !== null) return; // already tracking
        const t = e.changedTouches[0];
        joyTouchId = t.identifier;

        const rect = $base.getBoundingClientRect();
        joyOriginX = rect.left + rect.width / 2;
        joyOriginY = rect.top + rect.height / 2;

        $knob.classList.add("mob-active");
        moveKnob($knob, t.clientX - joyOriginX, t.clientY - joyOriginY);
      },
      { passive: false },
    );

    // ── touchmove ──
    document.addEventListener(
      "touchmove",
      (e) => {
        if (joyTouchId === null) return;
        for (const t of e.changedTouches) {
          if (t.identifier !== joyTouchId) continue;
          e.preventDefault();
          moveKnob($knob, t.clientX - joyOriginX, t.clientY - joyOriginY);
          break;
        }
      },
      { passive: false },
    );

    // ── touchend / touchcancel ──
    const endJoy = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== joyTouchId) continue;
        joyTouchId = null;
        $knob.classList.remove("mob-active");
        $knob.style.transform = "translate(-50%, -50%)";
        releaseAllKeys();
        break;
      }
    };
    document.addEventListener("touchend", endJoy);
    document.addEventListener("touchcancel", endJoy);
  }

  function moveKnob($knob, rawDX, rawDY) {
    const dist = Math.hypot(rawDX, rawDY);
    const ratio = Math.min(1, dist / JOYSTICK_RADIUS);
    const clampedDX = (rawDX / (dist || 1)) * ratio * JOYSTICK_RADIUS;
    const clampedDY = (rawDY / (dist || 1)) * ratio * JOYSTICK_RADIUS;

    $knob.style.transform = `translate(calc(-50% + ${clampedDX}px), calc(-50% + ${clampedDY}px))`;
    applyJoystickDelta(rawDX, rawDY);
  }

  /* ──────────────────────────────────────────────────────
     3. SHOOT BUTTON  (tap = shoot  |  hold = charge shot)
  ────────────────────────────────────────────────────── */

  const CHARGE_HOLD_MS = 350; // ms before charge mode activates

  let shootTouchId = null;
  let chargeTimer = null;
  let isCharging = false;

  function buildShootButton() {
    const $btn = document.createElement("div");
    $btn.id = "mob-shoot-btn";
    $btn.innerHTML = `
      <div id="mob-shoot-inner">
        <div id="mob-charge-ring"></div>
        <div id="mob-shoot-icon">🔫</div>
        <div id="mob-shoot-label">FIRE</div>
      </div>
    `;
    document.body.appendChild($btn);

    // ── touchstart ──
    $btn.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        if (shootTouchId !== null) return;
        shootTouchId = e.changedTouches[0].identifier;
        isCharging = false;

        $btn.classList.add("mob-btn-active");

        // Start charge timer
        chargeTimer = setTimeout(() => {
          isCharging = true;
          $btn.classList.add("mob-btn-charging");
          document.getElementById("mob-shoot-label").textContent = "CHARGE";
          // Keep mousedown held → game interprets this as charge-shot wind-up
          fireMouseDown();
        }, CHARGE_HOLD_MS);

        // Immediate tap-shot (mousedown)
        fireMouseDown();
      },
      { passive: false },
    );

    // ── touchend ──
    $btn.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        if (
          !Array.from(e.changedTouches).some(
            (t) => t.identifier === shootTouchId,
          )
        )
          return;
        shootTouchId = null;

        clearTimeout(chargeTimer);
        $btn.classList.remove("mob-btn-active", "mob-btn-charging");
        document.getElementById("mob-shoot-label").textContent = "FIRE";

        fireMouseUp(); // release — triggers normal shot OR charge release

        isCharging = false;
      },
      { passive: false },
    );

    // ── touchcancel ──
    $btn.addEventListener(
      "touchcancel",
      (e) => {
        shootTouchId = null;
        clearTimeout(chargeTimer);
        $btn.classList.remove("mob-btn-active", "mob-btn-charging");
        document.getElementById("mob-shoot-label").textContent = "FIRE";
        fireMouseUp();
        isCharging = false;
      },
      { passive: false },
    );
  }

  function getCanvasAimPoint() {
    const canvas = document.getElementById("c");
    if (!canvas) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = canvas.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    // Aim in the direction the joystick is pointing
    const reach = Math.min(r.width, r.height) * 0.35;
    return {
      x: cx + aimNX * reach,
      y: cy + aimNY * reach,
    };
  }

  function fireMouseDown() {
    const canvas = document.getElementById("c");
    if (!canvas) return;
    const { x, y } = getCanvasAimPoint();
    canvas.dispatchEvent(
      new MouseEvent("mousedown", {
        clientX: x,
        clientY: y,
        button: 0,
        buttons: 1,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  function fireMouseUp() {
    const canvas = document.getElementById("c");
    if (!canvas) return;
    const { x, y } = getCanvasAimPoint();
    canvas.dispatchEvent(
      new MouseEvent("mouseup", {
        clientX: x,
        clientY: y,
        button: 0,
        buttons: 0,
        bubbles: true,
        cancelable: true,
      }),
    );
    // Also dispatch click for games that listen to click
    canvas.dispatchEvent(
      new MouseEvent("click", {
        clientX: x,
        clientY: y,
        button: 0,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  /* ──────────────────────────────────────────────────────
     4. SHOW / HIDE CONTROLS BASED ON GAME STATE
  ────────────────────────────────────────────────────── */

  function showControls() {
    document.getElementById("mob-joystick-wrap").style.display = "flex";
    document.getElementById("mob-shoot-btn").style.display = "flex";
  }

  function hideControls() {
    document.getElementById("mob-joystick-wrap").style.display = "none";
    document.getElementById("mob-shoot-btn").style.display = "none";
    releaseAllKeys();
  }

  // ── Watch the main menu & login screens ──
  // When they are NOT "active" and the canvas is rendering → game is live.
  const MENU_SCREEN_IDS = [
    "s-login",
    "s-menu",
    "s-showcase",
    "s-complete-profile",
  ];

  function detectGameState() {
    const allMenusGone = MENU_SCREEN_IDS.every((id) => {
      const el = document.getElementById(id);
      if (!el) return true;
      const style = window.getComputedStyle(el);
      return (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      );
    });

    const canvas = document.getElementById("c");
    const canvasVisible =
      canvas && window.getComputedStyle(canvas).display !== "none";

    const nowActive = allMenusGone && canvasVisible;

    if (nowActive && !gameIsActive) {
      gameIsActive = true;
      showControls();
      tryLockLandscape();
    } else if (!nowActive && gameIsActive) {
      gameIsActive = false;
      hideControls();
      evaluateOrientation();
    }
  }

  // Use MutationObserver to react to DOM class/style changes
  const docObserver = new MutationObserver(detectGameState);
  docObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "style"],
    subtree: true,
  });

  /* ──────────────────────────────────────────────────────
     5. INTERCEPT openGameFlow / exitGame to be reliable
  ────────────────────────────────────────────────────── */

  function patchGlobalFunction(name, onCall) {
    const tryPatch = () => {
      if (typeof window[name] !== "function") {
        setTimeout(tryPatch, 300);
        return;
      }
      const orig = window[name];
      window[name] = function (...args) {
        const result = orig.apply(this, args);
        onCall();
        return result;
      };
    };
    tryPatch();
  }

  // When game starts → show controls after a short delay (let canvas mount)
  patchGlobalFunction("openGameFlow", () => {
    setTimeout(() => {
      gameIsActive = true;
      showControls();
      tryLockLandscape();
    }, 800);
  });

  // When game exits → hide controls
  ["exitGame", "restartGame", "goToMenu"].forEach((fn) => {
    patchGlobalFunction(fn, () => {
      gameIsActive = false;
      hideControls();
      evaluateOrientation();
    });
  });

  /* ──────────────────────────────────────────────────────
     6. PREVENT DEFAULT TOUCH GESTURES IN-GAME
        (stops scroll, zoom, and context menu)
  ────────────────────────────────────────────────────── */

  document.addEventListener(
    "touchmove",
    (e) => {
      if (gameIsActive) e.preventDefault();
    },
    { passive: false },
  );

  document.addEventListener("contextmenu", (e) => {
    if (gameIsActive) e.preventDefault();
  });

  // Disable pinch-zoom in-game via meta viewport swap
  let vpMeta = document.querySelector('meta[name="viewport"]');
  if (!vpMeta) {
    vpMeta = document.createElement("meta");
    vpMeta.name = "viewport";
    document.head.appendChild(vpMeta);
  }

  function setViewportForGame(active) {
    vpMeta.content = active
      ? "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      : "width=device-width, initial-scale=1.0";
  }

  const _origShow = showControls;
  showControls = function () {
    _origShow();
    setViewportForGame(true);
  };

  const _origHide = hideControls;
  hideControls = function () {
    _origHide();
    setViewportForGame(false);
  };

  /* ──────────────────────────────────────────────────────
     7. INIT
  ────────────────────────────────────────────────────── */

  function init() {
    buildLandscapeOverlay();
    buildJoystick();
    buildShootButton();

    // Start hidden
    hideControls();
    evaluateOrientation();

    // Run an initial game-state check
    setTimeout(detectGameState, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
