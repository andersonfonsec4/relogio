// Preferências
const PREFS_KEY = "relogio_prefs";
const defaults = { theme: "dark", format24: true };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}
function savePrefs(p) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

const prefs = loadPrefs();
document.documentElement.setAttribute("data-theme", prefs.theme);

// Elementos
const elHours   = document.getElementById("hours");
const elMinutes = document.getElementById("minutes");
const elSeconds = document.getElementById("seconds");
const elSuffix  = document.getElementById("suffix");
const elDate    = document.getElementById("date");
const elTZ      = document.getElementById("tz");

const btnTheme  = document.getElementById("toggleTheme");
const btnFormat = document.getElementById("toggleFormat");

// Estado inicial dos botões
btnTheme.setAttribute("aria-pressed", String(prefs.theme === "dark"));
btnFormat.textContent = prefs.format24 ? "24h" : "12h";
btnFormat.setAttribute("aria-pressed", String(prefs.format24));

// Fuso
try {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  elTZ.textContent = `Fuso horário: ${tz}`;
} catch {
  elTZ.textContent = "";
}

// Relógio
const pad2 = (n) => String(n).padStart(2, "0");

function renderClock() {
  const now = new Date();

  let h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  if (prefs.format24) {
    elSuffix.hidden = true;
  } else {
    const isPM = h >= 12;
    const hr12 = (h % 12) || 12;
    elSuffix.textContent = isPM ? "PM" : "AM";
    elSuffix.hidden = false;
    h = hr12;
  }

  elHours.textContent = pad2(h);
  elMinutes.textContent = pad2(m);
  elSeconds.textContent = pad2(s);

  const fmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const str = fmt.format(now);
  elDate.textContent = str[0].toUpperCase() + str.slice(1);
}

// Ações
function toggleTheme() {
  prefs.theme = (prefs.theme === "dark") ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", prefs.theme);
  btnTheme.setAttribute("aria-pressed", String(prefs.theme === "dark"));
  savePrefs(prefs);
}

function toggleFormat() {
  prefs.format24 = !prefs.format24;
  btnFormat.textContent = prefs.format24 ? "24h" : "12h";
  btnFormat.setAttribute("aria-pressed", String(prefs.format24));
  savePrefs(prefs);
  renderClock();
}

btnTheme.addEventListener("click", toggleTheme);
btnFormat.addEventListener("click", toggleFormat);

// Atalhos
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "t") toggleTheme();
  if (k === "f") toggleFormat();
});

// Loop alinhado ao segundo
function startTick() {
  renderClock();
  const now = Date.now();
  const delay = 1000 - (now % 1000);
  setTimeout(function tick() {
    renderClock();
    setTimeout(tick, 1000);
  }, delay);
}
startTick();
