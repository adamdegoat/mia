# Mia - live intelligence demo

A browser voice demo. You talk, Mia answers out loud, promotes what ZY builds,
and surfaces the matching capability on screen. Built for presenting to a room.

## Two files
- `index.html` - the page (goes on GitHub Pages). Ears + mouth are the free
  browser Web Speech APIs. Runs in Chrome on a laptop.
- `worker.js` - Mia's brain: a Cloudflare Worker that hides your Claude key and
  answers as Mia. Optional. Without it, the page runs on built-in scripted answers.

## Run it right now (offline, no setup)
Open `index.html` in Chrome. Click Begin. Mia introduces herself. Tap a question
chip, or hold the button (or spacebar) and speak. This uses the scripted answers,
enough to see the whole thing work.

## Make Mia answer live (Claude)
1. `npm i -g wrangler && wrangler login`
2. `wrangler deploy worker.js --name mia-brain --compatibility-date 2024-11-01`
3. `wrangler secret put ANTHROPIC_API_KEY`  (paste your key)
4. Copy the Worker URL, paste it into `CONFIG.workerUrl` in `index.html`.

## Change your name
- `index.html`: `CONFIG.developerName`
- `worker.js`: `const DEV`

## Put it online (GitHub Pages)
Push `index.html` to a repo, enable Pages. That is the link you open in the room.

## Presenter tips
- Chrome on a laptop, close to a good mic. Hold to speak so Mia never hears herself.
- Best voice is browser-dependent. To upgrade to a human voice later, swap the
  `speak()` function for an ElevenLabs call. Everything else stays the same.
