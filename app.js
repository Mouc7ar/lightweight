const KEY = "gymTrackerSets_v2";

const $$ = (sel) => document.querySelector(sel);
const $$$ = (sel) => Array.from(document.querySelectorAll(sel));

const screenTitle = $$("#screenTitle");
const screenSub = $$("#screenSub");

const tabs = $$$(".tab");
const tabBtns = $$$(".tabbtn");

// Log inputs
const dateEl = $$("#date");
const exerciseEl = $$("#exercise");
const weightEl = $$("#weight");
const repsEl = $$("#reps");
const notesEl = $$("#notes");
const addBtn = $$("#addBtn");
const addSameBtn = $$("#addSameBtn");
const todayBtn = $$("#todayBtn");
const reuseBtn = $$("#reuseBtn");
const recentList = $$("#recentList");
const toHistoryBtn = $$("#toHistoryBtn");

// History
const listEl = $$("#list");
const searchEl = $$("#search");
const filterTodayBtn = $$("#filterToday");
const clearBtn = $$("#clearBtn");

// Charts
const chartExercise = $$("#chartExercise");
const chartCanvas = $$("#chart");
const chartEmpty = $$("#chartEmpty");
const ctx = chartCanvas.getContext("2d");

// Settings
const exportBtn = $$("#exportBtn");
const importFile = $$("#importFile");

// ---------- Storage ----------
function loadSets() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}
function saveSets(sets) {
  localStorage.setItem(KEY, JSON.stringify(sets));
}

// ---------- Utils ----------
function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
}
function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function safe(s) {
  return (s || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

// Estimated 1RM (Epley): 1RM ≈ w * (1 + reps/30)
function epley1RM(w, r) {
  if (!w || !r) return 0;
  return w * (1 + r / 30);
}

// ---------- Tabs ----------
const TAB_META = {
  log: { title: "Log", sub: "Fast set logging." },
  history: { title: "History", sub: "Search and review." },
  charts: { title: "Charts", sub: "See progress trends." },
  settings: { title: "Settings", sub: "Backup & restore." },
};

function goTab(name) {
  tabs.forEach(t => (t.hidden = t.dataset.tab !== name));
  tabBtns.forEach(b => b.classList.toggle("active", b.dataset.go === name));
  screenTitle.textContent = TAB_META[name].title;
  screenSub.textContent = TAB_META[name].sub;

  if (name === "history") renderHistory();
  if (name === "charts") renderChartUI();
  if (name === "log") renderRecent();
}

tabBtns.forEach(btn => btn.addEventListener("click", () => goTab(btn.dataset.go)));

// ---------- Render ----------
function renderRecent() {
  const sets = loadSets().slice().reverse().slice(0, 6);
  if (sets.length === 0) {
    recentList.innerHTML = `<div class="item"><div class="itemTitle">No sets yet.</div><div class="itemMeta">Add your first set above.</div></div>`;
    return;
  }
  recentList.innerHTML = sets.map(s => `
    <div class="item">
      <div class="itemTop">
        <div class="itemTitle">${safe(s.exercise)}</div>
        <div class="itemMeta">${formatDate(s.date)}</div>
      </div>
      <div class="pill">${s.weight} × ${s.reps}</div>
      ${s.notes ? `<div class="note">${safe(s.notes)}</div>` : ""}
    </div>
  `).join("");
}

function renderHistory() {
  const sets = loadSets();
  const q = (searchEl.value || "").trim().toLowerCase();
  const onlyToday = filterTodayBtn.dataset.on === "1";
  const today = todayISO();

  const filtered = sets.filter(s => {
    const okQ = q ? s.exercise.toLowerCase().includes(q) : true;
    const okD = onlyToday ? s.date === today : true;
    return okQ && okD;
  }).slice().reverse();

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="item"><div class="itemTitle">Nothing found.</div><div class="itemMeta">Try another search.</div></div>`;
    return;
  }

  listEl.innerHTML = filtered.map(s => `
    <div class="item">
      <div class="itemTop">
        <div class="itemTitle">${safe(s.exercise)}</div>
        <div class="itemMeta">${formatDate(s.date)}</div>
      </div>
      <div class="pill">${s.weight} × ${s.reps}</div>
      ${s.notes ? `<div class="note">${safe(s.notes)}</div>` : ""}
    </div>
  `).join("");
}

// ---------- Log actions ----------
function setToday() { dateEl.value = todayISO(); }

function lastExercise() {
  const sets = loadSets();
  const last = sets[sets.length - 1];
  if (last?.exercise) exerciseEl.value = last.exercise;
}

function addSet({ keepExercise }) {
  const date = dateEl.value || todayISO();
  const exercise = (exerciseEl.value || "").trim();
  const weight = Number(weightEl.value);
  const reps = Number(repsEl.value);
  const notes = (notesEl.value || "").trim();

  if (!exercise || !weight || !reps) {
    // small UX: focus the first missing field
    if (!exercise) exerciseEl.focus();
    else if (!weight) weightEl.focus();
    else repsEl.focus();
    return;
  }

  const sets = loadSets();
  sets.push({
    id: crypto.randomUUID(),
    date,
    exercise,
    weight,
    reps,
    notes,
    createdAt: Date.now(),
  });
  saveSets(sets);

  // reset inputs for speed
  if (!keepExercise) exerciseEl.value = "";
  weightEl.value = "";
  repsEl.value = "";
  notesEl.value = "";
  weightEl.focus();

  renderRecent();
}

addBtn.addEventListener("click", () => addSet({ keepExercise: false }));
addSameBtn.addEventListener("click", () => addSet({ keepExercise: true }));
todayBtn.addEventListener("click", setToday);
reuseBtn.addEventListener("click", lastExercise);

$$$(".quickReps").forEach(btn => {
  btn.addEventListener("click", () => {
    repsEl.value = btn.dataset.reps;
    weightEl.focus();
  });
});

toHistoryBtn.addEventListener("click", () => goTab("history"));

// ---------- History actions ----------
searchEl.addEventListener("input", renderHistory);

filterTodayBtn.addEventListener("click", () => {
  const on = filterTodayBtn.dataset.on === "1";
  filterTodayBtn.dataset.on = on ? "0" : "1";
  filterTodayBtn.textContent = on ? "Today" : "Today ✓";
  renderHistory();
});

clearBtn.addEventListener("click", () => {
  const ok = confirm("Clear all saved sets? This cannot be undone.");
  if (!ok) return;
  saveSets([]);
  renderRecent();
  renderHistory();
  renderChartUI();
});

// ---------- Charts ----------
function uniqueExercises(sets) {
  const map = new Map();
  sets.forEach(s => {
    const key = s.exercise.trim().toLowerCase();
    if (!key) return;
    if (!map.has(key)) map.set(key, s.exercise.trim());
  });
  return Array.from(map.values()).sort((a,b)=>a.localeCompare(b));
}

function renderChartUI() {
  const sets = loadSets();
  const exercises = uniqueExercises(sets);

  chartExercise.innerHTML = exercises.length
    ? exercises.map(x => `<option value="${safe(x)}">${safe(x)}</option>`).join("")
    : `<option value="">No data yet</option>`;

  chartEmpty.textContent = exercises.length ? "" : "Log some sets first, then charts will appear.";
  drawChart();
}

function drawChart() {
  const sets = loadSets();
  const ex = chartExercise.value;
  if (!ex) {
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    return;
  }

  // last ~30 points for that exercise
  const pts = sets
    .filter(s => s.exercise.trim().toLowerCase() === ex.trim().toLowerCase())
    .map(s => ({ t: s.date, v: epley1RM(s.weight, s.reps) }))
    .filter(p => p.v > 0)
    .slice(-30);

  // clear
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  if (pts.length < 2) {
    chartEmpty.textContent = "Need at least 2 logged sets for a trend.";
    return;
  }
  chartEmpty.textContent = "";

  // basic scaling
  const w = chartCanvas.width, h = chartCanvas.height;
  const pad = 18;

  const ys = pts.map(p => p.v);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = (maxY - minY) || 1;

  function x(i) {
    return pad + (i * (w - pad * 2)) / (pts.length - 1);
  }
  function y(v) {
    const n = (v - minY) / range;
    return (h - pad) - n * (h - pad * 2);
  }

  // axes (simple)
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // line
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, i) => {
    const xx = x(i), yy = y(p.v);
    if (i === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.stroke();

  // dots
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(p.v), 2.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // label
  ctx.font = "12px system-ui";
  ctx.fillText(`1RM ~ ${Math.round(pts[pts.length - 1].v)}`, pad, 14);
}

chartExercise.addEventListener("change", drawChart);

// ---------- Settings: export/import ----------
exportBtn.addEventListener("click", () => {
  const data = loadSets();
  const blob = new Blob([JSON.stringify({ version: 2, sets: data }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gym-tracker-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const parsed = JSON.parse(text);
    const sets = parsed.sets ?? parsed; // allow raw array too
    if (!Array.isArray(sets)) throw new Error("Invalid format");
    saveSets(sets);
    alert("Import complete.");
    renderRecent();
    renderHistory();
    renderChartUI();
  } catch {
    alert("Import failed. Make sure it's a valid backup JSON.");
  } finally {
    importFile.value = "";
  }
});

// ---------- Init ----------
setToday();
renderRecent();
goTab("log");
