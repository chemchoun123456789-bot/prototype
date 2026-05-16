// ═══ STARFIELD ═══
const cv = document.getElementById("c"),
  cx = cv.getContext("2d");
let W,
  H,
  stars = [],
  meteors = [];
function rsz() {
  W = cv.width = window.innerWidth;
  H = cv.height = window.innerHeight;
}
rsz();
window.addEventListener("resize", rsz);
function mkStar() {
  const ip = Math.random() < 0.06,
    ir = Math.random() < 0.04;
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.3 + 0.2,
    spd: Math.random() * 0.1 + 0.015,
    op: Math.random() * 0.7 + 0.2,
    tw: Math.random() * Math.PI * 2,
    col: ip ? "rgba(180,80,255," : ir ? "rgba(255,80,80," : "rgba(255,255,255,",
  };
}
for (let i = 0; i < 260; i++) stars.push(mkStar());
function mkMeteor() {
  return {
    x: Math.random() * W * 0.5 + W * 0.25,
    y: Math.random() * H * 0.5,
    vx: -(Math.random() * 6 + 3),
    vy: Math.random() * 3 + 1.5,
    len: Math.random() * 130 + 70,
    life: 1,
  };
}
let lastM = 0;
function drawStars(ts) {
  cx.clearRect(0, 0, W, H);
  stars.forEach((s) => {
    s.tw += 0.018;
    cx.beginPath();
    cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    cx.fillStyle = s.col + s.op * (0.55 + 0.45 * Math.sin(s.tw)) + ")";
    cx.fill();
    s.y += s.spd;
    if (s.y > H) {
      s.y = 0;
      s.x = Math.random() * W;
    }
  });
  if (ts - lastM > Math.random() * 3500 + 2500) {
    meteors.push(mkMeteor());
    lastM = ts;
  }
  meteors.forEach((m, i) => {
    m.life -= 0.014;
    m.x += m.vx;
    m.y += m.vy;
    const g = cx.createLinearGradient(
      m.x,
      m.y,
      m.x + m.len * 0.7,
      m.y - m.len * 0.35,
    );
    g.addColorStop(0, `rgba(180,80,255,${m.life * 0.85})`);
    g.addColorStop(0.4, `rgba(120,20,200,${m.life * 0.35})`);
    g.addColorStop(1, "rgba(100,0,180,0)");
    cx.beginPath();
    cx.moveTo(m.x, m.y);
    cx.lineTo(m.x + m.len * 0.7, m.y - m.len * 0.35);
    cx.strokeStyle = g;
    cx.lineWidth = 1.5;
    cx.stroke();
    if (m.life <= 0) meteors.splice(i, 1);
  });
  requestAnimationFrame(drawStars);
}
requestAnimationFrame(drawStars);
const ptsEl = document.getElementById("pts");
for (let i = 0; i < 22; i++) {
  const p = document.createElement("div");
  p.className = "p";
  const sz = Math.random() * 2 + 1,
    ip = Math.random() > 0.4;
  p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;background:${ip ? "rgba(155,48,255,.9)" : "rgba(255,17,17,.7)"};box-shadow:0 0 4px ${ip ? "rgba(155,48,255,.8)" : "rgba(255,17,17,.6)"};animation-duration:${Math.random() * 12 + 8}s;animation-delay:${Math.random() * 10}s;`;
  ptsEl.appendChild(p);
}

// ═══ LOADING ═══
const lf = document.getElementById("lf"),
  lpEl = document.getElementById("lp"),
  ltxt = document.getElementById("ltxt"),
  loEl = document.getElementById("lo");
const stages = [
  "LOADING COMBAT SYSTEMS",
  "INITIALIZING AI",
  "CALIBRATING WEAPONS",
  "ONLINE",
];
let pct = 0;
const li = setInterval(() => {
  pct += Math.random() * 4 + 1.5;
  if (pct >= 100) {
    pct = 100;
    clearInterval(li);
    setTimeout(() => {
      loEl.classList.add("out");
      setTimeout(() => loEl.remove(), 900);
    }, 350);
  }
  lf.style.width = pct + "%";
  ltxt.textContent = stages[Math.min(Math.floor(pct / 28), stages.length - 1)];
  lpEl.textContent = Math.floor(pct) + "%";
}, 55);

// ═══ TRANSITIONS ═══
function doTransition(msg, cb) {
  const pt = document.getElementById("pt");
  if (!pt) {
    cb && cb();
    return;
  }
  const txt = document.getElementById("pt-txt");
  if (txt) txt.textContent = msg;
  pt.style.transition = "clip-path .6s cubic-bezier(.77,0,.18,1)";
  pt.classList.add("on");
  setTimeout(() => {
    cb && cb();
  }, 700);
}
function closeTransition(cb) {
  const pt = document.getElementById("pt");
  if (!pt) {
    cb && cb();
    return;
  }
  pt.style.transition = "clip-path .5s cubic-bezier(.77,0,.18,1)";
  pt.classList.remove("on");
  setTimeout(() => {
    cb && cb();
  }, 550);
}
function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const el = document.getElementById("s-" + id);
  if (el) el.classList.add("active");
}

// ═══ LOGIN ═══
function goTab(t) {
  document.getElementById("tb-login").classList.toggle("on", t === "login");
  document.getElementById("tb-reg").classList.toggle("on", t === "reg");
  document.getElementById("p-login").classList.toggle("on", t === "login");
  document.getElementById("p-reg").classList.toggle("on", t === "reg");
  document.getElementById("stbar").textContent =
    t === "login" ? "▶ awaiting authentication" : "▶ new soldier registration";
}
function handleAv(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (ev) => {
    const img = document.getElementById("avImg");
    img.src = ev.target.result;
    img.style.display = "block";
    document.getElementById("avEmoji").style.display = "none";
    document.getElementById("avprev").style.cssText +=
      "border-color:#9b30ff;box-shadow:0 0 14px rgba(155,48,255,.5)";
  };
  r.readAsDataURL(f);
}
// ═══ SUPABASE BACKEND ═══
const SB_URL = "https://tdluhznskrgbitrbecof.supabase.co";
const SB_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbHVoem5za3JnYml0cmJlY29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODY1OTAsImV4cCI6MjA5NDM2MjU5MH0.eIK6U9vnbJSKh-yc5BoaRWnf6MgTTgPmv-vGt5-gqKw";
const SB_HEADERS = {
  apikey: SB_KEY,
  Authorization: "Bearer " + SB_KEY,
  "Content-Type": "application/json",
};

async function sbGetPlayer(username) {
  const r = await fetch(
    `${SB_URL}/rest/v1/players?username=eq.${encodeURIComponent(username)}&limit=1`,
    { headers: SB_HEADERS },
  );
  const d = await r.json();
  return d[0] || null;
}

async function sbGetAllPlayers() {
  const r = await fetch(
    `${SB_URL}/rest/v1/players?select=username,nickname,exp,stats`,
    { headers: SB_HEADERS },
  );
  return await r.json();
}

async function sbInsertPlayer(player) {
  const r = await fetch(`${SB_URL}/rest/v1/players`, {
    method: "POST",
    headers: { ...SB_HEADERS, Prefer: "return=representation" },
    body: JSON.stringify(player),
  });
  if (!r.ok) {
    const errBody = await r.json().catch(() => ({}));
    const msg = errBody.message || errBody.details || errBody.hint || r.status;
    console.error("sbInsertPlayer error:", msg, errBody);
    return { ok: false, msg };
  }
  return { ok: true };
}

async function sbSavePlayer(username, data) {
  fetch(
    `${SB_URL}/rest/v1/players?username=eq.${encodeURIComponent(username)}`,
    {
      method: "PATCH",
      headers: SB_HEADERS,
      body: JSON.stringify(data),
    },
  );
}

// Compatibility shim: getUsers() returns a fake object with just currentUser
// so all existing code patterns: const users = getUsers(); users[u] = currentUser; saveUsers(users);
// still work without changes throughout the file.
function getUsers() {
  if (!currentUser) return {};
  const obj = {};
  obj[currentUser.username] = currentUser;
  return obj;
}
function saveUsers(users) {
  // Extract whichever user was saved (always currentUser in practice)
  if (!currentUser) return;
  const u = users[currentUser.username] || currentUser;
  sbSavePlayer(u.username, {
    nickname: u.nickname,
    avatar: u.avatar || null,
    coins: u.coins || 0,
    exp: u.exp || 0,
    skins: u.skins || [],
    achievements: u.achievements || {},
    used_codes: u.used_codes || [],
    stats: u.stats || {},
    title: u.title || "SOLDIER",
    available_titles: u.availableTitles || [],
    selected_char: u.selectedChar || null,
    selected_weapon: u.selectedWeapon || null,
  });
}

function showMsg(id, type, txt) {
  const el = document.getElementById(id);
  el.className = "msg " + type;
  el.textContent = txt;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.className = "msg";
  }, 4500);
}

async function hashPw(p) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(p),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function doLogin() {
  const u = document.getElementById("lu").value.trim(),
    p = document.getElementById("lp2").value;
  if (!u || !p) return showMsg("lmsg", "err", "[ FIELDS INCOMPLETE ]");
  showMsg("lmsg", "ok", "[ CONNECTING... ]");
  const isEmail = u.includes("@");
  let stored = null;
  if (isEmail) {
    const r = await fetch(
      `${SB_URL}/rest/v1/players?email=eq.${encodeURIComponent(u)}&limit=1`,
      { headers: SB_HEADERS },
    );
    if (r.ok) {
      const d = await r.json();
      stored = d[0] || null;
    }
  } else {
    stored = await sbGetPlayer(u);
  }
  if (!stored) return showMsg("lmsg", "err", "[ USER NOT FOUND ]");
  if (!stored.pw)
    return showMsg("lmsg", "err", "[ USE GOOGLE LOGIN FOR THIS ACCOUNT ]");
  const pwHash = await hashPw(p);
  if (stored.pw !== pwHash)
    return showMsg("lmsg", "err", "[ INVALID PASSWORD ]");
  showMsg("lmsg", "ok", "[ ACCESS GRANTED ] DEPLOYING...");
  const userData = dbRowToUser(stored);
  localStorage.setItem("lsmw_current", stored.username);
  setTimeout(
    () =>
      doTransition("ENTERING THE WAR...", () =>
        closeTransition(() => startShowcase(userData)),
      ),
    900,
  );
}

async function doReg() {
  const u = document.getElementById("ru").value.trim(),
    n = document.getElementById("rn").value.trim(),
    e = document.getElementById("re").value.trim(),
    p = document.getElementById("rp").value;
  const avImg = document.getElementById("avImg"),
    av = avImg.style.display !== "none" ? avImg.src : null;
  if (!u || !n || !e || !p)
    return showMsg("rmsg", "err", "[ ALL FIELDS REQUIRED ]");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    return showMsg("rmsg", "err", "[ INVALID EMAIL ADDRESS ]");
  if (p.length < 6) return showMsg("rmsg", "err", "[ PASSWORD TOO SHORT ]");
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(u))
    return showMsg("rmsg", "err", "[ USERNAME: 3-16 CHARS ]");
  showMsg("rmsg", "ok", "[ CHECKING... ]");
  const existing = await sbGetPlayer(u);
  if (existing) return showMsg("rmsg", "err", "[ USERNAME ALREADY TAKEN ]");
  const rEmail = await fetch(
    `${SB_URL}/rest/v1/players?email=eq.${encodeURIComponent(e)}&limit=1`,
    { headers: SB_HEADERS },
  );
  if (rEmail.ok) {
    const dEmail = await rEmail.json();
    if (dEmail[0])
      return showMsg("rmsg", "err", "[ EMAIL ALREADY REGISTERED ]");
  }
  const pwHash = await hashPw(p);
  const result = await sbInsertPlayer({
    username: u,
    nickname: n,
    email: e,
    pw: pwHash,
    avatar: av,
    coins: 500,
    exp: 0,
    skins: [],
    achievements: {},
    used_codes: [],
    stats: { kills: 0, waves: 0, highWave: 0, bosses: 0, coinsEarned: 0 },
    title: "SOLDIER",
    available_titles: [],
  });
  if (!result.ok)
    return showMsg("rmsg", "err", "[ SERVER ERROR: " + result.msg + " ]");
  showMsg(
    "rmsg",
    "ok",
    "[ SOLDIER CREATED ] NOW LOGIN, " + n.toUpperCase() + "!",
  );
  setTimeout(
    () =>
      doTransition("REGISTERING...", () =>
        closeTransition(() => {
          goTab("login");
          document.getElementById("lu").value = u;
          document.getElementById("lp2").focus();
        }),
      ),
    1000,
  );
}

// Convert a Supabase DB row to the shape the rest of the code expects
function dbRowToUser(row) {
  return {
    username: row.username,
    nickname: row.nickname,
    pw: row.pw,
    avatar: row.avatar || null,
    coins: row.coins || 500,
    exp: row.exp || 0,
    skins: row.skins || [],
    achievements: row.achievements || {},
    used_codes: row.used_codes || [],
    stats: row.stats || { kills: 0, waves: 0, highWave: 0 },
    title: row.title || "SOLDIER",
    availableTitles: row.available_titles || [],
    selectedChar: row.selected_char || null,
    selectedWeapon: row.selected_weapon || null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

// ═══ GOOGLE OAUTH ═══
const GOOGLE_CLIENT_ID =
  "705975913285-1ssvt8om86p9ac4e1f207fms763cegdu.apps.googleusercontent.com";
let pendingGoogleUser = null;

// Fetch Google user info using an access token
async function fetchGoogleUserInfo(accessToken) {
  const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: "Bearer " + accessToken },
  });
  if (!r.ok) throw new Error("Failed to fetch Google user info");
  return await r.json();
}

// Look up a player by their google_id in Supabase
async function sbGetPlayerByGoogleId(googleId) {
  try {
    const r = await fetch(
      `${SB_URL}/rest/v1/players?google_id=eq.${encodeURIComponent(googleId)}&limit=1`,
      { headers: SB_HEADERS },
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d[0] || null;
  } catch {
    return null;
  }
}

// Opens a real Google popup and returns user info via Promise
function openGooglePopup() {
  return new Promise((resolve, reject) => {
    if (typeof google === "undefined" || !google.accounts) {
      return reject(new Error("GOOGLE SERVICE UNAVAILABLE"));
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile",
      prompt: "select_account",
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          return reject(new Error(tokenResponse.error));
        }
        try {
          const userInfo = await fetchGoogleUserInfo(
            tokenResponse.access_token,
          );
          resolve(userInfo);
        } catch (e) {
          reject(e);
        }
      },
    });
    client.requestAccessToken();
  });
}

// Called when user clicks "Sign in with Google" on the LOGIN tab
async function doGoogleLogin() {
  showMsg("lmsg", "ok", "[ OPENING GOOGLE... ]");
  try {
    const userInfo = await openGooglePopup();
    const googleId = userInfo.sub;
    const email = userInfo.email;

    showMsg("lmsg", "ok", "[ VERIFYING ACCOUNT... ]");
    let stored = await sbGetPlayerByGoogleId(googleId);

    if (!stored) {
      const r = await fetch(
        `${SB_URL}/rest/v1/players?email=eq.${encodeURIComponent(email)}&limit=1`,
        { headers: SB_HEADERS },
      );
      if (r.ok) {
        const d = await r.json();
        stored = d[0] || null;
      }
    }

    if (!stored) {
      return showMsg(
        "lmsg",
        "err",
        "[ ACCOUNT NOT FOUND — PLEASE REGISTER FIRST ]",
      );
    }

    showMsg("lmsg", "ok", "[ ACCESS GRANTED ] DEPLOYING...");
    const userData = dbRowToUser(stored);
    localStorage.setItem("lsmw_current", stored.username);
    setTimeout(
      () =>
        doTransition("ENTERING THE WAR...", () =>
          closeTransition(() => startShowcase(userData)),
        ),
      900,
    );
  } catch (err) {
    showMsg("lmsg", "err", "[ " + (err.message || "GOOGLE ERROR") + " ]");
  }
}

// Called when user clicks "Create account with Google" on the REGISTER tab
async function doGoogleRegister() {
  showMsg("rmsg", "ok", "[ OPENING GOOGLE... ]");
  try {
    const userInfo = await openGooglePopup();
    const googleId = userInfo.sub;
    const email = userInfo.email;
    const googleName = userInfo.name || "";

    showMsg("rmsg", "ok", "[ CHECKING ACCOUNT... ]");
    const existing = await sbGetPlayerByGoogleId(googleId);
    if (existing) {
      showMsg("rmsg", "err", "[ ACCOUNT ALREADY EXISTS — PLEASE LOGIN ]");
      setTimeout(() => goTab("login"), 1800);
      return;
    }

    const rEmail = await fetch(
      `${SB_URL}/rest/v1/players?email=eq.${encodeURIComponent(email)}&limit=1`,
      { headers: SB_HEADERS },
    );
    if (rEmail.ok) {
      const dEmail = await rEmail.json();
      if (dEmail[0]) {
        showMsg("rmsg", "err", "[ EMAIL ALREADY REGISTERED — PLEASE LOGIN ]");
        setTimeout(() => goTab("login"), 1800);
        return;
      }
    }

    pendingGoogleUser = { googleId, email, googleName };
    showMsg("rmsg", "ok", "[ GOOGLE VERIFIED — COMPLETE YOUR PROFILE ]");
    setTimeout(() => {
      doTransition("SETTING UP PROFILE...", () =>
        closeTransition(() => {
          document.getElementById("cp-email-display").textContent = email;
          document.getElementById("cp-username").value = "";
          document.getElementById("cp-nickname").value = googleName
            .replace(/\s+/g, "")
            .slice(0, 16);
          showScreen("complete-profile");
        }),
      );
    }, 800);
  } catch (err) {
    showMsg("rmsg", "err", "[ " + (err.message || "GOOGLE ERROR") + " ]");
  }
}

// Called when user submits the Complete Profile form
async function doCompleteProfile() {
  if (!pendingGoogleUser) {
    showMsg("cpmsg", "err", "[ SESSION EXPIRED — PLEASE TRY AGAIN ]");
    setTimeout(() => showScreen("login"), 1500);
    return;
  }

  const u = document.getElementById("cp-username").value.trim();
  const n = document.getElementById("cp-nickname").value.trim();

  if (!u || !n) return showMsg("cpmsg", "err", "[ ALL FIELDS REQUIRED ]");
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(u))
    return showMsg("cpmsg", "err", "[ USERNAME: 3-16 ALPHANUMERIC CHARS ]");
  if (n.length < 2 || n.length > 24)
    return showMsg("cpmsg", "err", "[ IN-GAME NAME: 2-24 CHARS ]");

  showMsg("cpmsg", "ok", "[ CHECKING USERNAME... ]");

  // Ensure username is not taken
  const existing = await sbGetPlayer(u);
  if (existing) return showMsg("cpmsg", "err", "[ USERNAME ALREADY TAKEN ]");

  showMsg("cpmsg", "ok", "[ CREATING SOLDIER... ]");

  const result = await sbInsertPlayer({
    username: u,
    nickname: n,
    pw: null,
    google_id: pendingGoogleUser.googleId,
    email: pendingGoogleUser.email,
    avatar: null,
    coins: 500,
    exp: 0,
    skins: [],
    achievements: {},
    used_codes: [],
    stats: { kills: 0, waves: 0, highWave: 0, bosses: 0, coinsEarned: 0 },
    title: "SOLDIER",
    available_titles: [],
  });

  if (!result.ok) return showMsg("cpmsg", "err", "[ " + result.msg + " ]");

  showMsg("cpmsg", "ok", "[ SOLDIER CREATED ] ENTERING THE WAR...");
  const newRow = await sbGetPlayer(u);
  const userData = dbRowToUser(newRow);
  localStorage.setItem("lsmw_current", u);
  pendingGoogleUser = null;

  setTimeout(
    () =>
      doTransition("ENTERING THE WAR...", () =>
        closeTransition(() => startShowcase(userData)),
      ),
    900,
  );
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // In game handled by onGKey; in menu - close sidebar if open
    if (
      document.getElementById("s-menu") &&
      document.getElementById("s-menu").classList.contains("active")
    ) {
      closeSidebar && closeSidebar();
    }
    return;
  }
  if (e.key !== "Enter") return;
  if (
    document.getElementById("s-complete-profile") &&
    document.getElementById("s-complete-profile").classList.contains("active")
  ) {
    doCompleteProfile();
  } else if (document.getElementById("p-login").classList.contains("on")) {
    doLogin();
  } else {
    doReg();
  }
});

// ═══ SHOWCASE ═══
const RC = {
  COMMON: "#aaa",
  RARE: "#4488ff",
  EPIC: "#9b30ff",
  LEGENDARY: "#ffd700",
  MYTHICAL: "#ff0a50",
  SECRET: "#00eeff",
};
const SHOWCASE_DATA = [
  {
    name: "PHANTOM",
    rarity: "MYTHICAL",
    color: "#ff0a50",
    glow: "#ff005540",
    body: "#1a0010",
    armor: "#ff0a50",
    visor: "#ff88aa",
  },
  {
    name: "VOID KNIGHT",
    rarity: "SECRET",
    color: "#00eeff",
    glow: "#00eeff40",
    body: "#001520",
    armor: "#00eeff",
    visor: "#88ffff",
  },
  {
    name: "INFERNO",
    rarity: "LEGENDARY",
    color: "#ffd700",
    glow: "#ffd70040",
    body: "#140e00",
    armor: "#ffd700",
    visor: "#fff088",
  },
  {
    name: "SHADOW",
    rarity: "EPIC",
    color: "#9b30ff",
    glow: "#9b30ff40",
    body: "#080015",
    armor: "#9b30ff",
    visor: "#cc88ff",
  },
  {
    name: "CRIMSON",
    rarity: "RARE",
    color: "#ff4444",
    glow: "#ff444430",
    body: "#150000",
    armor: "#ff4444",
    visor: "#ff8888",
  },
  {
    name: "TOXIC",
    rarity: "LEGENDARY",
    color: "#00ff88",
    glow: "#00ff8830",
    body: "#001510",
    armor: "#00ff88",
    visor: "#88ffcc",
  },
  {
    name: "NOVA",
    rarity: "MYTHICAL",
    color: "#ff6600",
    glow: "#ff660030",
    body: "#150800",
    armor: "#ff6600",
    visor: "#ffaa44",
  },
  {
    name: "GHOST",
    rarity: "SECRET",
    color: "#ffffff",
    glow: "#ffffff25",
    body: "#111",
    armor: "#ddd",
    visor: "#fff",
  },
];
let showcaseUser = null,
  scRAF = null;

function startShowcase(userData) {
  showcaseUser = userData;
  _goingToMenu = false;
  showScreen("showcase");
  const bar = document.getElementById("sc-bar");
  if (bar) bar.style.width = "0%";
  buildScGrid();
  runScTimer();
}
function buildScGrid() {
  const grid = document.getElementById("sc-grid");
  if (!grid) return;
  grid.innerHTML = "";
  SHOWCASE_DATA.forEach((sk, i) => {
    const card = document.createElement("div");
    card.className = "sc-card";
    const rc = RC[sk.rarity] || "#aaa";
    const cid = "sc-cv-" + i;
    card.innerHTML = `<div class="sc-shine"></div><div class="sc-inner"><div class="sc-rar" style="color:${rc}">${sk.rarity}</div><canvas id="${cid}" width="80" height="80" style="display:block;margin:0 auto"></canvas><div class="sc-name">${sk.name}</div></div>`;
    grid.appendChild(card);
    setTimeout(
      () => {
        card.classList.add("vis");
        const cv2 = document.getElementById(cid);
        if (cv2) drawChar(cv2, sk, 40, 42, 32, true);
      },
      i * 200 + 300,
    );
  });
}
function runScTimer() {
  if (scRAF) {
    cancelAnimationFrame(scRAF);
    scRAF = null;
  }
  const bar = document.getElementById("sc-bar"),
    label = document.getElementById("sc-label");
  const msgs = [
    "PREPARING BATTLE SYSTEMS...",
    "LOADING WEAPON SKINS...",
    "SYNCING LEADERBOARD...",
    "CALIBRATING AI CORES...",
    "READY TO DEPLOY...",
  ];
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const e = ts - start,
      pct = Math.min((e / 10000) * 100, 100);
    if (bar) bar.style.width = pct + "%";
    if (label)
      label.textContent = msgs[Math.min(Math.floor(pct / 22), msgs.length - 1)];
    if (pct < 100) {
      scRAF = requestAnimationFrame(step);
    } else {
      scRAF = null;
      gotoMenu();
    }
  }
  scRAF = requestAnimationFrame(step);
}
function skipShowcase() {
  if (scRAF) {
    cancelAnimationFrame(scRAF);
    scRAF = null;
  }
  const bar = document.getElementById("sc-bar");
  if (bar) bar.style.width = "100%";
  _goingToMenu = false; // reset flag so gotoMenu runs
  gotoMenu();
}
let _goingToMenu = false;
function gotoMenu() {
  if (_goingToMenu) return;
  _goingToMenu = true;
  doTransition("DEPLOYING SOLDIER...", () => {
    try {
      setupMenu(showcaseUser);
    } catch (e) {
      console.error("setupMenu:", e);
    }
    showScreen("menu");
    closeTransition(() => {
      _goingToMenu = false;
    });
  });
}

// ═══ DRAW UTILS ═══
function rRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hexA(h, a) {
  try {
    const [r, g, b] = hexToRgb(h);
    return `rgba(${r},${g},${b},${a})`;
  } catch {
    return `rgba(128,128,128,${a})`;
  }
}

function drawChar(canvas, skin, cx2, cy2, size, small) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const s = size,
    x = cx2,
    y = cy2,
    c = skin.color || "#9b30ff",
    b = skin.body || "#08001a",
    ar = skin.armor || c,
    vi = skin.visor || "#aaffff";
  // glow backdrop — use rgba safely
  const rg = ctx.createRadialGradient(
    x,
    y + s * 0.1,
    0,
    x,
    y + s * 0.1,
    s * 1.1,
  );
  rg.addColorStop(0, hexA(c, 0.25));
  rg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(x, y + s * 0.1, s * 1.1, 0, Math.PI * 2);
  ctx.fill();
  // legs
  ctx.fillStyle = b;
  ctx.fillRect(x - s * 0.22, y + s * 0.35, s * 0.18, s * 0.5);
  ctx.fillRect(x + s * 0.04, y + s * 0.35, s * 0.18, s * 0.5);
  // boots
  ctx.fillStyle = ar;
  ctx.fillRect(x - s * 0.24, y + s * 0.76, s * 0.2, s * 0.09);
  ctx.fillRect(x + s * 0.04, y + s * 0.76, s * 0.2, s * 0.09);
  // body
  ctx.fillStyle = b;
  rRect(ctx, x - s * 0.28, y - s * 0.05, s * 0.56, s * 0.42, s * 0.06);
  ctx.fill();
  // chest armor
  ctx.fillStyle = ar;
  rRect(ctx, x - s * 0.22, y - s * 0.02, s * 0.44, s * 0.32, s * 0.05);
  ctx.fill();
  // chest detail
  ctx.fillStyle = vi;
  ctx.globalAlpha = 0.45;
  rRect(ctx, x - s * 0.08, y + s * 0.04, s * 0.16, s * 0.13, s * 0.03);
  ctx.fill();
  ctx.globalAlpha = 1;
  // arms
  ctx.fillStyle = b;
  ctx.fillRect(x - s * 0.42, y - s * 0.04, s * 0.16, s * 0.34);
  ctx.fillRect(x + s * 0.26, y - s * 0.04, s * 0.16, s * 0.34);
  ctx.fillStyle = ar;
  ctx.fillRect(x - s * 0.41, y + s * 0.02, s * 0.14, s * 0.2);
  ctx.fillRect(x + s * 0.27, y + s * 0.02, s * 0.14, s * 0.2);
  // hands
  ctx.fillStyle = b;
  ctx.beginPath();
  ctx.arc(x - s * 0.34, y + s * 0.32, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.34, y + s * 0.32, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // weapon
  ctx.fillStyle = ar;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(x + s * 0.28, y + s * 0.24, s * 0.28, s * 0.07);
  ctx.fillRect(x + s * 0.44, y + s * 0.18, s * 0.05, s * 0.14);
  ctx.globalAlpha = 1;
  ctx.fillStyle = vi;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.arc(x + s * 0.56, y + s * 0.27, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // helmet
  ctx.fillStyle = b;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.18, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ar;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.2, s * 0.24, Math.PI, 0);
  ctx.fill();
  rRect(ctx, x - s * 0.26, y - s * 0.22, s * 0.52, s * 0.18, s * 0.04);
  ctx.fill();
  // visor — use globalAlpha instead of hex concatenation
  const vg = ctx.createLinearGradient(
    x - s * 0.2,
    y - s * 0.2,
    x + s * 0.2,
    y - s * 0.08,
  );
  vg.addColorStop(0, hexA(vi, 0.8));
  vg.addColorStop(0.5, "rgba(255,255,255,1)");
  vg.addColorStop(1, hexA(vi, 0.5));
  ctx.fillStyle = vg;
  rRect(ctx, x - s * 0.2, y - s * 0.18, s * 0.4, s * 0.14, s * 0.04);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.18, y - s * 0.12);
  ctx.lineTo(x + s * 0.18, y - s * 0.12);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(x - s * 0.08, y - s * 0.13, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.08, y - s * 0.13, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // neon outline
  ctx.strokeStyle = c;
  ctx.lineWidth = small ? 1 : 1.5;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.18, s * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawWeapon(canvas, skin) {
  const ctx = canvas.getContext("2d"),
    W = canvas.width,
    H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const c = skin.color || "#9b30ff",
    dark = "#050010",
    x = W / 2,
    y = H / 2;
  // background glow
  const bg = ctx.createRadialGradient(x, y, 0, x, y, W * 0.55);
  bg.addColorStop(0, hexA(c, 0.18));
  bg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  if (skin.wtype === "pistol") drawPistolShape(ctx, c, dark, x, y, W, H);
  else if (skin.wtype === "rifle") drawRifleShape(ctx, c, dark, x, y, W, H);
  else drawShotgunShape(ctx, c, dark, x, y, W, H);
  ctx.restore();
  // rarity glow border
  ctx.strokeStyle = c;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.globalAlpha = 1;
}

function drawPistolShape(ctx, c, dark, x, y, W, H) {
  // slide / barrel
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.32, y - H * 0.22, W * 0.58, H * 0.28, 3);
  ctx.fill();
  // slide color stripe
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.7;
  rRect(ctx, x - W * 0.3, y - H * 0.18, W * 0.54, H * 0.14, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // frame / grip
  ctx.fillStyle = dark;
  rRect(ctx, x + W * 0.06, y + H * 0.06, W * 0.14, H * 0.36, 4);
  ctx.fill();
  // grip color
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.4;
  rRect(ctx, x + W * 0.08, y + H * 0.08, W * 0.1, H * 0.3, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
  // barrel tip
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.44, y - H * 0.1, W * 0.16, H * 0.08, 2);
  ctx.fill();
  // barrel tip glow
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x - W * 0.44, y - H * 0.07, H * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // trigger guard
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + W * 0.08, y + H * 0.06, H * 0.09, 0, Math.PI);
  ctx.stroke();
  // ejection port
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.5;
  rRect(ctx, x, y - H * 0.2, W * 0.1, H * 0.06, 1);
  ctx.fill();
  ctx.globalAlpha = 1;
  // sight
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.8;
  rRect(ctx, x - W * 0.1, y - H * 0.28, W * 0.06, H * 0.06, 1);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRifleShape(ctx, c, dark, x, y, W, H) {
  // main body/receiver
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.18, y - H * 0.14, W * 0.38, H * 0.28, 3);
  ctx.fill();
  // body color
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.6;
  rRect(ctx, x - W * 0.16, y - H * 0.1, W * 0.34, H * 0.18, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // long barrel
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.48, y - H * 0.07, W * 0.34, H * 0.1, 2);
  ctx.fill();
  // barrel color stripe
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.5;
  rRect(ctx, x - W * 0.46, y - H * 0.04, W * 0.3, H * 0.05, 1);
  ctx.fill();
  ctx.globalAlpha = 1;
  // muzzle break
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.49, y - H * 0.1, W * 0.06, H * 0.16, 2);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(x - W * 0.46, y, H * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // stock
  ctx.fillStyle = dark;
  rRect(ctx, x + W * 0.2, y - H * 0.12, W * 0.28, H * 0.24, 3);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.35;
  rRect(ctx, x + W * 0.22, y - H * 0.08, W * 0.24, H * 0.14, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // pistol grip
  ctx.fillStyle = dark;
  rRect(ctx, x + W * 0.1, y + H * 0.1, W * 0.12, H * 0.28, 3);
  ctx.fill();
  // scope
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.08, y - H * 0.26, W * 0.2, H * 0.12, 3);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(x + W * 0.04, y - H * 0.22, H * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(x + W * 0.04, y - H * 0.22, H * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // magazine
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.04, y + H * 0.08, W * 0.12, H * 0.22, 3);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.4;
  rRect(ctx, x - W * 0.02, y + H * 0.1, W * 0.08, H * 0.16, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawShotgunShape(ctx, c, dark, x, y, W, H) {
  // upper barrel
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.46, y - H * 0.2, W * 0.72, H * 0.16, 3);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.55;
  rRect(ctx, x - W * 0.44, y - H * 0.16, W * 0.68, H * 0.09, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // lower barrel
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.46, y - H * 0.04, W * 0.7, H * 0.16, 3);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.45;
  rRect(ctx, x - W * 0.44, y - H * 0.01, W * 0.66, H * 0.09, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // double muzzle glow
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(x - W * 0.46, y - H * 0.14, H * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - W * 0.46, y + H * 0.04, H * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // muzzle inner dark
  ctx.fillStyle = "rgba(0,0,0,.7)";
  ctx.beginPath();
  ctx.arc(x - W * 0.46, y - H * 0.14, H * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - W * 0.46, y + H * 0.04, H * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // receiver / breech
  ctx.fillStyle = dark;
  rRect(ctx, x + W * 0.24, y - H * 0.22, W * 0.24, H * 0.4, 4);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.5;
  rRect(ctx, x + W * 0.26, y - H * 0.18, W * 0.18, H * 0.3, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
  // pump handle
  ctx.fillStyle = dark;
  rRect(ctx, x - W * 0.1, y + H * 0.08, W * 0.26, H * 0.14, 4);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.globalAlpha = 0.6;
  rRect(ctx, x - W * 0.08, y + H * 0.1, W * 0.22, H * 0.1, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
  // barrel connector ring
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.rect(x + W * 0.05, y - H * 0.22, W * 0.06, H * 0.4);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ═══ SKIN DATA ═══
const RARITY_POOL = [
  "COMMON",
  "COMMON",
  "COMMON",
  "COMMON",
  "COMMON",
  "RARE",
  "RARE",
  "RARE",
  "RARE",
  "EPIC",
  "EPIC",
  "EPIC",
  "LEGENDARY",
  "LEGENDARY",
  "MYTHICAL",
  "SECRET",
];
const RARITY_COST = {
  COMMON: 500,
  RARE: 1500,
  EPIC: 3500,
  LEGENDARY: 8000,
  MYTHICAL: 20000,
  SECRET: 50000,
};
const RARITY_SCALE = {
  COMMON: 0.18,
  RARE: 0.36,
  EPIC: 0.54,
  LEGENDARY: 0.72,
  MYTHICAL: 0.88,
  SECRET: 1.0,
};
const COL_POOL = [
  "#ff0a50",
  "#00eeff",
  "#ffd700",
  "#9b30ff",
  "#ff4444",
  "#cccccc",
  "#00ff88",
  "#ff6600",
  "#44aaff",
  "#ff44ff",
  "#aaffaa",
  "#ffaa00",
  "#00ffff",
  "#ff88aa",
  "#88ff88",
  "#8888ff",
  "#ffff44",
  "#44ffff",
  "#ff8800",
  "#88ffff",
];
const CHAR_NAMES_ALL = [
  "PHANTOM",
  "VOID KNIGHT",
  "INFERNO",
  "SHADOW",
  "CRIMSON",
  "GHOST",
  "TOXIC",
  "NOVA",
  "STORM",
  "ECLIPSE",
  "VIPER",
  "TITAN",
  "WRAITH",
  "SPECTER",
  "BLAZE",
  "IRON",
  "FROST",
  "EMBER",
  "NEXUS",
  "PULSE",
  "RAZOR",
  "SURGE",
  "DRIFT",
  "APEX",
  "ZENITH",
  "CIPHER",
  "FORGE",
  "PRISM",
  "ECHO",
  "RIFT",
  "FLUX",
  "CORE",
  "GRID",
  "VOLT",
  "BYTE",
  "ARC",
  "BEAM",
  "SPARK",
  "GLITCH",
  "NULL",
  "ZERO",
  "OMNI",
  "ULTRA",
  "HYPER",
  "MEGA",
  "ALPHA",
  "BETA",
  "GAMMA",
  "DELTA",
  "SIGMA",
  "OMEGA",
  "ZETA",
  "ETA",
  "THETA",
  "KAPPA",
  "LAMBDA",
  "MU",
  "NU",
  "XI",
  "PI",
  "RHO",
  "TAU",
  "UPSILON",
  "PHI",
  "CHI",
  "PSI",
  "IOTA",
  "ATLAS",
  "ORION",
  "LYRA",
  "VEGA",
  "SIRIUS",
  "ANTARES",
  "RIGEL",
  "DENEB",
  "ALTAIR",
  "FOMALHAUT",
  "ACHERNAR",
  "HADAR",
  "ACRUX",
  "MIMOSA",
  "ATRIA",
  "ALDEBARAN",
  "CAPELLA",
  "CASTOR",
  "POLLUX",
  "PROCYON",
  "ARCTURUS",
  "SPICA",
  "REGULUS",
  "ALGOL",
  "MARKAB",
  "SCHEAT",
  "ALGENIB",
  "MIRFAK",
  "RUCHBAH",
  "SEGIN",
  "ASTRA",
  "NEXOR",
];
const WEAPON_NAMES_ALL = [
  "PLASMA BOLT",
  "VOID CANNON",
  "INFERNO RIFLE",
  "SHADOW GUN",
  "CRIMSON SHOT",
  "GHOST BLADE",
  "TOXIC SPRAY",
  "NOVA BURST",
  "STORM RIFLE",
  "ECLIPSE GUN",
  "VIPER SMG",
  "TITAN CANNON",
  "WRAITH PISTOL",
  "SPECTER RIFLE",
  "BLAZE SHOTGUN",
  "IRON REVOLVER",
  "FROST BEAM",
  "EMBER RIFLE",
  "NEXUS GUN",
  "PULSE CANNON",
  "RAZOR SMG",
  "SURGE RIFLE",
  "DRIFT PISTOL",
  "APEX GUN",
  "ZENITH CANNON",
  "CIPHER RIFLE",
  "FORGE GUN",
  "PRISM BEAM",
  "ECHO SHOT",
  "RIFT CANNON",
  "FLUX GUN",
  "CORE RIFLE",
  "GRID SMG",
  "VOLT PISTOL",
  "BYTE CANNON",
  "ARC RIFLE",
  "BEAM GUN",
  "SPARK SMG",
  "GLITCH PISTOL",
  "NULL CANNON",
  "ZERO RIFLE",
  "OMNI BEAM",
  "ULTRA RIFLE",
  "HYPER SMG",
  "MEGA CANNON",
  "ALPHA PISTOL",
  "BETA RIFLE",
  "GAMMA GUN",
  "DELTA SMG",
  "SIGMA CANNON",
  "OMEGA RIFLE",
  "ZETA GUN",
  "ETA PISTOL",
  "THETA CANNON",
  "KAPPA RIFLE",
  "LAMBDA SMG",
  "MU GUN",
  "NU CANNON",
  "XI RIFLE",
  "PI GUN",
  "RHO SMG",
  "TAU PISTOL",
  "UPSILON CANNON",
  "PHI RIFLE",
  "CHI GUN",
  "PSI SMG",
  "IOTA PISTOL",
  "ATLAS CANNON",
  "ORION RIFLE",
  "LYRA GUN",
  "VEGA SMG",
  "SIRIUS PISTOL",
  "ANTARES CANNON",
  "RIGEL RIFLE",
  "DENEB GUN",
  "ALTAIR SMG",
  "FOMALHAUT PISTOL",
  "ACHERNAR CANNON",
  "HADAR RIFLE",
  "ACRUX GUN",
  "MIMOSA SMG",
  "ATRIA PISTOL",
  "ALDEBARAN CANNON",
  "CAPELLA RIFLE",
  "CASTOR GUN",
  "POLLUX SMG",
  "PROCYON PISTOL",
  "ARCTURUS CANNON",
  "SPICA RIFLE",
  "REGULUS GUN",
  "ALGOL SMG",
  "MARKAB PISTOL",
  "SCHEAT CANNON",
  "ALGENIB RIFLE",
  "MIRFAK GUN",
  "RUCHBAH SMG",
  "SEGIN PISTOL",
  "ASTRA CANNON",
  "NEXOR RIFLE",
];
const WTYPES = ["pistol", "rifle", "shotgun"];

function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function charStatsByRarity(rar, rng) {
  const s = RARITY_SCALE[rar] || 0.18;
  return {
    hp: Math.round(55 + s * 145 + rng() * 10),
    spd: parseFloat((1.2 + s * 3.8 + rng() * 0.2).toFixed(1)),
    regen: parseFloat((0.3 + s * 4.7 + rng() * 0.2).toFixed(1)),
  };
}
function weapStatsByRarity(rar, rng) {
  const s = RARITY_SCALE[rar] || 0.18;
  return {
    dmg: Math.round(8 + s * 92 + rng() * 5),
    rate: Math.round(8 + s * 92 + rng() * 5),
    range: Math.round(8 + s * 92 + rng() * 5),
    spd: Math.round(8 + s * 92 + rng() * 5),
  };
}

// ═══ 50 CHARACTERS — exact rarity counts: 15+12+10+8+3+2 ═══
const CHAR_DEFS = [
  // ── COMMON (15) ──
  { name: "IRON WOLF", rarity: "COMMON", color: "#aaaaaa", visor: "#cccccc" },
  { name: "STEEL HAWK", rarity: "COMMON", color: "#bbbbcc", visor: "#ddddee" },
  { name: "DUST RIDER", rarity: "COMMON", color: "#cc8844", visor: "#ffaa66" },
  { name: "GRUNT", rarity: "COMMON", color: "#999988", visor: "#bbbbaa" },
  { name: "SCOUT", rarity: "COMMON", color: "#aabb88", visor: "#ccddaa" },
  { name: "PATROL", rarity: "COMMON", color: "#88aa99", visor: "#aaccbb" },
  { name: "RANGER", rarity: "COMMON", color: "#aa9977", visor: "#ccbb99" },
  { name: "TROOPER", rarity: "COMMON", color: "#bbaa88", visor: "#ddccaa" },
  { name: "SENTINEL", rarity: "COMMON", color: "#ccbb99", visor: "#eeddbb" },
  { name: "TAC OPS", rarity: "COMMON", color: "#aaccaa", visor: "#cceecc" },
  { name: "VANGUARD", rarity: "COMMON", color: "#bbccbb", visor: "#ddeedd" },
  { name: "WARDEN", rarity: "COMMON", color: "#ccaaaa", visor: "#eecccc" },
  { name: "RECON", rarity: "COMMON", color: "#bbbbaa", visor: "#ddddcc" },
  { name: "ENFORCER", rarity: "COMMON", color: "#aabbcc", visor: "#ccddee" },
  { name: "BREACHER", rarity: "COMMON", color: "#ccbbaa", visor: "#eeddcc" },
  // ── RARE (12) ──
  { name: "PLASMA", rarity: "RARE", color: "#4488ff", visor: "#88ccff" },
  { name: "SURGE", rarity: "RARE", color: "#44aaff", visor: "#88ddff" },
  { name: "VOLT", rarity: "RARE", color: "#44ccff", visor: "#88eeff" },
  { name: "PULSE", rarity: "RARE", color: "#5599ff", visor: "#99ccff" },
  { name: "ARC", rarity: "RARE", color: "#4477dd", visor: "#88aaff" },
  { name: "SHOCK", rarity: "RARE", color: "#3366cc", visor: "#7799ff" },
  { name: "FROST", rarity: "RARE", color: "#44ddff", visor: "#88ffff" },
  { name: "CRYO", rarity: "RARE", color: "#55eeff", visor: "#aaffff" },
  { name: "BLIZZARD", rarity: "RARE", color: "#66ffff", visor: "#bbffff" },
  { name: "ECHO", rarity: "RARE", color: "#4499ee", visor: "#88ccff" },
  { name: "BEAM", rarity: "RARE", color: "#33aaff", visor: "#77ddff" },
  { name: "WAVE", rarity: "RARE", color: "#22bbff", visor: "#66eeff" },
  // ── EPIC (10) ──
  { name: "SHADOW", rarity: "EPIC", color: "#9b30ff", visor: "#cc88ff" },
  { name: "VOID KNIGHT", rarity: "EPIC", color: "#aa44ff", visor: "#dd99ff" },
  { name: "DARK OPS", rarity: "EPIC", color: "#bb55ff", visor: "#eeaaff" },
  { name: "SPECTER", rarity: "EPIC", color: "#8822ee", visor: "#bb77ff" },
  { name: "WRAITH", rarity: "EPIC", color: "#9933dd", visor: "#cc88ee" },
  { name: "PHANTOM", rarity: "EPIC", color: "#aa44dd", visor: "#dd99ff" },
  { name: "RIFT", rarity: "EPIC", color: "#7711cc", visor: "#aa66ee" },
  { name: "NEXUS", rarity: "EPIC", color: "#8833bb", visor: "#bb88dd" },
  { name: "PRISM", rarity: "EPIC", color: "#cc66ff", visor: "#ffbbff" },
  { name: "CIPHER", rarity: "EPIC", color: "#dd77ff", visor: "#ffccff" },
  // ── LEGENDARY (8) ──
  { name: "INFERNO", rarity: "LEGENDARY", color: "#ffd700", visor: "#fff088" },
  {
    name: "SOLAR BLAZE",
    rarity: "LEGENDARY",
    color: "#ffcc00",
    visor: "#ffee66",
  },
  { name: "TITAN", rarity: "LEGENDARY", color: "#ffaa00", visor: "#ffcc44" },
  { name: "BLAZE", rarity: "LEGENDARY", color: "#ff8800", visor: "#ffaa44" },
  { name: "EMBER", rarity: "LEGENDARY", color: "#ffdd22", visor: "#ffff66" },
  { name: "NOVA", rarity: "LEGENDARY", color: "#ffe033", visor: "#ffff77" },
  { name: "FORGE", rarity: "LEGENDARY", color: "#ffc444", visor: "#ffdd88" },
  { name: "APEX", rarity: "LEGENDARY", color: "#ffb300", visor: "#ffd044" },
  // ── MYTHICAL (3) ──
  {
    name: "PHANTOM EDGE",
    rarity: "MYTHICAL",
    color: "#ff0a50",
    visor: "#ff88aa",
  },
  {
    name: "BLOOD REAPER",
    rarity: "MYTHICAL",
    color: "#ff2244",
    visor: "#ff7788",
  },
  {
    name: "DOOM BRINGER",
    rarity: "MYTHICAL",
    color: "#ff3366",
    visor: "#ff99bb",
  },
  // ── SECRET (2) ──
  { name: "VOID REAPER", rarity: "SECRET", color: "#00eeff", visor: "#88ffff" },
  { name: "ZERO POINT", rarity: "SECRET", color: "#ffffff", visor: "#aaffff" },
];
const ALL_CHARS = CHAR_DEFS.map((def, i) => {
  const rng = seededRand(i * 7 + 1);
  return {
    id: i,
    name: def.name,
    rarity: def.rarity,
    color: def.color,
    body: "#08001a",
    armor: def.color,
    visor: def.visor,
    price: RARITY_COST[def.rarity],
    stats: charStatsByRarity(def.rarity, rng),
  };
});

// ═══ 50 WEAPONS — exact rarity counts ═══
// COMMON×15, RARE×12, EPIC×10, LEGENDARY×8, MYTHICAL×3, SECRET×2
const WEAPON_DEFS = [
  // ── COMMON (15) ── pistols, basic rifles, basic shotguns
  { name: "IRON PISTOL", wtype: "pistol", rarity: "COMMON", color: "#aaaaaa" },
  { name: "STEEL PISTOL", wtype: "pistol", rarity: "COMMON", color: "#bbbbcc" },
  { name: "RUST GUN", wtype: "pistol", rarity: "COMMON", color: "#cc8844" },
  { name: "BASIC RIFLE", wtype: "rifle", rarity: "COMMON", color: "#999988" },
  { name: "FIELD RIFLE", wtype: "rifle", rarity: "COMMON", color: "#aabb88" },
  { name: "DUTY RIFLE", wtype: "rifle", rarity: "COMMON", color: "#88aa99" },
  { name: "BUCK SHOT", wtype: "shotgun", rarity: "COMMON", color: "#aa9977" },
  { name: "PUMP ACTION", wtype: "shotgun", rarity: "COMMON", color: "#bbaa88" },
  { name: "SCATTER GUN", wtype: "shotgun", rarity: "COMMON", color: "#ccbb99" },
  { name: "TAC PISTOL", wtype: "pistol", rarity: "COMMON", color: "#aaccaa" },
  { name: "GRUNT RIFLE", wtype: "rifle", rarity: "COMMON", color: "#bbccbb" },
  { name: "TRENCH GUN", wtype: "shotgun", rarity: "COMMON", color: "#ccaaaa" },
  { name: "SIDEARM", wtype: "pistol", rarity: "COMMON", color: "#bbbbaa" },
  { name: "PATROL RIFLE", wtype: "rifle", rarity: "COMMON", color: "#aabbcc" },
  { name: "BREACHER", wtype: "shotgun", rarity: "COMMON", color: "#ccbbaa" },
  // ── RARE (12) ──
  { name: "PLASMA PISTOL", wtype: "pistol", rarity: "RARE", color: "#4488ff" },
  { name: "SURGE RIFLE", wtype: "rifle", rarity: "RARE", color: "#44aaff" },
  { name: "VOLT SHOTGUN", wtype: "shotgun", rarity: "RARE", color: "#44ccff" },
  { name: "PULSE GUN", wtype: "pistol", rarity: "RARE", color: "#5599ff" },
  { name: "ARC RIFLE", wtype: "rifle", rarity: "RARE", color: "#4477dd" },
  { name: "SHOCK CANNON", wtype: "shotgun", rarity: "RARE", color: "#3366cc" },
  { name: "FROST PISTOL", wtype: "pistol", rarity: "RARE", color: "#44ddff" },
  { name: "CRYO RIFLE", wtype: "rifle", rarity: "RARE", color: "#55eeff" },
  { name: "ICE BREAKER", wtype: "shotgun", rarity: "RARE", color: "#66ffff" },
  { name: "ECHO GUN", wtype: "pistol", rarity: "RARE", color: "#4499ee" },
  { name: "BEAM RIFLE", wtype: "rifle", rarity: "RARE", color: "#33aaff" },
  { name: "WAVE SHOTGUN", wtype: "shotgun", rarity: "RARE", color: "#22bbff" },
  // ── EPIC (10) ──
  { name: "SHADOW PISTOL", wtype: "pistol", rarity: "EPIC", color: "#9b30ff" },
  { name: "VOID RIFLE", wtype: "rifle", rarity: "EPIC", color: "#aa44ff" },
  { name: "DARK CANNON", wtype: "shotgun", rarity: "EPIC", color: "#bb55ff" },
  { name: "SPECTER GUN", wtype: "pistol", rarity: "EPIC", color: "#8822ee" },
  { name: "WRAITH RIFLE", wtype: "rifle", rarity: "EPIC", color: "#9933dd" },
  { name: "PHANTOM SHOT", wtype: "shotgun", rarity: "EPIC", color: "#aa44dd" },
  { name: "RIFT PISTOL", wtype: "pistol", rarity: "EPIC", color: "#7711cc" },
  { name: "NEXUS RIFLE", wtype: "rifle", rarity: "EPIC", color: "#8833bb" },
  { name: "PRISM CANNON", wtype: "shotgun", rarity: "EPIC", color: "#cc66ff" },
  { name: "CIPHER GUN", wtype: "pistol", rarity: "EPIC", color: "#dd77ff" },
  // ── LEGENDARY (8) ──
  {
    name: "INFERNO PISTOL",
    wtype: "pistol",
    rarity: "LEGENDARY",
    color: "#ffd700",
  },
  {
    name: "SOLAR RIFLE",
    wtype: "rifle",
    rarity: "LEGENDARY",
    color: "#ffcc00",
  },
  {
    name: "TITAN CANNON",
    wtype: "shotgun",
    rarity: "LEGENDARY",
    color: "#ffaa00",
  },
  {
    name: "BLAZE PISTOL",
    wtype: "pistol",
    rarity: "LEGENDARY",
    color: "#ff8800",
  },
  {
    name: "EMBER RIFLE",
    wtype: "rifle",
    rarity: "LEGENDARY",
    color: "#ffdd22",
  },
  {
    name: "NOVA CANNON",
    wtype: "shotgun",
    rarity: "LEGENDARY",
    color: "#ffe033",
  },
  { name: "FORGE GUN", wtype: "pistol", rarity: "LEGENDARY", color: "#ffc444" },
  { name: "APEX RIFLE", wtype: "rifle", rarity: "LEGENDARY", color: "#ffb300" },
  // ── MYTHICAL (3) ──
  {
    name: "PHANTOM EDGE",
    wtype: "pistol",
    rarity: "MYTHICAL",
    color: "#ff0a50",
  },
  { name: "BLOOD RIFLE", wtype: "rifle", rarity: "MYTHICAL", color: "#ff2244" },
  {
    name: "DOOM CANNON",
    wtype: "shotgun",
    rarity: "MYTHICAL",
    color: "#ff3366",
  },
  // ── SECRET (2) ──
  { name: "VOID REAPER", wtype: "rifle", rarity: "SECRET", color: "#00eeff" },
  { name: "ZERO POINT", wtype: "pistol", rarity: "SECRET", color: "#ffffff" },
];

const ALL_WEAPONS = WEAPON_DEFS.map((def, i) => {
  const rng = seededRand(i * 17 + 5);
  return {
    id: i,
    name: def.name,
    wtype: def.wtype,
    rarity: def.rarity,
    color: def.color,
    body: "#050010",
    visor: def.color,
    price: RARITY_COST[def.rarity],
    stats: weapStatsByRarity(def.rarity, rng),
  };
});

// ═══ RANK SYSTEM ═══
const RANKS = [
  { name: "IRON", icon: "🔩", color: "#8899aa", expNeeded: 0 },
  { name: "BRONZE", icon: "🥉", color: "#cd7f32", expNeeded: 500 },
  { name: "SILVER", icon: "🥈", color: "#c0c0c0", expNeeded: 1500 },
  { name: "GOLD", icon: "🥇", color: "#ffd700", expNeeded: 3500 },
  { name: "PLATINUM", icon: "💎", color: "#00eeff", expNeeded: 8000 },
  { name: "DIAMOND", icon: "💠", color: "#9b30ff", expNeeded: 18000 },
  { name: "LEGEND", icon: "👑", color: "#ff0a50", expNeeded: 40000 },
];
function getRankInfo(exp) {
  let rank = RANKS[0],
    next = RANKS[1];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (exp >= RANKS[i].expNeeded) {
      rank = RANKS[i];
      next = RANKS[i + 1] || null;
      break;
    }
  }
  const pct = next
    ? Math.min(
        100,
        Math.round(
          ((exp - rank.expNeeded) / (next.expNeeded - rank.expNeeded)) * 100,
        ),
      )
    : 100;
  return { rank, next, pct, exp };
}

let selChar = 0,
  selWeapon = 0,
  currentUser = null;

// ═══ MENU SETUP ═══
function setupMenu(userData) {
  currentUser = userData;
  if (!currentUser.skins) currentUser.skins = [];
  if (!currentUser.stats)
    currentUser.stats = { kills: 0, waves: 0, highWave: 0 };
  if (!currentUser.exp) currentUser.exp = 0;
  // give starter items if brand new (no owned chars/weapons)
  const hasChar = currentUser.skins.some((s) => s.startsWith("c"));
  const hasWeap = currentUser.skins.some((s) => s.startsWith("w"));
  if (!hasChar) currentUser.skins.push("c0");
  if (!hasWeap) currentUser.skins.push("w0");
  document.getElementById("hud-coins").textContent = currentUser.coins || 500;
  document.getElementById("topbar-nick").textContent =
    userData.nickname.toUpperCase();
  if (userData.avatar) {
    const av = document.getElementById("topbar-av");
    av.innerHTML = `<img src="${userData.avatar}" alt="">`;
  }
  // set selChar/selWeapon to first owned
  const firstChar = currentUser.skins.find((s) => s.startsWith("c"));
  const firstWeap = currentUser.skins.find((s) => s.startsWith("w"));
  selChar = firstChar ? parseInt(firstChar.slice(1)) : 0;
  selWeapon = firstWeap ? parseInt(firstWeap.slice(1)) : 0;
  // update rank in topbar
  const ri = getRankInfo(currentUser.exp || 0);
  document.getElementById("topbar-rank").textContent =
    ri.rank.icon + " " + ri.rank.name + " RANK";
  buildGamePage();
  buildShopPage();
  buildProfilePage();
}

// ═══ GAME PAGE — OWNED ONLY ═══
function buildGamePage() {
  updateBigChar(selChar);
  updatePreviewPanel("char", selChar);
  updatePreviewPanel("weapon", selWeapon);

  // ONLY show owned chars
  const ownedCharIds = (currentUser.skins || [])
    .filter((s) => s.startsWith("c"))
    .map((s) => parseInt(s.slice(1)));
  const charPool = ownedCharIds.map((i) => ALL_CHARS[i]).filter(Boolean);

  // ONLY show owned weapons
  const ownedWeapIds = (currentUser.skins || [])
    .filter((s) => s.startsWith("w"))
    .map((s) => parseInt(s.slice(1)));
  const weapPool = ownedWeapIds.map((i) => ALL_WEAPONS[i]).filter(Boolean);

  // build char cards
  const cg = document.getElementById("char-skins-grid");
  cg.innerHTML = "";
  cg.className = "skins-grid";
  charPool.forEach((sk) => {
    const i = sk.id;
    const rc = RC[sk.rarity] || "#aaa";
    const cid = "gc-cv-" + i;
    const card = document.createElement("div");
    card.className = "skin-card owned" + (i === selChar ? " selected" : "");
    card.innerHTML = `
      <div class="skin-card-rar-bar" style="background:${rc};box-shadow:0 0 6px ${rc}88;"></div>
      <div class="skin-card-art">
        <canvas id="${cid}" class="skin-canvas" width="110" height="120"></canvas>
      </div>
      <div class="skin-card-foot">
        <div class="skin-name">${sk.name}</div>
        <div class="skin-price" style="color:${rc}">${sk.rarity}</div>
      </div>`;
    card.onclick = () => {
      selChar = i;
      playUIClick("equip");
      updateBigChar(i);
      updatePreviewPanel("char", i);
      document
        .querySelectorAll("#char-skins-grid .skin-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
    };
    cg.appendChild(card);
    setTimeout(
      () => {
        const c = document.getElementById(cid);
        if (c) drawChar(c, sk, 55, 62, 45, true);
      },
      i * 8 + 50,
    );
  });
  if (charPool.length === 0) {
    cg.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:30px;font-family:\'Share Tech Mono\',monospace;font-size:11px;color:rgba(155,48,255,.4);letter-spacing:2px;">NO CHARACTERS OWNED<br><br><span style="color:rgba(155,48,255,.6)">→ BUY FROM SHOP</span></div>';
  }

  // build weapon cards
  const wg = document.getElementById("weapon-skins-grid");
  wg.innerHTML = "";
  wg.className = "skins-grid weapons-grid";
  weapPool.forEach((sk) => {
    const i = sk.id;
    const rc = RC[sk.rarity] || "#aaa";
    const cid = "gw-cv-" + i;
    const card = document.createElement("div");
    card.className =
      "skin-card weapon-card owned" + (i === selWeapon ? " selected" : "");
    card.innerHTML = `
      <div class="skin-card-rar-bar" style="background:${rc};box-shadow:0 0 6px ${rc}88;"></div>
      <div class="skin-card-art" style="background:radial-gradient(ellipse at 50% 50%,rgba(155,48,255,.1) 0%,transparent 65%);">
        <canvas id="${cid}" class="skin-canvas" width="130" height="75"></canvas>
      </div>
      <div class="skin-card-foot">
        <div class="skin-name">${sk.name}</div>
        <div class="skin-price" style="color:${rc}">${sk.rarity}</div>
      </div>`;
    card.onclick = () => {
      selWeapon = i;
      playUIClick("equip");
      updatePreviewPanel("weapon", i);
      document
        .querySelectorAll("#weapon-skins-grid .skin-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
    };
    wg.appendChild(card);
    setTimeout(
      () => {
        const c = document.getElementById(cid);
        if (c) drawWeapon(c, sk);
      },
      i * 8 + 50,
    );
  });
  if (weapPool.length === 0) {
    wg.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:30px;font-family:\'Share Tech Mono\',monospace;font-size:11px;color:rgba(155,48,255,.4);letter-spacing:2px;">NO WEAPONS OWNED<br><br><span style="color:rgba(155,48,255,.6)">→ BUY FROM SHOP</span></div>';
  }
}

function updateBigChar(i) {
  const sk = ALL_CHARS[i];
  if (!sk) return;
  const cv2 = document.getElementById("bigCharCanvas");
  if (cv2) drawChar(cv2, sk, 105, 108, 85, false);
  const rc = RC[sk.rarity] || "#aaa";
  safeSet("bigCharName", "textContent", sk.name);
  safeSet("bigCharRarity", "textContent", "◆ " + sk.rarity);
  const el = document.getElementById("bigCharRarity");
  if (el) el.style.color = rc;
  const hp = Math.round(sk.stats.hp);
  setTimeout(() => {
    safePct("stat-hp", (hp / 180) * 100);
    safePct("stat-spd", (sk.stats.spd / 5) * 100);
    safePct("stat-regen", (sk.stats.regen / 5) * 100);
  }, 50);
  safeSet("stat-hp-v", "textContent", hp);
  safeSet("stat-spd-v", "textContent", sk.stats.spd.toFixed(1));
  safeSet("stat-regen-v", "textContent", sk.stats.regen.toFixed(1));
}

function safeSet(id, prop, val) {
  const el = document.getElementById(id);
  if (el) el[prop] = val;
}
function safePct(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = pct + "%";
}

function updatePreviewPanel(type, i) {
  if (type === "char") {
    const sk = ALL_CHARS[i];
    if (!sk) return;
    const rc = RC[sk.rarity] || "#aaa";
    const cv2 = document.getElementById("previewCharCanvas");
    if (cv2) drawChar(cv2, sk, 65, 68, 52, true);
    safeSet("preview-char-name", "textContent", sk.name);
    safeSet("preview-char-rar", "textContent", "◆ " + sk.rarity);
    const el = document.getElementById("preview-char-rar");
    if (el) el.style.color = rc;
    const hp = Math.round(sk.stats.hp);
    setTimeout(() => {
      safePct("prev-hp", (hp / 180) * 100);
      safePct("prev-spd", (sk.stats.spd / 5) * 100);
      safePct("prev-regen", (sk.stats.regen / 5) * 100);
    }, 80);
    safeSet("prev-hp-v", "textContent", hp);
    safeSet("prev-spd-v", "textContent", sk.stats.spd.toFixed(1));
    safeSet("prev-regen-v", "textContent", sk.stats.regen.toFixed(1));
  } else {
    const sk = ALL_WEAPONS[i];
    if (!sk) return;
    const rc = RC[sk.rarity] || "#aaa";
    const cv2 = document.getElementById("previewWeaponCanvas");
    if (cv2) drawWeapon(cv2, sk);
    safeSet("preview-wpn-name", "textContent", sk.name);
    safeSet("preview-wpn-rar", "textContent", "◆ " + sk.rarity);
    const el = document.getElementById("preview-wpn-rar");
    if (el) el.style.color = rc;
    setTimeout(() => {
      safePct("prev-dmg", sk.stats.dmg);
      safePct("prev-rate", sk.stats.rate);
      safePct("prev-range", sk.stats.range);
    }, 80);
    safeSet("prev-dmg-v", "textContent", Math.round(sk.stats.dmg));
    safeSet("prev-rate-v", "textContent", Math.round(sk.stats.rate));
    safeSet("prev-range-v", "textContent", Math.round(sk.stats.range));
  }
}

function switchCharTab(t) {
  document
    .querySelectorAll(".ctab")
    .forEach((el, i) =>
      el.classList.toggle(
        "active",
        (i === 0 && t === "chars") || (i === 1 && t === "weapons"),
      ),
    );
  const cp = document.getElementById("chars-panel"),
    wp = document.getElementById("weapons-panel");
  cp.style.display = t === "chars" ? "flex" : "none";
  wp.style.display = t === "weapons" ? "flex" : "none";
}

// ═══ SHOP PAGE ═══
let shopPreviewType = "chars",
  shopPreviewIdx = 0,
  shopCurrentFilter = "ALL",
  shopCurrentType = "chars";

function buildShopPage() {
  buildShopGrid("chars");
  buildShopGrid("weapons");
}

function buildShopGrid(type, filterRar) {
  filterRar = filterRar || "ALL";
  const allItems = type === "chars" ? ALL_CHARS : ALL_WEAPONS;
  const items =
    filterRar === "ALL"
      ? allItems
      : allItems.filter((sk) => sk.rarity === filterRar);
  const grid = document.getElementById("shop-" + type + "-grid");
  grid.innerHTML = "";
  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;font-family:'Share Tech Mono',monospace;font-size:11px;color:rgba(155,48,255,.4);letter-spacing:2px;">NO ITEMS IN THIS CATEGORY</div>`;
    return;
  }
  items.forEach((sk) => {
    const i = sk.id;
    const key = (type === "chars" ? "c" : "w") + i;
    const owned = currentUser.skins && currentUser.skins.includes(key);
    const rc = RC[sk.rarity] || "#aaa";
    const isChar = type === "chars";
    const cvW = isChar ? 90 : 120,
      cvH = isChar ? 100 : 70;
    const cid = "sh2-" + type + "-" + i;
    let statsH = "";
    if (isChar) {
      statsH = `<div class="shop-stats">
        <div class="shop-stat-row"><span class="shop-stat-label">❤️</span><div class="shop-stat-bar"><div class="shop-stat-fill" style="width:${Math.min((sk.stats.hp / 200) * 100, 100)}%;background:linear-gradient(90deg,#ff4444,#ff8888)"></div></div><span class="shop-stat-val-sm">${Math.round(sk.stats.hp)}</span></div>
        <div class="shop-stat-row"><span class="shop-stat-label">⚡</span><div class="shop-stat-bar"><div class="shop-stat-fill" style="width:${Math.min((sk.stats.spd / 5) * 100, 100)}%;background:linear-gradient(90deg,#00eeff,#88ffff)"></div></div><span class="shop-stat-val-sm">${sk.stats.spd}</span></div>
        <div class="shop-stat-row"><span class="shop-stat-label">💚</span><div class="shop-stat-bar"><div class="shop-stat-fill" style="width:${Math.min((sk.stats.regen / 5) * 100, 100)}%;background:linear-gradient(90deg,#00ff88,#88ffcc)"></div></div><span class="shop-stat-val-sm">${sk.stats.regen}</span></div>
      </div>`;
    } else {
      statsH = `<div class="shop-stats">
        <div class="shop-stat-row"><span class="shop-stat-label">🔥</span><div class="shop-stat-bar"><div class="shop-stat-fill" style="width:${sk.stats.dmg}%;background:linear-gradient(90deg,#ff4444,#ff8888)"></div></div><span class="shop-stat-val-sm">${sk.stats.dmg}</span></div>
        <div class="shop-stat-row"><span class="shop-stat-label">⚡</span><div class="shop-stat-bar"><div class="shop-stat-fill" style="width:${sk.stats.rate}%;background:linear-gradient(90deg,#ffd700,#fff088)"></div></div><span class="shop-stat-val-sm">${sk.stats.rate}</span></div>
        <div class="shop-stat-row"><span class="shop-stat-label">🎯</span><div class="shop-stat-bar"><div class="shop-stat-fill" style="width:${sk.stats.range}%;background:linear-gradient(90deg,#00eeff,#88ffff)"></div></div><span class="shop-stat-val-sm">${sk.stats.range}</span></div>
        <div class="shop-stat-row"><span class="shop-stat-label">💨</span><div class="shop-stat-bar"><div class="shop-stat-fill" style="width:${sk.stats.spd}%;background:linear-gradient(90deg,#00ff88,#88ffcc)"></div></div><span class="shop-stat-val-sm">${sk.stats.spd}</span></div>
      </div>`;
    }
    const card = document.createElement("div");
    card.className = "shop-card" + (owned ? " owned" : "");
    card.style.borderColor = rc + "55";
    card.innerHTML = `
      <div class="shop-card-shine"></div>
      <div class="shop-rar-stripe" style="background:${rc};box-shadow:0 0 8px ${rc};"></div>
      ${owned ? `<div class="shop-owned-badge">✓ OWNED</div>` : ""}
      ${!isChar ? `<div style="position:absolute;top:12px;left:9px;font-family:'Share Tech Mono',monospace;font-size:8px;color:${rc};letter-spacing:1px;z-index:3;text-transform:uppercase;">${sk.wtype}</div>` : ""}
      <div class="shop-art" style="background:radial-gradient(ellipse at 50% 60%,${hexA(rc, 0.12)} 0%,transparent 70%);">
        <canvas id="${cid}" width="${cvW}" height="${cvH}" style="filter:drop-shadow(0 0 10px ${rc});"></canvas>
      </div>
      <div class="shop-info">
        <span class="shop-rarity-label" style="color:${rc};">◆ ${sk.rarity}</span>
        <div class="shop-name">${sk.name}</div>
        ${statsH}
        <div class="shop-price-row"><span>💰</span><span class="shop-price" style="color:${rc};">${sk.price.toLocaleString()}</span></div>
        <button class="shop-buy-btn${owned ? " owned" : ""}" onclick="event.stopPropagation();buyItem('${type}',${i})">${owned ? "✓ OWNED" : "BUY NOW"}</button>
      </div>`;
    card.onclick = () => updateShopPreview(type, i);
    grid.appendChild(card);
    const idx = items.indexOf(sk);
    setTimeout(
      () => {
        const cv = document.getElementById(cid);
        if (!cv) return;
        if (isChar) drawChar(cv, sk, cvW / 2, cvH / 2 - 2, cvW * 0.43, true);
        else drawWeapon(cv, sk);
      },
      idx * 15 + 60,
    );
  });
  if (items.length > 0) updateShopPreview(type, items[0].id);
}

function filterShop(rar) {
  shopCurrentFilter = rar;
  document.querySelectorAll(".rar-btn").forEach((b) => {
    const active = b.dataset.rar === rar;
    b.classList.toggle("active", active);
    if (active) {
      b.style.background = RC[rar] || "rgba(255,255,255,.2)";
      b.style.color = "#fff";
    } else {
      b.style.background = "rgba(255,255,255,.05)";
      b.style.color = "rgba(255,255,255,.45)";
    }
  });
  buildShopGrid(shopCurrentType, rar);
}

function switchShopTab(t) {
  shopCurrentType = t;
  document
    .getElementById("stab-chars")
    .classList.toggle("active", t === "chars");
  document
    .getElementById("stab-weapons")
    .classList.toggle("active", t === "weapons");
  document.getElementById("shop-chars-grid").style.display =
    t === "chars" ? "grid" : "none";
  document.getElementById("shop-weapons-grid").style.display =
    t === "weapons" ? "grid" : "none";
  buildShopGrid(t, shopCurrentFilter);
}

function updateShopPreview(type, i) {
  shopPreviewType = type;
  shopPreviewIdx = i;
  const sk = (type === "chars" ? ALL_CHARS : ALL_WEAPONS)[i];
  if (!sk) return;
  const rc = RC[sk.rarity] || "#aaa";
  const cv2 = document.getElementById("shopPreviewCanvas");
  // animate panel
  const panel = document.getElementById("shop-preview-panel");
  if (panel) {
    panel.style.transition = "transform .3s ease,opacity .3s ease";
    panel.style.opacity = "0";
    panel.style.transform = "translateX(10px)";
  }
  setTimeout(() => {
    if (type === "chars") {
      if (cv2) {
        cv2.width = 130;
        cv2.height = 130;
        drawChar(cv2, sk, 65, 68, 52, true);
      }
      safeSet("shop-s1-label", "textContent", "❤️ HP");
      safeSet("shop-s2-label", "textContent", "⚡ SPD");
      safeSet("shop-s3-label", "textContent", "💚 REGEN");
      setTimeout(() => {
        safePct("shop-s1", (sk.stats.hp / 200) * 100);
        safePct("shop-s2", (sk.stats.spd / 5) * 100);
        safePct("shop-s3", (sk.stats.regen / 5) * 100);
      }, 80);
      safeSet("shop-s1-v", "textContent", Math.round(sk.stats.hp));
      safeSet("shop-s2-v", "textContent", sk.stats.spd.toFixed(1));
      safeSet("shop-s3-v", "textContent", sk.stats.regen.toFixed(1));
    } else {
      if (cv2) {
        cv2.width = 130;
        cv2.height = 80;
        drawWeapon(cv2, sk);
      }
      safeSet("shop-s1-label", "textContent", "🔥 DMG");
      safeSet("shop-s2-label", "textContent", "⚡ RATE");
      safeSet("shop-s3-label", "textContent", "🎯 RANGE");
      setTimeout(() => {
        safePct("shop-s1", sk.stats.dmg);
        safePct("shop-s2", sk.stats.rate);
        safePct("shop-s3", sk.stats.range);
      }, 80);
      safeSet("shop-s1-v", "textContent", sk.stats.dmg);
      safeSet("shop-s2-v", "textContent", sk.stats.rate);
      safeSet("shop-s3-v", "textContent", sk.stats.range);
    }
    safeSet("shop-prev-name", "textContent", sk.name);
    safeSet("shop-prev-rar", "textContent", "◆ " + sk.rarity);
    const el = document.getElementById("shop-prev-rar");
    if (el) el.style.color = rc;
    safeSet(
      "shop-prev-price",
      "textContent",
      "💰 " + sk.price.toLocaleString() + " COINS",
    );
    const key = (type === "chars" ? "c" : "w") + i;
    const owned =
      currentUser && currentUser.skins && currentUser.skins.includes(key);
    const btn = document.getElementById("shop-prev-buy");
    if (btn) {
      btn.textContent = owned ? "✓ OWNED" : "BUY NOW";
      btn.style.borderColor = owned ? "rgba(0,255,136,.4)" : null;
      btn.style.color = owned ? "var(--green)" : null;
    }
    // animate in
    if (panel) {
      panel.style.opacity = "1";
      panel.style.transform = "translateX(0)";
    }
  }, 80);
}

function shopPreviewBuy() {
  buyItem(shopPreviewType, shopPreviewIdx);
  updateShopPreview(shopPreviewType, shopPreviewIdx);
}

function buyItem(type, i) {
  if (!currentUser) return;
  const key = (type === "chars" ? "c" : "w") + i;
  if (!currentUser.skins) currentUser.skins = [];
  if (currentUser.skins.includes(key)) return;
  const price = (type === "chars" ? ALL_CHARS : ALL_WEAPONS)[i].price;
  if (currentUser.coins < price) {
    playUIClick("error");
    alert("NOT ENOUGH COINS!");
    return;
  }
  currentUser.coins -= price;
  currentUser.skins.push(key);
  const users = getUsers();
  users[currentUser.username] = currentUser;
  saveUsers(users);
  playUIClick("buy");
  document.getElementById("hud-coins").textContent = currentUser.coins;
  buildShopGrid(shopCurrentType, shopCurrentFilter);
  buildGamePage();
}
function buildProfilePage() {
  if (!currentUser) return;
  const u = currentUser;
  const ri = getRankInfo(u.exp || 0);

  // avatar: uploaded image or current char skin
  const avWrap = document.getElementById("prof-av-wrap");
  if (u.avatar) {
    avWrap.innerHTML = `<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    avWrap.innerHTML = `<canvas id="prof-av-canvas" width="90" height="90" class="prof-av-canvas"></canvas>`;
    const sk = ALL_CHARS[selChar];
    setTimeout(() => {
      const c = document.getElementById("prof-av-canvas");
      if (c) drawChar(c, sk, 45, 48, 36, true);
    }, 80);
  }

  document.getElementById("prof-nick").textContent = u.nickname.toUpperCase();
  document.getElementById("prof-title-txt").textContent =
    "[ " + (u.title || "SOLDIER") + " ]";

  // rank badge
  const rb = document.getElementById("prof-rank-badge");
  rb.textContent = ri.rank.icon + " " + ri.rank.name;
  rb.style.color = ri.rank.color;
  rb.style.borderColor = ri.rank.color;
  rb.style.boxShadow = `0 0 12px ${ri.rank.color}44`;

  // exp bar
  document.getElementById("prof-exp-cur").textContent =
    (u.exp || 0).toLocaleString() + " EXP";
  document.getElementById("prof-exp-pct").textContent = ri.pct + "%";
  document.getElementById("prof-exp-fill").style.background =
    `linear-gradient(90deg,${ri.rank.color},${ri.rank.color}88)`;
  setTimeout(() => {
    document.getElementById("prof-exp-fill").style.width = ri.pct + "%";
  }, 100);
  document.getElementById("prof-exp-next").textContent = ri.next
    ? "NEXT: " +
      ri.next.name +
      " — " +
      ri.next.expNeeded.toLocaleString() +
      " EXP"
    : "MAX RANK REACHED 👑";

  // stats
  document.getElementById("prof-kills").textContent = (
    (u.stats && u.stats.kills) ||
    0
  ).toLocaleString();
  document.getElementById("prof-waves").textContent =
    (u.stats && u.stats.highWave) || 0;
  document.getElementById("prof-exp-big").textContent = (
    u.exp || 0
  ).toLocaleString();
  document.getElementById("prof-coins-big").textContent = (
    u.coins || 0
  ).toLocaleString();

  // equipped char
  const eqChar = ALL_CHARS[selChar];
  const eqRC = RC[eqChar.rarity] || "#aaa";
  document.getElementById("prof-eq-char-name").textContent = eqChar.name;
  document.getElementById("prof-eq-char-rar").textContent =
    "◆ " + eqChar.rarity;
  document.getElementById("prof-eq-char-rar").style.color = eqRC;
  setTimeout(() => {
    const c = document.getElementById("prof-eq-char");
    if (c) drawChar(c, eqChar, 20, 22, 16, true);
  }, 100);

  // equipped weapon
  const eqWpn = ALL_WEAPONS[selWeapon];
  const eqWRC = RC[eqWpn.rarity] || "#aaa";
  document.getElementById("prof-eq-wpn-name").textContent = eqWpn.name;
  document.getElementById("prof-eq-wpn-rar").textContent = "◆ " + eqWpn.rarity;
  document.getElementById("prof-eq-wpn-rar").style.color = eqWRC;
  setTimeout(() => {
    const c = document.getElementById("prof-eq-wpn");
    if (c) drawWeapon(c, eqWpn);
  }, 100);

  // owned chars grid
  const ownedCIds = (u.skins || [])
    .filter((s) => s.startsWith("c"))
    .map((s) => parseInt(s.slice(1)));
  const ocGrid = document.getElementById("prof-owned-chars");
  ocGrid.innerHTML = "";
  document.getElementById("prof-char-count").textContent = ownedCIds.length;
  ownedCIds.forEach((ci, idx) => {
    const sk = ALL_CHARS[ci];
    if (!sk) return;
    const rc = RC[sk.rarity] || "#aaa";
    const item = document.createElement("div");
    item.className = "prof-owned-item";
    item.style.borderColor = ci === selChar ? rc : "rgba(155,48,255,.2)";
    if (ci === selChar) item.style.boxShadow = `0 0 10px ${rc}55`;
    item.title = sk.name + " (" + sk.rarity + ")";
    const cvsId = "poc-" + idx;
    item.innerHTML = `<canvas id="${cvsId}" width="46" height="46"></canvas>`;
    item.onclick = () => {
      selChar = ci;
      buildGamePage();
      buildProfilePage();
    };
    ocGrid.appendChild(item);
    setTimeout(
      () => {
        const c = document.getElementById(cvsId);
        if (c) drawChar(c, sk, 23, 25, 18, true);
      },
      idx * 20 + 50,
    );
  });
  if (ownedCIds.length === 0)
    ocGrid.innerHTML =
      "<div style=\"font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(155,48,255,.3);letter-spacing:2px;\">NONE OWNED — VISIT SHOP</div>";

  // owned weapons grid
  const ownedWIds = (u.skins || [])
    .filter((s) => s.startsWith("w"))
    .map((s) => parseInt(s.slice(1)));
  const owGrid = document.getElementById("prof-owned-weaps");
  owGrid.innerHTML = "";
  document.getElementById("prof-weap-count").textContent = ownedWIds.length;
  ownedWIds.forEach((wi, idx) => {
    const sk = ALL_WEAPONS[wi];
    if (!sk) return;
    const rc = RC[sk.rarity] || "#aaa";
    const item = document.createElement("div");
    item.className = "prof-owned-item";
    item.style.width = "70px";
    item.style.height = "44px";
    item.style.borderRadius = "6px";
    item.style.borderColor = wi === selWeapon ? rc : "rgba(155,48,255,.2)";
    if (wi === selWeapon) item.style.boxShadow = `0 0 10px ${rc}55`;
    item.title = sk.name + " (" + sk.rarity + ")";
    const cvsId = "pow-" + idx;
    item.innerHTML = `<canvas id="${cvsId}" width="66" height="40"></canvas>`;
    item.onclick = () => {
      selWeapon = wi;
      buildGamePage();
      buildProfilePage();
    };
    owGrid.appendChild(item);
    setTimeout(
      () => {
        const c = document.getElementById(cvsId);
        if (c) drawWeapon(c, sk);
      },
      idx * 20 + 50,
    );
  });
  if (ownedWIds.length === 0)
    owGrid.innerHTML =
      "<div style=\"font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(155,48,255,.3);letter-spacing:2px;\">NONE OWNED — VISIT SHOP</div>";
}

// ═══ ACHIEVEMENTS SYSTEM ═══
const ACHIEVEMENTS_DEF = [
  {
    id: "first_blood",
    name: "FIRST BLOOD",
    icon: "🩸",
    desc: "Get your first kill",
    type: "kills",
    target: 1,
    reward: { exp: 50, coins: 0, title: null },
  },
  {
    id: "killer",
    name: "KILLER",
    icon: "💀",
    desc: "Kill 100 enemies",
    type: "kills",
    target: 100,
    reward: { exp: 200, coins: 500, title: "[HUNTER]" },
  },
  {
    id: "destroyer",
    name: "DESTROYER",
    icon: "🔥",
    desc: "Kill 500 enemies",
    type: "kills",
    target: 500,
    reward: { exp: 500, coins: 2000, title: "[DESTROYER]" },
  },
  {
    id: "wave10",
    name: "WAVE 10 SURVIVOR",
    icon: "🌊",
    desc: "Reach Wave 10",
    type: "highWave",
    target: 10,
    reward: { exp: 100, coins: 200, title: null },
  },
  {
    id: "wave50",
    name: "WAVE 50 SURVIVOR",
    icon: "⚡",
    desc: "Reach Wave 50",
    type: "highWave",
    target: 50,
    reward: { exp: 500, coins: 1000, title: "[GHOST]" },
  },
  {
    id: "boss_killer",
    name: "BOSS KILLER",
    icon: "👑",
    desc: "Defeat your first boss",
    type: "bosses",
    target: 1,
    reward: { exp: 300, coins: 500, title: "[BOSS SLAYER]" },
  },
  {
    id: "rich",
    name: "RICH PLAYER",
    icon: "💰",
    desc: "Accumulate 10,000 coins",
    type: "coinsTotal",
    target: 10000,
    reward: { exp: 200, coins: 0, title: null },
  },
  {
    id: "legend",
    name: "LEGEND PLAYER",
    icon: "🏆",
    desc: "Reach Legend rank",
    type: "rank",
    target: 6,
    reward: { exp: 1000, coins: 5000, title: "[LEGEND]" },
  },
];

function getAchievements() {
  if (!currentUser) return {};
  return currentUser.achievements || {};
}
function saveAchievements(a) {
  if (!currentUser) return;
  currentUser.achievements = a;
  sbSavePlayer(currentUser.username, { achievements: a });
}
function getAchProgress(def) {
  if (!currentUser) return 0;
  const s = currentUser.stats || {};
  if (def.type === "kills") return s.kills || 0;
  if (def.type === "highWave") return s.highWave || 0;
  if (def.type === "bosses") return s.bosses || 0;
  if (def.type === "coinsTotal") return s.coinsEarned || currentUser.coins || 0;
  if (def.type === "rank")
    return getRankInfo(currentUser.exp || 0).rank
      ? RANKS.findIndex(
          (r) => r.name === getRankInfo(currentUser.exp || 0).rank.name,
        )
      : 0;
  return 0;
}
function checkAchievements() {
  if (!currentUser) return;
  const unlocked = getAchievements();
  ACHIEVEMENTS_DEF.forEach((def) => {
    if (unlocked[def.id]) return;
    const progress = getAchProgress(def);
    if (progress >= def.target) {
      unlocked[def.id] = { unlockedAt: Date.now() };
      saveAchievements(unlocked);
      // give rewards
      if (def.reward.exp) {
        currentUser.exp = (currentUser.exp || 0) + def.reward.exp;
      }
      if (def.reward.coins) {
        currentUser.coins = (currentUser.coins || 0) + def.reward.coins;
        gameCoins += def.reward.coins;
      }
      if (def.reward.title && !currentUser.availableTitles)
        currentUser.availableTitles = [];
      if (def.reward.title) currentUser.availableTitles.push(def.reward.title);
      const users = getUsers();
      users[currentUser.username] = currentUser;
      saveUsers(users);
      if (document.getElementById("hud-coins"))
        safeSet("hud-coins", "textContent", currentUser.coins);
      showAchPopup(def);
    }
  });
}
function showAchPopup(def) {
  const pop = document.getElementById("ach-popup");
  if (!pop) return;
  safeSet("ach-popup-icon", "textContent", def.icon);
  safeSet("ach-popup-name", "textContent", def.name);
  const r = def.reward;
  let rTxt = "";
  if (r.exp) rTxt += "+" + r.exp + " EXP  ";
  if (r.coins) rTxt += "+" + r.coins + " 💰  ";
  if (r.title) rTxt += r.title;
  safeSet("ach-popup-reward", "textContent", rTxt || "UNLOCKED!");
  pop.classList.add("show");
  setTimeout(() => pop.classList.remove("show"), 4000);
}
function buildAchievementsPage() {
  const grid = document.getElementById("ach-grid");
  if (!grid || !currentUser) return;
  const unlocked = getAchievements();
  grid.innerHTML = "";
  ACHIEVEMENTS_DEF.forEach((def) => {
    const isUnlocked = !!unlocked[def.id];
    const progress = Math.min(getAchProgress(def), def.target);
    const pct = Math.round((progress / def.target) * 100);
    const card = document.createElement("div");
    card.className = "ach-card " + (isUnlocked ? "unlocked" : "locked");
    const r = def.reward;
    let rTxt = "";
    if (r.exp) rTxt += "+" + r.exp + " EXP  ";
    if (r.coins) rTxt += "+" + r.coins + " 💰  ";
    if (r.title) rTxt += r.title;
    card.innerHTML = `
      ${isUnlocked ? '<div class="ach-badge-unlocked">✅</div>' : ""}
      <div class="ach-icon">${def.icon}</div>
      <div class="ach-info">
        <div class="ach-name">${def.name}</div>
        <div class="ach-desc">${def.desc}</div>
        <div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${pct}%"></div></div>
        <div class="ach-progress-txt">${progress} / ${def.target} &nbsp;(${pct}%)</div>
        <div class="ach-reward">${isUnlocked ? "✓ CLAIMED: " : "REWARD: "}${rTxt}</div>
      </div>`;
    grid.appendChild(card);
  });
}

// ═══ SETTINGS SYSTEM ═══
let gameSettings = {
  particles: true,
  shake: true,
  compactHud: false,
  showFps: false,
  masterVol: 80,
  musicVol: 60,
  sfxVol: 80,
  keys: { up: "W", down: "S", left: "A", right: "D" },
  theme: "dark",
};
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem("lsmw_settings") || "null");
    if (s) gameSettings = Object.assign(gameSettings, s);
  } catch {}
}
function saveSettings() {
  localStorage.setItem("lsmw_settings", JSON.stringify(gameSettings));
}
function initSettings() {
  loadSettings();
  const tg = document.getElementById("theme-toggle");
  if (tg) tg.checked = gameSettings.theme === "light";
  // cyber toggles — states set via inline onchange, just sync initial checked
  const tp = document.getElementById("tog-particles");
  if (tp) tp.checked = gameSettings.particles !== false;
  const ts = document.getElementById("tog-shake");
  if (ts) ts.checked = gameSettings.shake !== false;
  const th = document.getElementById("tog-hud");
  if (th) th.checked = !!gameSettings.compactHud;
  const tf = document.getElementById("tog-fps");
  if (tf) tf.checked = !!gameSettings.showFps;
  ["master", "music", "sfx"].forEach((k) => {
    const el = document.getElementById("vol-" + k);
    if (el) el.value = gameSettings[k + "Vol"] || 80;
    safeSet(
      "vol-" + k + "-v",
      "textContent",
      (gameSettings[k + "Vol"] || 80) + "%",
    );
  });
  const keys = ["up", "down", "left", "right"];
  keys.forEach((k) => {
    const el = document.getElementById("key-" + k);
    if (el) el.value = gameSettings.keys[k];
  });
  if (tg)
    tg.onchange = (e) => {
      gameSettings.theme = e.target.checked ? "light" : "dark";
      applyTheme();
      setBg();
      saveSettings();
    };
  applyTheme();
}
function applyTheme() {
  const isLight = gameSettings.theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  // Hide starfield in light mode, show in dark
  const cv = document.getElementById("c");
  if (cv) cv.style.opacity = isLight ? "0" : "1";
  const nebEls = document.querySelectorAll(".neb,.sl,.beam,.vig");
  nebEls.forEach((el) => (el.style.opacity = isLight ? "0" : "1"));
  // Update game bg if running
  setBg && setBg();
}
function updateVol(k, v) {
  gameSettings[k + "Vol"] = parseInt(v);
  safeSet("vol-" + k + "-v", "textContent", v + "%");
  saveSettings();
}
function resetAudio() {
  gameSettings.masterVol = 80;
  gameSettings.musicVol = 60;
  gameSettings.sfxVol = 80;
  ["master", "music", "sfx"].forEach((k) => {
    const el = document.getElementById("vol-" + k);
    if (el) el.value = gameSettings[k + "Vol"];
    safeSet("vol-" + k + "-v", "textContent", gameSettings[k + "Vol"] + "%");
  });
  saveSettings();
}
let listeningInput = null;
function startRebind(inp) {
  if (listeningInput) {
    listeningInput.classList.remove("listening");
    listeningInput.value =
      gameSettings.keys[listeningInput.id.replace("key-", "")];
  }
  listeningInput = inp;
  inp.classList.add("listening");
  inp.value = "...";
  function onKey(e) {
    e.preventDefault();
    const k = inp.id.replace("key-", "");
    gameSettings.keys[k] = e.key.toUpperCase();
    inp.value = e.key.toUpperCase();
    inp.classList.remove("listening");
    listeningInput = null;
    saveSettings();
    document.removeEventListener("keydown", onKey);
  }
  setTimeout(
    () => document.addEventListener("keydown", onKey, { once: false }),
    50,
  );
}
function resetKeybinds() {
  const def = { up: "W", down: "S", left: "A", right: "D" };
  gameSettings.keys = Object.assign({}, def);
  Object.keys(def).forEach((k) => {
    safeSet("key-" + k, "value", def[k]);
  });
  saveSettings();
}

// ═══ REDEEM CODES ═══
// Redeem codes stored as SHA-256 hashes for security
const VALID_CODE_HASHES = {
  "0b445d06e80a0f8b1d8e1b97d47ac79e73dd92da0e3e3e778b3ec05afc7c29fc": 100000,
  a1b8c48a04d525f304dc7145478730ff054e7920cf26e7383ceff60f321d7fb7: 1000,
  "835d6dc88b708bc646d6db82c853ef4182fabbd4a8de59c213f2b5ab3ae7d9be": 500,
  "829e93d172d3bfcd986dfc5caa52dcb4006595395293555e3df6e64b5ba21982": 500,
  "5851218d39e52d9b46462a8dcc65642f7633c798c1eff9c80bb0a5edfadf5c0f": 100000,
};
function getUsedCodes() {
  if (!currentUser) return [];
  return currentUser.used_codes || [];
}
async function doRedeem() {
  const inp = document.getElementById("redeem-input");
  const msg = document.getElementById("redeem-msg");
  if (!inp || !msg || !currentUser) return;
  const code = inp.value.trim().toUpperCase();
  if (!code) {
    setRedeemMsg(msg, "err", "[ ENTER A CODE ]");
    return;
  }
  // Hash the entered code before comparing
  const _enc = new TextEncoder();
  const _hbuf = await crypto.subtle.digest("SHA-256", _enc.encode(code));
  const codeHash = Array.from(new Uint8Array(_hbuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const used = getUsedCodes();
  if (used.includes(codeHash)) {
    setRedeemMsg(msg, "err", "[ CODE ALREADY USED ]");
    return;
  }
  const amount = VALID_CODE_HASHES[codeHash];
  if (!amount) {
    setRedeemMsg(msg, "err", "[ INVALID CODE ]");
    return;
  }
  used.push(codeHash);
  currentUser.used_codes = used;
  sbSavePlayer(currentUser.username, { used_codes: used });
  currentUser.coins = (currentUser.coins || 0) + amount;
  const users = getUsers();
  users[currentUser.username] = currentUser;
  saveUsers(users);
  safeSet("hud-coins", "textContent", currentUser.coins);
  setRedeemMsg(
    msg,
    "ok",
    "[ ✓ +" + amount.toLocaleString() + " COINS ADDED! ]",
  );
  inp.value = "";
}
function setRedeemMsg(el, type, txt) {
  el.className = "redeem-msg " + type;
  el.textContent = txt;
  setTimeout(() => {
    el.className = "redeem-msg";
    el.textContent = "";
  }, 4000);
}

// ═══ ADMIN PANEL ═══
let adminMode = false,
  godGun = false,
  godChar = false;
function toggleAdminInput() {
  const w = document.getElementById("admin-secret-wrap");
  if (w) w.style.display = w.style.display === "none" ? "block" : "none";
}
function tryAdminLogin() {
  const inp = document.getElementById("admin-secret-input");
  if (!inp) return;
  if (
    inp.value === "159753123456789987654321147852369963258741<<ONLY ADMIN>>"
  ) {
    document.getElementById("admin-panel").style.display = "block";
    document.getElementById("admin-secret-wrap").style.display = "none";
    inp.value = "";
  } else {
    inp.value = "";
    inp.placeholder = "WRONG CODE...";
  }
}
function closeAdminPanel() {
  document.getElementById("admin-panel").style.display = "none";
}
function toggleAdminMode(on) {
  adminMode = on;
  safeSet(
    "admin-status",
    "textContent",
    "ADMIN MODE: " + (on ? "ON 🔥" : "OFF"),
  );
}
function adminGiveCoins() {
  if (!currentUser) return;
  currentUser.coins = 999999;
  const users = getUsers();
  users[currentUser.username] = currentUser;
  saveUsers(users);
  safeSet("hud-coins", "textContent", currentUser.coins);
  if (buildProfilePage) buildProfilePage();
}
function toggleGodGun(on) {
  godGun = on;
}
function toggleGodChar(on) {
  godChar = on;
  if (!currentUser) return;
  if (on) {
    currentUser._godChar = { hp: 600, spd: 10.0, regen: 10.0 };
  } else {
    delete currentUser._godChar;
  }
}
function adminUnlockAll() {
  if (!currentUser) return;
  if (!currentUser.skins) currentUser.skins = [];
  ALL_CHARS.forEach((_, i) => {
    const k = "c" + i;
    if (!currentUser.skins.includes(k)) currentUser.skins.push(k);
  });
  ALL_WEAPONS.forEach((_, i) => {
    const k = "w" + i;
    if (!currentUser.skins.includes(k)) currentUser.skins.push(k);
  });
  const users = getUsers();
  users[currentUser.username] = currentUser;
  saveUsers(users);
  buildGamePage();
  buildShopPage();
}
function adminMaxRank() {
  if (!currentUser) return;
  currentUser.exp = 50000;
  const users = getUsers();
  users[currentUser.username] = currentUser;
  saveUsers(users);
  safeSet("topbar-rank", "textContent", "👑 LEGEND RANK");
  buildProfilePage && buildProfilePage();
}

// ═══ INVENTORY SYSTEM ═══
function buildInventoryPage() {
  const cont = document.getElementById("inventory-content");
  if (!cont || !currentUser) return;
  const ownedCIds = (currentUser.skins || [])
    .filter((s) => s.startsWith("c"))
    .map((s) => parseInt(s.slice(1)));
  const ownedWIds = (currentUser.skins || [])
    .filter((s) => s.startsWith("w"))
    .map((s) => parseInt(s.slice(1)));
  let html2 = `<div style="margin-bottom:20px;">
    <div style="font-family:'Orbitron',sans-serif;font-size:13px;font-weight:700;color:var(--purple);letter-spacing:2px;margin-bottom:14px;text-transform:uppercase;">⚔ CHARACTERS (${ownedCIds.length})</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">`;
  ownedCIds.forEach((ci) => {
    const sk = ALL_CHARS[ci];
    if (!sk) return;
    const rc = RC[sk.rarity] || "#aaa";
    const eq =
      ci === selChar
        ? "border-color:" + rc + ";box-shadow:0 0 15px " + rc + "44;"
        : "";
    html2 += `<div class="sett-card" style="padding:12px;${eq}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <canvas id="inv-c-${ci}" width="48" height="52" style="border-radius:4px;"></canvas>
        <div>
          <div style="font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;color:#fff;letter-spacing:1px;">${sk.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:8px;color:${rc};letter-spacing:1px;">◆ ${sk.rarity}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,.6);letter-spacing:1px;">
        <div style="display:flex;justify-content:space-between;"><span>❤️ HP</span><span style="color:#ff8888;">${Math.round(sk.stats.hp)}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>⚡ SPEED</span><span style="color:#00eeff;">${sk.stats.spd.toFixed(1)}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>💚 REGEN</span><span style="color:#00ff88;">${sk.stats.regen.toFixed(1)}/s</span></div>
        <div style="display:flex;justify-content:space-between;"><span>🛡️ ARMOR</span><span style="color:#cc88ff;">${Math.round(sk.stats.hp * 0.15)}</span></div>
      </div>
      ${ci !== selChar ? `<button class="sett-btn" style="width:100%;margin-top:8px;" onclick="selChar=${ci};buildGamePage();buildInventoryPage();buildProfilePage();">EQUIP</button>` : '<div style="text-align:center;font-family:Share Tech Mono,monospace;font-size:9px;color:#00eeff;margin-top:6px;">▸ EQUIPPED</div>'}
    </div>`;
  });
  html2 += `</div></div>
  <div>
    <div style="font-family:'Orbitron',sans-serif;font-size:13px;font-weight:700;color:var(--purple);letter-spacing:2px;margin-bottom:14px;text-transform:uppercase;">🔫 WEAPONS (${ownedWIds.length})</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">`;
  ownedWIds.forEach((wi) => {
    const sk = ALL_WEAPONS[wi];
    if (!sk) return;
    const rc = RC[sk.rarity] || "#aaa";
    const eq =
      wi === selWeapon
        ? "border-color:" + rc + ";box-shadow:0 0 15px " + rc + "44;"
        : "";
    html2 += `<div class="sett-card" style="padding:12px;${eq}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <canvas id="inv-w-${wi}" width="80" height="44" style="border-radius:4px;"></canvas>
        <div>
          <div style="font-family:'Orbitron',sans-serif;font-size:9px;font-weight:700;color:#fff;letter-spacing:1px;">${sk.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:8px;color:${rc};letter-spacing:1px;">◆ ${sk.rarity} · ${sk.wtype.toUpperCase()}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(255,255,255,.6);letter-spacing:1px;">
        <div style="display:flex;justify-content:space-between;"><span>🔥 DAMAGE</span><span style="color:#ff8888;">${sk.stats.dmg}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>💨 BULLET SPD</span><span style="color:#00eeff;">${sk.stats.spd}</span></div>
      </div>
      ${wi !== selWeapon ? `<button class="sett-btn" style="width:100%;margin-top:8px;" onclick="selWeapon=${wi};buildGamePage();buildInventoryPage();buildProfilePage();">EQUIP</button>` : '<div style="text-align:center;font-family:Share Tech Mono,monospace;font-size:9px;color:#00eeff;margin-top:6px;">▸ EQUIPPED</div>'}
    </div>`;
  });
  html2 += `</div></div>`;
  cont.innerHTML = html2;
  // Draw canvases
  ownedCIds.forEach((ci) => {
    const sk = ALL_CHARS[ci];
    const c = document.getElementById("inv-c-" + ci);
    if (c && sk) setTimeout(() => drawChar(c, sk, 24, 28, 20, true), 10);
  });
  ownedWIds.forEach((wi) => {
    const sk = ALL_WEAPONS[wi];
    const c = document.getElementById("inv-w-" + wi);
    if (c && sk) setTimeout(() => drawWeapon(c, sk), 10);
  });
}

// ═══ TITLES SYSTEM ═══
const ALL_TITLES = [
  { id: "[ROOKIE]", name: "[ROOKIE]", unlockBy: "default" },
  { id: "[HUNTER]", name: "[HUNTER]", unlockBy: "ach:killer" },
  { id: "[DESTROYER]", name: "[DESTROYER]", unlockBy: "ach:destroyer" },
  { id: "[GHOST]", name: "[GHOST]", unlockBy: "ach:wave50" },
  { id: "[BOSS SLAYER]", name: "[BOSS SLAYER]", unlockBy: "ach:boss_killer" },
  { id: "[LEGEND]", name: "[LEGEND]", unlockBy: "ach:legend" },
];
function getUnlockedTitles() {
  if (!currentUser) return ["[ROOKIE]"];
  const unlocked = getAchievements();
  return ALL_TITLES.filter(
    (t) => t.unlockBy === "default" || unlocked[t.unlockBy.replace("ach:", "")],
  ).map((t) => t.id);
}
function setTitle(title) {
  if (!currentUser) return;
  const available = getUnlockedTitles();
  if (!available.includes(title)) {
    alert("TITLE LOCKED");
    return;
  }
  currentUser.title = title;
  const users = getUsers();
  users[currentUser.username] = currentUser;
  saveUsers(users);
  buildProfilePage && buildProfilePage();
}

// ═══ GAME FLOW: Loading → Mode Select ═══
function openGameFlow() {
  const scr = document.getElementById("game-loading-screen");
  scr.style.display = "flex";
  runGameLoadingBar(() => {
    // loading done → show mode select
    scr.style.display = "none";
    openModeSelect();
  });
}

function runGameLoadingBar(onDone) {
  const fill = document.getElementById("game-ls-fill");
  const txt = document.getElementById("game-ls-txt");
  const msgs = [
    "Loading assets...",
    "Building the map...",
    "Spawning robots...",
    "Calibrating weapons...",
    "READY TO FIGHT!",
  ];
  let pct = 0;
  let loadingRAF = null;
  const start = performance.now();
  const DURATION = 10000; // 10 seconds
  function tick(now) {
    const elapsed = now - start;
    pct = Math.min((elapsed / DURATION) * 100, 100);
    if (fill) fill.style.width = pct + "%";
    if (txt)
      txt.textContent = msgs[Math.min(Math.floor(pct / 22), msgs.length - 1)];
    if (pct < 100) {
      loadingRAF = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(loadingRAF);
      setTimeout(onDone, 300);
    }
  }
  loadingRAF = requestAnimationFrame(tick);
}

function openModeSelect() {
  const scr = document.getElementById("mode-select-screen");
  scr.style.display = "flex";
}

function closeModeSelect() {
  const scr = document.getElementById("mode-select-screen");
  scr.style.opacity = "0";
  scr.style.transition = "opacity .3s ease";
  setTimeout(() => {
    scr.style.display = "none";
    scr.style.opacity = "";
    scr.style.transition = "";
  }, 300);
}

function selectMode(mode) {
  closeModeSelect();
  if (currentUser) {
    currentUser._gameMode = mode;
    const users = getUsers();
    users[currentUser.username] = currentUser;
    saveUsers(users);
  }
  // Launch the real game
  setTimeout(() => launchGame(mode), 350);
}

// ═══ SECRET PANEL (التعديل 1) ═══
async function trySecretPanel() {
  const inp = document.getElementById("secret-panel-input");
  const msg = document.getElementById("secret-msg");
  if (!inp || !msg) return;
  const val = inp.value.trim();
  // Hash the input and compare to stored hash (SHA-256 of original code)
  const encoder = new TextEncoder();
  const data = encoder.encode(val);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const ADMIN_HASH =
    "870a9496415cb2977863a9d48bbee274dd0e2cb5f306c60a573139f2471fa6b0"; // SHA-256 of admin code
  inp.value = "";
  if (hashHex === ADMIN_HASH) {
    showAdminPage();
  } else {
    msg.className = "redeem-msg err";
    msg.textContent = "[ ACCESS DENIED ]";
    setTimeout(() => {
      msg.className = "redeem-msg";
      msg.textContent = "";
    }, 3000);
  }
}
function showAdminPage() {
  document.getElementById("admin-panel").style.display = "block";
}

// ═══ TITLES PAGE (التعديل 2) ═══
function buildTitlesPage() {
  const grid = document.getElementById("titles-grid");
  if (!grid || !currentUser) return;
  const unlocked = getAchievements();
  const equippedTitle = currentUser.title || "[ROOKIE]";
  grid.innerHTML = "";
  ALL_TITLES.forEach((t) => {
    const isUnlocked =
      t.unlockBy === "default" || !!unlocked[t.unlockBy.replace("ach:", "")];
    const isEquipped = equippedTitle === t.id;
    const card = document.createElement("div");
    card.className = "ach-card" + (isUnlocked ? " unlocked" : " locked");
    if (isEquipped)
      card.style.cssText =
        "border-color:#00eeff;box-shadow:0 0 20px rgba(0,238,255,.2);";
    const icons = {
      "[ROOKIE]": "🎖",
      "[HUNTER]": "💀",
      "[DESTROYER]": "🔥",
      "[GHOST]": "👻",
      "[BOSS SLAYER]": "👑",
      "[LEGEND]": "⚡",
    };
    const unlockDescs = {
      "[ROOKIE]": "Default title — always available",
      "[HUNTER]": "Kill 100 enemies",
      "[DESTROYER]": "Kill 500 enemies",
      "[GHOST]": "Reach Wave 50",
      "[BOSS SLAYER]": "Defeat your first boss",
      "[LEGEND]": "Reach Legend rank",
    };
    card.innerHTML = `
      ${isEquipped ? '<div class="ach-badge-unlocked" style="font-size:12px;">✦ EQUIPPED</div>' : ""}
      <div class="ach-icon">${icons[t.id] || "🏅"}</div>
      <div class="ach-info">
        <div class="ach-name">${t.id}</div>
        <div class="ach-desc">${unlockDescs[t.id] || "Unlock to use"}</div>
        <div class="ach-reward">${isUnlocked ? "✓ UNLOCKED" : "🔒 LOCKED"}</div>
        ${isUnlocked && !isEquipped ? `<button class="sett-btn" style="margin-top:8px;" onclick="setTitle('${t.id}');buildTitlesPage();">EQUIP</button>` : ""}
        ${isEquipped ? `<div style="font-family:'Share Tech Mono',monospace;font-size:9px;color:#00eeff;margin-top:6px;letter-spacing:1px;">▸ CURRENTLY EQUIPPED</div>` : ""}
      </div>`;
    grid.appendChild(card);
  });
}

// ═══ LEADERBOARD PAGE ═══
async function buildLeaderboardPage() {
  const cont = document.getElementById("leaderboard-table");
  if (!cont) return;
  cont.innerHTML =
    '<div style="text-align:center;padding:40px;font-family:Share Tech Mono,monospace;font-size:11px;color:rgba(155,48,255,.4);letter-spacing:2px;">LOADING...</div>';
  const allPlayers = await sbGetAllPlayers().catch(() => []);
  // Merge currentUser fresh data if present
  if (currentUser) {
    const idx = allPlayers.findIndex(
      (p) => p.username === currentUser.username,
    );
    const merged = {
      username: currentUser.username,
      nickname: currentUser.nickname,
      exp: currentUser.exp,
      stats: currentUser.stats,
    };
    if (idx >= 0) allPlayers[idx] = merged;
    else allPlayers.push(merged);
  }
  const rows = allPlayers
    .filter(function (u) {
      return u && u.username;
    })
    .map(function (u) {
      return {
        username: u.username,
        nick: u.nickname || u.username,
        wave: (u.stats && u.stats.highWave) || 0,
        kills: (u.stats && u.stats.kills) || 0,
        exp: u.exp || 0,
        rank: getRankInfo(u.exp || 0).rank,
      };
    })
    .sort(function (a, b) {
      return b.wave - a.wave || b.kills - a.kills;
    });
  if (rows.length === 0) {
    cont.innerHTML =
      '<div style="text-align:center;padding:40px;font-family:Share Tech Mono,monospace;font-size:11px;color:rgba(155,48,255,.4);letter-spacing:2px;">NO SCORES YET — PLAY A GAME FIRST</div>';
    return;
  }
  var medal = ["🥇", "🥈", "🥉"];
  var html2 =
    '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:Share Tech Mono,monospace;font-size:11px;">' +
    '<thead><tr style="border-bottom:1px solid rgba(155,48,255,.3);color:rgba(155,48,255,.6);letter-spacing:2px;">' +
    '<th style="padding:10px 8px;text-align:center;">#</th>' +
    '<th style="padding:10px 8px;text-align:left;">PLAYER</th>' +
    '<th style="padding:10px 8px;text-align:center;">RANK</th>' +
    '<th style="padding:10px 8px;text-align:center;">BEST WAVE</th>' +
    '<th style="padding:10px 8px;text-align:center;">KILLS</th>' +
    '<th style="padding:10px 8px;text-align:center;">EXP</th>' +
    "</tr></thead><tbody>";
  rows.forEach(function (r, i) {
    var isMe = currentUser && r.username === currentUser.username;
    var bg = isMe
      ? "rgba(155,48,255,.12)"
      : i % 2 === 0
        ? "rgba(255,255,255,.02)"
        : "transparent";
    var pos = i < 3 ? medal[i] : i + 1 + ".";
    var nameColor = isMe ? "#fff" : "rgba(255,255,255,.7)";
    var nameWeight = isMe ? "700" : "400";
    var nameLabel = r.nick.toUpperCase() + (isMe ? " · YOU" : "");
    html2 +=
      '<tr style="border-bottom:1px solid rgba(155,48,255,.07);background:' +
      bg +
      ';">' +
      '<td style="padding:10px 8px;text-align:center;font-size:14px;">' +
      pos +
      "</td>" +
      '<td style="padding:10px 8px;color:' +
      nameColor +
      ";font-weight:" +
      nameWeight +
      ';">' +
      nameLabel +
      "</td>" +
      '<td style="padding:10px 8px;text-align:center;">' +
      r.rank.icon +
      " " +
      r.rank.name +
      "</td>" +
      '<td style="padding:10px 8px;text-align:center;color:#9b30ff;font-weight:700;">' +
      r.wave +
      "</td>" +
      '<td style="padding:10px 8px;text-align:center;color:rgba(255,68,68,.8);">' +
      r.kills.toLocaleString() +
      "</td>" +
      '<td style="padding:10px 8px;text-align:center;color:#00eeff;">' +
      r.exp.toLocaleString() +
      "</td>" +
      "</tr>";
  });
  html2 += "</tbody></table></div>";
  cont.innerHTML = html2;
}

// ═══ LOGOUT (التعديل 2) ═══
function doLogout() {
  localStorage.removeItem("lsmw_current");
  currentUser = null;
  showScreen("login");
  // reset form
  const lu = document.getElementById("lu");
  if (lu) lu.value = "";
  const lp2 = document.getElementById("lp2");
  if (lp2) lp2.value = "";
  closeSidebar();
}

// ═══ SIDEBAR / NAV ═══
function toggleSidebar() {
  const sb = document.getElementById("sidebar"),
    ov = document.getElementById("sideOverlay"),
    bb = document.getElementById("burgerBtn");
  const open = sb.classList.toggle("open");
  ov.classList.toggle("on", open);
  bb.classList.toggle("open", open);
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sideOverlay").classList.remove("on");
  document.getElementById("burgerBtn").classList.remove("open");
}
function navTo(p) {
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  const navEl = document.getElementById("nav-" + p);
  if (navEl) navEl.classList.add("active");
  document
    .querySelectorAll(".page")
    .forEach((pg) => pg.classList.remove("active"));
  const pageEl = document.getElementById("page-" + p);
  if (pageEl) pageEl.classList.add("active");
  // Build leaderboard dynamically on each visit
  if (p === "leaderboard") buildLeaderboardPage();
  // UI click sound
  playUIClick();
  if (p === "profile") buildProfilePage();
  if (p === "achievements") buildAchievementsPage();
  if (p === "settings") initSettings();
  if (p === "titles") buildTitlesPage();
  if (p === "inventory") buildInventoryPage();
  closeSidebar();
}

// ══════ AUTO-LOGIN ══════
window.addEventListener("load", async function () {
  const cur = localStorage.getItem("lsmw_current");
  if (!cur) return;
  try {
    const row = await sbGetPlayer(cur);
    if (!row || !row.username) return;
    const loEl = document.getElementById("lo");
    if (loEl) {
      loEl.style.transition = "opacity .4s";
      loEl.style.opacity = "0";
      setTimeout(() => loEl.remove(), 400);
    }
    setTimeout(() => startShowcase(dbRowToUser(row)), 420);
  } catch (e) {
    console.warn("auto-login failed:", e);
  }
});

// ══════════════════════════════════════════
// ════         LAST STAND GAME ENGINE    ════
// ══════════════════════════════════════════
let GC = null,
  GCX = null,
  gameRunning = false,
  gameMode = "vs-robots",
  gameRAF = null;
const CYAN = "#00eeff";
let PL = {
  x: 0,
  y: 0,
  hp: 100,
  maxHp: 100,
  shield: 0,
  maxShield: 0,
  speed: 3.5,
  fireRate: 300,
  lastShot: 0,
  ammo: 120,
  maxAmmo: 120,
  kills: 0,
  facing: 0,
  dmgMult: 1,
  regenTimer: 0,
  shieldRegenTimer: 0,
  stamina: 100,
  maxStamina: 100,
  staminaDrain: false,
  _kbVx: 0,
  _kbVy: 0,
};
let PL2 = {
  x: 80,
  y: 80,
  hp: 100,
  maxHp: 100,
  speed: 3.5,
  ammo: 120,
  maxAmmo: 120,
  fireRate: 300,
  lastShot: 0,
  facing: 0,
  active: false,
};
let CAM = { x: 0, y: 0 };
let wave = 1,
  waveKills = 0,
  waveEnemyCount = 8,
  waveClearing = false,
  gameCoins = 0,
  gameCoinsAtStart = 0,
  gameTotalKills = 0;
let enemies = [],
  bullets = [],
  pickups = [],
  dmgNums = [],
  particles2 = [];
const KEY_MAP = {},
  KEY_MAP2 = {};
let lastTime = 0,
  fps = 0,
  frameCount = 0,
  fpsTimer = 0,
  minimapFrame = 0;
let cdAmmo = 0,
  cdHeal = 0,
  cdShield = 0,
  autoSpawnAmmoT = 0,
  autoSpawnHealT = 0;
let shakeX = 0,
  shakeY = 0,
  shakeIntensity = 0;
let audioCtx = null;
// ── NEW SYSTEMS ──
let obstacles = []; // map obstacles/walls
let comboCount = 0,
  comboTimer = 0,
  comboMaxTimer = 4000,
  gameBestCombo = 0; // combo system
let isReloading = false,
  reloadTimer = 0,
  reloadDuration = 1800; // reload
let currentBoss = null; // boss reference
let playerUpgrades = { dmg: 0, hp: 0, spd: 0, fireRate: 0, regen: 0, ammo: 0 }; // upgrade levels

// ── CHARGED SHOT (Right-click, all weapons, 1 per wave) ──
let chargedShotUsed = false;
let chargePhase = 0; // 0=idle 1=holding(3s) 2=charging(5s)
let chargeTimer = 0;
let _chargeHoldTimeout = null;
let chargedShotParticles = [];
const HOLD_TO_CHARGE = 3000;
const CHARGE_DURATION = 5000;

function playCoinSound(color) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const g = ctx.createGain();
  g.connect(ctx.destination);
  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  o.connect(g);
  o.type = "sine";
  if (color === "#ffd700") {
    o.frequency.setValueAtTime(880, now);
    o.frequency.linearRampToValueAtTime(1100, now + 0.1);
  } else if (color === "#00ff88") {
    o.frequency.setValueAtTime(700, now);
    o.frequency.linearRampToValueAtTime(1400, now + 0.18);
  } else {
    o.frequency.setValueAtTime(500, now);
    o.frequency.linearRampToValueAtTime(700, now + 0.08);
  }
  g.gain.setValueAtTime(0.12, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  o.start(now);
  o.stop(now + 0.2);
}
function getAudioCtx() {
  if (!audioCtx)
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  return audioCtx;
}
function playSound(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const g = ctx.createGain();
  g.connect(ctx.destination);
  const now = ctx.currentTime;
  if (type === "shoot") {
    const o = ctx.createOscillator();
    o.connect(g);
    o.type = "square";
    o.frequency.setValueAtTime(200, now);
    o.frequency.exponentialRampToValueAtTime(60, now + 0.08);
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    o.start(now);
    o.stop(now + 0.08);
  } else if (type === "hit") {
    const o = ctx.createOscillator();
    o.connect(g);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(300, now);
    o.frequency.exponentialRampToValueAtTime(80, now + 0.05);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    o.start(now);
    o.stop(now + 0.05);
  } else if (type === "crit") {
    [0, 0.03].forEach((d, i) => {
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = "square";
      o.frequency.setValueAtTime(400 + i * 100, now + d);
      o.frequency.exponentialRampToValueAtTime(100, now + d + 0.12);
      g.gain.setValueAtTime(0.18, now + d);
      g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.12);
      o.start(now + d);
      o.stop(now + d + 0.12);
    });
  } else if (type === "kill") {
    [0, 0.06, 0.12].forEach((d, i) => {
      const o = ctx.createOscillator();
      o.connect(g);
      o.frequency.setValueAtTime(300 + i * 150, now + d);
      g.gain.setValueAtTime(0.1, now + d);
      g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.08);
      o.start(now + d);
      o.stop(now + d + 0.1);
    });
  } else if (type === "pickup") {
    const o = ctx.createOscillator();
    o.connect(g);
    o.type = "sine";
    o.frequency.setValueAtTime(600, now);
    o.frequency.linearRampToValueAtTime(900, now + 0.15);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    o.start(now);
    o.stop(now + 0.15);
  } else if (type === "explode") {
    try {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(g);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      src.start(now);
    } catch (e) {}
  }
}

// UI sound feedback (nav clicks, buy, equip)
function playUIClick(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const g = ctx.createGain();
  g.connect(ctx.destination);
  const now = ctx.currentTime;
  if (type === "buy") {
    [0, 0.08].forEach(function (d, i) {
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = "sine";
      o.frequency.setValueAtTime(520 + i * 180, now + d);
      g.gain.setValueAtTime(0.09, now + d);
      g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.12);
      o.start(now + d);
      o.stop(now + d + 0.12);
    });
  } else if (type === "equip") {
    const o = ctx.createOscillator();
    o.connect(g);
    o.type = "triangle";
    o.frequency.setValueAtTime(700, now);
    o.frequency.linearRampToValueAtTime(900, now + 0.07);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    o.start(now);
    o.stop(now + 0.1);
  } else if (type === "error") {
    const o = ctx.createOscillator();
    o.connect(g);
    o.type = "square";
    o.frequency.setValueAtTime(120, now);
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.start(now);
    o.stop(now + 0.12);
  } else {
    const o = ctx.createOscillator();
    o.connect(g);
    o.type = "sine";
    o.frequency.setValueAtTime(400, now);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    o.start(now);
    o.stop(now + 0.06);
  }
}

const ETYPES = {
  basic: {
    type: "basic",
    hp: 40,
    maxHp: 40,
    spd: 1.4,
    dmg: 10,
    r: 14,
    color: "#ff2222",
    eyeColor: "#ff8800",
    shape: "circle",
    wavMin: 0,
    xp: 10,
  },
  heavy: {
    type: "heavy",
    hp: 120,
    maxHp: 120,
    spd: 0.7,
    dmg: 25,
    r: 22,
    color: "#cc0000",
    eyeColor: "#ff6600",
    shape: "square",
    wavMin: 0,
    xp: 25,
  },
  shooter: {
    type: "shooter",
    hp: 60,
    maxHp: 60,
    spd: 0.9,
    dmg: 15,
    r: 16,
    color: "#2255ff",
    eyeColor: "#000",
    shape: "square",
    wavMin: 3,
    xp: 20,
    shootCd: 950,
    keepDist: 180,
  },
  exploder: {
    type: "exploder",
    hp: 50,
    maxHp: 50,
    spd: 1.6,
    dmg: 5,
    r: 15,
    color: "#ff8800",
    eyeColor: "#0088ff",
    shape: "star",
    wavMin: 3,
    xp: 15,
    explodeRadius: 120,
    exploMax: 30,
  },
  phantom: {
    type: "phantom",
    hp: 80,
    maxHp: 80,
    spd: 2.4,
    dmg: 18,
    r: 13,
    color: "#cc44ff",
    eyeColor: "#fff",
    shape: "circle",
    wavMin: 8,
    xp: 35,
    maxShield: 40,
  },
};

// Boss definitions — one spawns every 10 waves
const BOSS_DEFS = [
  {
    name: "IRON TITAN",
    color: "#ff4400",
    r: 36,
    hp: 800,
    spd: 1.0,
    dmg: 30,
    shootCd: 600,
    shape: "square",
    icon: "🤖",
  },
  {
    name: "VOID REAPER",
    color: "#cc00ff",
    r: 32,
    hp: 1200,
    spd: 1.4,
    dmg: 25,
    shootCd: 500,
    shape: "circle",
    icon: "👾",
  },
  {
    name: "BLOOD STORM",
    color: "#ff0055",
    r: 40,
    hp: 1800,
    spd: 1.6,
    dmg: 35,
    shootCd: 400,
    shape: "star",
    icon: "💀",
  },
  {
    name: "DOOM MACHINE",
    color: "#ff8800",
    r: 44,
    hp: 2600,
    spd: 1.2,
    dmg: 40,
    shootCd: 350,
    shape: "square",
    icon: "☠",
  },
];

// Upgrade pool
const UPGRADE_POOL = [
  {
    id: "dmg",
    icon: "🔥",
    name: "POWER UP",
    desc: "Bullet damage +20%",
    val: "+20% DMG",
    apply: () => {
      playerUpgrades.dmg++;
      PL.dmgMult = (PL.dmgMult || 1) * 1.2;
    },
  },
  {
    id: "hp",
    icon: "❤️",
    name: "MAX HEALTH",
    desc: "Maximum HP +30",
    val: "+30 MAX HP",
    apply: () => {
      playerUpgrades.hp++;
      PL.maxHp += 30;
      PL.hp = Math.min(PL.hp + 30, PL.maxHp);
    },
  },
  {
    id: "spd",
    icon: "⚡",
    name: "SPEED BOOST",
    desc: "Move speed +15%",
    val: "+15% SPD",
    apply: () => {
      playerUpgrades.spd++;
      PL.speed *= 1.15;
    },
  },
  {
    id: "fire",
    icon: "🎯",
    name: "RAPID FIRE",
    desc: "Fire rate +15%",
    val: "-15% DELAY",
    apply: () => {
      playerUpgrades.fireRate++;
      PL.fireRate = Math.max(80, PL.fireRate * 0.85);
    },
  },
  {
    id: "regen",
    icon: "💚",
    name: "REGENERATION",
    desc: "HP regen +0.5/s",
    val: "+0.5 REGEN",
    apply: () => {
      playerUpgrades.regen++;
    },
  },
  {
    id: "ammo",
    icon: "🔫",
    name: "AMMO PACK",
    desc: "Max ammo +40",
    val: "+40 AMMO",
    apply: () => {
      playerUpgrades.ammo++;
      PL.maxAmmo += 40;
      PL.ammo = Math.min(PL.ammo + 40, PL.maxAmmo);
    },
  },
  {
    id: "shield",
    icon: "🛡️",
    name: "SHIELD",
    desc: "Gain energy shield",
    val: "+50 SHIELD",
    apply: () => {
      PL.shield = Math.min(
        PL.shield + Math.round(PL.maxShield * 0.5),
        PL.maxShield,
      );
    },
  },
  {
    id: "crit",
    icon: "💥",
    name: "CRIT BOOST",
    desc: "Crit chance +10%",
    val: "+10% CRIT",
    apply: () => {
      PL._critBonus = (PL._critBonus || 0.1) + 0.1;
    },
  },
];

function getWaveTypes(w) {
  return Object.values(ETYPES).filter((e) => e.wavMin <= w);
}
function calcWaveCount(w) {
  if (w === 0) return 3;
  if (w <= 9) return 2 + w;
  if (w <= 20) return 8 + w;
  if (w <= 50) return 28 + (w - 20) * 2;
  return 88 + Math.floor((w - 50) / 2) * 5;
} // Wave 0:3, 1-9:+1/wave(3..11), 10-20:+1/wave, 20-50:+2/wave, 50+:+5/2waves

const WORLD_W = 4000,
  WORLD_H = 4000; // Medium open world map

// ======= VIRTUAL JOYSTICK (Mobile) =======
let VJ = {
  active: false,
  touch: null,
  baseX: 0,
  baseY: 0,
  knobX: 0,
  knobY: 0,
  dx: 0,
  dy: 0,
  radius: 55,
  knobR: 24,
  shootTouch: null,
  shootBaseX: 0,
  shootBaseY: 0,
};
function initVirtualJoystick() {
  const jc = document.getElementById("joystick-canvas");
  if (!jc) return;
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    window.innerWidth < 700;
  if (!isMobile) {
    jc.style.display = "none";
    return;
  }
  jc.style.display = "block";
  jc.style.pointerEvents = "auto";
  jc.width = GC.width;
  jc.height = GC.height;
  const ctx = jc.getContext("2d");
  function drawJoystick() {
    ctx.clearRect(0, 0, jc.width, jc.height);
    if (!VJ.active) return;
    ctx.beginPath();
    ctx.arc(VJ.baseX, VJ.baseY, VJ.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(155,48,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(155,48,255,0.08)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(VJ.knobX, VJ.knobY, VJ.knobR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(155,48,255,0.55)";
    ctx.fill();
  }
  jc.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const halfW = jc.width / 2;
        if (t.clientX < halfW) {
          // Left half = move joystick
          if (!VJ.active) {
            VJ.active = true;
            VJ.touch = t.identifier;
            VJ.baseX = t.clientX;
            VJ.baseY = t.clientY;
            VJ.knobX = t.clientX;
            VJ.knobY = t.clientY;
            VJ.dx = 0;
            VJ.dy = 0;
          }
        } else {
          // Right half = fire
          VJ.shootTouch = t.identifier;
          VJ.shootBaseX = t.clientX;
          VJ.shootBaseY = t.clientY;
          _mouseHeld = true;
          const wx = t.clientX - GC.width / 2 + CAM.x;
          const wy = t.clientY - GC.height / 2 + CAM.y;
          PL.facing = Math.atan2(wy - PL.y, wx - PL.x);
          fireOnce();
          if (_autoFireRAF) clearTimeout(_autoFireRAF);
          _autoFireRAF = setTimeout(_autoFireLoop, 80);
        }
      }
      drawJoystick();
    },
    { passive: false },
  );
  jc.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === VJ.touch) {
          const dx = t.clientX - VJ.baseX;
          const dy = t.clientY - VJ.baseY;
          const dist = Math.min(Math.hypot(dx, dy), VJ.radius);
          const ang = Math.atan2(dy, dx);
          VJ.knobX = VJ.baseX + Math.cos(ang) * dist;
          VJ.knobY = VJ.baseY + Math.sin(ang) * dist;
          VJ.dx = Math.cos(ang) * (dist / VJ.radius);
          VJ.dy = Math.sin(ang) * (dist / VJ.radius);
        } else if (t.identifier === VJ.shootTouch) {
          const wx = t.clientX - GC.width / 2 + CAM.x;
          const wy = t.clientY - GC.height / 2 + CAM.y;
          PL.facing = Math.atan2(wy - PL.y, wx - PL.x);
        }
      }
      drawJoystick();
    },
    { passive: false },
  );
  jc.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === VJ.touch) {
          VJ.active = false;
          VJ.touch = null;
          VJ.dx = 0;
          VJ.dy = 0;
        } else if (t.identifier === VJ.shootTouch) {
          VJ.shootTouch = null;
          _mouseHeld = false;
          if (_autoFireRAF) {
            clearTimeout(_autoFireRAF);
            _autoFireRAF = null;
          }
        }
      }
      drawJoystick();
    },
    { passive: false },
  );
  // Integrate joystick dx/dy into player movement via update2
  window._vjDrawJoystick = drawJoystick;
}

function launchGame(mode) {
  gameMode = mode || "vs-robots";
  const scr = document.getElementById("game-screen");
  if (scr) scr.style.display = "block";
  const topbar = document.querySelector(".topbar");
  if (topbar) topbar.style.display = "none";
  GC = document.getElementById("game-canvas");
  if (!GC) return;
  GCX = GC.getContext("2d");
  resizeGC();
  window.addEventListener("resize", resizeGC);
  setBg();
  // Init player
  const sk = ALL_CHARS && ALL_CHARS[selChar];
  PL.maxHp = PL.hp = sk ? Math.max(50, Math.round(sk.stats.hp)) : 100;
  PL.maxShield = 100;
  PL.shield = 0;
  PL.speed = (sk ? sk.stats.spd : 3.5) * 0.7;
  PL.ammo = PL.maxAmmo = 120;
  PL.kills = 0;
  PL.facing = 0;
  PL.regenTimer = 0;
  PL.stamina = 100;
  PL.maxStamina = 100;
  PL.staminaDrain = false;
  PL._kbVx = 0;
  PL._kbVy = 0;
  PL.dmgMult = godGun ? 999 : 1;
  // Set fireRate based on weapon type
  (function () {
    const wep = ALL_WEAPONS && ALL_WEAPONS[selWeapon];
    const wtype = wep ? wep.wtype : "pistol";
    if (godGun) {
      PL.fireRate = 80;
    } else if (wtype === "shotgun") {
      PL.fireRate = 800;
    } else if (wtype === "pistol") {
      PL.fireRate = 400;
    } else {
      PL.fireRate = 120;
    } // rifle auto
  })();
  if (godChar && currentUser?._godChar) {
    PL.maxHp = PL.hp = 2000;
    PL.speed *= 6;
  }
  PL.x = WORLD_W / 2;
  PL.y = WORLD_H / 2;
  PL2.active = mode === "coop";
  if (PL2.active) {
    PL2.x = PL.x + 80;
    PL2.y = PL.y;
    PL2.x = Math.max(20, Math.min(WORLD_W - 20, PL2.x));
    PL2.hp = PL2.maxHp = 100;
    PL2.ammo = PL2.maxAmmo = 120;
  }
  CAM.x = PL.x;
  CAM.y = PL.y;
  gameCoins = currentUser?.coins || 0;
  gameCoinsAtStart = gameCoins; // track starting amount for earned display
  gameTotalKills = 0;
  wave = 1;
  waveKills = 0;
  enemies = [];
  bullets = [];
  pickups = [];
  dmgNums = [];
  particles2 = [];
  cdAmmo = 0;
  cdHeal = 0;
  cdShield = 0;
  autoSpawnAmmoT = 0;
  autoSpawnHealT = 0;
  shakeIntensity = 0;
  gameRunning = true;
  // ── Reset new systems ──
  comboCount = 0;
  comboTimer = 0;
  gameBestCombo = 0;
  isReloading = false;
  reloadTimer = 0;
  currentBoss = null;
  playerUpgrades = { dmg: 0, hp: 0, spd: 0, fireRate: 0, regen: 0, ammo: 0 };
  chargedShotUsed = false;
  chargePhase = 0;
  chargeTimer = 0;
  chargedShotParticles = [];
  if (_chargeHoldTimeout) {
    clearTimeout(_chargeHoldTimeout);
    _chargeHoldTimeout = null;
  }
  generateObstacles();
  document.addEventListener("keydown", onGKey);
  document.addEventListener("keyup", onGKeyUp);
  document.addEventListener("keydown", onGKey2);
  document.addEventListener("keyup", onGKeyUp2);
  GC.addEventListener("mousedown", onGMouseDown);
  GC.addEventListener("mouseup", onGMouseUp);
  GC.addEventListener("mousemove", onGMouse);
  GC.addEventListener("mouseleave", onGMouseUp); // release fire on leave
  GC.addEventListener("contextmenu", (e) => e.preventDefault()); // block right-click menu
  startWave();
  initVirtualJoystick();
  if (gameRAF) cancelAnimationFrame(gameRAF);
  lastTime = performance.now();
  gameRAF = requestAnimationFrame(gLoop);
  updateHUD2();
  showWaveAnn(wave);
}

function resizeGC() {
  if (!GC) return;
  GC.width = window.innerWidth;
  GC.height = window.innerHeight;
}
function setBg() {
  const bg = document.getElementById("game-bg");
  if (!bg) return;
  bg.className =
    gameSettings?.theme === "light" ? "container-white" : "container-dark";
}

// ── Generate random obstacles (walls/crates) scattered around the world ──
function generateObstacles() {
  obstacles = [];
  const safe = 320; // safe zone around spawn
  const cx = WORLD_W / 2,
    cy = WORLD_H / 2;
  // Wall segments
  const walls = [
    { x: 800, y: 600, w: 200, h: 30 },
    { x: 1200, y: 400, w: 30, h: 180 },
    { x: 1600, y: 900, w: 160, h: 30 },
    { x: 2200, y: 700, w: 30, h: 220 },
    { x: 800, y: 1400, w: 180, h: 30 },
    { x: 1400, y: 1200, w: 30, h: 160 },
    { x: 2600, y: 1100, w: 200, h: 30 },
    { x: 3000, y: 800, w: 30, h: 200 },
    { x: 600, y: 2200, w: 30, h: 180 },
    { x: 1800, y: 2400, w: 160, h: 30 },
    { x: 2400, y: 2000, w: 30, h: 200 },
    { x: 3200, y: 2200, w: 180, h: 30 },
    { x: 900, y: 3000, w: 200, h: 30 },
    { x: 1600, y: 2800, w: 30, h: 160 },
    { x: 2800, y: 2800, w: 160, h: 30 },
    { x: 3400, y: 3000, w: 30, h: 180 },
    { x: 500, y: 3400, w: 180, h: 30 },
    { x: 2000, y: 3200, w: 30, h: 200 },
    { x: 3000, y: 3400, w: 200, h: 30 },
  ];
  walls.forEach((w) => {
    const dist = Math.hypot(w.x + w.w / 2 - cx, w.y + w.h / 2 - cy);
    if (dist > safe) obstacles.push({ ...w, type: "wall", color: "#334" });
  });
  // Random crates
  for (let i = 0; i < 60; i++) {
    let ox,
      oy,
      tries = 0;
    do {
      ox = 80 + Math.random() * (WORLD_W - 160);
      oy = 80 + Math.random() * (WORLD_H - 160);
      tries++;
    } while (Math.hypot(ox - cx, oy - cy) < safe && tries < 20);
    if (Math.hypot(ox - cx, oy - cy) > safe)
      obstacles.push({
        x: ox,
        y: oy,
        w: 36,
        h: 36,
        type: "crate",
        color: "#556",
      });
  }
}

// ── Check if a point is inside an obstacle ──
function isInsideObstacle(x, y, margin) {
  margin = margin || 0;
  for (const o of obstacles) {
    if (
      x > o.x - margin &&
      x < o.x + o.w + margin &&
      y > o.y - margin &&
      y < o.y + o.h + margin
    )
      return true;
  }
  return false;
}

function onGKey(e) {
  KEY_MAP[e.key.toUpperCase()] = true;
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
    e.preventDefault();
  if (
    e.key.toUpperCase() === "R" &&
    gameRunning &&
    !isReloading &&
    PL.ammo < PL.maxAmmo
  ) {
    startReload();
  }
  if (e.key === "Escape") {
    const pm = document.getElementById("pause-menu");
    if (pm && pm.style.display === "flex") {
      resumeGame();
      return;
    }
    if (gameRunning) pauseGame();
  }
}
function onGKeyUp(e) {
  KEY_MAP[e.key.toUpperCase()] = false;
}
function onGKey2(e) {
  KEY_MAP2[e.key] = true;
}
function onGKeyUp2(e) {
  KEY_MAP2[e.key] = false;
}

let mouseWorld = { x: 0, y: 0 };
function onGMouse(e) {
  mouseWorld.x = e.clientX - GC.width / 2 + CAM.x;
  mouseWorld.y = e.clientY - GC.height / 2 + CAM.y;
  PL.facing = Math.atan2(mouseWorld.y - PL.y, mouseWorld.x - PL.x);
}
let _mouseHeld = false,
  _autoFireRAF = null;
function fireOnce() {
  if (!gameRunning) return;
  if (isReloading) return;
  const now = performance.now();
  if (now - PL.lastShot < PL.fireRate) return;
  if (PL.ammo <= 0) {
    startReload();
    return;
  }

  const wep = ALL_WEAPONS && ALL_WEAPONS[selWeapon];
  const wtype = wep ? wep.wtype : "pistol";
  const baseDmg = wep ? Math.round(wep.stats.dmg * 0.3 + 8) : 15;
  const critChance = 0.1 + (PL._critBonus || 0);
  const spd = godGun ? 60 : 12;
  const bColor = wep ? wep.color : "#00eeff";

  if (wtype === "shotgun") {
    // Shotgun: 5 pellets spread, consume 1 ammo per shot, 800ms between shots
    PL.lastShot = now;
    PL.ammo--;
    const pellets = 5;
    const spreadAngle = 0.45; // radians total spread
    for (let p = 0; p < pellets; p++) {
      const offset = -spreadAngle / 2 + (spreadAngle / (pellets - 1)) * p;
      const ang = PL.facing + offset;
      const isCrit = Math.random() < critChance;
      const dmg = Math.round(
        baseDmg * 0.55 * (isCrit ? 1.15 : 1) * (PL.dmgMult || 1),
      );
      bullets.push({
        x: PL.x,
        y: PL.y,
        vx: Math.cos(ang) * (spd * 0.9),
        vy: Math.sin(ang) * (spd * 0.9),
        owner: "p1",
        dmg,
        isCrit,
        r: 3,
        life: godGun ? 9999 : 380,
        color: bColor,
      });
    }
    playSound("shoot");
    updateHUD2();
    if (PL.ammo <= 0 && !isReloading) setTimeout(() => startReload(), 200);
  } else if (wtype === "pistol") {
    // Pistol: semi-auto — one bullet per click, no auto-fire loop
    PL.lastShot = now;
    PL.ammo--;
    const isCrit = Math.random() < critChance;
    const dmg = Math.round(baseDmg * (isCrit ? 1.15 : 1) * (PL.dmgMult || 1));
    bullets.push({
      x: PL.x,
      y: PL.y,
      vx: Math.cos(PL.facing) * spd,
      vy: Math.sin(PL.facing) * spd,
      owner: "p1",
      dmg,
      isCrit,
      r: 4,
      life: godGun ? 9999 : 500,
      color: bColor,
    });
    playSound(isCrit ? "crit" : "shoot");
    if (isCrit) {
      flashScreen("rgba(255,200,0,.1)");
      if (gameSettings?.shake) triggerShake(3);
    }
    updateHUD2();
    if (PL.ammo <= 0 && !isReloading) setTimeout(() => startReload(), 200);
    // Semi-auto: stop auto-fire after each shot
    if (_autoFireRAF) {
      clearTimeout(_autoFireRAF);
      _autoFireRAF = null;
    }
  } else {
    // Rifle: full-auto
    PL.lastShot = now;
    PL.ammo--;
    const isCrit = Math.random() < critChance;
    const dmg = Math.round(baseDmg * (isCrit ? 1.15 : 1) * (PL.dmgMult || 1));
    bullets.push({
      x: PL.x,
      y: PL.y,
      vx: Math.cos(PL.facing) * spd,
      vy: Math.sin(PL.facing) * spd,
      owner: "p1",
      dmg,
      isCrit,
      r: 4,
      life: godGun ? 9999 : 500,
      color: bColor,
    });
    playSound(isCrit ? "crit" : "shoot");
    if (isCrit) {
      flashScreen("rgba(255,200,0,.1)");
      if (gameSettings?.shake) triggerShake(3);
    }
    updateHUD2();
    if (PL.ammo <= 0 && !isReloading) setTimeout(() => startReload(), 200);
  }
}
function _autoFireLoop() {
  if (_mouseHeld && gameRunning) {
    const wep = ALL_WEAPONS && ALL_WEAPONS[selWeapon];
    const wtype = wep ? wep.wtype : "pistol";
    // Pistol is semi-auto — no loop
    if (wtype !== "pistol") {
      fireOnce();
    }
  }
  // shotgun loop interval = 800ms; others 60ms
  const wep2 = ALL_WEAPONS && ALL_WEAPONS[selWeapon];
  const wtype2 = wep2 ? wep2.wtype : "pistol";
  if (_mouseHeld && wtype2 !== "pistol") {
    _autoFireRAF = setTimeout(_autoFireLoop, wtype2 === "shotgun" ? 800 : 60);
  } else {
    _autoFireRAF = null;
  }
}
function onGMouseDown(e) {
  if (e.button === 2) {
    // Right click → charged shot
    e.preventDefault();
    if (chargedShotUsed || !gameRunning) return;
    if (chargePhase !== 0) return; // already charging
    const wx = e.clientX - GC.width / 2 + CAM.x,
      wy = e.clientY - GC.height / 2 + CAM.y;
    PL.facing = Math.atan2(wy - PL.y, wx - PL.x);
    chargePhase = 1;
    chargeTimer = 0;
    chargedShotParticles = [];
    spawnDmgNum2(PL.x, PL.y - 45, "⚡ HOLD...", false, "#ff8800");
    _chargeHoldTimeout = setTimeout(() => {
      if (chargePhase === 1 && gameRunning) {
        chargePhase = 2;
        chargeTimer = 0;
        spawnDmgNum2(PL.x, PL.y - 50, "⚡ CHARGING!", false, "#ff2200");
      }
    }, HOLD_TO_CHARGE);
    return;
  }
  if (e.button !== 0) return;
  // Left click → normal fire
  const wx = e.clientX - GC.width / 2 + CAM.x,
    wy = e.clientY - GC.height / 2 + CAM.y;
  PL.facing = Math.atan2(wy - PL.y, wx - PL.x);
  _mouseHeld = true;
  fireOnce();
  if (_autoFireRAF) clearTimeout(_autoFireRAF);
  const wep = ALL_WEAPONS && ALL_WEAPONS[selWeapon];
  const wtype = wep ? wep.wtype : "pistol";
  if (wtype !== "pistol") {
    _autoFireRAF = setTimeout(_autoFireLoop, wtype === "shotgun" ? 800 : 80);
  }
}
function onGMouseUp(e) {
  if (e && e.button === 2) {
    // Right click released → cancel charge if still in hold phase
    if (chargePhase === 1) {
      chargePhase = 0;
      if (_chargeHoldTimeout) {
        clearTimeout(_chargeHoldTimeout);
        _chargeHoldTimeout = null;
      }
      spawnDmgNum2(PL.x, PL.y - 45, "CANCELLED", false, "#888");
    } else if (chargePhase === 2) {
      // Released during charge → cancel
      chargePhase = 0;
      chargeTimer = 0;
      chargedShotParticles = [];
      if (_chargeHoldTimeout) {
        clearTimeout(_chargeHoldTimeout);
        _chargeHoldTimeout = null;
      }
      spawnDmgNum2(PL.x, PL.y - 45, "CANCELLED", false, "#888");
    }
    return;
  }
  _mouseHeld = false;
  if (_autoFireRAF) {
    clearTimeout(_autoFireRAF);
    _autoFireRAF = null;
  }
}
function onGClick(e) {
  /* kept for compatibility */
}

// ── RELOAD SYSTEM ──
function startReload() {
  if (isReloading || PL.ammo >= PL.maxAmmo) return;
  isReloading = true;
  reloadTimer = 0;
  const ri = document.getElementById("reload-indicator");
  if (ri) ri.style.display = "flex";
  const rb = document.getElementById("reload-bar-in");
  if (rb) rb.style.width = "0%";
}

function updateReload(dt) {
  if (!isReloading) return;
  reloadTimer += dt;
  const pct = Math.min((reloadTimer / reloadDuration) * 100, 100);
  const rb = document.getElementById("reload-bar-in");
  if (rb) rb.style.width = pct + "%";
  if (reloadTimer >= reloadDuration) {
    isReloading = false;
    reloadTimer = 0;
    PL.ammo = PL.maxAmmo;
    const ri = document.getElementById("reload-indicator");
    if (ri) ri.style.display = "none";
    spawnDmgNum2(PL.x, PL.y - 40, "🔫 RELOADED!", false, "#00eeff");
    updateHUD2();
  }
}

// ── COMBO SYSTEM ──
function addCombo() {
  comboCount++;
  if (comboCount > gameBestCombo) gameBestCombo = comboCount;
  comboTimer = comboMaxTimer;
  const ch = document.getElementById("combo-hud");
  const cc = document.getElementById("combo-count");
  const cm = document.getElementById("combo-mult");
  const cb = document.getElementById("combo-bar-in");
  if (comboCount >= 3) {
    if (ch) ch.style.display = "flex";
    if (cc) cc.textContent = "x" + comboCount;
    const mult = getComboMult();
    if (cm) cm.textContent = "COMBO ×" + mult.toFixed(1) + " COINS";
    if (cb) cb.style.width = "100%";
  }
}
function resetCombo() {
  comboCount = 0;
  comboTimer = 0;
  const ch = document.getElementById("combo-hud");
  if (ch) ch.style.display = "none";
}
function getComboMult() {
  if (comboCount < 3) return 1;
  if (comboCount < 6) return 1.5;
  if (comboCount < 10) return 2.0;
  if (comboCount < 15) return 2.5;
  return 3.0;
}
function updateCombo(dt) {
  if (comboCount < 3) return;
  comboTimer -= dt;
  const pct = Math.max(0, (comboTimer / comboMaxTimer) * 100);
  const cb = document.getElementById("combo-bar-in");
  if (cb) cb.style.width = pct + "%";
  if (comboTimer <= 0) resetCombo();
}

// ── CHARGED SHOT UPDATE ──
function updateChargedShot(dt) {
  if (chargePhase !== 2) return;
  chargeTimer += dt;
  const pct = Math.min(chargeTimer / CHARGE_DURATION, 1);

  // Spawn gathering particles
  if (Math.random() < 0.5) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 30 + pct * 30;
    chargedShotParticles.push({
      x: PL.x + Math.cos(ang) * dist,
      y: PL.y + Math.sin(ang) * dist,
      vx: Math.cos(ang + Math.PI / 2) * (0.5 + pct * 2),
      vy: Math.sin(ang + Math.PI / 2) * (0.5 + pct * 2),
      life: 350 + pct * 250,
      maxLife: 350 + pct * 250,
      r: 2 + pct * 3,
    });
  }
  // Update particles — pull toward player
  for (let i = chargedShotParticles.length - 1; i >= 0; i--) {
    const p = chargedShotParticles[i];
    const tox = PL.x - p.x,
      toy = PL.y - p.y;
    const d = Math.hypot(tox, toy) || 1;
    p.vx += (tox / d) * 0.5;
    p.vy += (toy / d) * 0.5;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;
    if (p.life <= 0) chargedShotParticles.splice(i, 1);
  }

  if (chargeTimer >= CHARGE_DURATION) fireChargedShot();
}

function fireChargedShot() {
  chargePhase = 0;
  chargeTimer = 0;
  chargedShotUsed = true;
  chargedShotParticles = [];
  if (_chargeHoldTimeout) {
    clearTimeout(_chargeHoldTimeout);
    _chargeHoldTimeout = null;
  }

  const wep = ALL_WEAPONS && ALL_WEAPONS[selWeapon];
  const baseDmg = wep ? Math.round(wep.stats.dmg * 0.3 + 8) : 15;
  const chargedDmg = Math.round(baseDmg * 5 * (PL.dmgMult || 1));

  bullets.push({
    x: PL.x,
    y: PL.y,
    vx: Math.cos(PL.facing) * 20,
    vy: Math.sin(PL.facing) * 20,
    owner: "p1",
    dmg: chargedDmg,
    isCrit: true,
    r: 14,
    life: 900,
    color: "#ff2200",
    isCharged: true,
  });

  flashScreen("rgba(255,30,0,.4)");
  if (gameSettings?.shake) triggerShake(12);
  spawnDmgNum2(PL.x, PL.y - 65, "⚡ CHARGED SHOT!", true, "#ff2200");
  playChargedShotSound();

  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    particles2.push({
      x: PL.x,
      y: PL.y,
      vx: Math.cos(a) * (3 + Math.random() * 6),
      vy: Math.sin(a) * (3 + Math.random() * 6),
      life: 500 + Math.random() * 300,
      color: Math.random() < 0.5 ? "#ff2200" : "#ff8800",
      r: 3 + Math.random() * 4,
    });
  }
}

function playChargedShotSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const g = ctx.createGain();
  g.connect(ctx.destination);
  const now = ctx.currentTime;
  [0, 0.04, 0.09].forEach((d, i) => {
    const o = ctx.createOscillator();
    o.connect(g);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(320 - i * 70, now + d);
    o.frequency.exponentialRampToValueAtTime(25, now + d + 0.35);
    g.gain.setValueAtTime(0.28, now + d);
    g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.35);
    o.start(now + d);
    o.stop(now + d + 0.35);
  });
}

// ── BOSS SPAWN ──
function spawnBoss() {
  const bIdx = Math.min(Math.floor((wave - 1) / 10) - 1, BOSS_DEFS.length - 1);
  const bDef = BOSS_DEFS[Math.max(0, bIdx)];
  const ang = Math.random() * Math.PI * 2;
  const bx = Math.max(80, Math.min(WORLD_W - 80, PL.x + Math.cos(ang) * 500));
  const by = Math.max(80, Math.min(WORLD_H - 80, PL.y + Math.sin(ang) * 500));
  const bossHp = bDef.hp + wave * 20;
  const boss = {
    ...bDef,
    type: "boss",
    x: bx,
    y: by,
    hp: bossHp,
    maxHp: bossHp,
    spd: bDef.spd + wave * 0.02,
    dmg: bDef.dmg + wave * 1,
    lastShot: 0,
    id: Math.random(),
    isBoss: true,
    phase: 1, // becomes enraged at 50% HP
  };
  currentBoss = boss;
  enemies.push(boss);
  // Show boss bar
  const bw = document.getElementById("boss-bar-wrap");
  if (bw) bw.style.display = "flex";
  const bn = document.getElementById("boss-bar-name");
  if (bn) bn.textContent = bDef.icon + " " + bDef.name;
  showWaveAnn("⚠ BOSS WAVE ⚠");
  triggerShake(12);
  flashScreen("rgba(255,0,50,.3)");
}

function updateBossBar() {
  if (!currentBoss) return;
  const pct = Math.max(0, (currentBoss.hp / currentBoss.maxHp) * 100);
  const bi = document.getElementById("boss-bar-in");
  const bt = document.getElementById("boss-bar-txt");
  if (bi) bi.style.width = pct + "%";
  if (bt) bt.textContent = Math.ceil(pct) + "%";
  // Boss enrage at 50%
  if (pct <= 50 && currentBoss.phase === 1) {
    currentBoss.phase = 2;
    currentBoss.spd *= 1.5;
    currentBoss.shootCd = Math.round(currentBoss.shootCd * 0.6);
    flashScreen("rgba(255,0,0,.4)");
    spawnDmgNum2(
      currentBoss.x,
      currentBoss.y - 60,
      "⚠ ENRAGED!",
      true,
      "#ff0000",
    );
  }
}

function startWave() {
  waveKills = 0;
  waveEnemyCount = calcWaveCount(wave);
  currentBoss = null;
  chargedShotUsed = false;
  chargePhase = 0;
  chargeTimer = 0;
  chargedShotParticles = [];
  if (_chargeHoldTimeout) {
    clearTimeout(_chargeHoldTimeout);
    _chargeHoldTimeout = null;
  }
  // Hide boss bar unless this is a boss wave
  const bw = document.getElementById("boss-bar-wrap");
  if (bw) bw.style.display = "none";

  const isBossWave = wave % 10 === 0;
  if (isBossWave) {
    // Boss wave: fewer normal enemies + boss
    const normalCount = Math.max(2, waveEnemyCount - 10);
    const types = getWaveTypes(wave);
    for (let i = 0; i < normalCount; i++)
      setTimeout(() => spawnEnemy(types), i * 4000 + 200);
    waveEnemyCount = normalCount + 1; // +1 for boss
    setTimeout(() => spawnBoss(), 2000);
  } else {
    const types = getWaveTypes(wave);
    for (let i = 0; i < waveEnemyCount; i++)
      setTimeout(() => spawnEnemy(types), i * 4000 + 200);
  }
  safeSet(
    "hud-wave-display",
    "textContent",
    "WAVE " + wave + (isBossWave ? " ⚠" : ""),
  );
  safeSet("hud-enemies-left", "textContent", "Enemies: " + waveEnemyCount);
}

function spawnEnemy(types) {
  if (!gameRunning) return;
  const t = { ...types[Math.floor(Math.random() * types.length)] };
  const ang = Math.random() * Math.PI * 2,
    dist = 380 + Math.random() * 200;
  let ex = Math.max(30, Math.min(WORLD_W - 30, PL.x + Math.cos(ang) * dist));
  let ey = Math.max(30, Math.min(WORLD_H - 30, PL.y + Math.sin(ang) * dist));
  const e = { ...t, x: ex, y: ey };
  e.hp = e.maxHp = t.hp + wave * 3;
  e.spd = t.spd + wave * 0.05;
  e.lastShot = 0;
  if (e.type === "phantom") {
    e.shield = e.maxShield = 40 + wave * 2;
    e.invisible = false;
    e.invTimer = 0;
  }
  e.id = Math.random();
  enemies.push(e);
  safeSet("hud-enemies-left", "textContent", "Enemies: " + enemies.length);
}

function gLoop(ts) {
  if (!gameRunning) return;
  const dt = Math.min(ts - lastTime, 50);
  lastTime = ts;
  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 1000) {
    fps = Math.round((frameCount * 1000) / fpsTimer);
    frameCount = 0;
    fpsTimer = 0;
  }
  const fpsel = document.getElementById("hud-fps");
  if (fpsel) {
    fpsel.style.display = gameSettings?.showFps ? "block" : "none";
    if (gameSettings?.showFps) fpsel.textContent = fps + " FPS";
  }
  update2(dt);
  render2();
  updateHUD2();
  gameRAF = requestAnimationFrame(gLoop);
}

function update2(dt) {
  // Shield regen
  PL.shieldRegenTimer += dt;
  if (PL.maxShield > 0 && PL.shieldRegenTimer > 1000) {
    PL.shieldRegenTimer = 0;
    PL.shield = Math.min(PL.shield + 0.5, PL.maxShield);
  }
  // Player move
  const ks = gameSettings?.keys || {
    up: "W",
    down: "S",
    left: "A",
    right: "D",
  };
  let mx = 0,
    my = 0;
  if (KEY_MAP[ks.up.toUpperCase()] || KEY_MAP["ARROWUP"]) my = -1;
  if (KEY_MAP[ks.down.toUpperCase()] || KEY_MAP["ARROWDOWN"]) my = 1;
  if (KEY_MAP[ks.left.toUpperCase()] || KEY_MAP["ARROWLEFT"]) mx = -1;
  if (KEY_MAP[ks.right.toUpperCase()] || KEY_MAP["ARROWRIGHT"]) mx = 1;
  // Virtual joystick overrides keyboard on mobile
  if (VJ.active && (Math.abs(VJ.dx) > 0.1 || Math.abs(VJ.dy) > 0.1)) {
    mx = VJ.dx;
    my = VJ.dy;
  } else if (mx && my) {
    mx *= 0.707;
    my *= 0.707;
  }
  // Sprint (Shift key)
  const isSprinting =
    KEY_MAP["SHIFT"] && PL.stamina > 0 && (mx !== 0 || my !== 0);
  if (isSprinting) {
    PL.stamina = Math.max(0, PL.stamina - dt * 0.04);
    PL.staminaDrain = true;
  } else {
    if (PL.staminaDrain && PL.stamina === 0) {
      // must wait for full regen before can sprint again
      if (PL.stamina >= PL.maxStamina) PL.staminaDrain = false;
    } else {
      PL.staminaDrain = false;
    }
    PL.stamina = Math.min(PL.maxStamina, PL.stamina + dt * 0.025);
  }
  const sprintMult = isSprinting ? 1.8 : 1;
  PL.x = Math.max(
    20,
    Math.min(WORLD_W - 20, PL.x + mx * PL.speed * sprintMult * (dt / 16)),
  );
  PL.y = Math.max(
    20,
    Math.min(WORLD_H - 20, PL.y + my * PL.speed * sprintMult * (dt / 16)),
  );
  // Apply knockback velocity
  if (Math.abs(PL._kbVx) > 0.05 || Math.abs(PL._kbVy) > 0.05) {
    PL.x = Math.max(20, Math.min(WORLD_W - 20, PL.x + PL._kbVx * (dt / 16)));
    PL.y = Math.max(20, Math.min(WORLD_H - 20, PL.y + PL._kbVy * (dt / 16)));
    PL._kbVx *= 0.75;
    PL._kbVy *= 0.75;
  }
  // Obstacle collision — push player out
  for (const o of obstacles) {
    const margin = 20;
    if (
      PL.x > o.x - margin &&
      PL.x < o.x + o.w + margin &&
      PL.y > o.y - margin &&
      PL.y < o.y + o.h + margin
    ) {
      const overlapL = PL.x - (o.x - margin);
      const overlapR = o.x + o.w + margin - PL.x;
      const overlapT = PL.y - (o.y - margin);
      const overlapB = o.y + o.h + margin - PL.y;
      const minOverlap = Math.min(overlapL, overlapR, overlapT, overlapB);
      if (minOverlap === overlapL) PL.x = o.x - margin;
      else if (minOverlap === overlapR) PL.x = o.x + o.w + margin;
      else if (minOverlap === overlapT) PL.y = o.y - margin;
      else PL.y = o.y + o.h + margin;
    }
  }
  // Regen
  PL.regenTimer += dt;
  if (PL.regenTimer > 1000) {
    PL.regenTimer = 0;
    const sk = ALL_CHARS && ALL_CHARS[selChar];
    const regen =
      (sk ? sk.stats.regen * 0.5 : 0.3) + (playerUpgrades.regen || 0) * 0.5;
    PL.hp = Math.min(PL.hp + regen, PL.maxHp);
  }
  // P2
  if (PL2.active) {
    let m2x = 0,
      m2y = 0;
    if (KEY_MAP2["ArrowUp"]) m2y = -1;
    if (KEY_MAP2["ArrowDown"]) m2y = 1;
    if (KEY_MAP2["ArrowLeft"]) m2x = -1;
    if (KEY_MAP2["ArrowRight"]) m2x = 1;
    if (m2x && m2y) {
      m2x *= 0.707;
      m2y *= 0.707;
    }
    PL2.x += m2x * PL2.speed * (dt / 16);
    PL2.y += m2y * PL2.speed * (dt / 16);
    PL2.x = Math.max(20, Math.min(WORLD_W - 20, PL2.x));
    PL2.y = Math.max(20, Math.min(WORLD_H - 20, PL2.y));
  }
  // Camera lerp
  CAM.x += (PL.x - CAM.x) * 0.09;
  CAM.y += (PL.y - CAM.y) * 0.09;
  // Grid bg offset
  const bg = document.getElementById("game-bg");
  if (bg)
    bg.style.backgroundPosition = `${(-CAM.x % 55).toFixed(1)}px ${(-CAM.y % 55).toFixed(1)}px`;
  // Bullets (dead-flag pooling: no mid-loop splice)
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    if (b.dead) continue;
    b.x += b.vx * (dt / 16);
    b.y += b.vy * (dt / 16);
    b.life -= dt;
    if (b.life <= 0) {
      b.dead = true;
      continue;
    }
    if (b.owner === "p1" || b.owner === "p2") {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (!e.dead && Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r) {
          b.dead = true;
          hitEnemy2(e, b.dmg, b.isCrit, j);
          break;
        }
      }
    } else {
      // enemy bullet
      if (Math.hypot(b.x - PL.x, b.y - PL.y) < 22) {
        applyDamageToPlayer(b.dmg);
        b.dead = true;
        flashScreen("rgba(255,0,0,.18)");
        if (gameSettings?.shake) triggerShake(5);
        resetCombo();
        if (PL.hp <= 0) {
          PL.hp = 0;
          gameOver2();
          return;
        }
      }
    }
  }
  // Flush dead bullets once per frame
  if (bullets.some((b) => b.dead)) bullets = bullets.filter((b) => !b.dead);
  // Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.type === "phantom") {
      e.invTimer = (e.invTimer || 0) + dt;
      if (e.invTimer > 2200) {
        e.invisible = !e.invisible;
        e.invTimer = 0;
      }
    }
    const dx = PL.x - e.x,
      dy = PL.y - e.y,
      dist = Math.hypot(dx, dy) || 1,
      ang = Math.atan2(dy, dx);
    if (e.type === "shooter") {
      if (dist > e.keepDist) {
        e.x += Math.cos(ang) * e.spd * (dt / 16);
        e.y += Math.sin(ang) * e.spd * (dt / 16);
      } else if (dist < e.keepDist - 40) {
        e.x -= Math.cos(ang) * e.spd * 0.5 * (dt / 16);
        e.y -= Math.sin(ang) * e.spd * 0.5 * (dt / 16);
      }
      const now2 = performance.now();
      if (now2 - (e.lastShot || 0) > e.shootCd) {
        e.lastShot = now2;
        bullets.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(ang) * 7,
          vy: Math.sin(ang) * 7,
          owner: "enemy",
          dmg: e.dmg,
          r: 5,
          life: 700,
          color: "#ff4444",
          isCrit: false,
        });
      }
    } else if (e.isBoss) {
      // Boss always moves toward player
      e.x += Math.cos(ang) * e.spd * (dt / 16);
      e.y += Math.sin(ang) * e.spd * (dt / 16);
      // Boss shoots spread bullets
      const now2 = performance.now();
      if (now2 - (e.lastShot || 0) > e.shootCd) {
        e.lastShot = now2;
        const spread = e.phase === 2 ? 5 : 3; // more bullets when enraged
        for (let s = 0; s < spread; s++) {
          const sa = ang + (s - (spread - 1) / 2) * 0.25;
          bullets.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(sa) * 8,
            vy: Math.sin(sa) * 8,
            owner: "enemy",
            dmg: e.dmg,
            r: 7,
            life: 900,
            color: "#ff0055",
            isCrit: false,
          });
        }
        if (gameSettings?.shake) triggerShake(3);
      }
    } else if (e.type !== "phantom" || !e.invisible) {
      // Wall avoidance steering
      let _ax = Math.cos(ang),
        _ay = Math.sin(ang);
      for (const _o of obstacles) {
        const _margin = e.r + 22;
        const _ex = e.x + _ax * _margin,
          _ey = e.y + _ay * _margin;
        if (
          _ex > _o.x &&
          _ex < _o.x + _o.w &&
          _ey > _o.y &&
          _ey < _o.y + _o.h
        ) {
          // perpendicular steer: pick left or right side
          const _perp = [
            [-_ay, _ax],
            [_ay, -_ax],
          ];
          const _side = _perp[Math.floor(Date.now() / 800 + e.id * 99) % 2];
          _ax = _ax * 0.3 + _side[0] * 0.7;
          _ay = _ay * 0.3 + _side[1] * 0.7;
          const _len = Math.hypot(_ax, _ay) || 1;
          _ax /= _len;
          _ay /= _len;
          break;
        }
      }
      e.x += _ax * e.spd * (dt / 16);
      e.y += _ay * e.spd * (dt / 16);
    } else {
      // phantom invisible sometimes teleports
      if (Math.random() < 0.005) {
        e.x = PL.x + (Math.random() - 0.5) * 200;
        e.y = PL.y + (Math.random() - 0.5) * 200;
      } else {
        e.x += Math.cos(ang) * e.spd * 1.2 * (dt / 16);
        e.y += Math.sin(ang) * e.spd * 1.2 * (dt / 16);
      }
    }
    if (dist < e.r + 20) {
      applyDamageToPlayer(e.dmg * (dt / 1000) * 1.2);
      if (gameSettings?.shake) triggerShake(2);
      resetCombo();
      // Knockback: push player away from enemy
      if (dist > 0) {
        const kbForce = 5;
        PL._kbVx = ((PL.x - e.x) / dist) * kbForce;
        PL._kbVy = ((PL.y - e.y) / dist) * kbForce;
      }
      if (PL.hp <= 0) {
        PL.hp = 0;
        gameOver2();
        return;
      }
    }
  }
  // Pickups
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.life = (p.life || 8000) - dt;
    if (p.life <= 0) {
      pickups.splice(i, 1);
      continue;
    }
    if (Math.hypot(p.x - PL.x, p.y - PL.y) < p.r + 16) {
      applyPickup2(p, false);
      pickups.splice(i, 1);
      if (p.type !== "coin") playSound("pickup");
    } else if (PL2.active && Math.hypot(p.x - PL2.x, p.y - PL2.y) < p.r + 16) {
      applyPickup2(p, true);
      pickups.splice(i, 1);
      if (p.type !== "coin") playSound("pickup");
    }
  }
  // Auto-spawn
  autoSpawnAmmoT += dt;
  autoSpawnHealT += dt;
  if (autoSpawnAmmoT > 30000) {
    autoSpawnAmmoT = 0;
    pickups.push({
      x: PL.x + (Math.random() - 0.5) * 300,
      y: PL.y + (Math.random() - 0.5) * 300,
      type: "ammo",
      r: 10,
      life: 8000,
    });
  }
  if (autoSpawnHealT > 40000) {
    autoSpawnHealT = 0;
    pickups.push({
      x: PL.x + (Math.random() - 0.5) * 300,
      y: PL.y + (Math.random() - 0.5) * 300,
      type: "heal",
      r: 10,
      life: 8000,
    });
  }
  // Cooldowns
  if (cdAmmo > 0) {
    cdAmmo = Math.max(0, cdAmmo - dt);
    updateCdUI2("ammo", cdAmmo);
  }
  if (cdHeal > 0) {
    cdHeal = Math.max(0, cdHeal - dt);
    updateCdUI2("heal", cdHeal);
  }
  if (cdShield > 0) {
    cdShield = Math.max(0, cdShield - dt);
    updateCdUI2("shield", cdShield);
  }
  // Damage numbers float up (dead-flag pooling)
  for (let i = 0; i < dmgNums.length; i++) {
    const d = dmgNums[i];
    d.y -= 1.2 * (dt / 16);
    d.life -= dt;
    if (d.life <= 0) d.dead = true;
  }
  if (dmgNums.some((d) => d.dead)) dmgNums = dmgNums.filter((d) => !d.dead);
  // Particles (dead-flag pooling)
  for (let i = 0; i < particles2.length; i++) {
    const p = particles2[i];
    p.x += p.vx * (dt / 16);
    p.y += p.vy * (dt / 16);
    p.life -= dt;
    p.vx *= 0.94;
    p.vy *= 0.94;
    if (p.life <= 0) p.dead = true;
  }
  if (particles2.some((p) => p.dead))
    particles2 = particles2.filter((p) => !p.dead);
  // Shake decay
  if (shakeIntensity > 0.1) {
    shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeY = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeIntensity *= 0.82;
  } else {
    shakeX = 0;
    shakeY = 0;
    shakeIntensity = 0;
  }
  // Wave clear check
  if (
    enemies.length === 0 &&
    waveEnemyCount > 0 &&
    waveKills >= waveEnemyCount &&
    gameRunning &&
    !waveClearing
  ) {
    waveClearing = true;
    // Hide boss bar on wave clear
    const bw = document.getElementById("boss-bar-wrap");
    if (bw) bw.style.display = "none";
    currentBoss = null;
    wave++;
    waveEnemyCount = 0;
    // Show upgrade screen before next wave
    setTimeout(() => {
      waveClearing = false;
      showUpgradeScreen();
    }, 600);
  }
  // Minimap (throttled: update every 4 frames)
  minimapFrame++;
  if (minimapFrame % 4 === 0) updateMinimap2();
  // New system updates
  updateReload(dt);
  updateCombo(dt);
  if (currentBoss) updateBossBar();
  updateChargedShot(dt);
}

function applyDamageToPlayer(dmg) {
  if (PL.shield > 0) {
    const absorbed = Math.min(PL.shield, dmg);
    PL.shield -= absorbed;
    dmg -= absorbed;
  }
  PL.hp -= dmg;
}

function hitEnemy2(e, dmg, isCrit, idx) {
  if (e.type === "phantom" && (e.shield || 0) > 0) {
    const sd = Math.min(dmg, e.shield);
    e.shield -= sd;
    dmg -= sd;
    if (dmg <= 0) {
      spawnDmgNum2(e.x, e.y, "🛡️", false, "#cc44ff");
      return;
    }
  }
  const finalDmg = isCrit ? Math.round(dmg * 1.15) : Math.round(dmg);
  e.hp -= finalDmg;
  playSound(isCrit ? "crit" : "hit");
  spawnDmgNum2(e.x, e.y, finalDmg, isCrit, isCrit ? "#ffdd00" : "#fff");
  if (isCrit) {
    flashScreen("rgba(255,200,0,.12)");
    if (gameSettings?.shake) triggerShake(4);
  }
  if (gameSettings?.particles !== false) {
    const n = isCrit ? 8 : 4;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      particles2.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * (2 + Math.random() * 3),
        vy: Math.sin(a) * (2 + Math.random() * 3),
        life: 300 + Math.random() * 200,
        color: isCrit ? "#ffdd00" : "#ff4444",
        r: isCrit ? 3 : 2,
      });
    }
  }
  if (e.hp <= 0) killEnemy2(e, idx);
}

function killEnemy2(e, idx) {
  playSound(e.type === "exploder" ? "explode" : "kill");
  waveKills++;
  gameTotalKills++;
  PL.kills++;
  if (currentUser) {
    if (!currentUser.stats) currentUser.stats = {};
    currentUser.stats.kills = (currentUser.stats.kills || 0) + 1;
    if (wave >= (currentUser.stats.highWave || 0))
      currentUser.stats.highWave = wave;
  }
  // Boss death
  if (e.isBoss) {
    currentBoss = null;
    const bw = document.getElementById("boss-bar-wrap");
    if (bw) bw.style.display = "none";
    if (currentUser) {
      if (!currentUser.stats) currentUser.stats = {};
      currentUser.stats.bosses = (currentUser.stats.bosses || 0) + 1;
    }
    flashScreen("rgba(255,150,0,.5)");
    triggerShake(18);
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      particles2.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * (3 + Math.random() * 6),
        vy: Math.sin(a) * (3 + Math.random() * 6),
        life: 800,
        color: e.color,
        r: 4,
      });
    }
    // Boss drops big loot
    for (let c = 0; c < 5; c++)
      pickups.push({
        x: e.x + (Math.random() - 0.5) * 60,
        y: e.y + (Math.random() - 0.5) * 60,
        type: "coin",
        val: Math.floor(100 + Math.random() * 200 + wave * 10),
        color: "#ffd700",
        r: 10,
        life: 10000,
        snd: "coin_yellow",
      });
    pickups.push({ x: e.x, y: e.y, type: "heal", r: 12, life: 10000 });
    spawnDmgNum2(e.x, e.y - 50, "👑 BOSS SLAIN!", true, "#ffd700");
  }
  if (e.type === "exploder") {
    flashScreen("rgba(255,100,0,.25)");
    if (gameSettings?.shake) triggerShake(9);
    const d = Math.hypot(PL.x - e.x, PL.y - e.y);
    if (d < e.explodeRadius) {
      const dmg = Math.round(e.exploMax * (1 - d / e.explodeRadius));
      applyDamageToPlayer(dmg);
    }
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      particles2.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * 6,
        vy: Math.sin(a) * 6,
        life: 500,
        color: "#ff6600",
        r: 3,
      });
    }
  }
  // Combo system
  addCombo();
  // Per-kill coin reward by enemy type
  const killCoins = {
    basic: 15,
    heavy: 30,
    shooter: 50,
    exploder: 40,
    phantom: 60,
  };
  const earned = killCoins[e.type] || 0;
  if (earned > 0) {
    gameCoins += earned;
    if (currentUser) currentUser.coins = (currentUser.coins || 0) + earned;
    spawnDmgNum2(e.x, e.y - 30, "+" + earned + "💰", false, "#ffd700");
  }
  dropLoot2(e);
  if (gameSettings?.particles !== false)
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      particles2.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * (1 + Math.random() * 4),
        vy: Math.sin(a) * (1 + Math.random() * 4),
        life: 400,
        color: e.color,
        r: 2,
      });
    }
  enemies.splice(idx, 1);
  safeSet("hud-enemies-left", "textContent", "Enemies: " + enemies.length);
  checkAchievements && checkAchievements();
}

function dropLoot2(e) {
  const r = Math.random();
  const boss = e.type === "heavy" || e.type === "phantom";
  const mult = getComboMult(); // combo coin multiplier
  // Red coins (20% small+heavy)
  if (r < 0.2)
    pickups.push({
      x: e.x,
      y: e.y,
      type: "coin",
      val: Math.floor((10 + Math.random() * 10) * mult),
      color: "#ff2222",
      r: 8,
      life: 6000,
      snd: "coin_red",
    });
  // Yellow coins (10% boss)
  if (boss && Math.random() < 0.1)
    pickups.push({
      x: e.x + (Math.random() - 0.5) * 20,
      y: e.y + (Math.random() - 0.5) * 20,
      type: "coin",
      val: Math.floor((20 + Math.random() * 30) * mult),
      color: "#ffd700",
      r: 9,
      life: 6000,
      snd: "coin_yellow",
    });
  // Green coins (1.5% boss, 5% boss-type)
  if (boss && Math.random() < 0.015)
    pickups.push({
      x: e.x + (Math.random() - 0.5) * 15,
      y: e.y + (Math.random() - 0.5) * 15,
      type: "coin",
      val: Math.floor((50 + Math.random() * 200) * mult),
      color: "#00ff88",
      r: 10,
      life: 7000,
      snd: "coin_green",
    });
  if (Math.random() < 0.3)
    pickups.push({
      x: e.x + (Math.random() - 0.5) * 30,
      y: e.y + (Math.random() - 0.5) * 30,
      type: "ammo",
      r: 10,
      life: 8000,
    });
  if (Math.random() < 0.05)
    pickups.push({
      x: e.x + (Math.random() - 0.5) * 20,
      y: e.y + (Math.random() - 0.5) * 20,
      type: "heal",
      r: 10,
      life: 8000,
    });
}

function applyPickup2(p, isP2) {
  const target = isP2 ? PL2 : PL;
  if (p.type === "heal") target.hp = Math.min(target.hp + 50, target.maxHp);
  else if (p.type === "ammo")
    target.ammo = Math.min(target.ammo + 30, target.maxAmmo);
  else if (p.type === "coin") {
    const val = p.val || 10;
    gameCoins += val;
    if (currentUser) {
      if (!currentUser.stats) currentUser.stats = {};
      currentUser.stats.coinsEarned =
        (currentUser.stats.coinsEarned || 0) + val;
    }
    spawnDmgNum2(p.x, p.y, "+" + val + "💰", false, p.color || "#ffd700");
    playCoinSound(p.color || "#ffd700");
  }
}

// ── UPGRADE SCREEN ──
function showUpgradeScreen() {
  if (!gameRunning) return;
  gameRunning = false; // pause game loop
  // Pick 3 random unique upgrades
  const pool = [...UPGRADE_POOL];
  const chosen = [];
  while (chosen.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  const container = document.getElementById("upgrade-cards-container");
  if (!container) return;
  container.innerHTML = "";
  chosen.forEach((upg) => {
    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.innerHTML = `
      <div class="upgrade-card-icon">${upg.icon}</div>
      <div class="upgrade-card-name">${upg.name}</div>
      <div class="upgrade-card-desc">${upg.desc}</div>
      <div class="upgrade-card-val">${upg.val}</div>`;
    card.onclick = () => selectUpgrade(upg);
    container.appendChild(card);
  });
  const scr = document.getElementById("upgrade-screen");
  if (scr) scr.style.display = "flex";
}

function selectUpgrade(upg) {
  upg.apply();
  const scr = document.getElementById("upgrade-screen");
  if (scr) scr.style.display = "none";
  gameRunning = true;
  lastTime = performance.now();
  gameRAF = requestAnimationFrame(gLoop);
  // startWave is called here after upgrade selection — wave already incremented
  startWave();
  showWaveAnn(wave);
}

function spawnSupply(type) {
  if (!gameRunning) return;
  const cost = type === "ammo" ? 50 : type === "shield" ? 75 : 100;
  const cd = type === "ammo" ? cdAmmo : type === "shield" ? cdShield : cdHeal;
  if (cd > 0) return;
  if (gameCoins < cost) {
    flashScreen("rgba(255,0,0,.15)");
    return;
  }
  gameCoins -= cost;
  if (currentUser) currentUser.coins = gameCoins;
  if (type === "ammo") {
    PL.ammo = Math.min(PL.ammo + 30, PL.maxAmmo);
    cdAmmo = 3000;
    spawnDmgNum2(PL.x, PL.y - 40, "+30🔫", false, "#00eeff");
  } else if (type === "heal") {
    PL.hp = Math.min(PL.hp + 50, PL.maxHp);
    cdHeal = 3000;
    spawnDmgNum2(PL.x, PL.y - 40, "+50❤️", false, "#00ff88");
  } else if (type === "shield") {
    const refill = Math.round(PL.maxShield * 0.3);
    PL.shield = Math.min(PL.shield + refill, PL.maxShield);
    cdShield = 3000;
    spawnDmgNum2(PL.x, PL.y - 40, "+" + refill + "🛡️", false, "#00ccff");
  }
  const btn = document.getElementById("btn-spawn-" + type);
  if (btn) {
    btn.style.transform = "scale(.9)";
    setTimeout(() => {
      btn.style.transform = "";
    }, 150);
  }
  playSound("pickup");
}

function updateCdUI2(type, cd) {
  const el = document.getElementById("cd-" + type);
  if (!el) return;
  if (cd > 0) {
    el.style.display = "block";
    el.textContent = Math.ceil(cd / 1000) + "s";
  } else el.style.display = "none";
}
function spawnDmgNum2(x, y, val, isCrit, color) {
  dmgNums.push({
    x,
    y,
    val: String(val),
    isCrit,
    life: 900,
    color: color || (isCrit ? "#ffdd00" : "#fff"),
  });
}
function triggerShake(n) {
  shakeIntensity = Math.max(shakeIntensity, n);
}
function flashScreen(color) {
  const fl = document.getElementById("screen-flash");
  if (!fl) return;
  fl.style.background = color;
  fl.style.opacity = "1";
  setTimeout(() => {
    fl.style.opacity = "0";
  }, 120);
}

function updateHUD2() {
  const pct = Math.max(0, PL.hp) / PL.maxHp;
  const bar = document.getElementById("hud-hp-bar");
  if (bar) {
    bar.style.width = pct * 100 + "%";
    bar.style.background =
      pct > 0.5
        ? "linear-gradient(90deg,#00ff88,#44ff44)"
        : pct > 0.25
          ? "linear-gradient(90deg,#ffaa00,#ffdd00)"
          : "linear-gradient(90deg,#ff2222,#ff6644)";
  }
  safeSet(
    "hud-hp-txt",
    "textContent",
    Math.max(0, Math.ceil(PL.hp)) + "/" + PL.maxHp,
  );
  // Shield bar
  const shBar = document.getElementById("hud-shield-bar");
  const shWrap = document.getElementById("hud-shield-wrap");
  if (shWrap) shWrap.style.display = PL.maxShield > 0 ? "flex" : "none";
  if (shBar)
    shBar.style.width = (Math.max(0, PL.shield) / PL.maxShield) * 100 + "%";
  safeSet(
    "hud-shield-txt",
    "textContent",
    Math.ceil(Math.max(0, PL.shield)) + "/" + PL.maxShield,
  );
  // Stamina bar
  const stBar = document.getElementById("hud-stamina-bar");
  const stWrap = document.getElementById("hud-stamina-wrap");
  if (stBar) {
    const stPct = PL.stamina / PL.maxStamina;
    stBar.style.width = stPct * 100 + "%";
    stBar.style.background =
      stPct > 0.3
        ? "linear-gradient(90deg,#ffd700,#fff088)"
        : "linear-gradient(90deg,#ff4444,#ff8800)";
  }
  safeSet("hud-ammo", "textContent", PL.ammo);
  safeSet("hud-ammo-max", "textContent", PL.maxAmmo);
  safeSet("hud-ammo-big", "textContent", PL.ammo + " / " + PL.maxAmmo);
  // Compact HUD: show small top-left ammo, hide big center ammo
  const _ammoSmallWrap = document.getElementById("hud-ammo")?.parentElement;
  const _ammoBigWrap = document.getElementById("hud-ammo-big")?.parentElement;
  if (_ammoBigWrap)
    _ammoBigWrap.style.display = gameSettings?.compactHud ? "none" : "block";
  if (_ammoSmallWrap)
    _ammoSmallWrap.style.display = gameSettings?.compactHud ? "flex" : "none";
  safeSet("hud-game-coins", "textContent", gameCoins);
}

function showWaveAnn(w) {
  const el = document.getElementById("wave-announce");
  const txt = document.getElementById("wave-announce-txt");
  if (!el || !txt) return;
  txt.textContent = "WAVE " + w;
  el.style.opacity = "1";
  setTimeout(() => {
    el.style.opacity = "0";
  }, 2200);
}

function updateMinimap2() {
  const mc = document.getElementById("minimap-canvas");
  if (!mc) return;
  const mctx = mc.getContext("2d"),
    W = mc.width,
    H = mc.height,
    SCALE = 0.045,
    cx = W / 2,
    cy = H / 2;
  mctx.clearRect(0, 0, W, H);
  const ox = PL.x * SCALE,
    oy = PL.y * SCALE;
  // World border on minimap
  const wbx = cx + (0 - ox),
    wby = cy + (0 - oy),
    wbw = WORLD_W * SCALE,
    wbh = WORLD_H * SCALE;
  mctx.strokeStyle = "rgba(155,48,255,.25)";
  mctx.lineWidth = 1;
  mctx.strokeRect(wbx, wby, wbw, wbh);
  for (const e of enemies) {
    const mx = cx + (e.x * SCALE - ox),
      my = cy + (e.y * SCALE - oy);
    if (mx < -5 || mx > W + 5 || my < -5 || my > H + 5) continue;
    mctx.fillStyle = e.isBoss
      ? "#ff0055"
      : e.type === "phantom"
        ? "#cc44ff"
        : e.type === "heavy"
          ? "#ff6600"
          : e.type === "exploder"
            ? "#ffaa00"
            : "#ff3333";
    mctx.beginPath();
    mctx.arc(mx, my, e.isBoss ? 6 : 3, 0, Math.PI * 2);
    mctx.fill();
    if (e.isBoss) {
      mctx.strokeStyle = "#ff0055";
      mctx.lineWidth = 1.5;
      mctx.beginPath();
      mctx.arc(mx, my, 8, 0, Math.PI * 2);
      mctx.stroke();
    }
  }
  for (const p of pickups) {
    const mx = cx + (p.x * SCALE - ox),
      my = cy + (p.y * SCALE - oy);
    if (mx < 0 || mx > W || my < 0 || my > H) continue;
    mctx.fillStyle =
      p.type === "heal" ? "#00ff88" : p.type === "coin" ? "#ffd700" : "#00eeff";
    mctx.fillRect(mx - 2, my - 2, 4, 4);
  }
  if (PL2.active) {
    const mx = cx + (PL2.x * SCALE - ox),
      my = cy + (PL2.y * SCALE - oy);
    mctx.fillStyle = "#4488ff";
    mctx.beginPath();
    mctx.arc(mx, my, 5, 0, Math.PI * 2);
    mctx.fill();
  }
  mctx.fillStyle = "#00ff88";
  mctx.beginPath();
  mctx.arc(cx, cy, 5, 0, Math.PI * 2);
  mctx.fill();
  mctx.strokeStyle = "rgba(255,255,255,.5)";
  mctx.lineWidth = 1.5;
  mctx.beginPath();
  mctx.arc(cx, cy, 5, 0, Math.PI * 2);
  mctx.stroke();
}

function render2() {
  if (!GCX || !GC) return;
  const W = GC.width,
    H = GC.height;
  GCX.clearRect(0, 0, W, H);
  GCX.save();
  GCX.translate(W / 2 + shakeX - CAM.x, H / 2 + shakeY - CAM.y);
  // World boundary
  GCX.strokeStyle = "rgba(155,48,255,.3)";
  GCX.lineWidth = 3;
  GCX.setLineDash([20, 10]);
  GCX.strokeRect(0, 0, WORLD_W, WORLD_H);
  GCX.setLineDash([]);
  // Corner markers
  [
    [0, 0],
    [WORLD_W, 0],
    [0, WORLD_H],
    [WORLD_W, WORLD_H],
  ].forEach(([cx2, cy2]) => {
    GCX.strokeStyle = "rgba(155,48,255,.5)";
    GCX.lineWidth = 2;
    GCX.strokeRect(cx2 - 15, cy2 - 15, 30, 30);
  });
  // ── Draw Obstacles ──
  for (const o of obstacles) {
    GCX.save();
    if (o.type === "wall") {
      GCX.fillStyle = "#223";
      GCX.fillRect(o.x, o.y, o.w, o.h);
      GCX.strokeStyle = "rgba(100,120,200,.5)";
      GCX.lineWidth = 2;
      GCX.strokeRect(o.x, o.y, o.w, o.h);
      // inner detail stripe
      GCX.fillStyle = "rgba(100,120,255,.12)";
      GCX.fillRect(o.x + 2, o.y + 2, o.w - 4, o.h - 4);
    } else {
      // crate
      GCX.fillStyle = "#3a3a2a";
      GCX.fillRect(o.x, o.y, o.w, o.h);
      GCX.strokeStyle = "rgba(200,180,80,.4)";
      GCX.lineWidth = 1.5;
      GCX.strokeRect(o.x, o.y, o.w, o.h);
      // X detail
      GCX.strokeStyle = "rgba(200,180,80,.2)";
      GCX.lineWidth = 1;
      GCX.beginPath();
      GCX.moveTo(o.x, o.y);
      GCX.lineTo(o.x + o.w, o.y + o.h);
      GCX.moveTo(o.x + o.w, o.y);
      GCX.lineTo(o.x, o.y + o.h);
      GCX.stroke();
    }
    GCX.restore();
  }
  // Pickups
  for (const p of pickups) drawPickup2(GCX, p);
  // Bullets
  for (const b of bullets) {
    GCX.save();
    if (b.isCharged) {
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.015);
      GCX.shadowBlur = 30 * pulse;
      GCX.shadowColor = "#ff2200";
      const grd = GCX.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2);
      grd.addColorStop(0, "rgba(255,80,0,0.98)");
      grd.addColorStop(0.5, "rgba(255,10,0,0.65)");
      grd.addColorStop(1, "rgba(200,0,0,0)");
      GCX.fillStyle = grd;
      GCX.beginPath();
      GCX.arc(b.x, b.y, b.r * 2, 0, Math.PI * 2);
      GCX.fill();
      GCX.shadowBlur = 18;
      GCX.fillStyle = "#ffaa00";
      GCX.beginPath();
      GCX.arc(b.x, b.y, b.r * 0.55, 0, Math.PI * 2);
      GCX.fill();
    } else {
      GCX.shadowBlur = 8;
      GCX.shadowColor = b.color;
      GCX.fillStyle = b.color;
      GCX.beginPath();
      GCX.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      GCX.fill();
    }
    GCX.restore();
  }
  // Charge particles & ring (right-click charged shot)
  if (chargePhase === 2) {
    const chPct = Math.min(chargeTimer / CHARGE_DURATION, 1);
    for (const p of chargedShotParticles) {
      const a = Math.max(0, p.life / p.maxLife);
      GCX.save();
      GCX.globalAlpha = a * 0.9;
      GCX.shadowBlur = 10;
      GCX.shadowColor = "#ff2200";
      GCX.fillStyle = `rgba(255,${Math.round(80 - chPct * 80)},0,1)`;
      GCX.beginPath();
      GCX.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      GCX.fill();
      GCX.restore();
    }
    // Charge ring around player
    GCX.save();
    GCX.globalAlpha = 0.5 + chPct * 0.45;
    GCX.strokeStyle = `rgba(255,${Math.round(80 - chPct * 80)},0,0.9)`;
    GCX.lineWidth = 3 + chPct * 5;
    GCX.shadowBlur = 18 * chPct;
    GCX.shadowColor = "#ff2200";
    GCX.beginPath();
    GCX.arc(PL.x, PL.y, 28 + chPct * 14, 0, Math.PI * 2 * chPct);
    GCX.stroke();
    GCX.restore();
  }
  // Enemies
  for (const e of enemies) drawEnemy2(GCX, e);
  // Players
  drawPlayer2(GCX, PL, "p1");
  if (PL2.active) drawPlayer2(GCX, PL2, "p2");
  // Particles
  for (const p of particles2) {
    GCX.globalAlpha = Math.max(0, p.life / 500);
    GCX.fillStyle = p.color;
    GCX.beginPath();
    GCX.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    GCX.fill();
  }
  GCX.globalAlpha = 1;
  // Damage numbers
  for (const d of dmgNums) {
    const a = Math.max(0, d.life / 900);
    GCX.save();
    GCX.globalAlpha = a;
    GCX.font = (d.isCrit ? "bold 20px" : "bold 14px") + " Orbitron,sans-serif";
    GCX.fillStyle = d.color;
    GCX.shadowBlur = d.isCrit ? 12 : 6;
    GCX.shadowColor = d.color;
    GCX.textAlign = "center";
    GCX.fillText(d.val, d.x, d.y);
    GCX.restore();
  }
  GCX.restore();
}

function drawPlayer2(ctx, pl, id) {
  const s = id === "p1" ? ALL_CHARS && ALL_CHARS[selChar] : null;
  const c = s ? s.color : "#9b30ff",
    ar = s ? s.armor : c,
    vi = s ? s.visor : "#aaffff";
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = c;
  ctx.fillStyle = s ? s.body : "#08001a";
  ctx.beginPath();
  ctx.arc(pl.x, pl.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ar;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(pl.x, pl.y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = vi;
  ctx.beginPath();
  ctx.arc(
    pl.x + Math.cos(pl.facing) * 9,
    pl.y + Math.sin(pl.facing) * 9,
    5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  if (id === "p2") {
    ctx.fillStyle = "#4488ff";
    ctx.font = "bold 9px Orbitron,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("P2", pl.x, pl.y - 24);
  }
  const pct = pl.hp / pl.maxHp;
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(0,0,0,.5)";
  ctx.fillRect(pl.x - 20, pl.y - 30, 40, 4);
  ctx.fillStyle = pct > 0.5 ? "#00ff88" : pct > 0.25 ? "#ffaa00" : "#ff3333";
  ctx.fillRect(pl.x - 20, pl.y - 30, 40 * pct, 4);
  // Shield bar above HP bar (only if shield exists)
  if (id === "p1" && PL.maxShield > 0) {
    const shPct = Math.max(0, PL.shield) / PL.maxShield;
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fillRect(pl.x - 20, pl.y - 37, 40, 4);
    ctx.fillStyle = "#00ccff";
    ctx.fillRect(pl.x - 20, pl.y - 37, 40 * shPct, 4);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawEnemy2(ctx, e) {
  if (e.type === "phantom" && e.invisible && Math.random() < 0.6) return;
  ctx.save();
  ctx.globalAlpha = e.type === "phantom" && e.invisible ? 0.3 : 1;
  ctx.shadowBlur = e.isBoss ? 30 : 14;
  ctx.shadowColor = e.color;

  // ── Boss special render ──
  if (e.isBoss) {
    const pulse = 1 + 0.08 * Math.sin(Date.now() * 0.004);
    ctx.shadowBlur = 35;
    // outer glow ring
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // body
    if (e.shape === "circle") {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.shape === "square") {
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
    } else {
      // star boss
      ctx.fillStyle = e.color;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Date.now() * 0.001,
          r2 = i % 2 === 0 ? e.r : e.r * 0.5;
        if (i === 0) ctx.moveTo(e.x + Math.cos(a) * r2, e.y + Math.sin(a) * r2);
        else ctx.lineTo(e.x + Math.cos(a) * r2, e.y + Math.sin(a) * r2);
      }
      ctx.closePath();
      ctx.fill();
    }
    // Inner core
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fff";
    ctx.beginPath();
    ctx.arc(e.x, e.y - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = e.phase === 2 ? "#ff0000" : "#000";
    ctx.beginPath();
    ctx.arc(e.x, e.y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    // Phase 2 rage indicator
    if (e.phase === 2) {
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.01);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Boss HP bar (large)
    const pct = e.hp / e.maxHp;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.fillRect(e.x - e.r - 6, e.y - e.r - 18, e.r * 2 + 12, 8);
    ctx.fillStyle = pct > 0.5 ? "#ff4400" : pct > 0.25 ? "#ff8800" : "#ff0000";
    ctx.fillRect(e.x - e.r - 6, e.y - e.r - 18, (e.r * 2 + 12) * pct, 8);
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }

  if (e.shape === "circle") {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();
    if (e.type === "basic") {
      [-1, 1].forEach((s) => {
        ctx.fillStyle = e.eyeColor;
        ctx.beginPath();
        ctx.arc(e.x + s * 5, e.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (e.type === "phantom") {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(e.x, e.y - 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#330044";
      ctx.beginPath();
      ctx.arc(e.x, e.y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      if ((e.shield || 0) > 0) {
        ctx.strokeStyle = "rgba(180,100,255,.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (e.shape === "square") {
    const r = e.r;
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x - r, e.y - r, r * 2, r * 2);
    if (e.type === "heavy") {
      ctx.fillStyle = e.eyeColor;
      ctx.fillRect(e.x - r * 0.5, e.y - 5, r, 10);
    } else if (e.type === "shooter") {
      [-1, 1].forEach((s) => {
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(e.x + s * 6, e.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(e.x + s * 6, e.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  } else if (e.shape === "star") {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        r2 = i % 2 === 0 ? e.r : e.r * 0.4;
      if (i === 0) ctx.moveTo(e.x + Math.cos(a) * r2, e.y + Math.sin(a) * r2);
      else ctx.lineTo(e.x + Math.cos(a) * r2, e.y + Math.sin(a) * r2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff2222";
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.arc(
        e.x + Math.cos(a) * e.r,
        e.y + Math.sin(a) * e.r,
        3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = e.eyeColor;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // HP bar
  const pct = e.hp / e.maxHp;
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "rgba(0,0,0,.6)";
  ctx.fillRect(e.x - e.r, e.y - e.r - 9, e.r * 2, 4);
  ctx.fillStyle = pct > 0.5 ? "#44ff44" : pct > 0.25 ? "#ffaa00" : "#ff3333";
  ctx.fillRect(e.x - e.r, e.y - e.r - 9, e.r * 2 * pct, 4);
  if (e.type === "phantom" && (e.maxShield || 0) > 0) {
    ctx.fillStyle = "rgba(180,100,255,.3)";
    ctx.fillRect(e.x - e.r, e.y - e.r - 15, e.r * 2, 3);
    ctx.fillStyle = "#cc44ff";
    ctx.fillRect(
      e.x - e.r,
      e.y - e.r - 15,
      e.r * 2 * (e.shield / e.maxShield),
      3,
    );
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawPickup2(ctx, p) {
  ctx.save();
  const pulse = 0.8 + 0.2 * Math.sin(Date.now() * 0.004);
  ctx.globalAlpha = Math.min(1, p.life / 1000) * pulse;
  if (p.type === "heal") {
    ctx.fillStyle = "#00ff88";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#00ff88";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#004422";
    ctx.beginPath();
    ctx.arc(p.x + 3, p.y - 2, p.r * 0.65, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === "ammo") {
    ctx.fillStyle = "#001830";
    ctx.fillRect(p.x - 10, p.y - 8, 20, 16);
    ctx.strokeStyle = "#00eeff";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#00eeff";
    ctx.lineWidth = 2;
    [-4, 0, 4].forEach((oy) => {
      ctx.beginPath();
      ctx.moveTo(p.x - 7, p.y + oy);
      ctx.lineTo(p.x + 7, p.y + oy);
      ctx.stroke();
    });
  } else if (p.type === "coin") {
    ctx.fillStyle = p.color || "#ff2222";
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color || "#ff2222";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("$", p.x, p.y + 3);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function gameOver2() {
  gameRunning = false;
  cancelAnimationFrame(gameRAF);
  // Hide overlays
  const bw = document.getElementById("boss-bar-wrap");
  if (bw) bw.style.display = "none";
  const us = document.getElementById("upgrade-screen");
  if (us) us.style.display = "none";
  const ch = document.getElementById("combo-hud");
  if (ch) ch.style.display = "none";
  const ri = document.getElementById("reload-indicator");
  if (ri) ri.style.display = "none";
  if (currentUser) {
    if (!currentUser.stats) currentUser.stats = {};
    if (wave > (currentUser.stats.highWave || 0))
      currentUser.stats.highWave = wave;
    currentUser.coins = gameCoins;
    const users = getUsers();
    users[currentUser.username] = currentUser;
    saveUsers(users);
  }
  safeSet("go-wave", "textContent", "Wave Reached: " + wave);
  safeSet("go-kills", "textContent", "Kills: " + gameTotalKills);
  safeSet(
    "go-coins",
    "textContent",
    "Coins Earned: " + Math.max(0, gameCoins - gameCoinsAtStart),
  );
  // Extra stats
  safeSet("go-combo", "textContent", "Best Combo: x" + gameBestCombo);
  safeSet(
    "go-best-wave",
    "textContent",
    "Personal Best: Wave " + (currentUser?.stats?.highWave || wave),
  );
  const _expEarned = Math.floor(gameTotalKills * 2 + wave * 10);
  if (currentUser) {
    currentUser.exp = (currentUser.exp || 0) + _expEarned;
  }
  safeSet("go-exp", "textContent", "EXP Earned: +" + _expEarned);
  const go = document.getElementById("game-over-screen");
  if (go) go.style.display = "flex";
  checkAchievements && checkAchievements();
}

function restartGame() {
  waveClearing = false;
  const go = document.getElementById("game-over-screen");
  if (go) go.style.display = "none";
  const us = document.getElementById("upgrade-screen");
  if (us) us.style.display = "none";
  // Remove old listeners before re-adding in launchGame
  document.removeEventListener("keydown", onGKey);
  document.removeEventListener("keyup", onGKeyUp);
  document.removeEventListener("keydown", onGKey2);
  document.removeEventListener("keyup", onGKeyUp2);
  if (GC) {
    GC.removeEventListener("mousedown", onGMouseDown);
    GC.removeEventListener("mouseup", onGMouseUp);
  }
  launchGame(gameMode);
}

function pauseGame() {
  if (!gameRunning) return;
  gameRunning = false;
  cancelAnimationFrame(gameRAF);
  const pm = document.getElementById("pause-menu");
  if (pm) pm.style.display = "flex";
}

function resumeGame() {
  const pm = document.getElementById("pause-menu");
  if (pm) pm.style.display = "none";
  gameRunning = true;
  gameRAF = requestAnimationFrame(gLoop);
}

function exitGame() {
  gameRunning = false;
  cancelAnimationFrame(gameRAF);
  const pm = document.getElementById("pause-menu");
  if (pm) pm.style.display = "none";
  document.removeEventListener("keydown", onGKey);
  document.removeEventListener("keyup", onGKeyUp);
  document.removeEventListener("keydown", onGKey2);
  document.removeEventListener("keyup", onGKeyUp2);
  if (GC) {
    GC.removeEventListener("mousedown", onGMouseDown);
    GC.removeEventListener("mouseup", onGMouseUp);
  }
  window.removeEventListener("resize", resizeGC);
  const go = document.getElementById("game-over-screen");
  if (go) go.style.display = "none";
  const us = document.getElementById("upgrade-screen");
  if (us) us.style.display = "none";
  const bw = document.getElementById("boss-bar-wrap");
  if (bw) bw.style.display = "none";
  const ch = document.getElementById("combo-hud");
  if (ch) ch.style.display = "none";
  const ri = document.getElementById("reload-indicator");
  if (ri) ri.style.display = "none";
  const scr = document.getElementById("game-screen");
  if (scr) scr.style.display = "none";
  const topbar = document.querySelector(".topbar");
  if (topbar) topbar.style.display = "";
  if (currentUser) {
    const users = getUsers();
    users[currentUser.username] = currentUser;
    saveUsers(users);
    safeSet("hud-coins", "textContent", currentUser.coins);
  }
}
