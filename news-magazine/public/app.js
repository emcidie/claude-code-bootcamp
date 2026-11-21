// Renders public/news.json as a magazine front page.

const state = { data: null, section: "All" };

const $ = (id) => document.getElementById(id);

const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function figure(a) {
  const fallback = `<div class="no-image">${escapeHtml(a.source)}</div>`;
  if (!a.image) return `<div class="figure">${fallback}</div>`;
  // If the publisher's image fails to load, show the source name instead.
  return `<div class="figure">${fallback}<img src="${escapeHtml(a.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></div>`;
}

function summary(a) {
  return (a.summary || "")
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

function keyPoints(a) {
  if (!a.keyPoints?.length) return "";
  return `<ul class="key-points">${a.keyPoints.map((k) => `<li>${escapeHtml(k)}</li>`).join("")}</ul>`;
}

function story(a, { points = false } = {}) {
  const byline = [a.source, timeAgo(a.publishedAt)].filter(Boolean).join(" · ");
  return `
    <a class="story" href="${escapeHtml(a.url)}" target="_blank" rel="noopener">
      ${figure(a)}
      <div class="kicker">${escapeHtml(a.section)}</div>
      <h3 class="headline">${escapeHtml(a.title)}</h3>
      <div class="summary">${summary(a)}</div>
      ${points ? keyPoints(a) : ""}
      <div class="meta">${escapeHtml(byline)} · <span class="read">Read full story →</span></div>
    </a>`;
}

function sectionBlock(title, articles) {
  if (!articles.length) return "";
  return `
    <section>
      <div class="section-head"><h2>${escapeHtml(title)}</h2></div>
      <div class="grid">${articles.map((a) => story(a)).join("")}</div>
    </section>`;
}

// Prefer stories with a picture for the front-page slots, from different sources.
function pickFront(articles) {
  const withImage = articles.filter((a) => a.image);
  const pool = withImage.length >= 3 ? withImage : articles;
  const picked = [];
  for (const a of pool) {
    if (picked.length === 3) break;
    if (!picked.some((p) => p.source === a.source)) picked.push(a);
  }
  for (const a of pool) {
    if (picked.length === 3) break;
    if (!picked.includes(a)) picked.push(a);
  }
  return picked;
}

function sectionNames(articles) {
  return [...new Set(articles.map((a) => a.section))];
}

function render() {
  const { articles } = state.data;
  const visible = state.section === "All" ? articles : articles.filter((a) => a.section === state.section);
  const main = $("content");

  if (!visible.length) {
    main.innerHTML = `<p class="status">No stories right now. Try again after the next refresh.</p>`;
    return;
  }

  const [lead, ...side] = pickFront(visible);
  const rest = visible.filter((a) => a !== lead && !side.includes(a));

  let html = `
    <section class="front">
      <div class="lead">${story(lead, { points: true })}</div>
      <div class="front-side">${side.map((a) => story(a, { points: true })).join("")}</div>
    </section>`;

  if (state.section === "All") {
    for (const name of sectionNames(rest)) {
      html += sectionBlock(name, rest.filter((a) => a.section === name));
    }
  } else {
    html += sectionBlock("More stories", rest);
  }
  main.innerHTML = html;
}

function renderNav() {
  const names = ["All", ...sectionNames(state.data.articles)];
  $("sections").innerHTML = names
    .map((n) => `<button type="button" data-section="${escapeHtml(n)}" aria-pressed="${n === state.section}">${escapeHtml(n === "All" ? "Front page" : n)}</button>`)
    .join("");
}

$("sections").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-section]");
  if (!btn) return;
  state.section = btn.dataset.section;
  renderNav();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

async function load() {
  $("today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  try {
    const res = await fetch(`news.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(res.status);
    state.data = await res.json();
  } catch {
    $("content").innerHTML = `<p class="status">No news yet. Run <code>npm run fetch</code> to pull the latest stories.</p>`;
    return;
  }
  const { siteTitle, tagline, generatedAt } = state.data;
  document.title = siteTitle;
  $("site-title").textContent = siteTitle;
  $("tagline").textContent = tagline;
  $("updated").textContent = `Updated ${timeAgo(generatedAt)}`;
  renderNav();
  render();
}

load();
