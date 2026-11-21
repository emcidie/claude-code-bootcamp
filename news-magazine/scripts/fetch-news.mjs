// Pulls the latest stories from the feeds in config/sources.json, reads each
// article, writes a summary, and saves everything to public/news.json for the
// magazine page to display.
//
//   npm run fetch
//
// Summaries are written by Claude when ANTHROPIC_API_KEY is set. Without a key
// the script falls back to the article's opening paragraphs.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Parser from "rss-parser";
import { JSDOM, VirtualConsole } from "jsdom";
import { Readability } from "@mozilla/readability";
import Anthropic from "@anthropic-ai/sdk";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PATHS = {
  configFile: path.join(ROOT, "config", "sources.json"),
  cacheFile: path.join(ROOT, "data", "summaries.json"),
  outputFile: path.join(ROOT, "public", "news.json"),
};

const USER_AGENT = "Mozilla/5.0 (compatible; DailyBriefReader/1.0)";
const FETCH_TIMEOUT_MS = 20_000;
const CONCURRENCY = 4;
// Articles are cut to this many characters before summarising; long enough for
// a full news story, short enough to keep the cost per article low.
const MAX_ARTICLE_CHARS = 40_000;
// Summaries older than this are dropped from the cache.
const CACHE_TTL_DAYS = 14;

const SUMMARY_INSTRUCTIONS = `You write summaries for a personal news magazine. The reader wants to understand what a story says without opening it, so the summary has to carry the substance of the article, not tease it.

Write:
1. A summary of 110-170 words in two short paragraphs. Cover what happened, who is involved, the key numbers, dates and places, why it matters, and what happens next if the article says. Stay neutral and stick to what the article states; do not add outside facts or opinions.
2. Three or four key points, each one sentence, capturing details the summary did not have room for.

Reply in exactly this format and nothing else:
SUMMARY:
<paragraph>

<paragraph>
KEY POINTS:
- <point>
- <point>
- <point>`;

// Settings for the current run, shared with the helpers below.
let settings, follow, useClaude, claude;

// Runs one refresh. The paths can be overridden (the AWS Lambda version reads
// and writes under /tmp).
export async function fetchNews({
  configFile = DEFAULT_PATHS.configFile,
  cacheFile = DEFAULT_PATHS.cacheFile,
  outputFile = DEFAULT_PATHS.outputFile,
} = {}) {
  const config = JSON.parse(await fs.readFile(configFile, "utf8"));
  settings = {
    maxArticlesPerSource: 8,
    maxAgeHours: 48,
    summaryModel: "claude-opus-5",
    ...config.settings,
  };
  follow = (config.follow ?? []).map((k) => k.trim()).filter(Boolean);

  useClaude =
    process.env.NO_AI !== "1" &&
    Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  claude = useClaude ? new Anthropic() : null;

  const cache = await readJson(cacheFile, {});

  const parser = new Parser({
    timeout: FETCH_TIMEOUT_MS,
    headers: { "User-Agent": USER_AGENT },
    customFields: {
      item: [
        ["media:content", "mediaContent", { keepArray: true }],
        ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ],
    },
  });

  console.log(
    `Summaries: ${useClaude ? `Claude (${settings.summaryModel})` : "article excerpt (no ANTHROPIC_API_KEY set)"}`,
  );
  if (follow.length) console.log(`Following: ${follow.join(", ")}`);

  // 1. Collect candidate stories from every feed.
  const candidates = [];
  for (const source of config.sources ?? []) {
    if (source.enabled === false) continue;
    try {
      const feed = await parser.parseURL(source.feed);
      const items = feed.items
        .map((item) => toCandidate(item, source))
        .filter((c) => isWebUrl(c.url) && c.title)
        .filter((c) => isRecent(c.publishedAt))
        .filter((c) => matchesFollow(c, source))
        .slice(0, source.maxArticles ?? settings.maxArticlesPerSource);
      console.log(`✓ ${source.name}: ${items.length} stories`);
      candidates.push(...items);
    } catch (err) {
      console.warn(`✗ ${source.name}: could not read feed (${err.message})`);
    }
  }

  // Different feeds sometimes carry the same story.
  const unique = [...new Map(candidates.map((c) => [c.id, c])).values()];

  // 2. Read and summarise each story (summaries are cached by URL).
  const articles = await mapLimit(unique, CONCURRENCY, async (story) => {
    const cached = cache[story.id];
    // A cached excerpt is upgraded once a Claude key is available.
    const wantsClaude = useClaude && cached?.summarizedBy !== "claude";
    if (cached && !wantsClaude) return { ...story, ...cached.data };

    const page = await readArticle(story.url);
    const text = page.text || story.feedText;
    // The article page's share image is usually larger than the feed thumbnail.
    const image = page.image || story.image || null;

    let summary;
    let summarizedBy = "excerpt";
    if (useClaude && text.length > 200) {
      try {
        summary = await summariseWithClaude(story, text);
        summarizedBy = "claude";
      } catch (err) {
        console.warn(`  ! Claude could not summarise "${story.title}": ${err.message}`);
      }
    }
    summary ??= excerptSummary(text);

    const data = { image, ...summary, summarizedBy };
    cache[story.id] = { data, summarizedBy, savedAt: new Date().toISOString() };
    return { ...story, ...data };
  });

  // 3. Save the page data and the summary cache.
  const published = articles
    .filter(Boolean)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .map(({ feedText, ...a }) => a);

  await writeJson(outputFile, {
    siteTitle: config.siteTitle ?? "The Daily Brief",
    tagline: config.tagline ?? "",
    follow,
    generatedAt: new Date().toISOString(),
    articles: published,
  });
  await writeJson(cacheFile, pruneCache(cache));
  console.log(`\nSaved ${published.length} stories to ${outputFile}`);
    return published.length;
}

// Run directly with `npm run fetch`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await fetchNews();
}

// ---------------------------------------------------------------------------

function toCandidate(item, source) {
  const feedHtml = item["content:encoded"] || item.content || item.summary || "";
  return {
    id: normaliseUrl(item.link ?? ""),
    url: item.link,
    title: cleanText(item.title ?? ""),
    source: source.name,
    section: source.section ?? "News",
    author: cleanText(item.creator || item.author || ""),
    publishedAt: toIso(item.isoDate || item.pubDate),
    image: absolute(feedImage(item, feedHtml), item.link),
    feedText: htmlToText(feedHtml) || cleanText(item.contentSnippet ?? ""),
  };
}

function feedImage(item, html) {
  const media = [...(item.mediaContent ?? []), ...(item.mediaThumbnail ?? [])]
    .map((m) => m.$ ?? {})
    .filter((m) => m.url && (!m.medium || m.medium === "image"))
    .sort((a, b) => Number(b.width ?? 0) - Number(a.width ?? 0));
  if (media.length) return media[0].url;
  if (item.enclosure?.url && /^image\//.test(item.enclosure.type ?? "image/")) {
    return item.enclosure.url;
  }
  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
}

function isRecent(iso) {
  if (!iso || !settings.maxAgeHours) return true;
  return Date.now() - new Date(iso).getTime() <= settings.maxAgeHours * 3_600_000;
}

// A source can set its own "follow" list; otherwise the global one applies.
function matchesFollow(story, source) {
  const words = source.follow ?? follow;
  if (!words.length) return true;
  const haystack = `${story.title} ${story.feedText}`.toLowerCase();
  return words.some((w) => haystack.includes(w.toLowerCase()));
}

async function readArticle(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // Silence jsdom's CSS parse warnings for real-world pages.
    const dom = new JSDOM(html, { url: res.url, virtualConsole: new VirtualConsole() });
    const doc = dom.window.document;
    const meta = (sel) => doc.querySelector(sel)?.getAttribute("content") || null;
    const image = meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]');
    const parsed = new Readability(doc).parse();
    const text = htmlToText(parsed?.content ?? "");
    return { text: text.slice(0, MAX_ARTICLE_CHARS), image: absolute(image, res.url) };
  } catch (err) {
    console.warn(`  ! Could not read article ${url} (${err.message}); using feed text`);
    return { text: "", image: null };
  }
}

async function summariseWithClaude(story, text) {
  const model = settings.summaryModel;
  const request = {
    model,
    max_tokens: 4000,
    system: SUMMARY_INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: `Headline: ${story.title}\nPublication: ${story.source}\n\nArticle:\n${text}`,
      },
    ],
  };
  // Summaries are routine work, so low effort keeps them fast and cheap.
  // (Haiku doesn't take an effort setting.)
  if (!model.includes("haiku")) request.output_config = { effort: "low" };
  // If a safety classifier declines an article, retry it on the model
  // Anthropic recommends instead of failing.
  if (/^claude-(opus|fable)-5/.test(model)) {
    request.betas = ["server-side-fallback-2026-07-01"];
    request.fallbacks = "default";
  }
  const response = await claude.beta.messages.create(request);

  if (response.stop_reason === "refusal") {
    throw new Error(`declined (${response.stop_details?.category ?? "no category"})`);
  }
  const output = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return parseSummary(output);
}

function parseSummary(output) {
  const [summaryPart, pointsPart = ""] = output.split(/^\s*KEY POINTS:\s*$/im);
  const summary = summaryPart.replace(/^\s*SUMMARY:\s*/i, "").trim();
  const keyPoints = pointsPart
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (!summary) throw new Error("empty summary");
  return { summary, keyPoints };
}

// Without Claude: use the article's opening paragraphs, up to ~170 words.
function excerptSummary(text) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 40);
  const out = [];
  let words = 0;
  for (const p of paragraphs) {
    out.push(p);
    words += p.split(/\s+/).length;
    if (words >= 140) break;
  }
  // Trim an overlong final paragraph so the card stays readable.
  const last = out.at(-1)?.split(/\s+/) ?? [];
  const over = words - 170;
  if (over > 10 && last.length > over) out[out.length - 1] = last.slice(0, -over).join(" ") + "…";
  const summary = out.join("\n\n");
  return { summary: summary || text.slice(0, 600), keyPoints: [] };
}

// --- small helpers ----------------------------------------------------------

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = await fn(items[i]);
      } catch (err) {
        console.warn(`  ! Skipped "${items[i].title}": ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function htmlToText(html) {
  if (!html) return "";
  const { document } = new JSDOM(`<body>${html}</body>`).window;
  document.querySelectorAll("p, br, li, h1, h2, h3").forEach((el) => el.append("\n\n"));
  return cleanParagraphs(document.body.textContent ?? "");
}

function cleanParagraphs(text) {
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function cleanText(s) {
  return s.replace(/\s+/g, " ").trim();
}

function normaliseUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const p of [...u.searchParams.keys()]) {
      if (/^(utm_|at_|cmp|ns_|ito)/i.test(p)) u.searchParams.delete(p);
    }
    return u.toString();
  } catch {
    return url;
  }
}

// Only http(s) links reach the page.
function absolute(url, base) {
  if (!url) return null;
  try {
    const u = new URL(url, base).toString();
    return isWebUrl(u) ? u : null;
  } catch {
    return null;
  }
}

function isWebUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function toIso(date) {
  const d = date ? new Date(date) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
}

function pruneCache(entries) {
  const cutoff = Date.now() - CACHE_TTL_DAYS * 86_400_000;
  return Object.fromEntries(
    Object.entries(entries).filter(([, v]) => new Date(v.savedAt).getTime() > cutoff),
  );
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n");
}
