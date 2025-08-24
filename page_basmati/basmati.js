/* Reads ../assets/cat/Rice.xlsx and renders:
   - Desktop: left sidebar categories
   - Mobile: top <select> categories
   - Clean white cards with full text (no truncation), no filters, no skeletons
*/
const XLSX_URL = "../assets/cat/Rice.xlsx";

const els = {
  tabs: document.getElementById("categoryTabs"),
  grid: document.getElementById("cardsGrid"),
  title: document.getElementById("activeCategoryTitle"),
  empty: document.getElementById("emptyState"),
  loading: document.getElementById("loading"),
  catSelect: document.getElementById("categorySelect"),
};

let allRows = [];
let categories = [];
let activeCategory = "All";

// --------- Data ----------
async function loadExcel() {
  const res = await fetch(XLSX_URL);
  if (!res.ok) throw new Error(`Failed to load Excel: ${res.status}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });

  return rows.map((r) => ({
    id: (r["Product ID"] ?? "").toString().trim(),
    type: (r["Type"] ?? "").toString().trim(),
    category: (r["Category"] ?? "").toString().trim(),
    length: (r["Average Grain Length"] ?? "").toString().trim(),
    color: (r["Color"] ?? "").toString().trim(),
    desc: (r["Description"] ?? "").toString().trim(),
  }));
}

function buildCategories(rows) {
  const set = new Set(rows.map(r => r.category).filter(Boolean));
  categories = ["All", ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
}

// --------- UI: categories ----------
function buildDesktopTabs() {
  els.tabs.innerHTML = "";
  const frag = document.createDocumentFragment();
  categories.forEach(label => {
    const count = label === "All" ? allRows.length : allRows.filter(r => r.category === label).length;
    const btn = document.createElement("button");
    btn.className = "cat-tab";
    btn.setAttribute("role","tab");
    btn.dataset.category = label;
    btn.setAttribute("aria-selected", label === activeCategory ? "true" : "false");
    btn.innerHTML = `<span>${label}</span><span class="cat-count">${count}</span>`;
    btn.addEventListener("click", () => setCategory(label));
    frag.appendChild(btn);
  });
  els.tabs.appendChild(frag);
}

function buildMobileSelect() {
  els.catSelect.innerHTML = "";
  categories.forEach(label => {
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label;
    els.catSelect.appendChild(opt);
  });
  els.catSelect.value = activeCategory;
  els.catSelect.addEventListener("change", (e) => setCategory(e.target.value));
}

function setCategory(label) {
  activeCategory = label;
  // update desktop tabs
  document.querySelectorAll(".cat-tab").forEach(b =>
    b.setAttribute("aria-selected", b.dataset.category === label ? "true" : "false")
  );
  // update mobile select
  if (els.catSelect.value !== label) els.catSelect.value = label;
  // title + cards
  els.title.textContent = label;
  renderCards();
}

// --------- UI: cards ----------
function renderCards() {
  let rows = activeCategory === "All" ? allRows : allRows.filter(r => r.category === activeCategory);

  els.grid.innerHTML = "";
  if (!rows.length) {
    els.grid.hidden = true;
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;

  const frag = document.createDocumentFragment();
  rows.forEach(r => {
    const card = document.createElement("article");
    card.className = "card";
    // Build card content
    const head = document.createElement("header");
    const type = document.createElement("h3");
    type.className = "type";
    type.textContent = r.type || r.id || "Basmati";
    const badges = document.createElement("div");
    badges.className = "badges";
    if (r.category) { const b = document.createElement("span"); b.className = "badge"; b.textContent = r.category; badges.appendChild(b); }
    if (r.id)    { const b = document.createElement("span"); b.className = "badge"; b.textContent = `#${r.id}`; badges.appendChild(b); }
    head.appendChild(type); head.appendChild(badges);

    const desc = document.createElement("p");
    desc.className = "desc";
    desc.textContent = r.desc || "—";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `
      <div class="item"><span class="label">Avg. Grain Length</span><span class="value">${r.length || "N/A"}</span></div>
      <div class="item"><span class="label">Type</span><span class="value">${r.type || "—"}</span></div>
      <div class="item"><span class="label">Color</span><span class="value">${r.color || "—"}</span></div>
    `;

    card.appendChild(head);
    card.appendChild(desc);
    card.appendChild(meta);
    frag.appendChild(card);
  });

  els.grid.appendChild(frag);
  els.grid.hidden = false;
}

// --------- Minimal nav behavior (no global script.js required) ----------
function wireNav() {
  const open = document.querySelector(".hamburger-icon");
  const overlay = document.querySelector(".mobile-nav");
  const close = document.querySelector(".mobile-nav .close-btn");
  open?.addEventListener("click", () => overlay?.classList.add("open"));
  close?.addEventListener("click", () => overlay?.classList.remove("open"));

  // Keep header/footer links exactly as-is, but make them navigate to the homepage sections
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const hash = a.getAttribute("href");
      window.location.href = `../index.html${hash}`;
    });
  });
}

// --------- Init ----------
(async function init(){
  wireNav();

  try {
    allRows = await loadExcel();
    buildCategories(allRows);
    buildDesktopTabs();
    buildMobileSelect();
    setCategory("All");
  } catch (err) {
    console.error(err);
    els.empty.hidden = false;
    els.empty.innerHTML = "<p>Could not load the catalog. Please check the Excel file path.</p>";
  } finally {
    els.loading.hidden = true;
  }
})();
