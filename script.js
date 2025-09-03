// Preferências salvas
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
const elHours = document.getElementById("hours");
const elMinutes = document.getElementById("minutes");
const elSeconds = document.getElementById("seconds");
const elSuffix = document.getElementById("suffix");
const elDate = document.getElementById("date");
const elTZ = document.getElementById("tz");
const btnTheme = document.getElementById("toggleTheme");
const btnFormat = document.getElementById("toggleFormat");

// Mostra fuso/local
try {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  elTZ.textContent = `Fuso horário: ${tz}`;
} catch {
  elTZ.textContent = "";
}

// Atualização do relógio
function pad2(n) {
  return String(n).padStart(2, "0");
}

function renderClock() {
  const now = new Date();

  // horário
  let h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  if (prefs.format24) {
    elSuffix.hidden = true;
  } else {
    const isPM = h >= 12;
    const hr12 = h % 12 || 12;
    elSuffix.textContent = isPM ? "PM" : "AM";
    elSuffix.hidden = false;
    h = hr12;
  }

  elHours.textContent = pad2(h);
  elMinutes.textContent = pad2(m);
  elSeconds.textContent = pad2(s);

  // data por extenso em pt-BR
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formatted = fmt.format(now);
  // Capitaliza a primeira letra do dia/mes (opcional)
  elDate.textContent =
    formatted.charAt(0).toLowerCase() === formatted.charAt(0)
      ? formatted[0].toUpperCase() + formatted.slice(1)
      : formatted;
}

// Alternar tema
function toggleTheme() {
  prefs.theme = prefs.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", prefs.theme);
  savePrefs(prefs);
}

// Alternar formato 12/24h
function toggleFormat() {
  prefs.format24 = !prefs.format24;
  btnFormat.textContent = prefs.format24 ? "24h" : "12h";
  savePrefs(prefs);
  renderClock();
}

// Listeners
btnTheme.addEventListener("click", toggleTheme);
btnFormat.addEventListener("click", toggleFormat);

// Teclado: T = tema, F = formato
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "t") toggleTheme();
  if (k === "f") toggleFormat();
});

// Estado inicial do botão de formato
btnFormat.textContent = prefs.format24 ? "24h" : "12h";

// Loop do relógio (1x/segundo, alinhado ao segundo)
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
