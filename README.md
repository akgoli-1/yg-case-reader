# Mock Trial Simulator — State v. Harper Lynn

A single-file HTML/JS mock-trial simulator for YMCA Texas Youth & Government
(2025–2026 case: *State v. Harper Lynn*). It runs entirely locally and uses
[Ollama](https://ollama.com) (`llama3` by default) as the AI backend — no API
key or subscription required.

## Quick start (Windows + Chrome)

1. **Install & start Ollama** (one-time): install Ollama, then run:
   ```
   ollama pull llama3
   ollama serve
   ```
2. **Double-click `Start-MockTrial.bat`.** It starts the local server and opens
   the app in Chrome at <http://localhost:8080/mock_trial.html>.

That's it. When the header shows a green **Ollama Connected** badge, you're ready.

## Manual start

```
node server.js
```
Then open <http://localhost:8080/mock_trial.html> in Chrome.

> ⚠️ **Do not open `mock_trial.html` by double-clicking it.** That loads it as a
> `file://` URL, and the browser will block it from reaching Ollama. Always use
> the `http://localhost:8080` address (the app shows a warning if you forget).

## Features

- Full 10-phase trial flow (pre-trial → opening → directs/crosses → closing → verdict)
- AI plays the opposing attorney, all witnesses, and the judge (via Ollama)
- **Push-to-talk:** hold the 🎤 button or the **SPACE** key to dictate, release to send
- **Quick Objections** panel — one click to raise common objections with correct phrasing
- Evidence tracker, objections log, and a full rules/witnesses/exhibits reference
- Per-character text-to-speech with adjustable speed
- End-of-trial **verdict + full argument evaluation** (scored per phase)

## Requirements

- [Node.js](https://nodejs.org) (for the local static server)
- [Ollama](https://ollama.com) running locally with a model (default `llama3`)
- Chrome or Edge (push-to-talk uses the Web Speech API)
