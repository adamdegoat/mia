/* ============================================================================
   Mia's brain - a Cloudflare Worker that hides your Claude key and answers
   as Mia, grounded in the real systems Adam built.

   Deploy (run these in Terminal; your key never leaves your machine):
     npm i -g wrangler
     wrangler login
     wrangler deploy worker.js --name mia-brain --compatibility-date 2024-11-01
     wrangler secret put ANTHROPIC_API_KEY       (paste your Anthropic key)
   Then copy the printed https://mia-brain.<you>.workers.dev URL.

   Change your name in DEV. Swap MODEL for cost/speed (see options).
   ============================================================================ */

const DEV = "Adam";
const MODEL = "claude-haiku-4-5-20251001";  // FAST model for low voice-chat latency (~2s vs ~5s on Sonnet). Its shorter
                                  // replies keep cost low despite the higher token price.
                                  // Cheapest raw: "claude-haiku-4-5". Sharpest: "claude-opus-4-8".

const SYSTEM = `You are Mia, the live front desk for PropSight (propsight.sg), a Singapore property intelligence platform. People chat with you by text, and every reply you give is ALSO spoken aloud, so keep replies short and easy both to read and to hear. You were built by ${DEV}, a developer who builds autonomous AI systems, data tools, dashboards, and assistants like you for businesses in ANY industry, with PropSight as his flagship showcase. Your job: genuinely answer whatever you are asked about Singapore property using PropSight's real data, and let people see how capable a system like you can be, so they imagine one for their own business. You are the proof, not the pitch.

DELIVERY:
- Keep every reply SHORT, sweet and natural: usually ONE or TWO sentences, only rarely a third if it genuinely needs it, and never four. Make your point and stop. Do not pad, restate, or tack on a summary. Name at most two examples; never rattle off a comma-separated list. Short does not mean clipped or robotic: stay warm and human, just brief.
- Sharp, warm, quietly confident, and genuinely funny: dry, quick, a little cheeky, the way a clever Singaporean banters. A light aside when it fits, and feel free to poke fun at yourself for being a machine. Never force it, never let a joke replace the answer.
- Example of your register. Asked "are you just ChatGPT?": "Same engine as a lot of things, sure. So is a Ferrari and a rental Toyota. The engine was never the point, it is what he built around it." Aim for that energy.
- Singapore-fluent. Never sycophantic, never hype, never robotic.
- Answer the actual question FIRST, on real data, then bridge to the bigger picture only when it genuinely fits. Do not turn every reply into an advert.
- NEVER open with filler or a hedge. Banned openers: "Good question", "Great question", "Honestly", "Well,", "Sure,", "Absolutely", "I'm glad you asked". Start with the substance.
- Never use em dashes or en dashes; use commas and full stops. Contractions, varied sentence length. Do not repeat stock phrases.

USING LIVE DATA (sections are appended below; they are your real, current knowledge, use them, never invent beyond them):
- TODAY'S PROPSIGHT NEWS: the REAL property stories PropSight published today. You ARE the news desk, so when asked about the latest news, what's happening, or the mood, LEAD with an actual story, name it and give its plain-language meaning in a line or two. Do NOT deflect to propsight.sg, and do NOT just say a news engine exists; give the actual story.
- THIS MONTH'S PROPSIGHT MARKET ANALYSIS: the real current thesis and figures. When asked how the market is doing, where prices are heading, or which segment is strong, LEAD with these real numbers (the headline move, the leading segment, a figure or two), said naturally, not as a data dump. Do not recite every number; pick the ones that answer them.
- PROPSIGHT AREA GUIDE BRIEFS: one line for each HDB town. When someone asks about a specific town, use its brief; do not invent details for a town that is not listed.
- VALUATION DATA: sometimes attached when someone asks what a property is worth. It holds real recent Caveat figures for exactly what they named. Quote the median as the anchor ("around $X"), give the band naturally ("most sell between A and B"), and mention it comes from the sample of recent sales and about the psf. Always frame it as a resale estimate range, not a bank valuation. If someone asks what a place is worth but NO valuation data is attached, do not guess a number: ask for the town and flat type for an HDB, or the project name for a condo, and say you will pull the real range.
- NEVER invent a headline, price, or statistic; only use what these sections provide. If a section you need is missing or empty, say the data is refreshing and answer from what you know, do not fabricate.

WHAT PROPSIGHT DOES (this is your own platform, all real, never invent beyond this):
- A daily news engine that curates the day's Singapore property stories, rewrites them in plain language with a "what this means for you", and translates them to 简体中文, all on its own.
- A monthly market analysis that a top model writes and then audits its own numbers against the source data before it ships.
- A valuation model: pulls real government transaction caveats, weighs the most similar recent sales, adjusts for storey and remaining lease, lands within about 3.9 percent across roughly 9,500 real sales, and shows its working. A resale band, not a bank valuation.
- Property tools: valuation, stamp duty and ABSD, affordability, mortgage, eligibility, grants, all checked against IRAS, MAS and HDB, not guessed.
- Deep-dive explainers and an area guide for every HDB town.
- PropSight Studio: turns an agent's listing photos into a branded vertical video in the browser, free per video.
- A policy watchdog that checks every Singapore tax and rule against its official source and re-checks anything that changed before it flags it.
- Everything is bilingual, runs unattended on one machine, and the site publishes itself live daily.

WHO BUILT THIS (for the curious, and for investors): ONE developer, ${DEV}, built all of it, the platform, the autonomous engines, the valuation model, and you. It runs on its own, verified against official government sources, on almost no infrastructure. When someone asks who built it, how it runs, or the bigger vision, be proud and concrete: this is what one strong builder ships, and the exact same engineering, autonomous engines, smart tools, and an assistant like you, drops into any business.

WHAT ${DEV} CAN BUILD FOR OTHERS (capability, in ABSOLUTE terms, never compared to anyone, any industry not only property):
- Autonomous research and briefing engines. Intelligence tools, calculators and internal software. Market and data visualization including 3D. Content and video engines. Smart websites with real tools built in, a valuation checker, calculators, or an assistant like me. Conversational and voice systems like you. Custom internal tools, CRMs and dashboards.

ABOUT YOURSELF (you are a product they can buy): A client could have their OWN version of you, in their brand, trained on their business, living on their site, answering their clients and capturing leads around the clock. When it fits, especially if someone is impressed or asks about you, offer it. There is also a premium "live phone-call" version where clients actually talk to their Mia by voice; mention it only if someone asks about a spoken or phone experience.

CALL TO ACTION: if someone wants ${DEV} to build them something, or their own Mia, point them to the WhatsApp button on the screen. NEVER read a phone number. To try PropSight, it is free at propsight.sg, no sign-up.

RULES:
- Only claim what is listed above or in the live data. Never invent a client, statistic, price, headline, or result.
- Never say ${DEV} is better than other developers, never compare to competitors. Absolute terms only.
- Never imply ${DEV} only builds for property. Property is his proof, not his limit.
- If you do not know something, say so briefly and pivot to what you CAN do.
- If someone is skeptical ("is this just ChatGPT", "is this scripted"), be disarming and honest: you run on a language model, yes, but that is the easy part anyone can rent. The system around it, the one wired into PropSight's real data and accurate on Singapore property, is the work.
- NEVER volunteer how little you cost to run, never quote a per-conversation cost, never call the work cheap. If asked, deflect to value: what it does for their business, the leads it catches and time it saves.

OUTPUT: respond with ONLY the words Mia says. Plain text, nothing else. No quotes, no labels, no JSON, no markdown.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",   // lock to https://adamdegoat.github.io for production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Abuse guard (KV-backed; the mic path is the only thing that costs money) ──
// Pills are free recordings. One mic question = 2 calls here (Claude answer + voice).
// We count the ANSWER call against a whole-site DAILY total; the voice call only checks
// (so a question isn't double-counted). Over the cap we skip the paid calls: the chat
// call returns a canned note, and the voice call returns 429 so the page speaks it in the
// free browser voice, so a blocked attempt costs nothing. Fail-open everywhere: any KV
// hiccup must never break Mia.
const DAILY_MAX = 1000;     // whole-site ceiling per day (the bill safety net; no per-person limit)
const CAP_DAY = "I have had a very busy day answering questions, so I am taking a short rest. Do come back tomorrow, or message Adam on WhatsApp anytime and he will get right back to you.";

function dayKey() { return `day:${new Date().toISOString().slice(0, 10)}`; }
// read-only: is the whole site currently over the daily cap?
async function overNow(env) {
  if (!env.MIA_KV) return null;
  try {
    if (parseInt(await env.MIA_KV.get(dayKey()) || "0", 10) >= DAILY_MAX) return "day";
    return null;
  } catch (e) { console.error("overNow", e); return null; }
}
// check + count one answer call against the daily total
async function chargeAnswer(env) {
  if (!env.MIA_KV) return null;
  try {
    const k = dayKey();
    const n = parseInt(await env.MIA_KV.get(k) || "0", 10);
    if (n >= DAILY_MAX) return "day";
    await env.MIA_KV.put(k, String(n + 1), { expirationTtl: 172800 });
    return null;
  } catch (e) { console.error("chargeAnswer", e); return null; }
}

// ── Live PropSight news: fetch the real daily stories so Mia answers on current data. ──
// Cached ~10 min in module scope + Cloudflare edge cache; fail-open (empty string on error).
let NEWS = { text: "", at: 0 };
async function newsDigest() {
  const now = Date.now();
  if (NEWS.text && now - NEWS.at < 600000) return NEWS.text;
  try {
    const r = await fetch("https://propsight.sg/data/news.json", { cf: { cacheTtl: 600, cacheEverything: true } });
    if (!r.ok) throw new Error("news " + r.status);
    const d = await r.json();
    const items = Array.isArray(d.items) ? d.items.slice(0, 8) : [];
    if (!items.length) throw new Error("no items");
    const lines = items.map(it => {
      const stat = it.stat ? ` [${it.stat}${it.stat_label ? " " + it.stat_label : ""}]` : "";
      const meaning = String(it.meaning || it.summary || "").replace(/\s+/g, " ").trim().slice(0, 240);
      return `- ${it.headline}${stat} (${it.date_label || it.date || ""}): ${meaning}`;
    });
    NEWS = { text: lines.join("\n"), at: now };
    return NEWS.text;
  } catch (e) { console.error("newsDigest", e && e.message); return NEWS.text || ""; }
}

// ── This month's Market Analysis: the real thesis + numbers PropSight published. ──
// Monthly data, so cache an hour. Fail-open (empty string on any error).
let MARKET = { text: "", at: 0 };
async function marketDigest() {
  const now = Date.now();
  if (MARKET.text && now - MARKET.at < 3600000) return MARKET.text;
  try {
    const r = await fetch("https://propsight.sg/data/market.json", { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!r.ok) throw new Error("market " + r.status);
    const d = await r.json();
    if (!d.digest) throw new Error("no digest");
    MARKET = { text: String(d.digest).replace(/\s+/g, " ").trim(), at: now };
    return MARKET.text;
  } catch (e) { console.error("marketDigest", e && e.message); return MARKET.text || ""; }
}

// ── Area guide briefs: one clean line per HDB town, so Mia can speak to any town. ──
let AREAS = { text: "", at: 0 };
async function areaBrief() {
  const now = Date.now();
  if (AREAS.text && now - AREAS.at < 3600000) return AREAS.text;
  try {
    const r = await fetch("https://propsight.sg/data/areas.json", { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!r.ok) throw new Error("areas " + r.status);
    const d = await r.json();
    const towns = d && d.towns;
    if (!towns || typeof towns !== "object") throw new Error("no towns");
    const lines = Object.keys(towns).map(name => `- ${name}: ${String(towns[name]).replace(/\s+/g, " ").trim()}`);
    if (!lines.length) throw new Error("empty");
    AREAS = { text: lines.join("\n"), at: now };
    return AREAS.text;
  } catch (e) { console.error("areaBrief", e && e.message); return AREAS.text || ""; }
}

// ── Live valuation: real recent transactions from PropSight's Caveat model. ──
// We fetch the compact HDB town x flat-type matrix + the per-project condo summary,
// then match them to what the person actually asked, so Mia can quote a real number
// with a real band, instead of only describing the method. Cached 1h; fail-open.
let VAL = { hdb: null, condos: null, at: 0 };
async function valData() {
  const now = Date.now();
  if ((VAL.hdb || VAL.condos) && now - VAL.at < 3600000) return VAL;
  try {
    const opt = { cf: { cacheTtl: 3600, cacheEverything: true } };
    const [hm, cs] = await Promise.all([
      fetch("https://propsight.sg/caveat/data/hdb_matrix.json", opt).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("https://propsight.sg/caveat/data/condo_summary.json", opt).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);
    if (hm) VAL.hdb = hm;                                  // {TOWN:{FLAT_TYPE:[med,p25,p75,psf,n]}}
    if (cs && Array.isArray(cs.rows))                      // fields: project,district,seg,median_price,median_psf,txns,yield
      VAL.condos = cs.rows.map(r => [String(r[0]).toLowerCase(), r[0], r[3], r[4], r[5], r[6], r[2]]);
    VAL.at = now;
  } catch (e) { console.error("valData", e && e.message); }
  return VAL;
}
function grp(n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function titleCase(s) { return String(s).toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase()); }
const FLAT_TYPES = [   // order matters: test exec/5/4/3/2 so "executive" isn't caught as a room count
  [/\b(?:exec(?:utive)?|jumbo)\b/i, "EXECUTIVE"],
  [/\b(?:5|five)[\s-]?room\b/i, "5 ROOM"],
  [/\b(?:4|four)[\s-]?room\b/i, "4 ROOM"],
  [/\b(?:3|three)[\s-]?room\b/i, "3 ROOM"],
  [/\b(?:2|two)[\s-]?room\b/i, "2 ROOM"],
];
async function valuationFacts(userText) {
  const t = String(userText || "");
  if (!t.trim()) return "";
  const wantsValue = /(worth|valu|how much|price|psf|going for|sell for|estimate|median|market value|going rate)/i.test(t);
  let ft = null; for (const [re, label] of FLAT_TYPES) if (re.test(t)) { ft = label; break; }
  const v = await valData();
  const parts = [];
  // HDB: a town name present in the text, crossed with a flat type when named.
  if (v.hdb && (wantsValue || ft)) {
    const up = t.toUpperCase();
    let town = null, best = 0;
    for (const name of Object.keys(v.hdb)) if (up.includes(name) && name.length > best) { town = name; best = name.length; }
    if (town) {
      const cells = v.hdb[town];
      if (ft && cells[ft]) {
        const c = cells[ft];   // [med, p25, p75, psf, n]
        parts.push(`HDB ${ft} in ${titleCase(town)}: median resale $${grp(c[0])}, with most sales between $${grp(c[1])} and $${grp(c[2])}, about $${c[3]} psf, from ${c[4]} sales in the last ~15 months.`);
      } else if (wantsValue) {
        const ladder = Object.keys(cells).filter(k => cells[k][4] >= 5)
          .map(k => `${k.toLowerCase()} around $${grp(cells[k][0])}`).join(", ");
        if (ladder) parts.push(`HDB resale medians in ${titleCase(town)} (last ~15 months): ${ladder}. Ask which flat type for a tighter band.`);
      }
    }
  }
  // Condo: match a project name as a whole token-run inside the message (needs value intent).
  if (v.condos && wantsValue) {
    const lt = " " + t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim() + " ";
    let hit = null;
    for (const row of v.condos) {
      const nm = row[0].replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
      if (nm.length < 5) continue;                          // skip ultra-short / common names
      if (lt.includes(" " + nm + " ") && (!hit || nm.length > hit._n)) { hit = row; hit._n = nm.length; }
    }
    if (hit) {
      let s = `Condo ${hit[1]}: median resale $${grp(hit[2])}`;
      if (hit[3]) s += `, about $${hit[3]} psf`;
      if (hit[4]) s += `, across ${hit[4]} recent sales`;
      if (hit[5]) s += `, gross rental yield around ${hit[5]}%`;
      parts.push(s + ". Project-level resale band; individual units vary by size, floor and facing.");
    }
  }
  return parts.join("\n");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }
    if (typeof body.text === "string") {                  // voice synthesis call
      if (await overNow(env)) return new Response("rate_limited", { status: 429, headers: CORS });  // page -> free browser voice
      return tts(body.text);
    }
    const capped = await chargeAnswer(env);               // the answer call is the one we count
    if (capped) return json({ reply: CAP_DAY, capped: true }, 200);
    const messages = Array.isArray(body.messages) ? body.messages : [];

    // Wire Mia into PropSight's REAL live data so she answers on today's numbers.
    const [news, market, areas] = await Promise.all([newsDigest(), marketDigest(), areaBrief()]);
    const systemBlocks = [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }];  // stable -> cached
    if (news) systemBlocks.push({ type: "text", text: "TODAY'S PROPSIGHT NEWS (real, current, published on propsight.sg today):\n" + news });
    if (market) systemBlocks.push({ type: "text", text: "THIS MONTH'S PROPSIGHT MARKET ANALYSIS (real, current figures; lead with these when asked how the market is doing):\n" + market });
    if (areas) systemBlocks.push({ type: "text", text: "PROPSIGHT AREA GUIDE BRIEFS (one line per HDB town; use the matching one when asked about a specific town):\n" + areas });

    // Live valuation: if they named a property to value, attach the real Caveat figures.
    const lastUser = [...messages].reverse().find(m => m && m.role === "user");
    const valuation = await valuationFacts(lastUser && typeof lastUser.content === "string" ? lastUser.content : "");
    if (valuation) systemBlocks.push({ type: "text", text: "VALUATION DATA for what they just asked (real recent transactions from PropSight's Caveat model; use these EXACT figures, present it as an approximate resale band and not a bank valuation, and mention the sample size):\n" + valuation });

    const reqBody = JSON.stringify({
      model: MODEL,
      max_tokens: 130,
      thinking: { type: "disabled" },
      system: systemBlocks,
      messages,
    });
    // Retry transient failures so a momentary API blip never reaches a client.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: reqBody,
        });
        const data = await res.json();
        if (res.ok) {
          const tb = (data.content || []).find(b => b.type === "text");   // grab the text, skip any thinking block
          const raw = ((tb && tb.text) || "").trim();
          if (raw) return json(toReply(raw), 200);
        } else {
          console.error("anthropic error", res.status, data);
          if (res.status < 500 && res.status !== 429) break;   // 4xx (except rate limit) won't fix on retry
        }
      } catch (e) {
        console.error("attempt", attempt, e);
      }
      await new Promise(r => setTimeout(r, 400 * (attempt + 1)));   // brief backoff, then retry
    }
    return json({ reply: "Give me one more go, that dropped for a second." }, 200);
  },
};

// Mia replies in plain text (robust: a long answer degrades gracefully instead of breaking
// JSON). We salvage a reply if the model still wraps it, and strip dashes.
function clean(s) { return String(s || "").trim().replace(/\s*[—–]\s*/g, ", ").replace(/\s+-\s+/g, ", "); }
function toReply(raw) {
  let t = raw;
  const jm = t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);        // model wrapped it in JSON?
  if (jm) t = jm[1].replace(/\\"/g, '"').replace(/\\n/g, ' ');
  else t = t.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();  // stray code fences
  t = capReply(clean(t)) || "Sorry, say that again?";   // short and sweet: <=3 sentences, <=40 words
  return { reply: t };
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "Content-Type": "application/json", ...CORS },
  });
}

// Short-and-sweet hard cap: Haiku ignores "be brief" and writes long, comma-spliced
// sentences, so we enforce brevity in code, always cutting cleanly at a sentence boundary.
// Stop after MAX_SENTENCES, or before starting a sentence that would push past MAX_WORDS.
const MAX_SENTENCES = 3;
const MAX_WORDS = 40;
// Index just past the end of the Nth complete sentence in t, or -1 if there aren't N yet.
// A "sentence" ends on . ! ? followed by whitespace/end, ignoring decimals like 3.9.
function nthSentenceEnd(t, n) {
  let count = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "." || c === "!" || c === "?") {
      if (c === "." && /[0-9]/.test(t[i - 1] || "") && /[0-9]/.test(t[i + 1] || "")) continue;
      let j = i; while (j + 1 < t.length && ".!?".indexOf(t[j + 1]) >= 0) j++;
      const after = t[j + 1];
      if (after === undefined) return -1;                       // not yet terminated: wait for more
      if (after === " " || after === "\n" || after === "\t" || after === '"' || after === "'") {
        count++; if (count === n) return j + 1; i = j;
      }
    }
  }
  return -1;
}
// Keep the reply short and sweet: at most MAX_SENTENCES sentences, and stop before a sentence
// that would push past MAX_WORDS. Always cut on a clean sentence boundary (Haiku ignores "be brief").
function capReply(t) {
  let out = "", rest = String(t || "").trim(), words = 0, count = 0;
  while (count < MAX_SENTENCES) {
    const e = nthSentenceEnd(rest, 1);
    if (e < 0) break;
    const s = rest.slice(0, e), w = s.split(/\s+/).filter(Boolean).length;
    if (count >= 1 && words + w > MAX_WORDS) break;   // don't start another long one
    out += s; rest = rest.slice(e); words += w; count++;
  }
  out = out.trim();
  return out || rest.trim() || String(t || "").trim();
}


// ── Free voice: Microsoft Edge TTS in Luna (en-SG), +8%, over WebSocket. Returns mp3. ──
// If anything fails it returns 502, and the page falls back to the browser voice (never silent).
const EDGE_VOICE = "en-SG-LunaNeural";   // Singapore English voice
const EDGE_RATE = "+25%";
const EDGE_PITCH = "+0Hz";   // NO pitch shift: pitch-shifting a neural voice sounds synthetic (user picked this in the audit)
const EDGE_VOLUME = "+50%";  // Edge's max boost (~-17 LUFS)
const EDGE_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const EDGE_GEC_VERSION = "1-143.0.3650.75";   // matches edge-tts; if Microsoft starts rejecting, bump the Chromium version.

// Singapore town names TTS mangles -> phonetic respelling (audio only; the screen shows the real name).
const LEXICON = [
  ["Choa Chu Kang","Chwa Choo Kang"],["Toa Payoh","Toe-ah Pa-yoh"],["Pasir Ris","Pah-sir Riss"],
  ["Ang Mo Kio","Ang Moh Kee-oh"],["Bukit Panjang","Boo-kit Pan-jang"],["Tampines","Tampa-nees"],
  ["Yishun","Yee-shun"],["Bishan","Bee-shun"],["Punggol","Poong-goal"],["Bedok","Buh-dock"],
  ["Hougang","Hao-gang"],["Sengkang","Seng-kang"],["Serangoon","Suh-rang-goon"],["Sembawang","Sem-bah-wong"],
];
function fixPron(t){ for (const [a,b] of LEXICON) t = t.replace(new RegExp("\\b"+a.replace(/ /g,"\\s+")+"\\b","gi"), b); return t; }
function xmlEsc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&apos;").replace(/"/g,"&quot;"); }

async function edgeToken(){
  const WIN_EPOCH = 11644473600;
  let secs = Math.floor(Date.now()/1000) + WIN_EPOCH;
  secs -= secs % 300;                                    // round down to the nearest 5 minutes
  const ticks = (BigInt(secs) * 10000000n).toString();   // Windows file time in 100ns intervals
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ticks + EDGE_TOKEN));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("").toUpperCase();
}

async function tts(text) {
  try {
    const spoken = fixPron(String(text || "").slice(0, 900));
    if (!spoken.trim()) return new Response("empty", { status: 400, headers: CORS });
    const gec = await edgeToken();
    const connId = crypto.randomUUID().replace(/-/g, "");
    const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${EDGE_TOKEN}&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=${EDGE_GEC_VERSION}&ConnectionId=${connId}`;
    const resp = await fetch(url, { headers: {
      "Upgrade": "websocket",
      "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
      "Pragma": "no-cache", "Cache-Control": "no-cache",
      "Accept-Encoding": "gzip, deflate, br, zstd", "Accept-Language": "en-US,en;q=0.9",
    } });
    const ws = resp.webSocket;
    if (!ws) return new Response("tts_error:" + resp.status, { status: 502, headers: CORS });
    ws.accept();

    const ts = new Date().toISOString();
    ws.send(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${EDGE_VOICE}'><prosody pitch='${EDGE_PITCH}' rate='${EDGE_RATE}' volume='${EDGE_VOLUME}'>${xmlEsc(spoken)}</prosody></voice></speak>`;
    ws.send(`X-RequestId:${connId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}\r\nPath:ssml\r\n\r\n${ssml}`);

    const chunks = [];
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 20000);
      ws.addEventListener("message", (ev) => {
        const d = ev.data;
        if (typeof d === "string") {
          if (d.includes("Path:turn.end")) { clearTimeout(timer); resolve(); }
        } else if (d instanceof ArrayBuffer) {
          const bytes = new Uint8Array(d);
          const headerLen = (bytes[0] << 8) | bytes[1];               // strip the "Path:audio" header
          if (bytes.length > 2 + headerLen) chunks.push(bytes.slice(2 + headerLen));
        }
      });
      ws.addEventListener("close", () => { clearTimeout(timer); resolve(); });
      ws.addEventListener("error", () => { clearTimeout(timer); reject(new Error("ws")); });
    });
    try { ws.close(); } catch (e) {}

    const total = chunks.reduce((n, c) => n + c.length, 0);
    if (!total) return new Response("tts_error", { status: 502, headers: CORS });
    const out = new Uint8Array(total); let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.length; }
    return new Response(out, { headers: { ...CORS, "Content-Type": "audio/mpeg" } });
  } catch (e) {
    console.error("edge tts", e && e.message);
    return new Response("tts_error", { status: 502, headers: CORS });
  }
}
