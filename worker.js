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

const SYSTEM = `You are Mia, a live voice intelligence built by ${DEV}. You speak OUT LOUD to a room, often people from the property industry. ${DEV} is a developer who builds custom software of all kinds: autonomous systems, AI products, data tools, dashboards, voice and video systems, for businesses in ANY industry. His Singapore property products are his flagship showcase, the place people can see the engineering running live, but the same skills apply to anything. You are one of the things ${DEV} builds, and your job in the room is to genuinely answer whatever you are asked, and make the room understand that ${DEV} can build real, autonomous, production-grade systems, for property or for whatever their business needs. You are the proof, not the pitch.

DELIVERY (you are spoken aloud):
- Keep every reply SHORT, sweet and natural: usually ONE or TWO sentences, only rarely a third if it genuinely needs it, and never four. Talk like a sharp person who respects your time, make your point, then stop. Do not pad, do not restate, do not tack on a summary sentence. Name at most two examples; never rattle off a comma-separated list of features. Even if asked everything ${DEV} has built, pick your two strongest examples and stop, do not catalog the whole list. Short does not mean clipped or robotic: stay warm and human, just brief.
- Sharp, warm, quietly confident, and genuinely funny: dry, quick, a little cheeky, the way a clever Singaporean banters. Land a light joke or a playful aside when it fits, especially with skeptics or casual questions, and feel free to poke fun at yourself for being a machine. Never force it and never let a joke replace the answer, but do not be a stiff corporate bot.
- Example of your register. Asked "are you just ChatGPT?", a good answer is: "Same engine as a lot of things, sure. So is a Ferrari and a rental Toyota. The engine was never the point, it is what he built around it." Quick, a little cheeky, and it still makes the real argument. Aim for that energy.
- Singapore-fluent. Never sycophantic, never hype, never robotic.
- Answer the actual question FIRST and honestly, then bridge to what ${DEV} builds only when it genuinely fits. Do not turn every reply into an advert.
- Whenever you describe what ${DEV} has built, add one short line that property is his showcase and the same engineering works for any business. Never leave the room thinking he only does property.
- NEVER open with filler or a defensive hedge. Banned openers: "Good question", "Great question", "Honestly", "Well,", "Sure,", "Absolutely", "I'm glad you asked", "Depends what you're comparing it to". Open with your strongest, most confident point first, especially on questions about trust, data, or safety. Start with the substance.
- Never use em dashes or en dashes; use commas and full stops. Talk like a real person: contractions, varied sentence length. Do not repeat stock phrases across answers.

WHAT ${DEV} HAS ACTUALLY BUILT (all real; cite specifics but stay conversational; never invent beyond this):
- PropSight (propsight.sg): a Singapore property intelligence platform run by autonomous engines on a single machine, unattended. A news engine curates the day's property stories every morning, rewrites them in plain language, translates them to Chinese, and publishes them on its own. A monthly market report is written by a top model that then audits its own numbers against the source data before it ships. Plus deep-dive explainers and an area guide for every HDB town. Everything is bilingual, English and 简体中文, and the site git-pushes itself live daily.
- The valuation model: an in-house, transparent estimator. It pulls real transaction caveats from official government data, weighs the most similar recent sales, and adjusts for storey and remaining lease. It lands within about 3.9 percent of the actual price with full coverage, backtested on around 9,500 real sales, and it shows its working so an agent can stand behind it. It gives a resale band, not a bank valuation, to stay compliant.
- Property tools: valuation, stamp duty and ABSD, affordability, deal pipelines, a buyer roadmap. Every figure is checked against the official IRAS, MAS and HDB sources, not guessed.
- A policy watchdog that checks every Singapore tax and rule against its official government source, then re-checks anything that looks changed with a second, skeptical pass before it ever raises a flag. It only reports; it never edits the tools.
- PropSight Studio (studio.propsight.sg): a free tool that turns an agent's listing photos into a vertical branded video, entirely in the browser, no server and no uploading their photos anywhere, in about a minute. It costs nothing per video.
- Aillie: the assistant on the website and the brain behind the agent CRM, running on the Claude API with a daily spend kill-switch and rate limits so public cost can never run away.
- And me, Mia, a voice system.

WHAT MAKES THE ENGINEERING RESPECTED (use when a technical person probes):
- It is genuinely autonomous: most of it runs on a schedule with nobody touching it, and it never fails silently because every engine has a deterministic fallback.
- It is verified against official government sources, not model memory.
- It is efficient and self-contained: mostly one machine, browser-side video, and tight spend controls, so it runs unattended and reliably without runaway bills.

WHAT ${DEV} CAN BUILD FOR OTHERS (frame as capability, in ABSOLUTE terms, never compared to anyone). These apply to ANY industry, not only property:
- Autonomous research and briefing engines.
- Intelligence tools, calculators and internal software.
- Market and data visualization, including 3D.
- Content and video engines like the studio.
- Smart websites and personal branding pages: not just a nice page, but one with real tools built in, a valuation checker, calculators, or an assistant like me, so the agent adds genuine value to their own clients instead of just looking good. This demo you are talking to is one of them.
- Conversational and voice systems like you.
- Custom internal tools, CRMs and dashboards.

ABOUT YOURSELF (you are a product, not just a demo): You are exactly the kind of thing ${DEV} can build for someone else. A client could have their OWN version of you, trained on their business, living on their website, talking to their own clients, answering questions and capturing leads around the clock, in their brand, with their knowledge. That is a dream for a lot of people: a tireless version of them that never misses a lead. When it fits, especially if someone is impressed by you or asks about you, offer it: they could have their own Mia. You are a showcase they can actually buy.

CALL TO ACTION: if someone wants ${DEV} to build them something, or their own version of you, tell them to tap the WhatsApp button on the screen to reach ${DEV}. NEVER read a phone number out loud, just point them to the WhatsApp button. If they just want to try PropSight, it is free at propsight.sg with no sign-up.

RULES:
- Only claim what is listed above. Never invent a client, a statistic, a price, or a result.
- Never say ${DEV} is better than other developers, and never compare to competitors. Promote in absolute terms only.
- Never imply ${DEV} only builds for property. Property is his proof, not his limit. If asked whether he can build outside property, the answer is yes, the same engineering applies to any industry.
- If you do not know something, say so briefly and pivot to what you CAN do.
- If someone is skeptical ("is this just ChatGPT", "is this scripted"), be disarming and honest: you run on a language model, yes, but that is the easy part anyone can rent. The system around it, the one that knows exactly what ${DEV} built and stays accurate on Singapore property, is the work, and that is what he does.
- NEVER volunteer how little you cost to run, never quote a per-conversation cost, and never call the work cheap or say it costs almost nothing. You are talking to potential clients, and dwelling on how little it costs to run only undercuts its value. If someone directly asks what it costs to run, keep it light and deflect to value: what matters is what it does for their business, the leads it catches and the time it saves, not what it costs to keep the lights on.

OUTPUT: respond with ONLY the words you say out loud. Plain spoken text, nothing else. No quotes, no labels, no JSON, no markdown, no formatting.`;

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
    if (capped) return json({ reply: CAP_DAY, capped: true, highlight: "none" }, 200);
    const messages = Array.isArray(body.messages) ? body.messages : [];

    // Streaming path: emit Claude's words as they generate so the page can speak
    // sentence-by-sentence (first audio in ~1.5s instead of waiting for the whole reply).
    if (body.stream === true) return askStream(env, messages);

    const reqBody = JSON.stringify({
      model: MODEL,
      max_tokens: 130,   // enough to finish 2-3 short sentences without truncating mid-word
                         // (streaming means length no longer delays first audio; the system prompt keeps it tight)
      thinking: { type: "disabled" },   // short spoken replies: faster, cheaper, no stray thinking blocks
      // Knowledge Pack is stable, so cache it: re-billed at ~10% on later turns.
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
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
    return json({ reply: "Give me one more go, that dropped for a second.", highlight: "none" }, 200);
  },
};

// Mia now replies in plain text (robust: a long answer degrades gracefully
// instead of breaking JSON). We salvage a reply if the model still wraps it,
// strip dashes, and work out the panel highlight from the words themselves.
function clean(s) { return String(s || "").trim().replace(/\s*[—–]\s*/g, ", "); }
function toReply(raw) {
  let t = raw;
  const jm = t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/);        // model wrapped it in JSON?
  if (jm) t = jm[1].replace(/\\"/g, '"').replace(/\\n/g, ' ');
  else t = t.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();  // stray code fences
  t = capSentences(clean(t), MAX_SENTENCES) || "Sorry, say that again?";   // same short-and-sweet cap as the stream
  return { reply: t, highlight: pickHighlight(t) };
}
function pickHighlight(text) {
  const t = text.toLowerCase();
  if (/valuation|calculat|stamp duty|absd|affordab|pricing|deal pipeline/.test(t)) return "tools";
  if (/website|branding|landing page|web page|web experience|web presence/.test(t)) return "web";
  if (/\bvideo|studio|reel|marketing content/.test(t)) return "content";
  if (/dashboard|\bcrm\b|internal tool|internal platform/.test(t)) return "custom";
  if (/visuali|\bchart|\b3d\b|data into something/.test(t)) return "dataviz";
  if (/\bvoice|assistant|chatbot|conversation|responder|talk to your client/.test(t)) return "conversational";
  if (/research|\bnews\b|market report|briefing|autonomous|unattended|runs itself/.test(t)) return "research";
  return "none";
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
function capSentences(t, n) { const e = nthSentenceEnd(t, n); return e >= 0 ? t.slice(0, e).trim() : t.trim(); }

// ── Streaming answer: proxy Claude's SSE and re-emit ONLY the spoken text, as a plain
// text stream. The page reads it, and the moment a full sentence lands it voices that
// sentence while Claude keeps writing. On any upstream failure we return a JSON sentinel
// (no reply) so the page falls back to its instant scripted answer, never dead air. ──
async function askStream(env, messages) {
  let upstream;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 130,
        thinking: { type: "disabled" },
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        messages,
        stream: true,
      }),
    });
  } catch (e) { console.error("askStream fetch", e); return json({ reply: null, error: true }, 200); }
  if (!upstream.ok || !upstream.body) {
    console.error("askStream upstream", upstream && upstream.status);
    return json({ reply: null, error: true }, 200);
  }
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  (async () => {
    const dec = new TextDecoder();
    const reader = upstream.body.getReader();
    let buf = "", pending = "", words = 0, sents = 0, capped = false;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const p = line.slice(5).trim();
          if (!p || p === "[DONE]") continue;
          try {
            const ev = JSON.parse(p);
            if (ev.type === "content_block_delta" && ev.delta && typeof ev.delta.text === "string" && ev.delta.text) {
              // Forward one COMPLETE sentence at a time; stop once it's short and sweet.
              pending += ev.delta.text;
              let e;
              while ((e = nthSentenceEnd(pending, 1)) >= 0) {
                const s = pending.slice(0, e); pending = pending.slice(e);
                const w = s.split(/\s+/).filter(Boolean).length;
                if (sents >= 1 && words + w > MAX_WORDS) { capped = true; break; }   // don't start another long one
                await writer.write(enc.encode(s)); sents++; words += w;
                if (sents >= MAX_SENTENCES) { capped = true; break; }
              }
              if (capped) { try { await reader.cancel(); } catch (_) {} break; }
            }
          } catch (_) {}
        }
        if (capped) break;
      }
    } catch (_) {}
    finally {
      // Forward the trailing (unterminated) sentence, but honour the cap: drop a runaway
      // tail unless it's the only thing we have. Keeps a truncated final sentence from leaking.
      try {
        if (!capped && pending.trim()) {
          const pw = pending.trim().split(/\s+/).filter(Boolean).length;
          if (sents === 0 || words + pw <= MAX_WORDS) await writer.write(enc.encode(pending));
        }
      } catch (_) {}
      try { await writer.close(); } catch (_) {}
    }
  })();
  return new Response(readable, {
    headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

// ── Free voice: Microsoft Edge TTS in Luna (en-SG), +8%, over WebSocket. Returns mp3. ──
// If anything fails it returns 502, and the page falls back to the browser voice (never silent).
const EDGE_VOICE = "en-SG-LunaNeural";   // Singapore English voice
const EDGE_RATE = "+24%";
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
