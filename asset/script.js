/* ============================================================
CLOCK
============================================================ */
function updateClock() {
    const now = new Date();
    let h = now.getHours(),
        m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    document.getElementById("clock").textContent = h + ":" + String(m).padStart(2, "0") + " " + ampm;
}
updateClock();
setInterval(updateClock, 1000);

/* ============================================================
WINDOW MANAGEMENT
============================================================ */
let zTop = 100;
const windows = ["win-about", "win-portfolio", "win-skills", "win-other", "win-contact", "win-notepad"];
const winTitles = {
    "win-about": { icon: "<img src='asset/ico/User Accounts.png' style='width: 14px; height: 14px; vertical-align: sub' />", label: "Angga's Profile" },
    "win-portfolio": { icon: "<img src='asset/ico/Briefcase.png' style='width: 14px; height: 14px; vertical-align: sub' />", label: "My Portfolio" },
    "win-skills": { icon: "<img src='asset/ico/System Properties.png' style='width: 14px; height: 14px; vertical-align: sub' />", label: "Skills & XP" },
    "win-other": { icon: "<img src='asset/ico/Favorites.png' style='width: 14px; height: 14px; vertical-align: sub' />", label: "The Enthusiasm" },
    "win-contact": { icon: "<img src='asset/ico/Outlook Express.png' style='width: 14px; height: 14px; vertical-align: sub' />", label: "Contact Info" },
    "win-notepad": { icon: "<img src='asset/ico/Notepad.png' style='width: 14px; height: 14px; vertical-align: sub' />", label: "README.txt" },
};

function openWindow(id) {
    const win = document.getElementById(id);
    win.classList.remove("minimized");
    win.classList.remove("closed");
    focusWindow(id);
    updateTaskbar();
    // close start menu
    document.getElementById("start-menu").classList.remove("open");
}

function closeWindow(id) {
    document.getElementById(id).classList.add("closed");
    updateTaskbar();
}

function minimizeWin(id) {
    document.getElementById(id).classList.toggle("minimized");
    updateTaskbar();
}

let maximizedStates = {};
function toggleMaximize(id) {
    const win = document.getElementById(id);
    if (maximizedStates[id]) {
        const s = maximizedStates[id];
        win.style.left = s.left;
        win.style.top = s.top;
        win.style.width = s.width;
        win.style.height = s.height;
        delete maximizedStates[id];
    } else {
        maximizedStates[id] = {
            left: win.style.left,
            top: win.style.top,
            width: win.style.width,
            height: win.style.height,
        };
        win.style.left = "0px";
        win.style.top = "0px";
        win.style.width = "100vw";
        win.style.height = "calc(100vh - 30px)";
    }
}

function focusWindow(id) {
    windows.forEach((w) => {
        const el = document.getElementById(w);
        el.classList.remove("focused");
        el.classList.add("inactive");
    });
    const win = document.getElementById(id);
    win.classList.add("focused");
    win.classList.remove("inactive");
    win.style.zIndex = ++zTop;
    updateTaskbar(id);
}

function updateTaskbar(activeId) {
    const area = document.getElementById("taskbar-area");
    area.innerHTML = "";
    windows.forEach((id) => {
        const win = document.getElementById(id);
        if (!win.classList.contains("closed")) {
            const info = winTitles[id];
            const btn = document.createElement("button");
            btn.className = "taskbar-btn" + (id === activeId ? " active" : "");
            btn.innerHTML = info.icon + " " + info.label;
            btn.onclick = () => {
                if (id === activeId) {
                    minimizeWin(id);
                    updateTaskbar();
                } else {
                    focusWindow(id);
                }
            };
            area.appendChild(btn);
        }
    });
}

/* ============================================================
DRAG
============================================================ */
let drag = null;
function startDrag(e, id) {
    if (e.target.closest(".xp-title-btns")) return;
    focusWindow(id);
    const win = document.getElementById(id);
    const rect = win.getBoundingClientRect();
    drag = { id, ox: e.clientX - rect.left, oy: e.clientY - rect.top };
    e.preventDefault();
}

document.addEventListener("mousemove", (e) => {
    if (!drag) return;
    const win = document.getElementById(drag.id);
    let x = e.clientX - drag.ox;
    let y = e.clientY - drag.oy;
    y = Math.max(0, Math.min(y, window.innerHeight - 56));
    x = Math.max(-win.offsetWidth + 60, x);
    win.style.left = x + "px";
    win.style.top = y + "px";
});

document.addEventListener("mouseup", () => (drag = null));

/* ============================================================
RESIZE
============================================================ */
let resz = null;
function startResize(e, id) {
    const win = document.getElementById(id);
    const rect = win.getBoundingClientRect();
    resz = { id, sw: rect.width, sh: rect.height, sx: e.clientX, sy: e.clientY };
    e.preventDefault();
    e.stopPropagation();
}

document.addEventListener("mousemove", (e) => {
    if (!resz) return;
    const win = document.getElementById(resz.id);
    const w = Math.max(280, resz.sw + e.clientX - resz.sx);
    const h = Math.max(180, resz.sh + e.clientY - resz.sy);
    win.style.width = w + "px";
    win.style.height = h + "px";
});

document.addEventListener("mouseup", () => (resz = null));

/* ============================================================
START MENU
============================================================ */
function toggleStart() {
    const sm = document.getElementById("start-menu");
    sm.classList.toggle("open");
}

document.addEventListener("click", (e) => {
    if (!e.target.closest("#start-menu") && !e.target.closest("#start-btn")) {
        document.getElementById("start-menu").classList.remove("open");
    }
});

/* ============================================================
TABS (skills window)
============================================================ */
function showTab(winId, tabName) {
    const tabs = document.querySelectorAll(`#${winId}-tabs .xp-tab`);
    const contents = document.querySelectorAll(`[id^="${winId}-tab-"]`);
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));
    document.getElementById(`${winId}-tab-${tabName}`).classList.add("active");
    const tabIdx = { general: 0, frontend: 1, backend: 2, other: 3 }[tabName];
    if (tabs[tabIdx]) tabs[tabIdx].classList.add("active");
}

/* ============================================================
PORTFOLIO VIEW TOGGLE
============================================================ */
function setView(winId, view) {
    document.getElementById("portfolio-icons").style.display = view === "icons" ? "grid" : "none";
    document.getElementById("portfolio-details").style.display = view === "details" ? "block" : "none";
}

function selectIcon(el, name, year) {
    document.querySelectorAll(".xp-file-icon").forEach((i) => i.classList.remove("selected"));
    el.classList.add("selected");
    document.getElementById("portfolio-statusbar").innerHTML = `<div class="xp-status-pane">1 object selected: ${name}</div><div class="xp-status-pane">Year: ${year}</div>`;
}

function selectRow(row) {
    document.querySelectorAll("#portfolio-details tr").forEach((r) => r.classList.remove("selected"));
    row.classList.add("selected");
}

/* Project detail mini-windows */
const projectData = {
    psikotes: { name: "Psikotes Online Arifindo", url: "https://psikotes.arifindo.com", year: "2024", cat: "HR Technology", desc: "Psikotes online untuk mempermudah proses rekrutmen di PT Arifindo. Meningkatkan efisiensi waktu, penilaian objektif, dan mengurangi kertas." },
    hris: { name: "HRIS Arifindo", url: "https://hris.arifindo.com", year: "2024", cat: "Enterprise Software", desc: "Aplikasi komprehensif untuk kelola SDM: data karyawan, pelamar karier, hasil psikotes, dan sistem absensi terintegrasi." },
    career: { name: "Career Arifindo", url: "https://career.arifindo.com", year: "2024", cat: "Recruitment Portal", desc: "Portal rekrutmen resmi PT Arifindo. Employer branding + seleksi kandidat secara efisien." },
    absensi: { name: "Absensi Arifindo", url: "https://absensi.arifindo.com", year: "2025", cat: "Mobile / PWA", desc: "Aplikasi absensi PWA, support Android dan iOS. Terintegrasi dengan HRIS." },
    payment: { name: "Payment Daru Estates", url: "https://staging.arifindo.com/", year: "2022", cat: "Property Tech", desc: "Aplikasi manajemen transaksi perumahan subsidi Daru Estate Tangerang." },
    daruestates: { name: "Daru Estates", url: "https://daruestates.com", year: "2023", cat: "Company Profile", desc: "Situs company profile perumahan subsidi terbesar di Tangerang." },
    folio: { name: "Folio POS", url: "https://foliopos.com", year: "2018", cat: "Retail Technology", desc: "Aplikasi kasir Android dan web, online dan offline, untuk retail, restoran, dan salon." },
};

function openProjectDetail(key) {
    const p = projectData[key];
    if (!p) return;
    const existing = document.getElementById("win-proj-" + key);
    if (existing) {
        existing.classList.remove("minimized");
        focusWindow("win-proj-" + key);
        return;
    }

    const win = document.createElement("div");
    win.className = "xp-window";
    win.id = "win-proj-" + key;
    win.style.cssText = `width:380px;height:260px;top:${100 + Math.random() * 80}px;left:${200 + Math.random() * 100}px;z-index:${++zTop}`;
    win.innerHTML = `
    <div class="xp-titlebar" onmousedown="startDrag(event,'win-proj-${key}')">
      <img class="xp-titlebar-icon" src="asset/ico/Internet Explorer 6.png" />
      <span class="xp-titlebar-text">${p.name} — Properties</span>
      <div class="xp-title-btns">
        <div class="xp-tbtn xp-tbtn-cls" onclick="this.closest('.xp-window').remove()">✕</div>
      </div>
    </div>
    <div class="xp-body">
      <div class="xp-content thin-scroll">
        <div style="padding:14px">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #eee">
            <img src="asset/ico/Internet Explorer 6.png" style="width: 36px; height: 36px" />
            <div>
              <div style="font-weight:bold;font-size:12px;color:var(--xp-blue)">${p.name}</div>
              <div style="font-size:10px;color:#888">${p.cat} · ${p.year}</div>
            </div>
          </div>
          <div style="font-size:11px;color:#333;line-height:1.7;margin-bottom:12px">${p.desc}</div>
          <div style="font-size:11px;margin-bottom:4px"><b>URL:</b> <a href="${p.url}" target="_blank" class="xp-link">${p.url}</a></div>
          <div style="font-size:11px"><b>Year:</b> ${p.year}</div>
          <div style="margin-top:14px">
            <a href="${p.url}" target="_blank" class="xp-link-btn">🌐 Open Website</a>
          </div>
        </div>
      </div>
    </div>
    <div class="xp-statusbar"><div class="xp-status-pane">Ready</div></div>
    <div class="resize-handle" onmousedown="startResize(event,'win-proj-${key}')"></div>
  `;
    document.body.appendChild(win);
}

/* ============================================================
CONTEXT MENU
============================================================ */
document.getElementById("desktop").addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const menu = document.getElementById("ctx-menu");
    menu.style.left = Math.min(e.clientX, window.innerWidth - 180) + "px";
    menu.style.top = Math.min(e.clientY, window.innerHeight - 160) + "px";
    menu.classList.add("open");
});

document.addEventListener("click", () => {
    document.getElementById("ctx-menu").classList.remove("open");
});

function openAllWindows() {
    windows.forEach((id) => openWindow(id));
}

function cascadeWindows() {
    let x = 30,
        y = 30;
    windows.forEach((id) => {
        const win = document.getElementById(id);
        if (!win.classList.contains("minimized") && !win.classList.contains("closed")) {
            win.style.left = x + "px";
            win.style.top = y + "px";
            x += 28;
            y += 28;
            focusWindow(id);
        }
    });
}

/* ============================================================
DESKTOP ICON CLICK
============================================================ */
document.querySelectorAll(".d-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
        document.querySelectorAll(".d-icon").forEach((i) => i.classList.remove("selected"));
        icon.classList.add("selected");
    });
});

document.getElementById("desktop").addEventListener("click", (e) => {
    if (!e.target.closest(".d-icon")) {
        document.querySelectorAll(".d-icon").forEach((i) => i.classList.remove("selected"));
    }
});

/* ============================================================
INITIAL LAYOUT
============================================================ */
setTimeout(() => {
    openWindow("win-about");
    updateTaskbar("win-about");
}, 300);

/* TOUCH DRAG */
document.addEventListener(
    "touchstart",
    (e) => {
        const titlebar = e.target.closest(".xp-titlebar");
        if (!titlebar || e.target.closest(".xp-title-btns")) return;
        const winEl = titlebar.closest(".xp-window");
        if (!winEl) return;
        focusWindow(winEl.id);
        const touch = e.touches[0];
        const rect = winEl.getBoundingClientRect();
        drag = { id: winEl.id, ox: touch.clientX - rect.left, oy: touch.clientY - rect.top };
        e.preventDefault();
    },
    { passive: false },
);

document.addEventListener(
    "touchmove",
    (e) => {
        if (!drag) return;
        const touch = e.touches[0];
        const win = document.getElementById(drag.id);
        const maxY = window.innerHeight - 36 - 26;
        let x = touch.clientX - drag.ox;
        let y = Math.max(0, Math.min(touch.clientY - drag.oy, maxY));
        x = Math.max(-win.offsetWidth + 60, x);
        win.style.left = x + "px";
        win.style.top = y + "px";
        e.preventDefault();
    },
    { passive: false },
);

document.addEventListener("touchend", () => {
    drag = null;
});

/* TOUCH RESIZE */
document.querySelectorAll(".resize-handle").forEach((handle) => {
    handle.addEventListener(
        "touchstart",
        (e) => {
            const winEl = handle.closest(".xp-window");
            if (!winEl) return;
            const rect = winEl.getBoundingClientRect();
            const touch = e.touches[0];
            resz = { id: winEl.id, sw: rect.width, sh: rect.height, sx: touch.clientX, sy: touch.clientY };
            e.preventDefault();
            e.stopPropagation();
        },
        { passive: false },
    );
});

document.addEventListener(
    "touchmove",
    (e) => {
        if (!resz) return;
        const touch = e.touches[0];
        const win = document.getElementById(resz.id);
        const w = Math.max(280, resz.sw + touch.clientX - resz.sx);
        const h = Math.max(180, resz.sh + touch.clientY - resz.sy);
        win.style.width = w + "px";
        win.style.height = h + "px";
        e.preventDefault();
    },
    { passive: false },
);

document.addEventListener("touchend", () => {
    resz = null;
});

/* DOUBLE TAP ICON TO OPEN */
let lastTap = {};
document.querySelectorAll(".d-icon").forEach((icon) => {
    icon.addEventListener("touchend", (e) => {
        const id = icon.getAttribute("ondblclick")?.match(/'([^']+)'/)?.[1];
        if (!id) return;
        const now = Date.now();
        if (lastTap[id] && now - lastTap[id] < 400) {
            openWindow(id);
            lastTap[id] = 0;
        } else {
            lastTap[id] = now;
        }
    });
});

/* LONG PRESS FOR CONTEXT MENU */
let longPressTimer = null;
document.getElementById("desktop").addEventListener(
    "touchstart",
    (e) => {
        longPressTimer = setTimeout(() => {
            const touch = e.touches[0];
            const menu = document.getElementById("ctx-menu");
            menu.style.left = Math.min(touch.clientX, window.innerWidth - 180) + "px";
            menu.style.top = Math.min(touch.clientY, window.innerHeight - 180) + "px";
            menu.classList.add("open");
        }, 600);
    },
    { passive: true },
);
document.getElementById("desktop").addEventListener("touchend", () => clearTimeout(longPressTimer));
document.getElementById("desktop").addEventListener("touchmove", () => clearTimeout(longPressTimer));

/* DOUBLE TAP TITLEBAR TO MAXIMIZE */
let titleTap = {};
document.addEventListener("touchend", (e) => {
    const titlebar = e.target.closest(".xp-titlebar");
    if (!titlebar || e.target.closest(".xp-title-btns")) return;
    const winEl = titlebar.closest(".xp-window");
    if (!winEl) return;
    const now = Date.now();
    const id = winEl.id;
    if (titleTap[id] && now - titleTap[id] < 400) {
        toggleMaximize(id);
        titleTap[id] = 0;
    } else {
        titleTap[id] = now;
    }
});