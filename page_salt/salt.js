
const XLSX_URL = "../assets/cat/Salt.xlsx";

const el = {
  sheetTabs: document.getElementById("sheetTabs"),
  tableWrap: document.getElementById("tableWrap"),
  heading: document.getElementById("tableHeading"),
  empty: document.getElementById("emptyState"),
  badge: document.getElementById("activeFilterBadge"),
  // mobile
  sheetSelect: document.getElementById("sheetSelect"),
  catSelectWrap: document.getElementById("catSelectWrap"),
  catSelect: document.getElementById("catSelect"),
};

let workbook = null;
let sheetNames = [];
let activeSheet = null;

const cache = new Map(); // sheetName -> { rows, keys, idKey, catKey, typeKey }

const S = (v) => (v == null ? "" : String(v).trim());
const isBadKey = (k) =>
  !k || /^\s*$/.test(k) || /^#?REF!?(_\d+)?$/i.test(k) || /^__EMPTY/i.test(k) || /^Unnamed:?/i.test(k);

function escapeHtml(s){
  return String(s ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

/* Load/Parse */
async function loadWorkbook(){
  const res = await fetch(XLSX_URL);
  if (!res.ok) throw new Error(`Failed to load Excel: ${res.status}`);
  const buf = await res.arrayBuffer();
  workbook = XLSX.read(buf, { type: "array" });
  sheetNames = workbook.SheetNames || [];
}

function parseSheet(name){
  const ws = workbook.Sheets[name];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });

  if (!raw.length) {
    const meta = { rows: [], keys: [], idKey: null, catKey: null, typeKey: null };
    cache.set(name, meta);
    return meta;
  }

  // union of keys across rows
  const keySet = new Set();
  raw.forEach(r => Object.keys(r).forEach(k => { if (!isBadKey(k)) keySet.add(k); }));
  const keys = [...keySet];

  const idKey   = keys[0] || null;
  const catKey  = keys.find(k => /^category$/i.test(k)) || null;
  const typeKey = keys.find(k => /^(type|variety|grade)$/i.test(k)) || null;

  const rows = raw.map(r => {
    const obj = {};
    keys.forEach(k => obj[k] = S(r[k]));
    return obj;
  });

  const meta = { rows, keys, idKey, catKey, typeKey };
  cache.set(name, meta);
  return meta;
}


/* ---------- Desktop tabs ---------- */
function buildSheetTabs(){
  el.sheetTabs.innerHTML = "";
  const frag = document.createDocumentFragment();

  sheetNames.forEach((name) => {
    const meta = cache.get(name) || parseSheet(name);
    const hasCats = meta.catKey
      ? [...new Set(meta.rows.map(r => r[meta.catKey]).filter(Boolean))].length > 0
      : false;

    const tab = document.createElement("div");
    tab.className = "sheet-tab";
    tab.dataset.sheet = name;

    const btn = document.createElement("button");
    btn.className = "sheet-btn";
    btn.type = "button";
    btn.innerHTML = `<span class="sheet-label">${escapeHtml(name)}</span>`;
    btn.addEventListener("click", () => activateSheet(name));
    tab.appendChild(btn);

    if (hasCats) {
      const caret = document.createElement("button");
      caret.type = "button";
      caret.className = "sheet-caret";
      caret.setAttribute("aria-label", `Categories in ${name}`);
      caret.innerHTML = `<span class="caret">▾</span>`;
      caret.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDropdown(tab, name);
      });

      const dd = document.createElement("div");
      dd.className = "sheet-dropdown";
      dd.hidden = true;

      tab.appendChild(caret);
      tab.appendChild(dd);
    }

    frag.appendChild(tab);
  });

  el.sheetTabs.appendChild(frag);

  if (!activeSheet && sheetNames.length) activateSheet(sheetNames[0]);

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".sheet-dropdown:not([hidden])").forEach(d => {
      if (!d.parentElement.contains(e.target)) d.hidden = true;
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".sheet-dropdown:not([hidden])").forEach(d => d.hidden = true);
    }
  });
}

function activateSheet(name){
  activeSheet = name;
  document.querySelectorAll(".sheet-tab").forEach(t =>
    t.toggleAttribute("data-active", t.dataset.sheet === name)
  );

  const meta = cache.get(name) || parseSheet(name);
  el.heading.textContent = name;
  el.badge.hidden = true;
  renderTable(meta.rows, meta);

  // build dropdown content lazily (desktop)
  const tab = [...document.querySelectorAll(".sheet-tab")].find(t => t.dataset.sheet === name);
  const dd = tab?.querySelector(".sheet-dropdown");
  if (dd && !dd.hasChildNodes()) buildDropdown(dd, meta, name);

  // update mobile selectors
  syncMobileSelectors(meta, name);
}

/* Desktop dropdown (Categories only) */
function toggleDropdown(tab, name){
  document.querySelectorAll(".sheet-dropdown:not([hidden])").forEach(d => {
    if (d !== tab.querySelector(".sheet-dropdown")) d.hidden = true;
  });
  const dd = tab.querySelector(".sheet-dropdown");
  const meta = cache.get(name) || parseSheet(name);
  if (!dd.hasChildNodes()) buildDropdown(dd, meta, name);
  dd.hidden = !dd.hidden;
}

function buildDropdown(dd, meta, sheetName){
  dd.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "dd-item dd-all";
  allBtn.textContent = "All items";
  allBtn.addEventListener("click", () => {
    el.heading.textContent = sheetName;
    el.badge.hidden = true;
    renderTable(meta.rows, meta);
    dd.hidden = true;
    setMobileCategory("");
  });
  dd.appendChild(allBtn);

  if (meta.catKey) {
    const list = [...new Set(meta.rows.map(r => r[meta.catKey]).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    if (list.length) {
      const title = document.createElement("div");
      title.className = "dd-title";
      title.textContent = "By Category";
      dd.appendChild(title);

      list.forEach(val => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dd-item";
        btn.textContent = val;
        btn.addEventListener("click", () => {
          const rows = meta.rows.filter(r => r[meta.catKey] === val);
          el.heading.textContent = sheetName;
          el.badge.hidden = false;
          el.badge.textContent = `Category: ${val}`;
          renderTable(rows, meta);
          dd.hidden = true;
          setMobileCategory(val);
        });
        dd.appendChild(btn);
      });
    }
  }
}

/* ---------- Mobile selectors ---------- */
function buildMobileSelectors(){
  // build main category (sheet) list
  el.sheetSelect.innerHTML = "";
  sheetNames.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n; opt.textContent = n; // label is "Main category" in HTML
    el.sheetSelect.appendChild(opt);
  });

  el.sheetSelect.onchange = () => {
    const name = el.sheetSelect.value;
    if (name && name !== activeSheet) activateSheet(name);
  };

  el.catSelect.onchange = () => {
    const meta = cache.get(activeSheet);
    const val = el.catSelect.value;
    if (!val) {
      el.heading.textContent = activeSheet;
      el.badge.hidden = true;
      renderTable(meta.rows, meta);
      return;
    }
    const rows = meta.rows.filter(r => r[meta.catKey] === val);
    el.heading.textContent = activeSheet;
    el.badge.hidden = false;
    el.badge.textContent = `Category: ${val}`;
    renderTable(rows, meta);
  };
}

function syncMobileSelectors(meta, name){
  el.sheetSelect.value = name;
  if (meta.catKey) {
    const list = [...new Set(meta.rows.map(r => r[meta.catKey]).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    if (list.length) {
      el.catSelectWrap.hidden = false;
      el.catSelect.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = ""; optAll.textContent = "All categories";
      el.catSelect.appendChild(optAll);
      list.forEach(val => {
        const o = document.createElement("option");
        o.value = val; o.textContent = val;
        el.catSelect.appendChild(o);
      });
      el.catSelect.value = ""; // default to All
    } else {
      el.catSelectWrap.hidden = true;
    }
  } else {
    el.catSelectWrap.hidden = true;
  }
}

function setMobileCategory(val){
  if (!el.catSelectWrap.hidden) {
    el.catSelect.value = val || "";
  }
}

/* ---------- Render table ---------- */
function renderTable(rows, meta){
  el.tableWrap.innerHTML = "";

  if (!rows || !rows.length) {
    el.tableWrap.hidden = true;
    el.empty.hidden = false;
    return;
  }
  el.empty.hidden = true;

  // 🔧 Build keys from the current rows only (ignore cached meta.keys)
  const keySet = new Set();
  rows.forEach(r => {
    Object.keys(r).forEach(k => { if (!isBadKey(k)) keySet.add(k); });
  });

  // keep only columns with at least one non-empty value
  const usableKeys = [...keySet].filter(k => rows.some(r => S(r[k]).length));

  // keep "important" keys first when they are actually usable
  const ordered = [];
  if (meta.idKey  && usableKeys.includes(meta.idKey))  ordered.push(meta.idKey);
  if (meta.catKey && usableKeys.includes(meta.catKey)) ordered.push(meta.catKey);
  if (meta.typeKey&& usableKeys.includes(meta.typeKey))ordered.push(meta.typeKey);
  usableKeys.forEach(k => { if (!ordered.includes(k)) ordered.push(k); });

  const table = document.createElement("table");
  table.className = "data-table";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  ordered.forEach(k => {
    const th = document.createElement("th");
    th.textContent = k;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(r => {
    const tr = document.createElement("tr");
    ordered.forEach(k => {
      const td = document.createElement("td");
      td.textContent = S(r[k]);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  el.tableWrap.appendChild(table);
  el.tableWrap.hidden = false;
}


/* Init */
(async function init(){
  try {
    await loadWorkbook();
    sheetNames.forEach(n => parseSheet(n)); // warm cache
    buildSheetTabs();
    buildMobileSelectors();
  } catch(err){
    console.error(err);
    el.empty.hidden = false;
    el.empty.innerHTML = "<p>Could not load the catalog. Please check the Excel path: ../assets/cat/Salt.xlsx</p>";
  }
})();
