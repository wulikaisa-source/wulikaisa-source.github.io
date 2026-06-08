const button = document.querySelector("#langToggle");
const year = document.querySelector("#year");
const translatable = Array.from(document.querySelectorAll("[data-zh][data-en]"));
const publicationList = document.querySelector("#publicationList");
const publicationCount = document.querySelector("#publicationCount");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const themeToggle = document.querySelector("#themeToggle");
const showcaseFrame = document.querySelector("#showcaseFrame");
const showcaseFallback = document.querySelector("#showcaseFallback");
const showcaseIndex = document.querySelector("#showcaseIndex");
const showcaseTitle = document.querySelector("#showcaseTitle");
const showcaseCaption = document.querySelector("#showcaseCaption");
const showcasePrev = document.querySelector("#showcasePrev");
const showcaseNext = document.querySelector("#showcaseNext");

let language = localStorage.getItem("homepage-language") || "zh";
let publicationFilter = "all";
let theme = localStorage.getItem("homepage-theme") || "light";
let showcaseCurrent = 0;
let showcaseTimer;
let publicationsData = Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [];

const showcaseItems = [
  {
    file: "assets/showcase/01-background.pdf",
    title: { zh: "Background", en: "Background" },
    caption: { zh: "高频声波器件与 5G/6G 射频前端研究背景。", en: "Research background in high-frequency acoustic devices and 5G/6G RF front-ends." },
  },
  {
    file: "assets/showcase/02-piezoelectric-materials.pdf",
    title: { zh: "压电材料", en: "Piezoelectric Materials" },
    caption: { zh: "AlScN、LiNbO3 等先进压电材料与薄膜工艺平台。", en: "Advanced piezoelectric materials and thin-film platforms including AlScN and LiNbO3." },
  },
  {
    file: "assets/showcase/03-fin-mounted-resonator.pdf",
    title: { zh: "Fin-mounted Resonator", en: "Fin-mounted Resonator" },
    caption: { zh: "面向毫米波频段的 Fin-mounted 铌酸锂声学谐振器。", en: "Fin-mounted lithium niobate acoustic resonators for mmWave frequencies." },
  },
  {
    file: "assets/showcase/04-sv-saw.pdf",
    title: { zh: "SV-SAW", en: "SV-SAW" },
    caption: { zh: "发表于 Nature Microsystems & Nanoengineering 的 6G cmWave SV-SAW 滤波器工作。", en: "6G cmWave SV-SAW filter work published in Nature Microsystems & Nanoengineering." },
  },
  {
    file: "assets/showcase/05-sn-baw.pdf",
    title: { zh: "SN-BAW", en: "SN-BAW" },
    caption: { zh: "发表于 Nature Microsystems & Nanoengineering 的 SN-BAW 高频声波器件工作。", en: "SN-BAW high-frequency acoustic device work published in Nature Microsystems & Nanoengineering." },
  },
];

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  translatable.forEach((node) => {
    node.textContent = node.dataset[language];
  });
  if (button) button.textContent = language === "zh" ? "EN" : "中文";
  localStorage.setItem("homepage-language", language);
  renderShowcase();
  renderPublications();
}

function applyTheme(nextTheme) {
  theme = nextTheme;
  document.documentElement.dataset.theme = theme;
  if (themeToggle) themeToggle.textContent = theme === "dark" ? "☀" : "☾";
  localStorage.setItem("homepage-theme", theme);
}

function renderShowcase() {
  const item = showcaseItems[showcaseCurrent];
  if (!item) return;
  if (showcaseFrame) showcaseFrame.src = item.file;
  if (showcaseFallback) showcaseFallback.href = item.file;
  if (showcaseIndex) showcaseIndex.textContent = `${String(showcaseCurrent + 1).padStart(2, "0")} / ${String(showcaseItems.length).padStart(2, "0")}`;
  if (showcaseTitle) showcaseTitle.textContent = item.title[language];
  if (showcaseCaption) showcaseCaption.textContent = item.caption[language];
}

function moveShowcase(delta) {
  showcaseCurrent = (showcaseCurrent + delta + showcaseItems.length) % showcaseItems.length;
  renderShowcase();
  resetShowcaseTimer();
}

function resetShowcaseTimer() {
  window.clearInterval(showcaseTimer);
  showcaseTimer = window.setInterval(() => {
    showcaseCurrent = (showcaseCurrent + 1) % showcaseItems.length;
    renderShowcase();
  }, 6500);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatAuthors(authors) {
  return escapeHtml(authors)
    .replaceAll(" and ", ", ")
    .replace(/Yang, Kai/g, "<strong>Yang, Kai</strong>");
}

function publicationTypeLabel(item) {
  if (item.isPatent) return language === "zh" ? "专利" : "Patent";
  if (item.type === "article") return language === "zh" ? "期刊" : "Journal";
  if (item.type === "inproceedings") return language === "zh" ? "会议" : "Conference";
  return item.type || "Record";
}

function renderPublications() {
  if (!publicationList || !publicationCount) return;
  const publications = Array.isArray(publicationsData) ? publicationsData : [];
  const filtered = publications.filter((item) => {
    if (publicationFilter === "first") return item.isKaiFirstAuthor;
    if (publicationFilter === "article") return item.type === "article";
    if (publicationFilter === "inproceedings") return item.type === "inproceedings";
    return true;
  });

  if (publications.length === 0) {
    publicationList.innerHTML = `<article><p>${language === "zh" ? "论文数据未加载，请确认 data/publications.js 和 data/publications.json 已上传到 GitHub。" : "Publication data did not load. Please make sure data/publications.js and data/publications.json are uploaded to GitHub."}</p></article>`;
    publicationCount.textContent = language === "zh" ? "当前显示 0 / 0 条。" : "Showing 0 of 0 records.";
    return;
  }

  publicationList.innerHTML = filtered.map((item) => {
    const detail = [item.venue, item.volume && `vol. ${item.volume}`, item.number && `no. ${item.number}`, item.pages && `pp. ${item.pages}`]
      .filter(Boolean)
      .join(", ");
    return `
      <article>
        <span class="tag">${item.year} · ${publicationTypeLabel(item)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${formatAuthors(item.authors)}</p>
        <p class="meta"><em>${escapeHtml(detail)}</em></p>
      </article>
    `;
  }).join("");

  publicationCount.textContent = language === "zh"
    ? `当前显示 ${filtered.length} / ${publications.length} 条，数据来自 BibTeX。`
    : `Showing ${filtered.length} of ${publications.length} records from BibTeX.`;
}

async function loadPublicationFallback() {
  if (publicationsData.length > 0) return;
  try {
    const response = await fetch("data/publications.json");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data)) publicationsData = data;
  } catch {
    publicationsData = [];
  }
}

button?.addEventListener("click", () => {
  applyLanguage(language === "zh" ? "en" : "zh");
});

themeToggle?.addEventListener("click", () => {
  applyTheme(theme === "dark" ? "light" : "dark");
});

showcasePrev?.addEventListener("click", () => moveShowcase(-1));
showcaseNext?.addEventListener("click", () => moveShowcase(1));

filterButtons.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    publicationFilter = filterButton.dataset.filter;
    filterButtons.forEach((node) => node.classList.toggle("active", node === filterButton));
    renderPublications();
  });
});

if (year) year.textContent = new Date().getFullYear();
applyTheme(theme);
loadPublicationFallback().then(() => {
  applyLanguage(language);
  resetShowcaseTimer();
});
