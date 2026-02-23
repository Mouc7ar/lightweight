:root{
  --bg:#0b0f14;
  --card:#101826;
  --text:#e9eefc;
  --muted:#9aa7c5;
  --border:rgba(255,255,255,.10);
  --border2:rgba(255,255,255,.14);
  --shadow: 0 10px 30px rgba(0,0,0,.38);

  --primary:#5b7cfa;
  --danger:#ff5a66;

  --radius:18px;
  --radius2:14px;
}

*{box-sizing:border-box;}
html,body{height:100%;}
body{
  margin:0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  background: radial-gradient(1200px 500px at 30% -10%, rgba(91,124,250,.12), transparent 55%),
              radial-gradient(900px 400px at 90% 0%, rgba(0,255,190,.06), transparent 60%),
              linear-gradient(180deg, #070b12, var(--bg));
  color:var(--text);
}

/* Topbar */
.topbar{
  position: sticky;
  top:0;
  z-index:10;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 14px 14px 10px;
  background: rgba(11,15,20,.72);
  backdrop-filter: blur(10px);
  border-bottom:1px solid var(--border);
}
.appname{font-weight: 950; letter-spacing:.2px; font-size: 16px;}
.subtitle{color:var(--muted); font-size: 13px; margin-top: 2px;}
.topbar-left{display:flex; flex-direction:column; gap:2px;}

.iconbtn{
  border:1px solid var(--border);
  background: rgba(255,255,255,.06);
  color: var(--text);
  width: 42px;
  height: 38px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 900;
  cursor:pointer;
  transition: transform .12s ease, border-color .12s ease;
}
.iconbtn:active{transform: scale(.98);}
.iconbtn:focus-visible{outline: none; border-color: rgba(91,124,250,.55);}

/* Layout */
.screen{
  max-width: 560px;
  margin: 0 auto;
  padding: 12px 12px 92px;
  display:grid;
  gap: 12px;
}

.card{
  background: rgba(16,24,38,.86);
  border:1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  box-shadow: var(--shadow);
}
.card.tight{padding: 12px;}

.sectionTitle{
  font-weight: 900;
  font-size: 14px;
  letter-spacing: .2px;
}
.muted{color:var(--muted); font-size: 13px;}

.row{
  display:flex;
  gap: 10px;
  align-items:center;
  justify-content:space-between;
}

.label{
  display:block;
  color: var(--muted);
  font-size: 13px;
  margin: 12px 0 6px;
}

.input{
  width:100%;
  padding: 12px 12px;
  border-radius: var(--radius2);
  border:1px solid var(--border);
  background: rgba(0,0,0,.18);
  color: var(--text);
  outline:none;
  font-size: 16px; /* iOS zoom fix */
  transition: border-color .12s ease, transform .12s ease;
}
.input:focus{
  border-color: rgba(91,124,250,.55);
}
.input:active{transform: scale(.999);}

.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
.grid3{
  display:grid;
  grid-template-columns: repeat(3,1fr);
  gap: 10px;
}

.btn{
  width:100%;
  padding: 12px 12px;
  border-radius: var(--radius2);
  border:1px solid var(--border);
  background: rgba(255,255,255,.06);
  color: var(--text);
  font-weight: 900;
  font-size: 14px;
  cursor:pointer;
  transition: transform .12s ease, border-color .12s ease;
}
.btn:active{transform: scale(.99);}
.btn:focus-visible{outline:none; border-color: rgba(91,124,250,.55);}

.btn-primary{
  background: rgba(91,124,250,.92);
  border-color: rgba(91,124,250,.45);
  color:white;
}
.btn-danger{
  background: rgba(255,90,102,.16);
  border-color: rgba(255,90,102,.28);
  color:#ffd0d4;
}

.btn-secondary{
  background: rgba(255,255,255,.06);
}

.chip{
  border:1px solid var(--border);
  background: rgba(255,255,255,.06);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 13px;
  cursor:pointer;
}
.chip:focus-visible{outline:none; border-color: rgba(91,124,250,.55);}

.quick{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.list{
  display:grid;
  gap: 10px;
  margin-top: 12px;
}

.item{
  border:1px solid var(--border);
  background: rgba(0,0,0,.16);
  border-radius: 16px;
  padding: 12px;
}
.itemTop{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  gap: 10px;
}
.itemTitle{font-weight: 950;}
.itemMeta{color:var(--muted); font-size: 13px;}

.pill{
  display:inline-block;
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(91,124,250,.12);
  border:1px solid rgba(91,124,250,.25);
  color:#cfe0ff;
  font-size: 13px;
  font-weight: 900;
}

canvas{
  width:100%;
  height:auto;
  margin-top: 12px;
  border-radius: 16px;
  border:1px solid var(--border);
  background: rgba(0,0,0,.12);
}

/* Bottom tabbar */
.tabbar{
  position: fixed;
  left:0; right:0; bottom:0;
  padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
  background: rgba(11,15,20,.78);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  z-index: 20;
}
.tabbtn{
  border:1px solid var(--border);
  background: rgba(255,255,255,.04);
  color: var(--text);
  border-radius: 14px;
  padding: 12px 10px;
  cursor:pointer;
  font-weight: 900;
  transition: border-color .12s ease, transform .12s ease;
}
.tabbtn:active{transform: scale(.99);}
.tabbtn.active{
  border-color: rgba(91,124,250,.45);
  background: rgba(91,124,250,.10);
}

/* Stats */
.stat{
  border:1px solid var(--border);
  background: rgba(0,0,0,.12);
  border-radius: 16px;
  padding: 12px;
}
.statNum{font-weight: 1000; font-size: 18px;}
.statLbl{color: var(--muted); font-size: 12px; margin-top: 4px;}

.miniStat{
  border:1px solid var(--border);
  background: rgba(0,0,0,.12);
  border-radius: 16px;
  padding: 10px;
}
.miniNum{font-weight: 1000; font-size: 14px;}
.miniLbl{color: var(--muted); font-size: 12px; margin-top: 4px;}

/* Exercise cards */
.exerciseCard{
  display:flex;
  gap: 12px;
  align-items:center;
  justify-content:space-between;
  cursor:pointer;
  transition: transform .12s ease, border-color .12s ease;
}
.exerciseCard:active{transform: scale(.995);}
.exerciseLeft{
  display:flex;
  flex-direction:column;
  gap: 6px;
  min-width: 0;
}
.exerciseName{
  font-weight: 1000;
  font-size: 15px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.exerciseMeta{
  color: var(--muted);
  font-size: 12px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
.spark{
  width: 90px;
  height: 36px;
  border-radius: 12px;
  border:1px solid var(--border);
  background: rgba(0,0,0,.10);
}

/* Sheet */
.sheet{
  position: fixed;
  inset: 0;
  z-index: 50;
}
.sheetScrim{
  position:absolute;
  inset:0;
  background: rgba(0,0,0,.45);
}
.sheetPanel{
  position:absolute;
  left:0; right:0; bottom:0;
  background: rgba(16,24,38,.94);
  border-top: 1px solid var(--border2);
  border-radius: 22px 22px 0 0;
  max-height: 88vh;
  overflow:auto;
  padding: 12px 12px calc(16px + env(safe-area-inset-bottom));
  transform: translateY(18px);
  animation: sheetIn .18s ease-out forwards;
}
@keyframes sheetIn{
  from{transform: translateY(18px); opacity:.6}
  to{transform: translateY(0); opacity:1}
}
.sheetHeader{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 10px;
  padding: 6px 4px 10px;
}
.sheetTitle{font-weight: 1000; font-size: 16px;}
.sheetBody{display:grid; gap: 12px;}

.fileBtn{display:flex; align-items:center; justify-content:center;}

/* Toast */
.toast{
  position: fixed;
  left: 50%;
  bottom: calc(86px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  background: rgba(0,0,0,.55);
  border:1px solid var(--border2);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 14px;
  backdrop-filter: blur(10px);
  max-width: 92vw;
  z-index: 60;
  animation: toastIn .14s ease-out;
}
@keyframes toastIn{
  from{transform: translateX(-50%) translateY(8px); opacity:0}
  to{transform: translateX(-50%) translateY(0); opacity:1}
}

/* Functional “effect”: shake on errors */
.shake{animation: shake .22s ease-in-out;}
@keyframes shake{
  0%{transform:translateX(0)}
  25%{transform:translateX(-6px)}
  50%{transform:translateX(6px)}
  75%{transform:translateX(-4px)}
  100%{transform:translateX(0)}
}
