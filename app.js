// LightWeight — minimal + functional effects (toasts, haptics, sheet, sparklines)

const SETS_KEY = "lw_sets_v1";
const EX_KEY = "lw_exercises_v1"; // stores custom exercise list (optional)

const $$ = (s) => document.querySelector(s);
const $$$ = (s) => Array.from(document.querySelectorAll(s));

/* ---------------- Storage ---------------- */
function loadSets() {
  try { return JSON.parse(localStorage.getItem(SETS_KEY)) ?? []; }
  catch { return []; }
}
function saveSets(sets) {
  localStorage.setItem(SETS_KEY, JSON.stringify(sets));
}

function loadExercises() {
  try { return JSON.parse(localStorage.getItem(EX_KEY)) ?? []; }
  catch { return []; }
}
function saveExercises(list) {
  localStorage.setItem(EX_KEY, JSON.stringify(list));
}

/* ---------------- Date helpers ---------------- */
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
function startOfWeekISO(d = new Date()) {
  // Monday as start
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  const off = x.getTimezoneOffset();
  const local = new Date(x.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

/* ---------------- Utilities ---------------- */
function safe(s){ return (s || "").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
function norm(s){ return (s || "").trim().toLowerCase(); }

function epley1RM(w, r) {
  w = Number(w) || 0; r = Number(r) || 0;
  if (!w || !r) return 0;
  return w * (1 + r / 30);
}

/* ---------------- Functional effects ---------------- */
const toastEl = $$("#toast");
function toast(msg, ms = 1200) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => (toastEl.hidden = true), ms);
}
function vibrate(ms = 15) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
function shake(el){
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

/* ---------------- Tabs ---------------- */
const subtitle = $$("#subtitle");
const tabs = $$$(".tab");
const tabBtns = $$$(".tabbtn");
const TAB_TITLES = {
  exercises: "Exercises",
  log: "Log",
  charts: "Charts",
  settings: "Settings",
};

function goTab(name) {
  tabs.forEach(t => (t.hidden = t.dataset.tab !== name));
  tabBtns.forEach(b => b.classList.toggle("active", b.dataset.go === name));
  subtitle.textContent = TAB_TITLES[name] || "";
  if (name === "exercises") renderExercises();
  if (name === "log") renderRecent();
  if (name === "charts") renderCharts();
}
tabBtns.forEach(b => b.addEventListener("click", () => goTab(b.dataset.go)));

/* ---------------- UI refs ---------------- */
/* Exercises */
const exerciseSearch = $$("#exerciseSearch");
const exerciseList = $$("#exerciseList");
const exerciseCount = $$("#exerciseCount");
const addExerciseBtn = $$("#addExerciseBtn");
const todayJumpBtn = $$("#todayJumpBtn");
const quickAddTop = $$("#quickAddTop");

/* Log */
const logTodayBtn = $$("#logTodayBtn");
const logDate = $$("#logDate");
const logExercise = $$("#logExercise");
const logWeight = $$("#logWeight");
const logReps = $$("#logReps");
const logAddBtn = $$("#logAddBtn");
const recentList = $$("#recentList");

/* Charts */
const statTotalSets = $$("#statTotalSets");
const statThisWeek = $$("#statThisWeek");
const chartsExercise = $$("#chartsExercise");
const chartsCanvas = $$("#chartsCanvas");
const chartsEmpty = $$("#chartsEmpty");
const chartsCtx = chartsCanvas.getContext("2d");

/* Settings */
const exportBtn = $$("#exportBtn");
const importFile = $$("#importFile");
const clearAllBtn = $$("#clearAllBtn");

/* Sheet */
const sheet = $$("#sheet");
const sheetScrim = $$("#sheetScrim");
const sheetClose = $$("#sheetClose");
const sheetTitle = $$("#sheetTitle");
const sheetSub = $$("#sheetSub");

const bestSetEl = $$("#bestSet");
const best1rmEl = $$("#best1rm");
const lastTrainedEl = $$("#lastTrained");

const detailCanvas = $$("#detailCanvas");
const detailCtx = detailCanvas.getContext("2d");
const detailEmpty = $$("#detailEmpty");

const detailTodayBtn = $$("#detailTodayBtn");
const detailDate = $$("#detailDate");
const detailWeight = $$("#detailWeight");
const detailReps = $$("#detailReps");
const detailAddBtn = $$("#detailAddBtn");
const detailDeleteExerciseBtn = $$("#detailDeleteExerciseBtn");

const detailHistory = $$("#detailHistory");

/* state */
let currentExercise = null;

/* ---------------- Data derivations ---------------- */
function getAllExerciseNames() {
  // combine explicit list + anything found in sets
  const list = loadExercises();
  const fromSets = new Set(loadSets().map(s => (s.exercise || "").trim()).filter(Boolean));
  list.forEach(x => fromSets.add(x));
  return Array.from(fromSets).sort((a,b) => a.localeCompare(b));
}

function setsForExercise(exName) {
  const key = norm(exName);
  return loadSets().filter(s => norm(s.exercise) === key);
}

function lastSetForExercise(exName) {
  const arr = setsForExercise(exName);
  if (!arr.length) return null;
  return arr.slice().sort((a,b) => (a.date === b.date ? (a.createdAt||0)-(b.createdAt||0) : a.date.localeCompare(b.date))).at(-1);
}

function bestSetForExercise(exName) {
  const arr = setsForExercise(exName);
  let best = null;
  let bestVal = -1;
  for (const s of arr) {
    const v = epley1RM(s.weight, s.reps);
    if (v > bestVal) { bestVal = v; best = s; }
  }
  return { best, bestVal: bestVal > 0 ? bestVal : 0 };
}

function sparkPoints(exName, n = 18) {
  const arr = setsForExercise(exName).slice().sort((a,b) => (a.date === b.date ? (a.createdAt||0)-(b.createdAt||0) : a.date.localeCompare(b.date)));
  const tail = arr.slice(-n);
  return tail.map(s => epley1RM(s.weight, s.reps)).filter(v => v > 0);
}

/* ---------------- Drawing (no colors specified by user; keep neutral) ---------------- */
function clearCanvas(ctx, canvas) {
  ctx.clearRect(0,0,canvas.width, canvas.height);
}

function drawLineChart(ctx, canvas, values) {
  clearCanvas(ctx, canvas);
  if (!values || values.length < 2) return false;

  const w = canvas.width, h = canvas.height;
  const pad = 18;

  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const range = (maxY - minY) || 1;

  const x = (i) => pad + (i * (w - pad*2)) / (values.length - 1);
  const y = (v) => (h - pad) - ((v - minY) / range) * (h - pad*2);

  // axes
  ctx.globalAlpha = 0.35;
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
  values.forEach((v,i) => {
    const xx = x(i), yy = y(v);
    if (i === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.stroke();

  // end label
  ctx.font = "12px system-ui";
  ctx.globalAlpha = 0.8;
  ctx.fillText(`~${Math.round(values.at(-1))}`, pad, 14);
  ctx.globalAlpha = 1;

  // dots
  values.forEach((v,i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(v), 2.2, 0, Math.PI*2);
    ctx.fill();
  });

  return true;
}

function drawSparkline(canvas, values) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width, canvas.height);
  if (!values || values.length < 2) return;

  const w = canvas.width, h = canvas.height;
  const pad = 6;

  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const range = (maxY - minY) || 1;

  const x = (i) => pad + (i * (w - pad*2)) / (values.length - 1);
  const y = (v) => (h - pad) - ((v - minY) / range) * (h - pad*2);

  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v,i) => {
    const xx = x(i), yy = y(v);
    if (i === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.stroke();
}

/* ---------------- Exercises screen ---------------- */
function renderExercises() {
  const q = (exerciseSearch.value || "").trim().toLowerCase();
  const names = getAllExerciseNames().filter(n => n.toLowerCase().includes(q));

  exerciseCount.textContent = `${names.length} exercise${names.length === 1 ? "" : "s"}`;
  if (!names.length) {
    exerciseList.innerHTML = `<div class="item"><div class="itemTitle">No exercises yet.</div><div class="itemMeta">Add one, then log a set.</div></div>`;
    return;
  }

  exerciseList.innerHTML = names.map(name => {
    const last = lastSetForExercise(name);
    const { best, bestVal } = bestSetForExercise(name);
    const lastText = last ? `${last.weight}×${last.reps} · ${formatDate(last.date)}` : "No sets yet";
    const bestText = best ? `${best.weight}×${best.reps}` : "—";
    const best1rm = bestVal ? `~${Math.round(bestVal)} 1RM` : "—";

    return `
      <div class="item exerciseCard" data-ex="${safe(name)}">
        <div class="exerciseLeft">
          <div class="exerciseName">${safe(name)}</div>
          <div class="exerciseMeta">
            <span>Last: ${safe(lastText)}</span>
            <span>Best: ${safe(bestText)}</span>
            <span>${safe(best1rm)}</span>
          </div>
        </div>
        <canvas class="spark" width="90" height="36" data-spark="${safe(name)}"></canvas>
      </div>
    `;
  }).join("");

  // attach click handlers + sparklines
  $$$(".exerciseCard").forEach(card => {
    card.addEventListener("click", () => openExercise(card.getAttribute("data-ex")));
  });
  $$$("canvas[data-spark]").forEach(c => {
    const name = c.getAttribute("data-spark");
    const pts = sparkPoints(name, 18);
    drawSparkline(c, pts);
  });
}

/* ---------------- Sheet (exercise detail) ---------------- */
function openExercise(name) {
  currentExercise = name;
  sheetTitle.textContent = name;
  sheet.hidden = false;
  sheet.setAttribute("aria-hidden", "false");
  vibrate(12);

  // init date
  detailDate.value = todayISO();

  renderExerciseDetail();
}

function closeSheet() {
  sheet.hidden = true;
  sheet.setAttribute("aria-hidden", "true");
  currentExercise = null;
}

sheetScrim.addEventListener("click", closeSheet);
sheetClose.addEventListener("click", closeSheet);

function renderExerciseDetail() {
  if (!currentExercise) return;

  const arr = setsForExercise(currentExercise)
    .slice()
    .sort((a,b) => (a.date === b.date ? (b.createdAt||0)-(a.createdAt||0) : b.date.localeCompare(a.date)));

  const last = lastSetForExercise(currentExercise);
  const { best, bestVal } = bestSetForExercise(currentExercise);

  // stats
  bestSetEl.textContent = best ? `${best.weight}×${best.reps}` : "—";
  best1rmEl.textContent = bestVal ? `~${Math.round(bestVal)}` : "—";
  lastTrainedEl.textContent = last ? formatDate(last.date) : "—";
  sheetSub.textContent = last ? `Last: ${last.weight}×${last.reps} · ${formatDate(last.date)}` : "No sets yet";

  // chart
  const pts = setsForExercise(currentExercise)
    .slice()
    .sort((a,b) => (a.date === b.date ? (a.createdAt||0)-(b.createdAt||0) : a.date.localeCompare(b.date)))
    .slice(-30)
    .map(s => epley1RM(s.weight, s.reps))
    .filter(v => v > 0);

  const ok = drawLineChart(detailCtx, detailCanvas, pts);
  detailEmpty.textContent = ok ? "" : "Log at least 2 sets to see a trend.";

  // history list
  if (!arr.length) {
    detailHistory.innerHTML = `<div class="item"><div class="itemTitle">No sets yet.</div><div class="itemMeta">Add one above.</div></div>`;
  } else {
    detailHistory.innerHTML = arr.slice(0, 30).map(s => `
      <div class="item">
        <div class="itemTop">
          <div class="itemTitle">${safe(currentExercise)}</div>
          <div class="itemMeta">${formatDate(s.date)}</div>
        </div>
        <div class="pill">${s.weight} × ${s.reps}</div>
      </div>
    `).join("");
  }
}

/* ---------------- Logging ---------------- */
function addSet(exercise, date, weight, reps) {
  const ex = (exercise || "").trim();
  const w = Number(weight);
  const r = Number(reps);

  if (!ex || !date || !w || !r) return { ok:false, msg:"Missing fields" };

  const set = {
    id: crypto.randomUUID(),
    exercise: ex,
    date,
    weight: w,
    reps: r,
    createdAt: Date.now(),
  };

  const sets = loadSets();
  sets.push(set);
  saveSets(sets);
  return { ok:true, set };
}

function renderRecent() {
  const sets = loadSets().slice().reverse().slice(0, 8);
  if (!sets.length) {
    recentList.innerHTML = `<div class="item"><div class="itemTitle">No sets yet.</div><div class="itemMeta">Log your first set.</div></div>`;
    return;
  }
  recentList.innerHTML = sets.map(s => `
    <div class="item">
      <div class="itemTop">
        <div class="itemTitle">${safe(s.exercise)}</div>
        <div class="itemMeta">${formatDate(s.date)}</div>
      </div>
      <div class="pill">${s.weight} × ${s.reps}</div>
    </div>
  `).join("");
}

/* quick reps buttons */
$$$(".quickReps").forEach(btn => {
  btn.addEventListener("click", () => {
    logReps.value = btn.dataset.reps;
    logWeight.focus();
    vibrate(10);
  });
});
$$$(".quickReps2").forEach(btn => {
  btn.addEventListener("click", () => {
    detailReps.value = btn.dataset.reps;
    detailWeight.focus();
    vibrate(10);
  });
});

/* log tab actions */
logTodayBtn.addEventListener("click", () => { logDate.value = todayISO(); toast("Today"); vibrate(10); });

logAddBtn.addEventListener("click", () => {
  const res = addSet(logExercise.value, logDate.value, logWeight.value, logReps.value);
  if (!res.ok) {
    toast("Fill exercise, weight, reps.");
    shake($$(".tab[data-tab='log'] .card"));
    vibrate(10);
    return;
  }
  toast("Set added.");
  vibrate(15);
  logWeight.value = "";
  logReps.value = "";
  logWeight.focus();

  // keep in sync
  renderRecent();
  renderExercises();
  renderCharts();
});

/* detail actions */
detailTodayBtn.addEventListener("click", () => { detailDate.value = todayISO(); toast("Today"); vibrate(10); });

detailAddBtn.addEventListener("click", () => {
  if (!currentExercise) return;
  const res = addSet(currentExercise, detailDate.value, detailWeight.value, detailReps.value);
  if (!res.ok) {
    toast("Fill weight and reps.");
    shake($$(".sheetPanel"));
    vibrate(10);
    return;
  }
  toast("Set added.");
  vibrate(15);
  detailWeight.value = "";
  detailReps.value = "";
  detailWeight.focus();

  renderExerciseDetail();
  renderExercises();
  renderCharts();
});

detailDeleteExerciseBtn.addEventListener("click", () => {
  if (!currentExercise) return;
  const choice = prompt(
    `Rename exercise:\n\n- Type a NEW name to rename\n- Type DELETE to remove from your exercise list\n\n(Logged sets remain stored.)`,
    currentExercise
  );
  if (!choice) return;

  const trimmed = choice.trim();
  if (!trimmed) return;

  if (trimmed.toUpperCase() === "DELETE") {
    const list = loadExercises().filter(x => norm(x) !== norm(currentExercise));
    saveExercises(list);
    toast("Removed from list.");
    vibrate(12);
    closeSheet();
    renderExercises();
    return;
  }

  // rename in sets + list
  const sets = loadSets();
  const from = norm(currentExercise);
  const toName = trimmed;

  let changed = 0;
  for (const s of sets) {
    if (norm(s.exercise) === from) { s.exercise = toName; changed++; }
  }
  saveSets(sets);

  const list = loadExercises();
  const kept = list.filter(x => norm(x) !== from);
  kept.push(toName);
  saveExercises(Array.from(new Set(kept)).sort((a,b)=>a.localeCompare(b)));

  toast(`Renamed (${changed} sets).`);
  vibrate(12);

  currentExercise = toName;
  sheetTitle.textContent = toName;
  renderExerciseDetail();
  renderExercises();
  renderCharts();
});

/* exercises screen actions */
exerciseSearch.addEventListener("input", renderExercises);

addExerciseBtn.addEventListener("click", () => {
  const name = prompt("New exercise name:");
  if (!name) return;
  const ex = name.trim();
  if (!ex) return;
  const list = loadExercises();
  if (!list.some(x => norm(x) === norm(ex))) list.push(ex);
  saveExercises(list.sort((a,b)=>a.localeCompare(b)));
  toast("Exercise added.");
  vibrate(10);
  renderExercises();
});

todayJumpBtn.addEventListener("click", () => {
  // show todays sets quickly via opening log + setting today
  goTab("log");
  logDate.value = todayISO();
  toast("Today");
});

quickAddTop.addEventListener("click", () => {
  goTab("log");
  logExercise.focus();
});

/* ---------------- Charts screen ---------------- */
function renderCharts() {
  const sets = loadSets();
  statTotalSets.textContent = String(sets.length);

  const weekStart = startOfWeekISO(new Date());
  const thisWeek = sets.filter(s => s.date >= weekStart).length;
  statThisWeek.textContent = String(thisWeek);

  const names = getAllExerciseNames();
  chartsExercise.innerHTML = names.length
    ? names.map(n => `<option value="${safe(n)}">${safe(n)}</option>`).join("")
    : `<option value="">No data</option>`;

  if (!names.length) {
    chartsEmpty.textContent = "Log some sets first.";
    chartsCtx.clearRect(0,0,chartsCanvas.width, chartsCanvas.height);
    return;
  }

  chartsEmpty.textContent = "";
  drawChartsExercise(names[0]);
}

function drawChartsExercise(name) {
  const pts = setsForExercise(name)
    .slice()
    .sort((a,b) => (a.date === b.date ? (a.createdAt||0)-(b.createdAt||0) : a.date.localeCompare(b.date)))
    .slice(-30)
    .map(s => epley1RM(s.weight, s.reps))
    .filter(v => v > 0);

  const ok = drawLineChart(chartsCtx, chartsCanvas, pts);
  chartsEmpty.textContent = ok ? "" : "Need at least 2 sets for a trend.";
}

chartsExercise.addEventListener("change", () => {
  const ex = chartsExercise.value;
  if (!ex) return;
  drawChartsExercise(ex);
});

/* ---------------- Backup ---------------- */
exportBtn.addEventListener("click", () => {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    sets: loadSets(),
    exercises: loadExercises(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lightweight-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Exported.");
  vibrate(10);
});

importFile.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.sets)) throw new Error("Bad format");
    saveSets(parsed.sets);
    if (Array.isArray(parsed.exercises)) saveExercises(parsed.exercises);
    toast("Imported.");
    vibrate(12);
    renderExercises();
    renderRecent();
    renderCharts();
  } catch {
    toast("Import failed.");
    shake($$(".screen"));
    vibrate(10);
  } finally {
    importFile.value = "";
  }
});

clearAllBtn.addEventListener("click", () => {
  const ok = confirm("Clear all data? This cannot be undone.");
  if (!ok) return;
  localStorage.removeItem(SETS_KEY);
  localStorage.removeItem(EX_KEY);
  toast("Cleared.");
  vibrate(15);
  renderExercises();
  renderRecent();
  renderCharts();
});

/* ---------------- Init ---------------- */
function init() {
  // default dates
  logDate.value = todayISO();
  detailDate.value = todayISO();

  // initial renders
  renderExercises();
  renderRecent();
  renderCharts();

  // default tab
  goTab("exercises");
}

init();
