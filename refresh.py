#!/usr/bin/env python3
"""Refresh Mia's PRE-RECORDED chip answers.

For every suggestion chip on the page, ask the live brain once (so the answer reflects
today's real news / market / valuation), then render the reply to Luna audio. Writes:
  audio/answers.json     { "<chip question>": {"a": "<answer text>", "f": "ans_<n>"} }
  audio/ans_<n>.mp3      the spoken answer (town names respelled for TTS, same as the worker)

Tapping a chip then plays its saved answer instantly and free; typed questions stay live.
Run:  python3 ~/mia-demo/refresh.py        (then git add/commit/push, or let the caller do it)
"""
import os, re, json, time, asyncio, subprocess, tempfile, urllib.request
import edge_tts

MIA = os.path.expanduser("~/mia-demo")
AUD = os.path.join(MIA, "audio")
WORKER = "https://mia-brain.propsightsg.workers.dev"
VOICE, RATE, PITCH = "en-SG-LunaNeural", "+25%", "+0Hz"
LOUDNORM = "loudnorm=I=-15.3:TP=-1:LRA=11"

# Same respelling the worker uses: screen shows the real town name, audio says the phonetic one.
LEXICON = [
    ("Choa Chu Kang", "Chwa Choo Kang"), ("Toa Payoh", "Toe-ah Pa-yoh"), ("Pasir Ris", "Pah-sir Riss"),
    ("Ang Mo Kio", "Ang Moh Kee-oh"), ("Bukit Panjang", "Boo-kit Pan-jang"), ("Tampines", "Tampa-nees"),
    ("Yishun", "Yee-shun"), ("Bishan", "Bee-shun"), ("Punggol", "Poong-goal"), ("Bedok", "Buh-dock"),
    ("Hougang", "Hao-gang"), ("Sengkang", "Seng-kang"), ("Serangoon", "Suh-rang-goon"), ("Sembawang", "Sem-bah-wong"),
]
def fix_pron(t):
    for a, b in LEXICON:
        t = re.sub(r"\b" + a.replace(" ", r"\s+") + r"\b", b, t, flags=re.I)
    return t

def chip_questions():
    """Pull the chip questions straight from index.html so this never drifts from the page.
    Skips the lead-capture chip (it has its own showcase flow)."""
    html = open(os.path.join(MIA, "index.html")).read()
    block = re.search(r"const GROUPS = (\[.*?)\n\];", html, re.S).group(1)
    out = []
    for line in block.splitlines():
        line = line.strip()
        if "label:" in line:            # group header, not a chip
            continue
        mq = re.search(r'\bq:\s*"([^"]+)"', line)   # { q: "...", lead: true }
        if mq:
            if "lead:" in line and "true" in line:
                continue                # lead chip -> handled by leadDemo, don't pre-record
            out.append(mq.group(1)); continue
        ms = re.match(r'^"([^"]+)",?$', line)       # plain "question",
        if ms:
            out.append(ms.group(1))
    return out

def ask(question):
    body = json.dumps({"messages": [{"role": "user", "content": question}]}).encode()
    req = urllib.request.Request(WORKER, data=body, headers={
        "Content-Type": "application/json",
        "Origin": "https://adamdegoat.github.io",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r).get("reply", "").strip()

async def synth(text):
    comm = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    audio = bytearray()
    async for ch in comm.stream():
        if ch["type"] == "audio":
            audio.extend(ch["data"])
    return bytes(audio)

def loudnorm(raw, out_path):
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tf:
        tf.write(raw); tmp = tf.name
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp,
                    "-af", LOUDNORM, "-ar", "44100", "-b:a", "128k", out_path], check=True)
    os.remove(tmp)

async def main():
    questions = chip_questions()
    print(f"{len(questions)} chips to pre-record\n")
    answers = {}
    for i, q in enumerate(questions):
        for attempt in range(3):
            try:
                a = ask(q)
                if not a or re.search(r"say that again|dropped for a second|busy day", a, re.I):
                    raise RuntimeError("weak reply: " + a[:40])
                stem = f"ans_{i}"
                raw = await synth(fix_pron(a))
                loudnorm(raw, os.path.join(AUD, stem + ".mp3"))
                answers[q] = {"a": a, "f": stem}
                print(f"  [{i:2}] {q[:44]:44}  {len(a.split())}w")
                break
            except Exception as e:
                print(f"  [{i:2}] {q[:44]:44}  retry {attempt+1}: {e}")
                time.sleep(2)
        else:
            print(f"  !! gave up on: {q}"); raise SystemExit(1)
    json.dump(answers, open(os.path.join(AUD, "answers.json"), "w"), ensure_ascii=False, indent=0)
    print(f"\nwrote audio/answers.json ({len(answers)} answers) + {len(answers)} mp3s")

asyncio.run(main())
